import type {
  FormProps,
  FormActionType,
  UseFormReturnType,
  FormSchemaInner as FormSchema,
} from '../types/form';
import type { NamePath } from 'ant-design-vue/lib/form/interface';
import type { DynamicProps } from '#/utils';
import { ref, onUnmounted, unref, nextTick, watch } from 'vue';
import { isProdMode } from '@/utils/env';
import { error } from '@/utils/log';
import { getDynamicProps } from '@/utils';

export declare type ValidateFields = (nameList?: NamePath[]) => Promise<Recordable>;

type Props = Partial<DynamicProps<FormProps>>;

/**
 * 注册一个表单实例, 对form实例 提供了一些操作接口
 * 监听表单属性的变化，并在变化时更新表单实例的属性
 * 提供一些方法，用于操作表单实例，如滚动到指定字段、设置表单属性/schemas、更新表单模式、获取表单值、设置表单值、验证表单 等
 * @param props
 */
export function useForm(props?: Props): UseFormReturnType {
  // 定义formRef变量，类型为Nullable<FormActionType>
  const formRef = ref<Nullable<FormActionType>>(null);
  // 定义loadedRef变量，类型为Nullable<boolean>
  const loadedRef = ref<Nullable<boolean>>(false);

  // 异步函数，获取form实例
  async function getForm() {
    // 获取form实例
    const form = unref(formRef);
    // 如果form实例不存在
    if (!form) {
      // 报错
      error(
        'The form instance has not been obtained, please make sure that the form has been rendered when performing the form operation!',
      );
    }
    // 等待下一次DOM更新
    await nextTick();
    // 返回form实例，类型为FormActionType
    return form as FormActionType;
  }

  // 注册函数，用于注册表单实例
  function register(instance: FormActionType) {
    // 如果是生产模式，则在组件卸载时清空表单实例和加载状态
    isProdMode() &&
      onUnmounted(() => {
        formRef.value = null;
        loadedRef.value = null;
      });
    // 如果表单已经加载并且是生产模式，且当前表单实例和之前注册的表单实例相同，则不进行注册
    if (unref(loadedRef) && isProdMode() && instance === unref(formRef)) return;

    // 注册表单实例
    formRef.value = instance;
    // 设置加载状态
    loadedRef.value = true;

    // 监听props的变化, 如果表单属性发生变化，则更新表单实例的属性
    watch(
      () => props,
      () => {
        // 如果props存在，则设置实例的props为获取到的动态属性
        props && instance.setProps(getDynamicProps(props));
      },
      {
        // 立即执行
        immediate: true,
        // 深度监听
        deep: true,
      },
    );
  }

  const methods: FormActionType = {
    // 滚动到指定字段
    scrollToField: async (name: NamePath, options?: ScrollOptions | undefined) => {
      const form = await getForm();
      form.scrollToField(name, options);
    },
    // 设置表单属性
    setProps: async (formProps: Partial<FormProps>) => {
      const form = await getForm();
      form.setProps(formProps);
    },

    // 更新表单模式
    updateSchema: async (data: Partial<FormSchema> | Partial<FormSchema>[]) => {
      const form = await getForm();
      form.updateSchema(data);
    },

    // 重置表单模式
    resetSchema: async (data: Partial<FormSchema> | Partial<FormSchema>[]) => {
      const form = await getForm();
      form.resetSchema(data);
    },

    // 清除验证
    clearValidate: async (name?: string | string[]) => {
      const form = await getForm();
      form.clearValidate(name);
    },

    // 重置字段
    async resetFields() {
      getForm().then(async (form) => {
        await form.resetFields();
      });
    },

    // 根据字段移除模式
    removeSchemaByField: async (field: string | string[]) => {
      unref(formRef)?.removeSchemaByField(field);
    },

    // 获取表单值
    // TODO promisify
    getFieldsValue: <T>() => {
      return unref(formRef)?.getFieldsValue() as T;
    },

    // 设置表单值
    setFieldsValue: async <T extends Recordable<any>>(values: T) => {
      const form = await getForm();
      form.setFieldsValue(values);
    },

    // 根据字段追加模式
    appendSchemaByField: async (
      schema: FormSchema | FormSchema[],
      prefixField: string | undefined,
      first?: boolean,
    ) => {
      const form = await getForm();
      form.appendSchemaByField(schema, prefixField, first);
    },

    // 提交
    submit: async (): Promise<any> => {
      const form = await getForm();
      return form.submit();
    },

    // 验证
    validate: async <T = Recordable>(nameList?: NamePath[] | false): Promise<T> => {
      const form = await getForm();
      return form.validate(nameList);
    },

    // 验证字段
    validateFields: async (nameList?: NamePath[]): Promise<Recordable> => {
      const form = await getForm();
      return form.validateFields(nameList);
    },
  };

  return [register, methods];
}
