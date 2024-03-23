import type { FieldMapToTime, FormSchema } from './types/form';
import type { CSSProperties, PropType } from 'vue';
import type { ColEx } from './types';
import type { TableActionType } from '@/components/Table';
import type { RowProps } from 'ant-design-vue/lib/grid/Row';
import { propTypes } from '@/utils/propTypes';

import { ButtonProps } from '@/components/Button';

// 导出基本属性
export const basicProps = {
  // 数据模型
  model: {
    type: Object as PropType<Recordable>,
    default: () => ({}),
  },
  // 标签宽度  固定宽度
  labelWidth: {
    type: [Number, String] as PropType<number | string>,
    default: 0,
  },
  // 时间映射
  fieldMapToTime: {
    type: Array as PropType<FieldMapToTime>,
    default: () => [],
  },
  // 紧凑
  compact: propTypes.bool,
  // 表单配置规则
  schemas: {
    type: Array as PropType<FormSchema[]>,
    default: () => [],
  },
  // 动态数据合并
  mergeDynamicData: {
    type: Object as PropType<Recordable>,
    default: null,
  },
  // 行样式
  baseRowStyle: {
    type: Object as PropType<CSSProperties>,
  },
  // 列属性
  baseColProps: {
    type: Object as PropType<Partial<ColEx>>,
  },
  // 自动设置占位符
  autoSetPlaceHolder: propTypes.bool.def(true),
  // 在INPUT组件上单击回车时，是否自动提交
  autoSubmitOnEnter: propTypes.bool.def(false),
  // 重置时提交
  submitOnReset: propTypes.bool,
  // 更改时提交
  submitOnChange: propTypes.bool,
  // 尺寸
  size: propTypes.oneOf(['default', 'small', 'large']).def('default'),
  // 禁用表单
  disabled: propTypes.bool,
  // 空值显示
  emptySpan: {
    type: [Number, Object] as PropType<number | Recordable>,
    default: 0,
  },
  // 是否显示收起展开按钮
  showAdvancedButton: propTypes.bool,
  // 转化时间
  transformDateFunc: {
    type: Function as PropType<Fn>,
    default: (date: any) => {
      return date?.format?.('YYYY-MM-DD HH:mm:ss') ?? date;
    },
  },
  // 规则消息连接标签
  rulesMessageJoinLabel: propTypes.bool.def(true),
  // 超过3行自动折叠
  autoAdvancedLine: propTypes.number.def(3),
  // 不受折叠影响的行数
  alwaysShowLines: propTypes.number.def(1),

  // 是否显示操作按钮
  showActionButtonGroup: propTypes.bool.def(true),
  // 操作列Col配置
  actionColOptions: Object as PropType<Partial<ColEx>>,
  // 显示重置按钮
  showResetButton: propTypes.bool.def(true),
  // 是否聚焦第一个输入框，只在第一个表单项为input的时候作用
  autoFocusFirstItem: propTypes.bool,
  // 重置按钮配置
  resetButtonOptions: Object as PropType<Partial<ButtonProps>>,

  // 显示确认按钮
  showSubmitButton: propTypes.bool.def(true),
  // 确认按钮配置
  submitButtonOptions: Object as PropType<Partial<ButtonProps>>,

  // 重置函数
  resetFunc: Function as PropType<() => Promise<void>>,
  // 提交函数
  submitFunc: Function as PropType<() => Promise<void>>,

  // 以下为默认props
  // 隐藏必填标记
  hideRequiredMark: propTypes.bool,

  // 标签列
  labelCol: Object as PropType<Partial<ColEx>>,

  // 布局
  layout: propTypes.oneOf(['horizontal', 'vertical', 'inline']).def('horizontal'),
  // 表格操作
  tableAction: {
    type: Object as PropType<TableActionType>,
  },

  // 列属性
  wrapperCol: Object as PropType<Partial<ColEx>>,

  // 对齐方式
  colon: propTypes.bool,

  // 标签对齐方式
  labelAlign,

  // rowProps：对象作为PropType<RowProps>的属性
  rowProps: Object as PropType<RowProps>,
};
