import type { NamePath, RuleObject } from 'ant-design-vue/lib/form/interface';
import type { VNode, CSSProperties } from 'vue';
import type { ButtonProps as AntdButtonProps } from '@/components/Button';
import type { FormItem } from './formItem';
import type { ColEx, ComponentType, ComponentProps } from './';
import type { TableActionType } from '@/components/Table/src/types/table';
import type { RowProps } from 'ant-design-vue/lib/grid/Row';

/**
 * 日期/时间 组件的类型定义
 * [string, [string, string], (string | [string, string])?][]: 整体上，这表示一个由元组组成的数组，每个元组包含三个元素：
 *    第一个元素是一个字符串。
 *    第二个元素是一个包含两个字符串的数组。
 *    第三个元素是可选的，可以是一个字符串，也可以是一个包含两个字符串的数组
 */
export type FieldMapToTime = [string, [string, string], (string | [string, string])?][];

/**
 * 规则
 */
export type Rule = RuleObject & {
  trigger?: 'blur' | 'change' | ['change', 'blur'];
};

// 渲染函数的参数类型
export interface RenderCallbackParams {
  // 表单schema
  schema: FormSchemaInner;
  // 表单值
  values: Recordable;
  // 模型
  model: Recordable;
  // 字段
  field: string;
}

/**
 * 扩展属性, 添加 text
 */
export interface ButtonProps extends AntdButtonProps {
  text?: string;
}

/**
 * 操作Form表单的接口定义
 */
export interface FormActionType {
  // 提交表单
  submit: () => Promise<void>;
  // 设置表单字段值
  setFieldsValue: (values: Recordable) => Promise<void>;
  // 重置表单
  resetFields: () => Promise<void>;
  // 获取表单字段值
  getFieldsValue: () => Recordable;
  // 清除验证
  clearValidate: (name?: string | string[]) => Promise<void>;
  // 更新表单模式
  updateSchema: (data: Partial<FormSchemaInner> | Partial<FormSchemaInner>[]) => Promise<void>;
  // 重置表单模式
  resetSchema: (data: Partial<FormSchemaInner> | Partial<FormSchemaInner>[]) => Promise<void>;
  // 设置表单属性
  setProps: (formProps: Partial<FormProps>) => Promise<void>;
  // 根据字段移除表单模式
  removeSchemaByField: (field: string | string[]) => Promise<void>;
  // 根据字段添加表单模式
  appendSchemaByField: (
    schema: FormSchemaInner | FormSchemaInner[],
    prefixField: string | undefined,
    first?: boolean | undefined,
  ) => Promise<void>;
  // 验证表单字段
  validateFields: (nameList?: NamePath[]) => Promise<any>;
  // 验证表单
  validate: <T = Recordable>(nameList?: NamePath[] | false) => Promise<T>;
  // 滚动到表单字段
  scrollToField: (name: NamePath, options?: ScrollOptions) => Promise<void>;
}

// 注册函数
export type RegisterFn = (formInstance: FormActionType) => void;

// useForm的返回值的类型
export type UseFormReturnType = [RegisterFn, FormActionType];

/**
 * BasicForm 的 Props 定义
 */
export interface FormProps {
  // 表单名称
  name?: string;
  // 表单布局方式
  layout?: 'vertical' | 'inline' | 'horizontal';
  // 表单值
  model?: Recordable;
  // 表单宽度
  labelWidth?: number | string;
  // 对齐方式
  labelAlign?: 'left' | 'right';
  // 行配置
  rowProps?: RowProps;
  // 提交表单时重置
  submitOnReset?: boolean;
  // 提交表单时改变
  submitOnChange?: boolean;
  // 列-标签 宽度配置
  labelCol?: Partial<ColEx>;
  // 列-输入框 宽度配置
  wrapperCol?: Partial<ColEx>;

  // 通用行样式
  baseRowStyle?: CSSProperties;

  // 通用列配置
  baseColProps?: Partial<ColEx>;

