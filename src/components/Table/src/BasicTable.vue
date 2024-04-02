<template>
  <div ref="wrapRef" :class="getWrapperClass">
    <BasicForm
      ref="formRef"
      submitOnReset
      v-bind="getFormProps"
      v-if="getBindValues.useSearchForm"
      :tableAction="tableAction"
      @register="registerForm"
      @submit="handleSearchInfoChange"
      @advanced-change="redoHeight"
    >
      <!-- 渲染 以 "form-" 开头的 表单相关的 动态作用域插槽-->
      <template #[replaceFormSlotKey(item)]="data" v-for="item in getFormSlotKeys">
        <slot :name="item" v-bind="data || {}"></slot>
      </template>
    </BasicForm>

    <Table
      ref="tableElRef"
      v-bind="getBindValues"
      :rowClassName="getRowClassName"
      v-show="getEmptyDataIsShowTable"
      @change="handleTableChange"
      @resize-column="setColumnWidth"
      @expand="handleTableExpand"
    >
      <template #[item]="data" v-for="item in Object.keys($slots)" :key="item">
        <slot :name="item" v-bind="data || {}"></slot>
      </template>
      <template #headerCell="{ column }">
        <slot name="headerCell" v-bind="{ column }">
          <HeaderCell :column="column" />
        </slot>
      </template>
      <!-- 增加对antdv3.x兼容 -->
      <template #bodyCell="data">
        <slot name="bodyCell" v-bind="data || {}"></slot>
      </template>
      <!--      <template #[`header-${column.dataIndex}`] v-for="(column, index) in columns" :key="index">-->
      <!--        <HeaderCell :column="column" />-->
      <!--      </template>-->
    </Table>
  </div>
