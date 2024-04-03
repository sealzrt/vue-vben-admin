import { isFunction } from '@/utils/is';
import type { BasicTableProps, TableRowSelection } from '../types/table';
import { computed, ComputedRef, nextTick, Ref, ref, toRaw, unref, watch } from 'vue';
import { ROW_KEY } from '../const';
import { omit } from 'lodash-es';
import { findNodeAll } from '@/utils/helper/treeHelper';
import type { Key } from 'ant-design-vue/lib/table/interface';
import { parseRowKey, parseRowKeyValue } from '../helper';

export function useRowSelection(
  propsRef: ComputedRef<BasicTableProps>,
  tableData: Ref<Recordable[]>,
  emit: EmitType,
) {
  const selectedRowKeysRef = ref<Key[]>([]);
  const selectedRowRef = ref<Recordable[]>([]);

  /**
   * 计算属性: 选中项数据 和 选中事件
   */
  const getRowSelectionRef = computed((): TableRowSelection | null => {
    const { rowSelection } = unref(propsRef);
    if (!rowSelection) {
      return null;
    }

    return {
      selectedRowKeys: unref(selectedRowKeysRef),
      onChange: (selectedRowKeys: Key[], selectedRows: any[], isClickCustomRow?: boolean) => {
        if (isClickCustomRow) {
          // 点击行触发

          // 维持外部定义的 onChange 回调
          rowSelection.onChange?.(selectedRowKeys, selectedRows);
        } else {
          // 点击 checkbox/radiobox 触发

          // 取出【当前页】所有 keyValues
          const currentPageKeys = tableData.value.map((o) => parseRowKeyValue(unref(getRowKey), o));

          // 从【所有分页】已选的 keyValues，且属于【当前页】的部分
          for (const selectedKey of selectedRowKeysRef.value.filter((k) =>
            currentPageKeys.includes(k),
          )) {
            // 判断是否已经不存在于【当前页】
            if (selectedRowKeys.findIndex((k) => k === selectedKey) < 0) {
              // 不存在 = 取消勾选
              const removeIndex = selectedRowKeysRef.value.findIndex((k) => k === selectedKey);
              if (removeIndex > -1) {
                // 取消勾选
                selectedRowKeysRef.value.splice(removeIndex, 1);
                selectedRowRef.value.splice(removeIndex, 1);
              }
            }
          }

          // 存在于【当前页】，但不存在于【所有分页】，则认为是新增的
          for (const selectedKey of selectedRowKeys) {
            const existIndex = selectedRowKeysRef.value.findIndex((k) => k === selectedKey);
            if (existIndex < 0) {
              // 新增勾选
              selectedRowKeysRef.value.push(selectedKey);
              const record = selectedRows.find(
                (o) => parseRowKeyValue(unref(getRowKey), o) === selectedKey,
              );
              if (record) {
                selectedRowRef.value.push(record);
              }
            }
          }

          // 赋值调整过的值
          setSelectedRowKeys(selectedRowKeysRef.value);

          // 维持外部定义的onChange回调
          rowSelection.onChange?.(selectedRowKeysRef.value, selectedRowRef.value);
        }
      },
      ...omit(rowSelection, ['onChange']),
    };
  });

  /**
   * 监听propsRef中rowSelection的selectedRowKeys的变化
   */
  watch(
    () => unref(propsRef).rowSelection?.selectedRowKeys,
    (v?: Key[]) => {
      // 将变化后的selectedRowKeys设置到state中
      setSelectedRowKeys(v);
    },
  );

  /**
   * 监听selectedRowKeysRef的值变化
   */
  watch(
    () => unref(selectedRowKeysRef),
    () => {
      // 等待DOM更新
      nextTick(() => {
        // 获取rowSelection配置
        const { rowSelection } = unref(propsRef);
        if (rowSelection) {
          // 获取onChange函数
          const { onChange } = rowSelection;
          if (onChange && isFunction(onChange)) onChange(getSelectRowKeys(), getSelectRows(), true);
        }
        // 触发'selection-change'事件，传递选中的行键和行数据
        emit('selection-change', {
          keys: getSelectRowKeys(),
          rows: getSelectRows(),
        });
      });
    },
    { deep: true },
  );

  // 计算属性，判断propsRef中是否存在autoCreateKey，且rowKey不存在
  const getAutoCreateKey = computed(() => {
    return unref(propsRef).autoCreateKey && !unref(propsRef).rowKey;
  });

  // 计算属性，如果存在autoCreateKey，则返回ROW_KEY，否则返回rowKey
  const getRowKey = computed(() => {
    const { rowKey } = unref(propsRef);
    return unref(getAutoCreateKey) ? ROW_KEY : rowKey;
  });

  // 设置选中的行keys
  function setSelectedRowKeys(keyValues?: Key[]) {
    // 将传入的keyValues赋值给selectedRowKeysRef
    selectedRowKeysRef.value = keyValues || [];
    // 将tableData和selectedRowRef转换为原始值
    const rows = toRaw(unref(tableData)).concat(toRaw(unref(selectedRowRef)));
    // 查找所有符合条件的节点
    const allSelectedRows = findNodeAll(
      rows,
      (item) => keyValues?.includes(parseRowKeyValue(unref(getRowKey), item)),
      {
        children: propsRef.value.childrenColumnName ?? 'children',
      },
    );
    // 声明一个空数组，用于存放最终选中的行
    const trueSelectedRows: any[] = [];
    // 遍历keyValues，查找allSelectedRows中符合条件的行
    keyValues?.forEach((keyValue: Key) => {
      const found = allSelectedRows.find(
        (item) => parseRowKeyValue(unref(getRowKey), item) === keyValue,
      );
      // 如果找到了，将其添加到trueSelectedRows中
      if (found) {
        trueSelectedRows.push(found);
      } else {
        // 跨页的时候，非本页数据无法得到，暂如此处理
        // tableData or selectedRowRef 总有数据
        // 如果rows[0]存在，将其添加到trueSelectedRows中
        if (rows[0]) {
          trueSelectedRows.push({ [parseRowKey(unref(getRowKey), rows[0])]: keyValue });
        }
      }
    });
    // 将trueSelectedRows赋值给selectedRowRef
    selectedRowRef.value = trueSelectedRows;
  }

  // 设置选中的行
  function setSelectedRows(rows: Recordable[]) {
    // 将传入的rows赋值给selectedRowRef
    selectedRowRef.value = rows;
    // 将selectedRowRef中的每一行的key值取出，赋值给selectedRowKeysRef
    selectedRowKeysRef.value = selectedRowRef.value.map((o) =>
      parseRowKeyValue(unref(getRowKey), o),
    );
  }

  // 清除选中的行keys
  function clearSelectedRowKeys() {
    // 将selectedRowRef和selectedRowKeysRef赋值为空
    selectedRowRef.value = [];
    selectedRowKeysRef.value = [];
  }

  // 根据key删除选中的行
  function deleteSelectRowByKey(key: Key) {
    // 获取selectedRowKeysRef中的值
    const selectedRowKeys = unref(selectedRowKeysRef);
    // 获取key在selectedRowKeys中的索引
    const index = selectedRowKeys.findIndex((item) => item === key);
    // 如果索引存在，将其从selectedRowKeys中删除
    if (index !== -1) {
      unref(selectedRowKeysRef).splice(index, 1);
    }
  }

  // 获取选中的行keys
  function getSelectRowKeys() {
    // 返回selectedRowKeysRef中的值
    return unref(selectedRowKeysRef);
  }

  // 获取选中的行
  function getSelectRows<T = Recordable>() {
    // 将selectedRowRef转换为原始值，并返回
    // const ret = toRaw(unref(selectedRowRef)).map((item) => toRaw(item));
    return unref(selectedRowRef) as T[];
  }

  // 获取行选择器
  function getRowSelection() {
    // 返回getRowSelectionRef中的值
    return unref(getRowSelectionRef)!;
  }

  return {
    getRowSelection,
    getRowSelectionRef,
    getSelectRows,
    getSelectRowKeys,
    setSelectedRowKeys,
    clearSelectedRowKeys,
    deleteSelectRowByKey,
    setSelectedRows,
  };
}
