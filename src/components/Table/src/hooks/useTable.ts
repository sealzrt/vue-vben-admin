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

  // 注册表格实例
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
    reload: async (opt?: FetchParams) => {
      return await getTableInstance().reload(opt);
    },
    setProps: (props: Partial<BasicTableProps>) => {
      getTableInstance().setProps(props);
    },
    redoHeight: () => {
      getTableInstance().redoHeight();
    },
    setSelectedRows: (rows: Recordable[]) => {
      return toRaw(getTableInstance().setSelectedRows(rows));
    },
    setLoading: (loading: boolean) => {
      getTableInstance().setLoading(loading);
    },
    getDataSource: () => {
      return getTableInstance().getDataSource();
    },
    getRawDataSource: () => {
      return getTableInstance().getRawDataSource();
    },
    getColumns: ({ ignoreIndex = false }: { ignoreIndex?: boolean } = {}) => {
      const columns = getTableInstance().getColumns({ ignoreIndex }) || [];
      return toRaw(columns);
    },
    setColumns: (columns: BasicColumn[] | string[]) => {
      getTableInstance().setColumns(columns);
    },
    setTableData: (values: any[]) => {
      return getTableInstance().setTableData(values);
    },
    setPagination: (info: Partial<PaginationProps>) => {
      return getTableInstance().setPagination(info);
    },
    deleteSelectRowByKey: (keyValue: Key) => {
      getTableInstance().deleteSelectRowByKey(keyValue);
    },
    getSelectRowKeys: () => {
      return toRaw(getTableInstance().getSelectRowKeys());
    },
    getSelectRows: () => {
      return toRaw(getTableInstance().getSelectRows());
    },
    clearSelectedRowKeys: () => {
      getTableInstance().clearSelectedRowKeys();
    },
    setSelectedRowKeys: (keyValues: Key[]) => {
      getTableInstance().setSelectedRowKeys(keyValues);
    },
    getPaginationRef: () => {
      return getTableInstance().getPaginationRef();
    },
    getSize: () => {
      return toRaw(getTableInstance().getSize());
    },
    updateTableData: (index: number, key: string, value: any) => {
      return getTableInstance().updateTableData(index, key, value);
    },
    deleteTableDataRecord: (keyValues: Key | Key[]) => {
      return getTableInstance().deleteTableDataRecord(keyValues);
    },
    insertTableDataRecord: (record: Recordable | Recordable[], index?: number) => {
      return getTableInstance().insertTableDataRecord(record, index);
    },
    updateTableDataRecord: (keyValue: Key, record: Recordable) => {
      return getTableInstance().updateTableDataRecord(keyValue, record);
    },
    findTableDataRecord: (keyValue: Key) => {
      return getTableInstance().findTableDataRecord(keyValue);
    },
    getRowSelection: () => {
      return toRaw(getTableInstance().getRowSelection());
    },
    getCacheColumns: () => {
      return toRaw(getTableInstance().getCacheColumns());
    },
    getForm: () => {
      return unref(formRef) as unknown as FormActionType;
    },
    setShowPagination: async (show: boolean) => {
      getTableInstance().setShowPagination(show);
    },
    getShowPagination: () => {
      return toRaw(getTableInstance().getShowPagination());
    },
    expandAll: () => {
      getTableInstance().expandAll();
    },
    collapseAll: () => {
      getTableInstance().collapseAll();
    },
    expandRows: (keyValues: Key[]) => {
      getTableInstance().expandRows(keyValues);
    },
    collapseRows: (keyValues: Key[]) => {
      getTableInstance().collapseRows(keyValues);
    },
    scrollTo: (pos: string) => {
      getTableInstance().scrollTo(pos);
    },
  };

  return [register, methods];
}