</template>
<script lang="ts" setup>
  import type {
    BasicTableProps,
    TableActionType,
    SizeType,
    ColumnChangeParam,
  } from './types/table';
  import { ref, computed, unref, toRaw, inject, watchEffect, useAttrs, useSlots } from 'vue';
  import { Table } from 'ant-design-vue';
  import { BasicForm, useForm } from '@/components/Form';
  import { PageWrapperFixedHeightKey } from '@/enums/pageEnum';
  import HeaderCell from './components/HeaderCell.vue';
  import { InnerHandlers, InnerMethods } from './types/table';
  import { usePagination } from './hooks/usePagination';
  import { useColumns } from './hooks/useColumns';
  import { useDataSource } from './hooks/useDataSource';
  import { useLoading } from './hooks/useLoading';
  import { useRowSelection } from './hooks/useRowSelection';
  import { useTableScroll } from './hooks/useTableScroll';
  import { useTableScrollTo } from './hooks/useScrollTo';
  import { useCustomRow } from './hooks/useCustomRow';
  import { useTableStyle } from './hooks/useTableStyle';
  import { useTableHeader } from './hooks/useTableHeader';
  import { useTableExpand } from './hooks/useTableExpand';
  import { createTableContext } from './hooks/useTableContext';
  import { useTableFooter } from './hooks/useTableFooter';
  import { useTableForm } from './hooks/useTableForm';
  import { useDesign } from '@/hooks/web/useDesign';
  import { omit } from 'lodash-es';
  import { basicProps } from './props';
  import { isFunction } from '@/utils/is';
  import { warn } from '@/utils/log';

  defineOptions({ name: 'BasicTable' });

  const props = defineProps(basicProps);

  // 定义一个常量emit，用于触发事件
  const emit = defineEmits([
    // 获取数据成功时触发
    'fetch-success',
    // 获取数据失败时触发
    'fetch-error',
    // 选择项发生变化时触发
    'selection-change',
    // 注册时触发
    'register',
    // 行点击时触发
    'row-click',
    // 行双击时触发
    'row-dbClick',
    // 行右键点击时触发
    'row-contextmenu',
    // 行鼠标进入时触发
    'row-mouseenter',
    // 行鼠标离开时触发
    'row-mouseleave',
    // 编辑结束时触发
    'edit-end',
    // 编辑取消时触发
    'edit-cancel',
    // 编辑行结束时触发
    'edit-row-end',
    // 编辑项发生变化时触发
    'edit-change',
    // 展开行发生变化时触发
    'expanded-rows-change',
    // 发生变化时触发
    'change',
    // 列发生变化时触发
    'columns-change',
  ]);

  // 定义 attrs 和 slots 变量，用于获取组件的属性和插槽
  const attrs = useAttrs();
  const slots = useSlots();

  // 定义 tableElRef 变量，用于获取表格元素
  const tableElRef = ref(null);
  // 定义 tableData 变量，用于获取表格数据
  const tableData = ref([]);

  // 定义 wrapRef 变量，用于获取表格包裹元素
  const wrapRef = ref(null);
  // 定义 formRef 变量，用于获取表单元素
  const formRef = ref(null);
  /*** 定义 innerPropsRef 变量，用于获取 动态设置的表格属性 ***/
  const innerPropsRef = ref<Partial<BasicTableProps>>();

  // 获取表格的前缀类名
  const { prefixCls } = useDesign('basic-table');
  // 注册表单
  const [registerForm, formActions] = useForm();

  /*** 计算属性: 获取表格的所有属性 ***/
  const getProps = computed(() => {
    // 将props和innerPropsRef的值合并为一个新对象
    return { ...props, ...unref(innerPropsRef) } as BasicTableProps;
  });

  // 注入PageWrapperFixedHeightKey的值，默认值为false
  const isFixedHeightPage = inject(PageWrapperFixedHeightKey, false);

  // 当isFixedHeightPage不为空且props中canResize为true时，警告一个信息
  watchEffect(() => {
    unref(isFixedHeightPage) &&
      props.canResize &&
      warn(
        "'canResize' of BasicTable may not work in PageWrapper with 'fixedHeight' (especially in hot updates)",
      );
  });

  const { getLoading, setLoading } = useLoading(getProps);

  const { getPaginationInfo, getPagination, setPagination, setShowPagination, getShowPagination } =
    usePagination(getProps);

  const {
    getRowSelection,
    getRowSelectionRef,
    getSelectRows,
    setSelectedRows,
    clearSelectedRowKeys,
    getSelectRowKeys,
    deleteSelectRowByKey,
    setSelectedRowKeys,
  } = useRowSelection(getProps, tableData, emit);

  const {
    handleTableChange: onTableChange,
    getDataSourceRef,
    getDataSource,
    getRawDataSource,
    setTableData,
    updateTableDataRecord,
    deleteTableDataRecord,
    insertTableDataRecord,
    findTableDataRecord,
    fetch,
    getRowKey,
    reload,
    getAutoCreateKey,
    updateTableData,
  } = useDataSource(
    getProps,
    {
      tableData,
      getPaginationInfo,
      setLoading,
      setPagination,
      getFieldsValue: formActions.getFieldsValue,
      clearSelectedRowKeys,
    },
    emit,
  );

  function handleTableChange(pagination: any, filters: any, sorter: any, extra: any) {
    onTableChange(pagination, filters, sorter);
    emit('change', pagination, filters, sorter);
    // 解决通过useTable注册onChange时不起作用的问题
    const { onChange } = unref(getProps);
    onChange && isFunction(onChange) && onChange(pagination, filters, sorter, extra);
  }

  const {
    getViewColumns,
    getColumns,
    setCacheColumnsByField,
    setCacheColumns,
    setColumnWidth,
    setColumns,
    getColumnsRef,
    getCacheColumns,
  } = useColumns(getProps, getPaginationInfo);

  const { getScrollRef, redoHeight } = useTableScroll(
    getProps,
    tableElRef,
    getColumnsRef,
    getRowSelectionRef,
    getDataSourceRef,
    wrapRef,
    formRef,
  );

  const { scrollTo } = useTableScrollTo(tableElRef, getDataSourceRef);

  const { customRow } = useCustomRow(getProps, {
    setSelectedRowKeys,
    getSelectRowKeys,
    clearSelectedRowKeys,
    getAutoCreateKey,
    emit,
  });

  const { getRowClassName } = useTableStyle(getProps, prefixCls);

  const { getExpandOption, expandAll, expandRows, collapseRows, collapseAll, handleTableExpand } =
    useTableExpand(getProps, tableData, emit);

  const handlers: InnerHandlers = {
    onColumnsChange: (data: ColumnChangeParam[]) => {
      emit('columns-change', data);
      // support useTable
      unref(getProps).onColumnsChange?.(data);
    },
  };

  const methods: InnerMethods = {
    clearSelectedRowKeys,
    getSelectRowKeys,
  };

  const { getHeaderProps } = useTableHeader(getProps, slots, handlers, methods);

  const { getFooterProps } = useTableFooter(getProps, getScrollRef, tableElRef, getDataSourceRef);

  const { getFormProps, replaceFormSlotKey, getFormSlotKeys, handleSearchInfoChange } =
    useTableForm(getProps, slots, fetch, getLoading);

  const getBindValues = computed(() => {
    const dataSource = unref(getDataSourceRef);
    let propsData: any = {
      ...attrs,
      customRow,
      ...unref(getProps),
      ...unref(getHeaderProps),
      scroll: unref(getScrollRef),
      loading: unref(getLoading),
      tableLayout: 'fixed',
      rowSelection: unref(getRowSelectionRef),
      rowKey: unref(getRowKey),
      columns: toRaw(unref(getViewColumns)),
      pagination: toRaw(unref(getPaginationInfo)),
      dataSource,
      footer: unref(getFooterProps),
      ...unref(getExpandOption),
    };
    // if (slots.expandedRowRender) {
    //   propsData = omit(propsData, 'scroll');
    // }

    propsData = omit(propsData, ['class', 'onChange']);
    return propsData;
  });

  const getWrapperClass = computed(() => {
    const values = unref(getBindValues);
    return [
      prefixCls,
      attrs.class,
      {
        [`${prefixCls}-form-container`]: values.useSearchForm,
        [`${prefixCls}--inset`]: values.inset,
      },
    ];
  });

  const getEmptyDataIsShowTable = computed(() => {
    const { emptyDataIsShowTable, useSearchForm } = unref(getProps);
    if (emptyDataIsShowTable || !useSearchForm) {
      return true;
    }
    return !!unref(getDataSourceRef).length;
  });

  function setProps(props: Partial<BasicTableProps>) {
    innerPropsRef.value = { ...unref(innerPropsRef), ...props };
  }

  const tableAction: TableActionType = {
    reload,
    getSelectRows,
    setSelectedRows,
    clearSelectedRowKeys,
    getSelectRowKeys,
    deleteSelectRowByKey,
    setPagination,
    setTableData,
    updateTableDataRecord,
    deleteTableDataRecord,
    insertTableDataRecord,
    findTableDataRecord,
    redoHeight,
    setSelectedRowKeys,
    setColumns,
    setLoading,
    getDataSource,
    getRawDataSource,
    setProps,
    getRowSelection,
    getPaginationRef: getPagination,
    getColumns,
    getCacheColumns,
    emit,
    updateTableData,
    setShowPagination,
    getShowPagination,
    setCacheColumnsByField,
    expandAll,
    collapseAll,
    expandRows,
    collapseRows,
    scrollTo,
    getSize: () => {
      return unref(getBindValues).size as SizeType;
    },
    setCacheColumns,
  };
  createTableContext({ ...tableAction, wrapRef, getBindValues });

  /**** 注册 ****/
  emit('register', tableAction, formActions);

  defineExpose({ tableElRef, ...tableAction });
