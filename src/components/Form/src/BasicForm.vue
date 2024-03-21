<template>
  <Form
    v-bind="getBindValue"
    :class="getFormClass"
    ref="formElRef"
    :model="formModel"
    @keypress.enter="handleEnterPress"
  >
    <Row v-bind="getRow">
      <slot name="formHeader"></slot>
      <template v-for="schema in getSchema" :key="schema.field">
        <FormItem
          :isAdvanced="fieldsIsAdvancedMap[schema.field]"
          :tableAction="tableAction"
          :formActionType="formActionType"
          :schema="schema"
          :formProps="getProps"
          :allDefaultValues="defaultValueRef"
          :formModel="formModel"
          :setFormModel="setFormModel"
        >
          <template #[item]="data" v-for="item in Object.keys($slots)">
            <slot :name="item" v-bind="data || {}"></slot>
          </template>
        </FormItem>
      </template>

      <FormAction v-bind="getFormActionBindProps" @toggle-advanced="handleToggleAdvanced">
        <template
          #[item]="data"
          v-for="item in ['resetBefore', 'submitBefore', 'advanceBefore', 'advanceAfter']"
        >
          <slot :name="item" v-bind="data || {}"></slot>
        </template>
      </FormAction>
      <slot name="formFooter"></slot>
    </Row>
  </Form>
