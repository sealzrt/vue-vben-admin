import type { BasicTableProps, FetchParams, SorterResult } from '../types/table';
import type { PaginationProps } from '../types/pagination';
import {
  ref,
  unref,
  ComputedRef,
  computed,
  onMounted,
  watch,
  reactive,
  Ref,
  watchEffect,
} from 'vue';
import { useTimeoutFn } from '@vben/hooks';
import { buildUUID } from '@/utils/uuid';
import { isFunction, isBoolean, isObject } from '@/utils/is';
import { get, cloneDeep, merge } from 'lodash-es';
import { FETCH_SETTING, ROW_KEY, PAGE_SIZE } from '../const';
import { parseRowKeyValue } from '../helper';
import type { Key } from 'ant-design-vue/lib/table/interface';

interface ActionType {
  getPaginationInfo: ComputedRef<boolean | PaginationProps>;
  setPagination: (info: Partial<PaginationProps>) => void;
  setLoading: (loading: boolean) => void;
  getFieldsValue: () => Recordable;
  clearSelectedRowKeys: () => void;
  tableData: Ref<Recordable[]>;
}

interface SearchState {
  sortInfo: Recordable;
  filterInfo: Record<string, string[]>;
}

/**
 * 主要用于处理表格的数据源相关功能，包括数据获取、更新、删除和查找等
 * @param propsRef
 * @param getPaginationInfo
 * @param setPagination
 * @param setLoading
 * @param getFieldsValue
 * @param clearSelectedRowKeys
 * @param tableData
 * @param emit
 */