</script>
<style lang="less">
  @border-color: #cecece4d;

  @prefix-cls: ~'@{namespace}-basic-table';

  [data-theme='dark'] {
    .ant-table-tbody > tr:hover.ant-table-row-selected > td,
    .ant-table-tbody > tr.ant-table-row-selected td {
      background-color: #262626;
    }
  }

  .@{prefix-cls} {
    max-width: 100%;
    height: 100%;

    &-row__striped {
      td {
        background-color: @app-content-background !important;
      }
    }

    &-form-container {
      padding: 16px;

      .ant-form {
        width: 100%;
        margin-bottom: 16px;
        padding: 12px 10px 6px;
        border-radius: 2px;
        background-color: @component-background;
      }
    }

    .ant-table-cell {
      .ant-tag {
        margin-right: 0;
      }
    }

    .ant-table-wrapper {
      padding: 6px;
      border-radius: 2px;
      background-color: @component-background;

      .ant-table-title {
        min-height: 40px;
        padding: 0 0 8px !important;
      }

      .ant-table.ant-table-bordered .ant-table-title {
        border: none !important;
      }
    }

    .ant-table {
      width: 100%;
      overflow-x: hidden;

      &-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 6px;
        border-bottom: none;
      }

      //.ant-table-tbody > tr.ant-table-row-selected td {
      //background-color: fade(@primary-color, 8%) !important;
      //}
    }

    .ant-table-wrapper .ant-pagination {
      margin: 10px 0 0;
    }

    .ant-table-footer {
      padding: 0;

      .ant-table-wrapper {
        padding: 0;
      }

      table {
        border: none !important;
      }

      .ant-table-body {
        overflow-x: hidden !important;
        //  overflow-y: scroll !important;
      }

      td {
        padding: 12px 8px;
      }
    }

    &--inset {
      .ant-table-wrapper {
        padding: 0;
      }
    }
  }
</style>