  // 表单项
  schemas?: FormSchema[];
  // 用于合并动态控制表单项的函数值
  mergeDynamicData?: Recordable;
  // 紧凑模式
  compact?: boolean;
  // 空行跨度
  emptySpan?: number | Partial<ColEx>;
  // 内联模式
  inline?: boolean;
  // 是否禁用
  disabled?: boolean;
  // 是否只读
  readonly?: boolean;
  // 时间间隔字段映射到多个
  fieldMapToTime?: FieldMapToTime;
  // 自动设置占位符
  autoSetPlaceHolder?: boolean;
  // 自动提交表单
  autoSubmitOnEnter?: boolean;
  // 检查信息是否添加到标签
  rulesMessageJoinLabel?: boolean;
  // 是否显示折叠和展开按钮
  showAdvancedButton?: boolean;
  // 是否自动聚焦第一个输入框
  autoFocusFirstItem?: boolean;
  // 自动折叠超过指定数量的行
  autoAdvancedLine?: number;
  // 始终显示行
  alwaysShowLines?: number;
  // 是否显示操作按钮
  showActionButtonGroup?: boolean;

  // 重置按钮配置
  resetButtonOptions?: Partial<ButtonProps>;

  // 确认按钮配置
  submitButtonOptions?: Partial<ButtonProps>;

  // 操作列配置
  actionColOptions?: Partial<ColEx>;

  // 显示重置按钮
  showResetButton?: boolean;
  // 显示确认按钮
  showSubmitButton?: boolean;

  // 重置函数，返回一个Promise<void>
  resetFunc?: () => Promise<void>;
  // 提交函数，返回一个Promise<void>
  submitFunc?: () => Promise<void>;
  // 转换日期函数，接收一个date参数，返回一个字符串
  transformDateFunc?: (date: any) => string;
  // 是否显示冒号
  colon?: boolean;
}

/**
 * 渲染函数的选项
 */
export type RenderOpts = {
  disabled: boolean;
  [key: string]: any;
};

/**
 * 基础表单项 的类型定义
 */
interface BaseFormSchema<T extends ComponentType = any> {
  // 字段名
  field: string;
  // 额外字段名，[]
  fields?: string[];
  // Event name triggered by internal value change, default change
  // 触发内部值变化的Event名称，默认change
  changeEvent?: string;
  // Variable name bound to v-model Default value
  // 绑定v-model的变量名，默认value
  valueField?: string;
  // Label name
  // 标签名
  label?: string | VNode | ((renderCallbackParams: RenderCallbackParams) => string | VNode);
  // Auxiliary text
  // 辅助文本
  subLabel?: string;
  // Help text on the right side of the text
  // 右侧文本框的帮助文本
  helpMessage?:
    | string
    | string[]
    | ((renderCallbackParams: RenderCallbackParams) => string | string[]);
  // BaseHelp component props
  // BaseHelp组件props
  helpComponentProps?: Partial<HelpComponentProps>;
  // Label width, if it is passed, the labelCol and WrapperCol configured by itemProps will be invalid
  // 标签宽度，如果传入了，itemProps配置的labelCol和wrapperCol将无效
  labelWidth?: string | number;
  // Disable the adjustment of labelWidth with global settings of formModel, and manually set labelCol and wrapperCol by yourself
  // 禁用全局设置的labelWidth调整，手动设置labelCol和wrapperCol
  disabledLabelWidth?: boolean;
  // 组件参数
  componentProps?:
    | ((opt: {
        schema: FormSchema;
        tableAction: TableActionType;
        formActionType: FormActionType;
        formModel: Recordable;
      }) => ComponentProps[T])
    | ComponentProps[T];
  // Required 必填
  required?: boolean | ((renderCallbackParams: RenderCallbackParams) => boolean);

  // 约定的固定的部分？
  suffix?: string | number | ((values: RenderCallbackParams) => string | number);

