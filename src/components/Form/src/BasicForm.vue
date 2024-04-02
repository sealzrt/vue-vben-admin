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
        <!-- for循环 遍历字段-->
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
          <!--
                !!!透传插槽!!!
                FormItem的插槽内容, 动态作用域插槽!!!
                #[item]动态插槽key 与 FormItem 的 schema.slot 的配置key 不一致的会忽略
                $slots: 是父组件传入的所有插槽的集合
                data为FormItem 执行插槽函数时的 作用域插槽数据
          -->
          <template #[item]="data" v-for="item in Object.keys($slots)">
            <!-- #[item]动态插槽key 与 FormItem 的 schema.slot 配置key 不一致的会忽略-->
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

  /**
   * 主要用于封装表单，提供表单基本的布局和样式，同时提供一些功能，如处理时间范围值、格式化时间等
   * 当组件挂载时，初始化默认值，并触发 'register' 事件，将 formActionType 作为参数传递
   */
  defineOptions({ name: 'BasicForm' });

  // debugger

  // 为了在声明 props 和 emits 选项时获得完整的类型推导支持，我们可以使用 defineProps 和 defineEmits API
  /*** 定义props类型和默认值 ***/
  const props = defineProps(basicProps);

  // 为了在声明 props 和 emits 选项时获得完整的类型推导支持，我们可以使用 defineProps 和 defineEmits API
  const emit = defineEmits([
    // 高级表单切换 事件
    'advanced-change',
    // 重置表单 事件
    'reset',
    // 提交表单 事件
    'submit',
    // 注册表单 事件
    'register',
    // 表单字段值改变 事件
    'field-value-change',
  ]);

  // 获取当前组件的属性, useSlots 和 useAttrs 是真实的运行时函数
  const attrs = useAttrs();

  // 整个表单的数据
  const formModel = reactive({});
  // 获取modal上下文
  const modalFn = useModalContext();

  // 高级模式 state
  const advanceState = reactive<AdvanceState>({
    // 是否显示高级选项
    isAdvanced: true,
    // 是否隐藏高级按钮
    hideAdvanceBtn: false,
    // 是否加载
    isLoad: false,
    // 操作span
    actionSpan: 6,
  });

  /*** 默认值ref, 根据 getSchema 获取 并存储默认值 ***/
  const defaultValueRef = ref({});
  /*** 用于判断是否已经初始化默认值的标记 ***/
  const isInitedDefaultRef = ref(false);
  /*** 动态设置的props:  在 useForm 里动态设置的props, 包括设置 schema ***/
  const propsRef = ref<Partial<FormProps>>();
  /*** 根据props.schema 进行初始化, 后续的表单字段的改动 都是修改的该数据 ***/
  const schemaRef = ref<FormSchema[] | null>(null);
  // form表单的 ref
  const formElRef = ref<FormActionType | null>(null);

  const { prefixCls } = useDesign('basic-form');

  // Get the basic configuration of the form
  /*** 计算属性: BasicForm的所有props, 包括父组件直接设置的props 和 在父组件 使用 useForm/setProps 动态设置的props ***/
  const getProps = computed(() => {
    // debugger
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

  /*** 获取所有的属性: 声明的props(包括默认值), 未声明的父组件传递的attrs, 动态设置的props ***/
  const getBindValue = computed(() => ({ ...attrs, ...props, ...unref(getProps) }) as AntFormProps);

  /**** 计算属性: 获取schema集合, 优先从 schemaRef获取, 其次从 getProps.schemas 获取  ****/
  const getSchema = computed((): FormSchema[] => {
    // debugger
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

  // 监听: 如果 getProps.model 有变化, 更新表单项的数据
  watch(
    () => unref(getProps).model,
    () => {
      // debugger
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

  // 监听: props.schemas发生变化时，重新设置表单项/字段
  watch(
    () => props.schemas,
    (schemas) => {
      resetSchema(schemas ?? []);
    },
  );

  /*** 监听 schema 表单字段的变化, 调整高度 和 初始化默认值 ***/
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

  // 使用watch监听formModel的变化, 判断是否需要自动提交
  watch(
    () => formModel,
    useDebounceFn(() => {
      // 如果getProps的submitOnChange属性为true，则调用handleSubmit方法
      unref(getProps).submitOnChange && handleSubmit();
    }, 300),
    { deep: true },
  );

  /*** 在useForm 动态设置 form props, 包括 schema ***/
  async function setProps(formProps: Partial<FormProps>): Promise<void> {
    // 存储动态设置的form props
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

  /***** 定义: ref引用当前组件时 可暴露的 属性or方法; 在useForm实例中 可以对form实例进行调用 *****/
  defineExpose({
    ...formActionType,
  });

  /**
   * 当组件挂载时，初始化默认值，并触发 'register' 事件，将 formActionType 作为参数传递
   */
  onMounted(() => {
    // debugger
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
