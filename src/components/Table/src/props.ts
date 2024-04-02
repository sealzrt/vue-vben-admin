import type { PropType } from 'vue';
import type { PaginationProps } from './types/pagination';
import type {
  BasicColumn,
  FetchSetting,
  TableSetting,
  SorterResult,
  TableCustomRecord,
  TableRowSelection,
  SizeType,
  BasicTableProps,
} from './types/table';
import type { FormProps } from '@/components/Form';

import { DEFAULT_FILTER_FN, DEFAULT_SORT_FN, FETCH_SETTING, DEFAULT_SIZE } from './const';
import { propTypes } from '@/utils/propTypes';
import type { Key } from 'ant-design-vue/lib/table/interface';

export const basicProps = {
  // 是否点击行进行选择
  clickToRowSelect: { type: Boolean, default: true },
  // 是否是树形表格
  isTreeTable: Boolean,
  // 表格设置
  tableSetting: propTypes.shape<TableSetting>({}),
  // 是否缩进
  inset: Boolean,
  // 排序函数
  sortFn: {
    type: Function as PropType<(sortInfo: SorterResult) => any>,
    default: DEFAULT_SORT_FN,
  },
  // 过滤函数
  filterFn: {
    type: Function as PropType<(data: Partial<Recordable<string[]>>) => any>,
    default: DEFAULT_FILTER_FN,
  },
  // 是否显示表格设置
  showTableSetting: Boolean,
  // 是否自动创建key
  autoCreateKey: { type: Boolean, default: true },
  // 是否隔行换色
  striped: { type: Boolean, default: true },
  // 是否显示汇总
  showSummary: Boolean,
  // 汇总函数
  summaryFunc: {
    type: [Function, Array] as PropType<(...arg: any[]) => any[]>,
    default: null,
  },
  // 汇总数据
  summaryData: {
    type: Array as PropType<Recordable[]>,
    default: null,
  },
  // 缩进大小
  indentSize: propTypes.number.def(24),
  // 是否可拖动
  canColDrag: { type: Boolean, default: true },
  // 接口
  api: {
    type: Function as PropType<(...arg: any[]) => Promise<any>>,
    default: null,
  },
  // 请求之前
  beforeFetch: {
    type: Function as PropType<Fn>,
    default: null,
  },
  // 请求之后
  afterFetch: {
    type: Function as PropType<Fn>,
    default: null,
  },
  // 处理搜索信息
  handleSearchInfoFn: {
    type: Function as PropType<Fn>,
    default: null,
  },
  // 请求设置
  fetchSetting: {
    type: Object as PropType<FetchSetting>,
    default: () => {
      return FETCH_SETTING;
    },
  },
  // 立即请求接口
  immediate: { type: Boolean, default: true },
  // 是否显示表格
  emptyDataIsShowTable: { type: Boolean, default: true },
  // 额外的请求参数
  searchInfo: {
    type: Object as PropType<Recordable>,
    default: null,
  },
  // 默认的排序参数
  defSort: {
    type: Object as PropType<Recordable>,
    default: null,
  },
  // 使用搜索表单
  useSearchForm: propTypes.bool,
  // 表单配置
  formConfig: {
    type: Object as PropType<Partial<FormProps>>,
    default: null,
  },
  // 列配置
  columns: {
    type: Array as PropType<BasicColumn[]>,
    default: () => [],
  },
  // 是否显示索引列
  showIndexColumn: { type: Boolean, default: true },
  // 索引列配置
  indexColumnProps: {
    type: Object as PropType<BasicColumn>,
    default: null,
  },
  // 操作列配置
  actionColumn: {
    type: Object as PropType<BasicColumn>,
    default: null,
  },
  // 是否缩略
  ellipsis: { type: Boolean, default: true },
  // 是否可拖动
  isCanResizeParent: { type: Boolean, default: false },
  // 是否重置大小
  canResize: { type: Boolean, default: true },
  // 清除选择
  clearSelectOnPageChange: propTypes.bool,
  // 缩放高度偏移量
  resizeHeightOffset: propTypes.number.def(0),

  // rowSelection：表格行选择配置
  rowSelection: {
    type: Object as PropType<TableRowSelection | null>,
    default: null,
  },
  // showSelectionBar：是否显示选择栏
  showSelectionBar: propTypes.bool,
  // title：标题
  title: {
    type: [String, Function] as PropType<string | ((data: Recordable) => string)>,
    default: null,
  },
  // titleHelpMessage：标题帮助信息
  titleHelpMessage: {
    type: [String, Array] as PropType<string | string[]>,
  },
  // maxHeight：最大高度
  maxHeight: propTypes.number,
  // dataSource：数据源
  dataSource: {
    type: Array as PropType<Recordable[]>,
    default: null,
  },
  // rowKey：行key
  rowKey: {
    type: [String, Function] as PropType<BasicTableProps['rowKey']>,
    default: '',
  },
  // bordered：是否显示边框
  bordered: propTypes.bool,
  // pagination：分页配置
  pagination: {
    type: [Object, Boolean] as PropType<PaginationProps | boolean>,
    default: null,
  },
  // loading：加载状态
  loading: propTypes.bool,
  // rowClassName：行类名
  rowClassName: {
    type: Function as PropType<(record: TableCustomRecord<any>, index: number) => string>,
  },
  // scroll：滚动配置
  scroll: {
    type: Object as PropType<PropType<BasicTableProps['scroll']>>,
  },
  // beforeEditSubmit：编辑提交前
  beforeEditSubmit: {
    type: Function as PropType<
      (data: { record: Recordable; index: number; key: Key; value: any }) => Promise<any>
    >,
  },
  // size：大小
  size: {
    type: String as PropType<SizeType>,
    default: DEFAULT_SIZE,
  },
};