  // Validation rules
  // 验证规则
  rules?: Rule[];
  // Check whether the information is added to the label
  // 检查信息是否添加到标签
  rulesMessageJoinLabel?: boolean;

  // Reference formModelItem
  // 引用formModelItem
  itemProps?: Partial<FormItem>;

  // col configuration outside formModelItem
  colProps?: Partial<ColEx>;

  // 默认值
  defaultValue?: any;

  // 默认值对象
  defaultValueObj?: { [key: string]: any };

  // 是否自动处理与时间相关组件的默认值
  isHandleDateDefaultValue?: boolean;

  // 是否高级
  isAdvanced?: boolean;

  // Matching details components
  span?: number;

  ifShow?: boolean | ((renderCallbackParams: RenderCallbackParams) => boolean);

  show?: boolean | ((renderCallbackParams: RenderCallbackParams) => boolean);

  // Render the content in the form-item tag
  // 在表单项中渲染内容
  render?: (
    renderCallbackParams: RenderCallbackParams,
    opts: RenderOpts,
  ) => VNode | VNode[] | string;

  // Rendering col content requires outer wrapper form-item
  // 渲染col内容需要外层form-item包裹
  renderColContent?: (
    renderCallbackParams: RenderCallbackParams,
    opts: RenderOpts,
  ) => VNode | VNode[] | string;

  // 渲染组件内容
  renderComponentContent?:
    | ((renderCallbackParams: RenderCallbackParams, opts: RenderOpts) => any)
    | VNode
    | VNode[]
    | string;

  // Custom slot, similar to renderColContent
  // 自定义插槽，类似于renderColContent
  colSlot?: string;

  dynamicDisabled?: boolean | ((renderCallbackParams: RenderCallbackParams) => boolean);

  dynamicReadonly?: boolean | ((renderCallbackParams: RenderCallbackParams) => boolean);

  dynamicRules?: (renderCallbackParams: RenderCallbackParams) => Rule[];
}

/**
 * 具有slot配置的 表单项，扩展自 基础表单项
 */
export interface SlotFormSchema extends BaseFormSchema {
  /*** Custom slot, in form-item; 自定义插槽 ***/
  slot: string;
}

/**
 * 具有组件配置的 表单项, 扩展自 基础表单项
 * ComponentFormSchema<T> 接口具有 BaseFormSchema<T> 接口的所有属性，以及额外的 component 属性
 */
export interface ComponentFormSchema<T extends ComponentType = any> extends BaseFormSchema<T> {
  // render component
  component: T;
}

/**
 * ComponentFormSchemaType 基本等于 ComponentFormSchema
 */
type ComponentFormSchemaType<T extends ComponentType = ComponentType> = T extends any
  ? ComponentFormSchema<T>
  : never;

/**
 * 表单项的结构：具有slot配置 或 具有component配置
 */
export type FormSchema = ComponentFormSchemaType | SlotFormSchema;

/**
 * ??? 内部表单项结构 ???
 */
export type FormSchemaInner = Partial<ComponentFormSchema> &
  Partial<SlotFormSchema> &
  BaseFormSchema;

export function isSlotFormSchema(schema: FormSchemaInner): schema is SlotFormSchema {
  return 'slot' in schema;
}

export function isComponentFormSchema(schema: FormSchemaInner): schema is ComponentFormSchema {
  return !isSlotFormSchema(schema);
}
/**
 * HelpComponentProps 接口用于定义HelpComponent组件的属性
 */
export interface HelpComponentProps {
  /**
   * 组件的最大宽度
   */
  maxWidth: string;
  /**
   * 是否显示序号
   */
  showIndex: boolean;
  /**
   * 文本
   */
  text: any;
  /**
   * 颜色
   */
  color: string;
  /**
   * 字体大小
   */
  fontSize: string;
  /**
   * icon图标
   */
  icon: string;
  /**
   * 绝对定位
   */
  absolute: boolean;
  /**
   * 定位数据
   */
  position: any;
}