export function useDataSource(
  propsRef: ComputedRef<BasicTableProps>,
  {
    getPaginationInfo,
    setPagination,
    setLoading,
    getFieldsValue,
    clearSelectedRowKeys,
    tableData,
  }: ActionType,
  emit: EmitType,
) {
  // 查询条件
  const searchState = reactive<SearchState>({
    sortInfo: {},
    filterInfo: {},
  });
  // 数据源
  const dataSourceRef = ref<Recordable[]>([]);
  // 原始数据源
  const rawDataSourceRef = ref<Recordable>({});

  // 监听dataSourceRef的值的变化
  watchEffect(() => {
    // 将dataSourceRef的值赋值给tableData.value
    tableData.value = unref(dataSourceRef);
  });

  // 监听propsRef.dataSource的变化
  watch(
    () => unref(propsRef).dataSource,
    () => {
      // 获取propsRef中的dataSource和api
      const { dataSource, api } = unref(propsRef);
      // 如果api不存在，则将dataSource赋值给dataSourceRef
      !api && dataSource && (dataSourceRef.value = dataSource);
    },
    {
      // 立即执行
      immediate: true,
    },
  );

  /**
   * 用于处理表格分页、排序和过滤变化时的逻辑
   * @param pagination
   * @param filters
   * @param sorter
   */
  function handleTableChange(
    pagination: PaginationProps,
    filters: Partial<Recordable<string[]>>,
    sorter: SorterResult,
  ) {
    const { clearSelectOnPageChange, sortFn, filterFn } = unref(propsRef);
    if (clearSelectOnPageChange) {
      clearSelectedRowKeys();
    }
    setPagination(pagination);

    const params: Recordable = {};
    if (sorter && isFunction(sortFn)) {
      const sortInfo = sortFn(sorter);
      searchState.sortInfo = sortInfo;
      params.sortInfo = sortInfo;
    }

    if (filters && isFunction(filterFn)) {
      const filterInfo = filterFn(filters);
      searchState.filterInfo = filterInfo;
      params.filterInfo = filterInfo;
    }
    fetch(params);
  }

  /**
   * 用于为数据源中的每一行设置一个唯一的 key
   * @param items
   */
  function setTableKey(items: any[]) {
    if (!items || !Array.isArray(items)) return;
    items.forEach((item) => {
      if (!item[ROW_KEY]) {
        item[ROW_KEY] = buildUUID();
      }
      if (item.children && item.children.length) {
        setTableKey(item.children);
      }
    });
  }

  // 计算属性getAutoCreateKey，返回propsRef的autoCreateKey属性为true且rowKey属性为undefined
  const getAutoCreateKey = computed(() => {
    return unref(propsRef).autoCreateKey && !unref(propsRef).rowKey;
  });

  // 计算属性getRowKey，返回propsRef的rowKey属性，如果getAutoCreateKey为true，则返回ROW_KEY
  const getRowKey = computed(() => {
    const { rowKey } = unref(propsRef);
    return unref(getAutoCreateKey) ? ROW_KEY : rowKey;
  });

  // 计算属性getDataSourceRef，返回dataSourceRef的值，如果dataSourceRef为空或者长度为0，则返回dataSourceRef
  // 如果getAutoCreateKey为true，则遍历dataSourceRef，如果第一项或者最后一项没有ROW_KEY属性，则给每一项添加ROW_KEY属性
  // 并且给每一项的children属性添加ROW_KEY属性
  const getDataSourceRef = computed(() => {
    const dataSource = unref(dataSourceRef);
    if (!dataSource || dataSource.length === 0) {
      return unref(dataSourceRef);
    }
    if (unref(getAutoCreateKey)) {
      const firstItem = dataSource[0];
      const lastItem = dataSource[dataSource.length - 1];

      if (firstItem && lastItem) {
        if (!firstItem[ROW_KEY] || !lastItem[ROW_KEY]) {
          const data = cloneDeep(unref(dataSourceRef));
          data.forEach((item) => {
            if (!item[ROW_KEY]) {
              item[ROW_KEY] = buildUUID();
            }
            if (item.children && item.children.length) {
              setTableKey(item.children);
            }
          });
          dataSourceRef.value = data;
        }
      }
    }
    return unref(dataSourceRef);
  });

  /**
   * 用于更新数据源中的某一行数据
   * @param index
   * @param key
   * @param value
   */
  async function updateTableData(index: number, key: Key, value: any) {
    const record = dataSourceRef.value[index];
    if (record) {
      dataSourceRef.value[index][key] = value;
    }
    return dataSourceRef.value[index];
  }

  /**
   * 根据keyValue查找表格数据记录，如果找到则更新记录
   * @param keyValue key值
   * @param record 记录
   * @returns {Recordable | undefined} 更新后的记录
   */
  function updateTableDataRecord(keyValue: Key, record: Recordable): Recordable | undefined {
    const row = findTableDataRecord(keyValue);

    if (row) {
      // 遍历row中的每一个字段
      for (const field in row) {
        // 如果record中也存在该字段，则更新row中的字段值
        if (Reflect.has(record, field)) row[field] = record[field];
      }
      // 返回更新后的记录
      return row;
    }
  }

  // 删除表格数据记录
  function deleteTableDataRecord(keyValues: Key | Key[]) {
    // 如果数据源为空或者长度为0，则直接返回
    if (!dataSourceRef.value || dataSourceRef.value.length == 0) return;
    // 将keyValues转换为数组
    const delKeyValues = !Array.isArray(keyValues) ? [keyValues] : keyValues;

    // 删除行
    function deleteRow(data, keyValue) {
      // 查找要删除的行
      const row: { index: number; data: [] } = findRow(data, keyValue);
      // 如果找不到要删除的行，则直接返回
      if (row === null || row.index === -1) {
        return;
      }
      // 从数据中删除行
      row.data.splice(row.index, 1);

      // 查找行
      function findRow(data, keyValue) {
        // 如果数据为空，则返回null
        if (data === null || data === undefined) {
          return null;
        }
        // 遍历数据
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          // 如果找到要删除的行，则返回行索引和数据
          if (parseRowKeyValue(unref(getRowKey), row) === keyValue) {
            return { index: i, data };
          }
          // 如果子数据不为空，则递归查找
          if (row.children?.length > 0) {
            const result = findRow(row.children, keyValue);
            // 如果找到，则返回结果
            if (result != null) {
              return result;
            }
          }
        }
        // 如果没有找到，则返回null
        return null;
      }
    }

    // 遍历要删除的keyValues
    for (const keyValue of delKeyValues) {
      // 从数据源中删除行
      deleteRow(dataSourceRef.value, keyValue);
      // 从propsRef中删除行
      deleteRow(unref(propsRef).dataSource, keyValue);
    }
    // 更新分页
    setPagination({
      total: unref(propsRef).dataSource?.length,
    });
  }

  function insertTableDataRecord(
    record: Recordable | Recordable[],
    index?: number,
  ): Recordable[] | undefined {
    // 如果数据源为空或者长度为0，则直接返回
    // if (!dataSourceRef.value || dataSourceRef.value.length == 0) return;
    index = index ?? dataSourceRef.value?.length;
    // 将record转换为数组
    const _record = isObject(record) ? [record as Recordable] : (record as Recordable[]);
    // 在指定索引处插入record
    unref(dataSourceRef).splice(index, 0, ..._record);
    // 返回插入后的数据源
    return unref(dataSourceRef);
  }

  function findTableDataRecord(keyValue: Key) {
    // 如果数据源为空或者长度为0，则直接返回
    if (!dataSourceRef.value || dataSourceRef.value.length == 0) return;
    // 获取子节点列名
    const { childrenColumnName = 'children' } = unref(propsRef);

    // 遍历数据源，查找指定keyValue的行
    const findRow = (array: any[]) => {
      let ret;
      array.some(function iter(r) {
        // 如果找到指定keyValue的行，则返回该行
        if (parseRowKeyValue(unref(getRowKey), r) === keyValue) {
          ret = r;
          return true;
        }
        // 如果当前行有子节点，则递归查找
        return r[childrenColumnName] && r[childrenColumnName].some(iter);
      });
      return ret;
    };

    // 返回查找到的行
    return findRow(dataSourceRef.value);
  }

  /**
   * 请求数据
   * @param opt
   */
  async function fetch(opt?: FetchParams) {
    // 获取propsRef中的参数
    const {
      api,
      searchInfo,
      defSort,
      fetchSetting,
      beforeFetch,
      afterFetch,
      useSearchForm,
      pagination,
    } = unref(propsRef);
    // 如果api不存在或者不是函数，则直接返回
    if (!api || !isFunction(api)) return;
    try {
      // 设置loading为true
      setLoading(true);
      // 合并FETCH_SETTING和fetchSetting
      const { pageField, sizeField, listField, totalField } = Object.assign(
        {},
        FETCH_SETTING,
        fetchSetting,
      );
      // 定义pageParams
      let pageParams: Recordable = {};

      // 获取分页信息
      const { current = 1, pageSize = PAGE_SIZE } = unref(getPaginationInfo) as PaginationProps;

      // 如果pagination为false或者getPaginationInfo为false，则pageParams为空
      if ((isBoolean(pagination) && !pagination) || isBoolean(getPaginationInfo)) {
        pageParams = {};
      } else {
        // 否则，将pageParams中的pageField和sizeField设置为current和pageSize
        pageParams[pageField] = (opt && opt.page) || current;
        pageParams[sizeField] = pageSize;
      }

      // 获取排序信息和过滤信息
      const { sortInfo = {}, filterInfo } = searchState;

      // 合并参数
      let params: Recordable = merge(
        pageParams,
        useSearchForm ? getFieldsValue() : {},
        searchInfo,
        opt?.searchInfo ?? {},
        defSort,
        sortInfo,
        filterInfo,
        opt?.sortInfo ?? {},
        opt?.filterInfo ?? {},
      );
      // 如果beforeFetch存在并且是函数，则执行beforeFetch
      if (beforeFetch && isFunction(beforeFetch)) {
        params = (await beforeFetch(params)) || params;
      }

      // 执行api
      const res = await api(params);
      // 设置rawDataSourceRef
      rawDataSourceRef.value = res;

      // 判断res是否为数组
      const isArrayResult = Array.isArray(res);

      // 设置resultItems
      let resultItems: Recordable[] = isArrayResult ? res : get(res, listField);
      // 设置resultTotal
      const resultTotal: number = isArrayResult ? res.length : get(res, totalField);

      // 如果数据变少，导致总页数变少并小于当前选中页码，通过getPaginationRef获取到的页码是不正确的，需获取正确的页码再次执行
      if (Number(resultTotal)) {
        const currentTotalPage = Math.ceil(resultTotal / pageSize);
        if (current > currentTotalPage) {
          setPagination({
            current: currentTotalPage,
          });
          return await fetch(opt);
        }
      }

      // 如果afterFetch存在并且是函数，则执行afterFetch
      if (afterFetch && isFunction(afterFetch)) {
        resultItems = (await afterFetch(resultItems)) || resultItems;
      }
      // 设置dataSourceRef
      dataSourceRef.value = resultItems;
      // 设置分页信息
      setPagination({
        total: resultTotal || 0,
      });
      // 如果opt存在并且opt.page存在，则设置分页信息中的current
      if (opt && opt.page) {
        setPagination({
          current: opt.page || 1,
        });
      }
      // 触发fetch-success事件
      emit('fetch-success', {
        items: unref(resultItems),
        total: resultTotal,
      });
      // 返回resultItems
      return resultItems;
    } catch (error) {
      emit('fetch-error', error);
      // 设置dataSourceRef为空
      dataSourceRef.value = [];
      // 设置total
      setPagination({
        total: 0,
      });
    } finally {
      // 关闭loading
      setLoading(false);
    }
  }

  // 设置表格数据
  function setTableData<T = Recordable>(values: T[]) {
    // 将values转换为Recordable类型，并赋值给dataSourceRef
    dataSourceRef.value = values as Recordable[];
  }

  // 获取数据源
  function getDataSource<T = Recordable>() {
    // 将getDataSourceRef的值转换为T类型，并返回
    return getDataSourceRef.value as T[];
  }

  // 获取原始数据源
  function getRawDataSource<T = Recordable>() {
    // 将rawDataSourceRef的值转换为T类型，并返回
    return rawDataSourceRef.value as T;
  }

  // 重新加载
  async function reload(opt?: FetchParams) {
    // 调用fetch方法，并返回结果
    return await fetch(opt);
  }

  // 在组件挂载时
  onMounted(() => {
    // 使用定时器函数
    useTimeoutFn(() => {
      // 如果propsRef的immediate属性为true
      unref(propsRef).immediate && fetch();
    }, 16);
  });

  return {
    getDataSourceRef,
    getDataSource,
    getRawDataSource,
    getRowKey,
    setTableData,
    getAutoCreateKey,
    fetch,
    reload,
    updateTableData,
    updateTableDataRecord,
    deleteTableDataRecord,
    insertTableDataRecord,
    findTableDataRecord,
    handleTableChange,
  };
}
