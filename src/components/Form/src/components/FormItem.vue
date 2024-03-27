<script lang="tsx">
  import { type Recordable, type Nullable } from '@vben/types';
  import type { PropType, Ref } from 'vue';
  import { computed, defineComponent, toRefs, unref } from 'vue';
  import {
    isComponentFormSchema,
    type FormActionType,
    type FormProps,
    type FormSchemaInner as FormSchema,
  } from '../types/form';
  import type { Rule as ValidationRule } from 'ant-design-vue/lib/form/interface';
  import type { TableActionType } from '@/components/Table';
  import { Col, Divider, Form } from 'ant-design-vue';
  import { componentMap } from '../componentMap';
  import { BasicHelp, BasicTitle } from '@/components/Basic';
  import { isBoolean, isFunction, isNull } from '@/utils/is';
  import { getSlot } from '@/utils/helper/tsxHelper';
  import {
    createPlaceholderMessage,
    isIncludeSimpleComponents,
    NO_AUTO_LINK_COMPONENTS,
    setComponentRuleType,
  } from '../helper';
  import { cloneDeep, upperFirst } from 'lodash-es';
  import { useItemLabelWidth } from '../hooks/useLabelWidth';
  import { useI18n } from '@/hooks/web/useI18n';

  export default defineComponent({
    name: 'BasicFormItem',
    inheritAttrs: false, // 禁止继承父组件属性
    props: {
      schema: {
        // 表单项/字段 配置
        type: Object as PropType<FormSchema>,
        default: () => ({}),
      },
      formProps: {
        // basicForm的所有属性
        type: Object as PropType<FormProps>,
        default: () => ({}),
      },
      allDefaultValues: {
        // 所有默认值
        type: Object as PropType<Recordable<any>>,
        default: () => ({}),
      },
      formModel: {
        // 表单模型, 包含所有的数据
        type: Object as PropType<Recordable<any>>,
        default: () => ({}),
      },
      setFormModel: {
        // 设置 表单项/字段 的值
        type: Function as PropType<(key: string, value: any, schema: FormSchema) => void>,
        default: null,
      },
      tableAction: {
        // 表格操作
        type: Object as PropType<TableActionType>,
      },
      formActionType: {
        // 表单操作
        type: Object as PropType<FormActionType>,
      },
      isAdvanced: {
        // 是否高级表单
        type: Boolean,
      },
    },
    setup(props, { slots }) {
      // 多语言
      const { t } = useI18n();

      // 注意: props.xxx 不要直接解构，这样会让数据失去响应性，一旦父组件发生数据变化，解构后的变量将无法同步更新为最新的值。
      // toRefs: 创建一个新的对象，它的每个字段都是 Reactive 对象各个字段的 Ref 变量; 使用 toRefs 就可以结构props
      /*** 借助toRefs 从props里解构 schema 和 formProps, 同时保证响应性 ***/
      const { schema, formProps } = toRefs(props) as {
        schema: Ref<FormSchema>;
        formProps: Ref<FormProps>;
      };

      // 组件 CropperAvatar 的 size 属性类型为 number
      // 此处补充一个兼容
      if (schema.value.component === 'CropperAvatar' && typeof formProps.value.size === 'string') {
        formProps.value.size = undefined;
      }

      const itemLabelWidthProp = useItemLabelWidth(schema, formProps);

      /**
       * 计算属性, 数据集合
       */
      const getValues = computed(() => {
        // 获取props中的参数
        const { allDefaultValues, formModel, schema } = props;
        // 获取props中的formProps
        const { mergeDynamicData } = props.formProps;
        // 返回一个对象
        return {
          // 字段
          field: schema.field,
          // 表单模型
          model: formModel,
          // 值
          values: {
            // 合并动态数据
            ...mergeDynamicData,
            // 合并默认值
            ...allDefaultValues,
            // 合并表单模型
            ...formModel,
          } as Recordable<any>,
          // 表单项/字段 配置
          schema: schema,
        };
      });

      /**
       * 获取组件的属性
       */
      const getComponentsProps = computed(() => {
        // 获取props中的参数
        const { schema, tableAction, formModel, formActionType } = props;
        // 获取组件属性
        let { componentProps = {} } = schema;
        // 如果组件属性是函数，则执行函数并获取返回值
        if (isFunction(componentProps)) {
          componentProps = componentProps({ schema, tableAction, formModel, formActionType }) ?? {};
        }
        // 如果组件是简单组件，则添加默认属性
        if (isIncludeSimpleComponents(schema.component)) {
          componentProps = Object.assign(
            { type: 'horizontal' },
            {
              orientation: 'left',
              plain: true,
            },
            componentProps,
          );
        }
        // 返回组件属性
        return componentProps as Recordable<any>;
      });

      /*** 计算属性，用于判断当前表单项是否禁用 ***/
      const getDisable = computed(() => {
        // 获取表单全局禁用状态
        const { disabled: globDisabled } = props.formProps;
        // 获取表单项动态禁用状态
        const { dynamicDisabled } = props.schema;
        // 获取表单项组件禁用状态
        const { disabled: itemDisabled = false } = unref(getComponentsProps);
        // 初始化禁用状态为全局禁用状态或表单项组件禁用状态
        let disabled = !!globDisabled || itemDisabled;
        // 如果动态禁用状态为布尔值
        if (isBoolean(dynamicDisabled)) {
          // 将动态禁用状态赋值给禁用状态
          disabled = dynamicDisabled;
        }
        // 如果动态禁用状态为函数
        if (isFunction(dynamicDisabled)) {
          // 将动态禁用状态函数执行，并将执行结果赋值给禁用状态
          disabled = dynamicDisabled(unref(getValues));
        }
        // 返回禁用状态
        return disabled;
      });

      /*** 计算属性, getReadonly，用于计算只读属性 ***/
      const getReadonly = computed(() => {
        // 从props中获取formProps和schema
        const { readonly: globReadonly } = props.formProps;
        const { dynamicReadonly } = props.schema;
        // 从组件属性中获取只读属性
        const { readonly: itemReadonly = false } = unref(getComponentsProps);

        // 初始化只读属性为全局只读属性和组件只读属性的或运算
        let readonly = globReadonly || itemReadonly;
        // 如果动态只读属性是布尔值，则只读属性等于动态只读属性
        if (isBoolean(dynamicReadonly)) {
          readonly = dynamicReadonly;
        }
        // 如果动态只读属性是函数，则只读属性等于动态只读函数的返回值
        if (isFunction(dynamicReadonly)) {
          readonly = dynamicReadonly(unref(getValues));
        }
        // 返回只读属性
        return readonly;
      });

      /**
       * 该函数主要用于判断当前项是否需要显示，以及是否需要根据条件显示
       */
      function getShow(): { isShow: boolean; isIfShow: boolean } {
        // 获取schema中的show和ifShow属性
        const { show, ifShow } = props.schema;
        // 获取formProps中的showAdvancedButton属性
        const { showAdvancedButton } = props.formProps;
        // 判断是否为高级选项
        const itemIsAdvanced = showAdvancedButton
          ? isBoolean(props.isAdvanced)
            ? props.isAdvanced
            : true
          : true;

        // 初始化isShow和isIfShow的值为true
        let isShow = true;
        let isIfShow = true;

        // 如果show的值为boolean类型，则将isShow的值赋值为show
        if (isBoolean(show)) {
          isShow = show;
        }
        // 如果ifShow的值为boolean类型，则将isIfShow的值赋值为ifShow
        if (isBoolean(ifShow)) {
          isIfShow = ifShow;
        }
        // 如果show的值为function类型，则将isShow的值赋值为show函数的返回值
        if (isFunction(show)) {
          isShow = show(unref(getValues));
        }
        // 如果ifShow的值为function类型，则将isIfShow的值赋值为ifShow函数的返回值
        if (isFunction(ifShow)) {
          isIfShow = ifShow(unref(getValues));
        }
        // 将isShow的值与itemIsAdvanced进行与运算
        isShow = isShow && itemIsAdvanced;
        // 返回isShow和isIfShow的值
        return { isShow, isIfShow };
      }

      function handleRules(): ValidationRule[] {
        const {
          rules: defRules = [],
          component,
          rulesMessageJoinLabel,
          label,
          dynamicRules,
          required,
        } = props.schema;
        if (isFunction(dynamicRules)) {
          return dynamicRules(unref(getValues)) as ValidationRule[];
        }

        let rules: ValidationRule[] = cloneDeep(defRules) as ValidationRule[];
        const { rulesMessageJoinLabel: globalRulesMessageJoinLabel } = props.formProps;

        const joinLabel = Reflect.has(props.schema, 'rulesMessageJoinLabel')
          ? rulesMessageJoinLabel
          : globalRulesMessageJoinLabel;
        const assertLabel = joinLabel ? (isFunction(label) ? '' : label) : '';
        const defaultMsg = component
          ? createPlaceholderMessage(component) + assertLabel
          : assertLabel;

        /**
         * 验证
         * @param rule
         * @param value
         */
        function validator(rule: any, value: any) {
          // 获取rule中的message，如果没有则获取默认的message
          const msg = rule.message || defaultMsg;
          // 如果value为空，则返回错误信息
          if (value === undefined || isNull(value)) {
            // 空值
            return Promise.reject(msg);
          } else if (Array.isArray(value) && value.length === 0) {
            // 数组类型
            return Promise.reject(msg);
          } else if (typeof value === 'string' && value.trim() === '') {
            // 空字符串
            return Promise.reject(msg);
          } else if (
            typeof value === 'object' &&
            Reflect.has(value, 'checked') &&
            Reflect.has(value, 'halfChecked') &&
            Array.isArray(value.checked) &&
            Array.isArray(value.halfChecked) &&
            value.checked.length === 0 &&
            value.halfChecked.length === 0
          ) {
            // 非关联选择的tree组件
            return Promise.reject(msg);
          }
          // 如果都不是，则返回成功信息
          return Promise.resolve();
        }

        const getRequired = isFunction(required) ? required(unref(getValues)) : required;

        /*
         * 1、若设置了required属性，又没有其他的rules，就创建一个验证规则；
         * 2、若设置了required属性，又存在其他的rules，则只rules中不存在required属性时，才添加验证required的规则
         *     也就是说rules中的required，优先级大于required
         */
        if (getRequired) {
          if (!rules || rules.length === 0) {
            const trigger = NO_AUTO_LINK_COMPONENTS.includes(component || 'Input')
              ? 'blur'
              : 'change';
            rules = [{ required: getRequired, validator, trigger }];
          } else {
            const requiredIndex: number = rules.findIndex((rule) => Reflect.has(rule, 'required'));

            if (requiredIndex === -1) {
              rules.push({ required: getRequired, validator });
            }
          }
        }

        const requiredRuleIndex: number = rules.findIndex(
          (rule) => Reflect.has(rule, 'required') && !Reflect.has(rule, 'validator'),
        );

        if (requiredRuleIndex !== -1) {
          const rule = rules[requiredRuleIndex];
          const { isShow } = getShow();
          if (!isShow) {
            rule.required = false;
          }
          if (component) {
            rule.message = rule.message || defaultMsg;

            if (component.includes('Input') || component.includes('Textarea')) {
              rule.whitespace = true;
            }
            const valueFormat = unref(getComponentsProps)?.valueFormat;
            setComponentRuleType(rule, component, valueFormat);
          }
        }

        // Maximum input length rule check
        const characterInx = rules.findIndex((val) => val.max);
        if (characterInx !== -1 && !rules[characterInx].validator) {
          rules[characterInx].message =
            rules[characterInx].message ||
            t('component.form.maxTip', [rules[characterInx].max] as Recordable<any>);
        }
        return rules;
      }

      /**
       * 渲染组件
       */
      function renderComponent() {
        // 如果props.schema不是组件表单模式，则返回null
        if (!isComponentFormSchema(props.schema)) {
          return null;
        }
        // 获取props.schema中的属性
        const {
          renderComponentContent,
          component,
          field,
          changeEvent = 'change',
          valueField,
        } = props.schema;

        // 判断component是否为Switch或Checkbox
        const isCheck = component && ['Switch', 'Checkbox'].includes(component);

        // 获取changeEvent的key
        const eventKey = `on${upperFirst(changeEvent)}`;

        // 定义on事件
        const on = {
          [eventKey]: (...args: Nullable<Recordable<any>>[]) => {
            const [e] = args;

            const target = e ? e.target : null;
            const value = target ? (isCheck ? target.checked : target.value) : e;
            props.setFormModel(field, value, props.schema);

            if (propsData[eventKey]) {
              propsData[eventKey](...args);
            }
          },
        };
        // 获取Comp组件
        const Comp = componentMap.get(component) as ReturnType<typeof defineComponent>;

        // 获取props.formProps中的属性
        const { autoSetPlaceHolder, size } = props.formProps;
        // 定义propsData
        const propsData: Recordable<any> = {
          allowClear: true,
          size,
          ...unref(getComponentsProps),
          disabled: unref(getDisable),
          readonly: unref(getReadonly),
        };

        // 判断是否需要设置占位符
        const isCreatePlaceholder = !propsData.disabled && autoSetPlaceHolder;
        // RangePicker占位符是数组
        if (isCreatePlaceholder && component !== 'RangePicker' && component) {
          propsData.placeholder =
            unref(getComponentsProps)?.placeholder || createPlaceholderMessage(component);
        }
        // 定义propsData
        propsData.codeField = field;
        propsData.formValues = unref(getValues);

        // 定义bindValue
        const bindValue: Recordable<any> = {
          [valueField || (isCheck ? 'checked' : 'value')]: props.formModel[field],
        };

        // 定义compAttr
        const compAttr: Recordable<any> = {
          ...propsData,
          ...on,
          ...bindValue,
        };

        // 如果没有renderComponentContent，则直接渲染Comp组件
        if (!renderComponentContent) {
          return <Comp {...compAttr} />;
        }

        /*** 插槽 ***/
        const compSlot = isFunction(renderComponentContent)
          ? {
              ...renderComponentContent(unref(getValues), {
                disabled: unref(getDisable),
                readonly: unref(getReadonly),
              }),
            }
          : {
              default: () => renderComponentContent,
            };
        return <Comp {...compAttr}>{compSlot}</Comp>;
      }

      function renderLabelHelpMessage() {
        const { label, helpMessage, helpComponentProps, subLabel } = props.schema;
        const getLabel = isFunction(label) ? label(unref(getValues)) : label;
        const renderLabel = subLabel ? (
          <span>
            {getLabel} <span class="text-secondary">{subLabel}</span>
          </span>
        ) : (
          getLabel
        );
        const getHelpMessage = isFunction(helpMessage)
          ? helpMessage(unref(getValues))
          : helpMessage;
        if (!getHelpMessage || (Array.isArray(getHelpMessage) && getHelpMessage.length === 0)) {
          return renderLabel;
        }
        return (
          <span>
            {renderLabel}
            <BasicHelp placement="top" class="mx-1" text={getHelpMessage} {...helpComponentProps} />
          </span>
        );
      }

      function renderItem() {
        // 解构出需要的属性
        const { itemProps, slot, render, field, suffix, component } = props.schema;
        // 获取itemLabelWidthProp的值
        const { labelCol, wrapperCol } = unref(itemLabelWidthProp);
        // 获取formProps的值
        const { colon } = props.formProps;
        // 获取getDisable和getReadonly的值
        const opts = { disabled: unref(getDisable), readonly: unref(getReadonly) };
        // 如果component的值为Divider，则渲染Divider组件
        if (component === 'Divider') {
          return (
            <Col span={24}>
              <Divider {...unref(getComponentsProps)}>{renderLabelHelpMessage()}</Divider>
            </Col>
          );
        } else if (component === 'BasicTitle') {
          // 如果component的值为BasicTitle，则渲染BasicTitle组件
          return (
            <Form.Item
              labelCol={labelCol}
              wrapperCol={wrapperCol}
              name={field}
              class={{ 'suffix-item': !!suffix }}
            >
              <BasicTitle {...unref(getComponentsProps)}>{renderLabelHelpMessage()}</BasicTitle>
            </Form.Item>
          );
        } else {
          // 否则渲染Form.Item组件
          const getContent = () => {
            // 如果存在slot，则从slots中获取slot，其次执行render函数，否则渲染renderComponent函数
            return slot
              ? getSlot(slots, slot, unref(getValues), opts)
              : render
                ? render(unref(getValues), opts)
                : renderComponent();
          };

          // 判断是否存在suffix
          const showSuffix = !!suffix;
          // 如果suffix是函数，则执行suffix函数，否则赋值suffix
          const getSuffix = isFunction(suffix) ? suffix(unref(getValues)) : suffix;

          // TODO 自定义组件验证会出现问题，因此这里框架默认将自定义组件设置手动触发验证，如果其他组件还有此问题请手动设置autoLink=false
          if (component && NO_AUTO_LINK_COMPONENTS.includes(component)) {
            props.schema &&
              (props.schema.itemProps! = {
                autoLink: false,
                ...props.schema.itemProps,
              });
          }

          // 渲染Form.Item组件
          return (
            <Form.Item
              name={field}
              colon={colon}
              class={{ 'suffix-item': showSuffix }}
              {...(itemProps as Recordable<any>)}
              label={renderLabelHelpMessage()}
              rules={handleRules()}
              labelCol={labelCol}
              wrapperCol={wrapperCol}
            >
              <div style="display:flex">
                <div style="flex:1;">{getContent()}</div>
                {showSuffix && <span class="suffix">{getSuffix}</span>}
              </div>
            </Form.Item>
          );
        }
      }

      return () => {
        // 获取props中的schema属性
        const { colProps = {}, colSlot, renderColContent, component, slot } = props.schema;
        // 如果componentMap中没有component，并且没有slot，则返回null
        if (!((component && componentMap.has(component)) || slot)) {
          return null;
        }

        // 获取props中的formProps属性
        const { baseColProps = {} } = props.formProps;
        // 将baseColProps和colProps合并, 获取列属性
        const realColProps = { ...baseColProps, ...colProps };
        // 获取isIfShow和isShow
        const { isIfShow, isShow } = getShow();
        // 获取getValues的值
        const values = unref(getValues);
        // 获取disabled和readonly
        const opts = { disabled: unref(getDisable), readonly: unref(getReadonly) };

        // 用于获取内容
        const getContent = () => {
          /*** 优先级: colSlot > renderColContent > 默认(包括: 'slot') ***/
          return colSlot
            ? getSlot(slots, colSlot, values, opts)
            : // 如果有renderColContent，则调用renderColContent
              renderColContent
              ? renderColContent(values, opts)
              : // 否则调用renderItem
                renderItem();
        };

        // 如果isIfShow为true，则返回Col组件
        return (
          isIfShow && (
            <Col {...realColProps} v-show={isShow}>
              {getContent()}
            </Col>
          )
        );
      };
    },
  });
</script>
