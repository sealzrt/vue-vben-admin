import type { BasicTableProps, TableActionType, FetchParams, BasicColumn } from '../types/table';
import type { PaginationProps } from '../types/pagination';
import type { DynamicProps } from '#/utils';
import type { FormActionType } from '@/components/Form';
import type { WatchStopHandle } from 'vue';
import { getDynamicProps } from '@/utils';
import { ref, onUnmounted, unref, watch, toRaw } from 'vue';
import { isProdMode } from '@/utils/env';
import { error } from '@/utils/log';
import type { Key } from 'ant-design-vue/lib/table/interface';

type Props = Partial<DynamicProps<BasicTableProps>>;

type UseTableMethod = TableActionType & {
  getForm: () => FormActionType;
};

/**
 * 包括: 注册表格实例, 获取表格实例, 表格操作方法
 * 注册表格实例：通过调用 register 函数，可以将表格实例注册到 useTable 中。在组件卸载时，会自动清空表格引用和加载状态。
 * 获取表格实例：通过调用 getTableInstance 函数，可以获取已经注册的表格实例。如果表格实例尚未获取，则会抛出一个错误。
 * 表格操作方法
 * @param tableProps
 */
export function useTable(tableProps?: Props): [
  (instance: TableActionType, formInstance: UseTableMethod) => void,
  TableActionType & {
    getForm: () => FormActionType;
  },
] {
  const tableRef = ref<Nullable<TableActionType>>(null);
  const loadedRef = ref<Nullable<boolean>>(false);
  const formRef = ref<Nullable<UseTableMethod>>(null);

  let stopWatch: WatchStopHandle;

  /**
   * 注册 表格实例 和 form实例
   * @param instance
   * @param formInstance
   */
  function register(instance: TableActionType, formInstance: UseTableMethod) {
    // 如果是生产模式，则在组件卸载时，清空表格引用和加载状态
    isProdMode() &&
      onUnmounted(() => {
        tableRef.value = null;
        loadedRef.value = null;
      });

    // 如果表格已经加载并且是生产模式，且实例和表格引用相同，则不进行注册
    if (unref(loadedRef) && isProdMode() && instance === unref(tableRef)) return;

    // 将实例赋值给表格引用
    tableRef.value = instance;
    // 将表单实例赋值给表单引用
    formRef.value = formInstance;
    // 如果表格属性存在，则将表格属性设置到实例中
    tableProps && instance.setProps(getDynamicProps(tableProps));
    // 将加载状态设置为true
    loadedRef.value = true;

    // 停止监听
    stopWatch?.();

    // 监听表格属性，当表格属性发生变化时，将表格属性设置到实例中
    stopWatch = watch(
      () => tableProps,
      () => {
        tableProps && instance.setProps(getDynamicProps(tableProps));
      },
      {
        immediate: true,
        deep: true,
      },
    );
  }

  // 获取表单实例对象
  function getTableInstance(): TableActionType {
    const table = unref(tableRef);
    if (!table) {
      error(
        'The table instance has not been obtained yet, please make sure the table is presented when performing the table operation!',
      );
    }
    return table as TableActionType;
  }

  const methods: TableActionType & {
    getForm: () => FormActionType;
  } = {
    // 重新加载
    reload: async (opt?: FetchParams) => {
      return await getTableInstance().reload(opt);
    },
    // 设置表格属性
    setProps: (props: Partial<BasicTableProps>) => {
      getTableInstance().setProps(props);
    },
    // 重新计算表格高度
    redoHeight: () => {
      getTableInstance().redoHeight();
    },
    // 设置选中的行
    setSelectedRows: (rows: Recordable[]) => {
      return toRaw(getTableInstance().setSelectedRows(rows));
    },
    // 设置表格加载状态
    setLoading: (loading: boolean) => {
      getTableInstance().setLoading(loading);
    },
    // 获取表格数据源
    getDataSource: () => {
      return getTableInstance().getDataSource();
    },
    // 获取原始表格数据源
    getRawDataSource: () => {
      return getTableInstance().getRawDataSource();
    },
    // 获取表格列
    getColumns: ({ ignoreIndex = false }: { ignoreIndex?: boolean } = {}) => {
      const columns = getTableInstance().getColumns({ ignoreIndex }) || [];
      return toRaw(columns);
    },
    // 设置表格列
    setColumns: (columns: BasicColumn[] | string[]) => {
      getTableInstance().setColumns(columns);
    },
    // 设置表格数据
    setTableData: (values: any[]) => {
      return getTableInstance().setTableData(values);
    },
    // 设置表格分页
    setPagination: (info: Partial<PaginationProps>) => {
      return getTableInstance().setPagination(info);
    },
    // 根据key删除选中的行
    deleteSelectRowByKey: (keyValue: Key) => {
      getTableInstance().deleteSelectRowByKey(keyValue);
    },
    // 获取选中的行key
    getSelectRowKeys: () => {
      return toRaw(getTableInstance().getSelectRowKeys());
    },
    // 获取选中的行
    getSelectRows: () => {
      return toRaw(getTableInstance().getSelectRows());
    },
    // 清除选中的行key
    clearSelectedRowKeys: () => {
      getTableInstance().clearSelectedRowKeys();
    },
    // 设置选中的行key
    setSelectedRowKeys: (keyValues: Key[]) => {
      getTableInstance().setSelectedRowKeys(keyValues);
    },
    // 获取表格分页
    getPaginationRef: () => {
      return getTableInstance().getPaginationRef();
    },
    // 获取表格尺寸
    getSize: () => {
      return toRaw(getTableInstance().getSize());
    },
    // 更新表格数据
    updateTableData: (index: number, key: string, value: any) => {
      return getTableInstance().updateTableData(index, key, value);
    },
    // 删除表格数据记录
    deleteTableDataRecord: (keyValues: Key | Key[]) => {
      return getTableInstance().deleteTableDataRecord(keyValues);
    },
    // 插入表格数据记录
    insertTableDataRecord: (record: Recordable | Recordable[], index?: number) => {
      return getTableInstance().insertTableDataRecord(record, index);
    },
    // 获取表格实例
    updateTableDataRecord: (keyValue: Key, record: Recordable) => {
      return getTableInstance().updateTableDataRecord(keyValue, record);
    },
    // 获取表格实例
    findTableDataRecord: (keyValue: Key) => {
      return getTableInstance().findTableDataRecord(keyValue);
    },
    // 返回表格实例的行选择器
    getRowSelection: () => {
      return toRaw(getTableInstance().getRowSelection());
    },
    // 返回表格实例的缓存列
    getCacheColumns: () => {
      return toRaw(getTableInstance().getCacheColumns());
    },
    // 返回表格实例的表单
    getForm: () => {
      return unref(formRef) as unknown as FormActionType;
    },
    // 设置表格实例的分页显示
    setShowPagination: async (show: boolean) => {
      getTableInstance().setShowPagination(show);
    },
    // 获取表格实例的分页显示
    getShowPagination: () => {
      return toRaw(getTableInstance().getShowPagination());
    },
    // 展开所有行
    expandAll: () => {
      getTableInstance().expandAll();
    },
    // 折叠所有行
    collapseAll: () => {
      getTableInstance().collapseAll();
    },
    // 展开指定行的行
    expandRows: (keyValues: Key[]) => {
      getTableInstance().expandRows(keyValues);
    },
    // 折叠指定行的行
    collapseRows: (keyValues: Key[]) => {
      getTableInstance().collapseRows(keyValues);
    },
    // 滚动到指定位置
    scrollTo: (pos: string) => {
      getTableInstance().scrollTo(pos);
    },
  };

  return [register, methods];
}
