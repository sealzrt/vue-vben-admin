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
      <!-- !!!透传插槽!!!  渲染 表单相关的 以 "form-" 开头的 动态作用域插槽-->
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
      <!-- !!!透传插槽!!!: 渲染 动态作用域插槽-->
      <template #[item]="data" v-for="item in Object.keys($slots)" :key="item">
        <slot :name="item" v-bind="data || {}"></slot>
      </template>
      <!-- 个性化头部单元格-->
      <template #headerCell="{ column }">
        <slot name="headerCell" v-bind="{ column }">
          <HeaderCell :column="column" />
        </slot>
      </template>
      <!-- 个性化单元格, 增加对antdv3.x兼容 -->
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

  /*** 计算属性: 获取表格的所有属性, 包括 父组件设置的props和useTable动态设置的props ***/
  const getProps = computed(() => {
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

  /*** 分页相关配置 ***/
  const { getPaginationInfo, getPagination, setPagination, setShowPagination, getShowPagination } =
    usePagination(getProps);

  /*** 选中项数据 和 选中事件 ***/
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

  /*** 主要用于处理表格的数据源相关功能，包括数据获取、更新、删除和查找等 ***/
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

  /**
   * 处理表格变化函数
   * @param pagination
   * @param filters
   * @param sorter
   * @param extra
   */
  function handleTableChange(pagination: any, filters: any, sorter: any, extra: any) {
    // 调用onTableChange函数
    onTableChange(pagination, filters, sorter);
    // 触发change事件
    emit('change', pagination, filters, sorter);
    // 解决通过useTable注册onChange时不起作用的问题
    const { onChange } = unref(getProps);
    // 判断是否有onChange函数
    onChange && isFunction(onChange) && onChange(pagination, filters, sorter, extra);
  }

  /*** 处理表格的列配置，包括获取、设置、排序和过滤等操作 ***/
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

  /*** 处理表格的滚动功能，包括计算表格的高度、处理滚动条的显示隐藏、计算滚动条的宽度等 ***/
  const { getScrollRef, redoHeight } = useTableScroll(
    getProps,
    tableElRef,
    getColumnsRef,
    getRowSelectionRef,
    getDataSourceRef,
    wrapRef,
    formRef,
  );

  // useTableScrollTo 函数主要用于处理表格的滚动功能，包括计算表格的高度、处理滚动条的显示隐藏、计算滚动条的宽度等
  const { scrollTo } = useTableScrollTo(tableElRef, getDataSourceRef);

  // 使用自定义行
  const { customRow } = useCustomRow(getProps, {
    setSelectedRowKeys,
    getSelectRowKeys,
    clearSelectedRowKeys,
    getAutoCreateKey,
    emit,
  });

  // 使用表格样式
  const { getRowClassName } = useTableStyle(getProps, prefixCls);

  // 使用表格展开
  const { getExpandOption, expandAll, expandRows, collapseRows, collapseAll, handleTableExpand } =
    useTableExpand(getProps, tableData, emit);

  // 处理函数
  const handlers: InnerHandlers = {
    onColumnsChange: (data: ColumnChangeParam[]) => {
      emit('columns-change', data);
      // support useTable
      unref(getProps).onColumnsChange?.(data);
    },
  };

  // 方法
  const methods: InnerMethods = {
    clearSelectedRowKeys,
    getSelectRowKeys,
  };

  // 用于处理表格标题
  const { getHeaderProps } = useTableHeader(getProps, slots, handlers, methods);

  // 获取表格底部的props
  const { getFooterProps } = useTableFooter(getProps, getScrollRef, tableElRef, getDataSourceRef);

  // 获取表单的props
  const { getFormProps, replaceFormSlotKey, getFormSlotKeys, handleSearchInfoChange } =
    useTableForm(getProps, slots, fetch, getLoading);

  // 计算属性getBindValues，用于获取表格组件的属性值
  const getBindValues = computed(() => {
    // 获取数据源
    const dataSource = unref(getDataSourceRef);
    let propsData: any = {
      // 合并属性
      ...attrs,
      // 自定义行
      customRow,
      // 获取组件属性
      ...unref(getProps),
      // 获取表头属性
      ...unref(getHeaderProps),
      // 获取滚动属性
      scroll: unref(getScrollRef),
      // 获取加载属性
      loading: unref(getLoading),
      // 表格布局
      tableLayout: 'fixed',
      // 行选择
      rowSelection: unref(getRowSelectionRef),
      // 行键
      rowKey: unref(getRowKey),
      // 列
      columns: toRaw(unref(getViewColumns)),
      // 分页
      pagination: toRaw(unref(getPaginationInfo)),
      // 数据源
      dataSource,
      // 页脚
      footer: unref(getFooterProps),
      // 展开选项
      ...unref(getExpandOption),
    };
    // 如果存在展开行渲染，则移除滚动属性
    // if (slots.expandedRowRender) {
    //   propsData = omit(propsData, 'scroll');
    // }

    // 移除class和onChange属性
    propsData = omit(propsData, ['class', 'onChange']);
    return propsData;
  });

  // 计算属性，用于获取包装器的类名
  const getWrapperClass = computed(() => {
    // 获取绑定值
    const values = unref(getBindValues);
    // 返回一个数组，包含前缀类名、属性中的类名以及一个对象
    return [
      prefixCls,
      attrs.class,
      {
        // 如果使用搜索表单，则添加前缀类名-form-container
        [`${prefixCls}-form-container`]: values.useSearchForm,
        // 如果inset为true，则添加前缀类名--inset
        [`${prefixCls}--inset`]: values.inset,
      },
    ];
  });

  // 计算属性，用于判断是否显示空数据表格
  const getEmptyDataIsShowTable = computed(() => {
    // 获取 props 中的 emptyDataIsShowTable 和 useSearchForm 属性
    const { emptyDataIsShowTable, useSearchForm } = unref(getProps);
    // 如果 emptyDataIsShowTable 为 true，或者 useSearchForm 为 false，则返回 true
    if (emptyDataIsShowTable || !useSearchForm) {
      return true;
    }
    // 否则，判断数据源数组的长度是否大于 0，如果是，则返回 true，否则返回 false
    return !!unref(getDataSourceRef).length;
  });

  /**
   * 使用useTable 动态设置的props
   * @param props
   */
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