</template>
<script lang="ts" setup>
  import type { FormActionType, FormProps, FormSchemaInner as FormSchema } from './types/form';
  import type { AdvanceState } from './types/hooks';
  import type { Ref } from 'vue';

  import { reactive, ref, computed, unref, onMounted, watch, nextTick, useAttrs } from 'vue';
  import { Form, Row, type FormProps as AntFormProps } from 'ant-design-vue';
  import FormItem from './components/FormItem.vue';
  import FormAction from './components/FormAction.vue';

  import { dateItemType, isIncludeSimpleComponents } from './helper';
  import { dateUtil } from '@/utils/dateUtil';

  import { deepMerge } from '@/utils';

  import { useFormValues } from './hooks/useFormValues';
  import useAdvanced from './hooks/useAdvanced';
  import { useFormEvents } from './hooks/useFormEvents';
  import { createFormContext } from './hooks/useFormContext';
  import { useAutoFocus } from './hooks/useAutoFocus';
  import { useModalContext } from '@/components/Modal';
  import { useDebounceFn } from '@vueuse/core';

  import { basicProps } from './props';
  import { useDesign } from '@/hooks/web/useDesign';
  import { cloneDeep } from 'lodash-es';
  import { TableActionType } from '@/components/Table';

  defineOptions({ name: 'BasicForm' });

  const props = defineProps(basicProps);

  // 定义一个emit函数，用于触发事件
  const emit = defineEmits([
    // 当高级表单切换时触发
    'advanced-change',
    // 当重置表单时触发
    'reset',
    // 当提交表单时触发
    'submit',
    // 当注册表单时触发
    'register',
    // 当表单字段值改变时触发
    'field-value-change',
  ]);

  // 获取当前组件的属性
  const attrs = useAttrs();

  // 创建一个响应式对象
  const formModel = reactive({});
  // 获取modal上下文
  const modalFn = useModalContext();

  // 创建一个响应式对象advanceState，类型为AdvanceState
  const advanceState = reactive<AdvanceState>({
    // 是否显示高级选项
    isAdvanced: true,
    // 是否隐藏高级按钮
    hideAdvanceBtn: false,
    // 是否加载
    isLoad: false,
    // 操作范围
    actionSpan: 6,
  });

  // 定义一个defaultValueRef变量，用于存储默认值
  const defaultValueRef = ref({});
  // 定义一个isInitedDefaultRef变量，用于判断是否已经初始化默认值
  const isInitedDefaultRef = ref(false);
  // 定义一个propsRef变量，用于存储FormProps类型的部分属性
  const propsRef = ref<Partial<FormProps>>();
  // 定义一个schemaRef变量，用于存储FormSchema类型的数组
  const schemaRef = ref<FormSchema[] | null>(null);
  // 定义一个formElRef变量，用于存储FormActionType类型的值
  const formElRef = ref<FormActionType | null>(null);

  const { prefixCls } = useDesign('basic-form');

  // Get the basic configuration of the form
  // 定义一个函数getProps，它是一个计算属性，用于获取表单的属性
  const getProps = computed(() => {
    // 将props和propsRef中的属性合并，并返回一个FormProps类型的对象
    return { ...props, ...unref(propsRef) } as FormProps;
  });

  const getFormClass = computed(() => {
    return [
      prefixCls,
      {
        [`${prefixCls}--compact`]: unref(getProps).compact,
      },
    ];
  });

  // Get uniform row style and Row configuration for the entire form
  // 获取整个表单的统一行样式和行配置
  const getRow = computed(() => {
    const { baseRowStyle = {}, rowProps } = unref(getProps);
    return {
      style: baseRowStyle,
      ...rowProps,
    };
  });

  // 获取所有的 属性
  const getBindValue = computed(() => ({ ...attrs, ...props, ...unref(getProps) }) as AntFormProps);

  // 计算属性: 获取schema
  const getSchema = computed((): FormSchema[] => {
    const schemas: FormSchema[] = unref(schemaRef) || (unref(getProps).schemas as any);
    // 遍历schemas
    for (const schema of schemas) {
      // 解构赋值
      const {
        defaultValue,
        component,
        componentProps = {},
        isHandleDateDefaultValue = true,
      } = schema;
      // 处理date类型
      if (
        isHandleDateDefaultValue &&
        defaultValue &&
        component &&
        dateItemType.includes(component)
      ) {
        // 创建opt对象
        const opt = {
          schema,
          tableAction: props.tableAction ?? ({} as TableActionType),
          formModel,
          formActionType: {} as FormActionType,
        };
        // 获取格式化器 valueFormat
        const valueFormat = componentProps
          ? typeof componentProps === 'function'
            ? componentProps(opt)['valueFormat'] // 如果 componentProps 是函数 函数调用
            : componentProps['valueFormat'] // 否则 componentProps 是对象
          : null;
        // 处理默认值
        if (!Array.isArray(defaultValue)) {
          // 普通类型 的默认值
          schema.defaultValue = valueFormat
            ? dateUtil(defaultValue).format(valueFormat)
            : dateUtil(defaultValue);
        } else {
          // 数组类型 的默认值
          const def: any[] = [];
          // 遍历defaultValue
          defaultValue.forEach((item) => {
            // 格式化item
            def.push(valueFormat ? dateUtil(item).format(valueFormat) : dateUtil(item));
          });
          // 将def赋值给schema.defaultValue
          schema.defaultValue = def;
        }
      }
    }
    // 如果props中showAdvancedButton属性为true，则过滤掉简单组件
    if (unref(getProps).showAdvancedButton) {
      return cloneDeep(
        schemas.filter((schema) => !isIncludeSimpleComponents(schema.component)) as FormSchema[],
      );
      // 否则直接返回schemas
    } else {
      return cloneDeep(schemas as FormSchema[]);
    }
  });

  /**
   * useAdvanced: 主要用于处理表单的布局和显示，根据屏幕尺寸和表单项的宽度自动切换到高级模式或简单模式
   */
  const { handleToggleAdvanced, fieldsIsAdvancedMap } = useAdvanced({
    advanceState,
    emit,
    getProps,
    getSchema,
    formModel,
    defaultValueRef,
  });

  /**
   * useFormValues: 初始化默认值 & 处理表单值; 内部包括 处理时间范围值, 格式化时间
   */
  const { handleFormValues, initDefault } = useFormValues({
    getProps,
    defaultValueRef,
    getSchema,
    formModel,
  });

  useAutoFocus({
    getSchema,
    getProps,
    isInitedDefault: isInitedDefaultRef,
    formElRef: formElRef as Ref<FormActionType>,
  });

  const {
    handleSubmit,
    setFieldsValue,
    clearValidate,
    validate,
    validateFields,
    getFieldsValue,
    updateSchema,
    resetSchema,
    appendSchemaByField,
    removeSchemaByField,
    resetFields,
    scrollToField,
  } = useFormEvents({
    emit,
    getProps,
    formModel,
    getSchema,
    defaultValueRef,
    formElRef: formElRef as Ref<FormActionType>,
    schemaRef: schemaRef as Ref<FormSchema[]>,
    handleFormValues,
  });

  // 创建一个表单上下文
  createFormContext({
    // 重置表单字段的操作
    resetAction: resetFields,
    // 提交表单的操作
    submitAction: handleSubmit,
  });

  // 监听 getProps.model 的变化
  watch(
    () => unref(getProps).model,
    () => {
      // 获取 getProps.model 的值
      const { model } = unref(getProps);
      // 如果 model 为空，则直接返回
      if (!model) return;
      // 将 model 的值设置到表单中
      setFieldsValue(model);
    },
    // 立即执行
    {
      immediate: true,
    },
  );

  // 当props.schemas发生变化时，调用resetSchema函数，并将schemas作为参数传入
  watch(
    () => props.schemas,
    (schemas) => {
      resetSchema(schemas ?? []);
    },
  );

  // 监听 schema 的变化
  watch(
    () => getSchema.value,
    (schema) => {
      // 执行nextTick函数
      nextTick(() => {
        // 调用modalFn的redoModalHeight函数，解决模态框自适应高度计算问题
        modalFn?.redoModalHeight?.();
      });
      // 如果isInitedDefaultRef为true，则直接返回
      if (unref(isInitedDefaultRef)) {
        return;
      }
      // 如果schema长度大于0，则初始化默认值
      if (schema?.length) {
        initDefault();
        isInitedDefaultRef.value = true;
      }
    },
  );

  // 使用watch监听formModel的变化
  watch(
    () => formModel,
    useDebounceFn(() => {
      // 如果getProps的submitOnChange属性为true，则调用handleSubmit方法
      unref(getProps).submitOnChange && handleSubmit();
    }, 300),
    { deep: true },
  );

  // 设置属性
  async function setProps(formProps: Partial<FormProps>): Promise<void> {
    // 将传入的属性与原有的属性进行深合并
    propsRef.value = deepMerge(unref(propsRef) || {}, formProps);
  }

  /**
   * 设置表单项的数据, 并触发事件
   * @param key
   * @param value
   * @param schema
   */
  function setFormModel(key: string, value: any, schema: FormSchema) {
    // 设置表单模型中的key对应的值为value
    formModel[key] = value;
    // 触发field-value-change事件，参数为key和value
    emit('field-value-change', key, value);
    // TODO 优化验证，这里如果是autoLink=false手动关联的情况下才会再次触发此函数
    // 如果schema存在且itemProps存在且autoLink为false，则抛出异常
    if (schema && schema.itemProps && !schema.itemProps.autoLink) {
      validateFields([key]).catch((_) => {});
    }
  }

  /**
   * 当按下 Enter 键时处理函数
   * @param e
   */
  function handleEnterPress(e: KeyboardEvent) {
    // 获取自动提交表单的属性
    const { autoSubmitOnEnter } = unref(getProps);
    // 如果没有开启自动提交，则直接返回
    if (!autoSubmitOnEnter) return;
    // 如果按下的是 Enter 键，并且有目标元素，且目标元素是 HTMLElement 类型
    if (e.key === 'Enter' && e.target && e.target instanceof HTMLElement) {
      // 将目标元素转换为 HTMLElement 类型
      const target: HTMLElement = e.target as HTMLElement;
      // 如果目标元素存在，且标签名是INPUT
      if (target && target.tagName && target.tagName.toUpperCase() == 'INPUT') {
        // 提交表单
        handleSubmit();
      }
    }
  }

  const formActionType = {
    getFieldsValue,
    setFieldsValue,
    resetFields,
    updateSchema,
    resetSchema,
    setProps,
    removeSchemaByField,
    appendSchemaByField,
    clearValidate,
    validateFields,
    validate,
    submit: handleSubmit,
    scrollToField: scrollToField,
  };

  const getFormActionBindProps = computed(
    () => ({ ...getProps.value, ...advanceState }) as InstanceType<typeof FormAction>['$props'],
  );

  defineExpose({
    ...formActionType,
  });

  /**
   * 当组件挂载时，初始化默认值，并触发 'register' 事件，将 formActionType 作为参数传递
   */
  onMounted(() => {
    initDefault();
    emit('register', formActionType);
  });
</script>

<style lang="less">
  @prefix-cls: ~'@{namespace}-basic-form';

  .@{prefix-cls} {
    .ant-form-item {
      &-label label::after {
        margin: 0 6px 0 2px;
      }

      // &-with-help {
      //   margin-bottom: 0;
      // }

      // &:not(.ant-form-item-with-help) {
      //   margin-bottom: 20px;
      // }

      &.suffix-item {
        .ant-form-item-children {
          display: flex;
        }

        .suffix {
          display: inline-flex;
          align-items: center;
          margin-top: 1px;
          padding-left: 6px;
          line-height: 1;
        }
      }
    }

    .ant-form-explain {
      font-size: 14px;
    }

    &--compact {
      .ant-form-item {
        margin-bottom: 8px !important;
      }
    }
  }
</style>
