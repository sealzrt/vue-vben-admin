import type { ComputedRef, Ref } from 'vue';
import type { FormProps, FormSchemaInner as FormSchema, FormActionType } from '../types/form';
import type { NamePath } from 'ant-design-vue/lib/form/interface';
import { unref, toRaw, nextTick } from 'vue';
import { isArray, isFunction, isObject, isString, isDef, isNil } from '@/utils/is';
import { deepMerge } from '@/utils';
import {
  dateItemType,
  handleInputNumberValue,
  defaultValueComponents,
  isIncludeSimpleComponents,
} from '../helper';
import { dateUtil } from '@/utils/dateUtil';
import { cloneDeep, set, uniqBy, get } from 'lodash-es';
import { error } from '@/utils/log';

interface UseFormActionContext {
  emit: EmitType;
  getProps: ComputedRef<FormProps>;
  getSchema: ComputedRef<FormSchema[]>;
  formModel: Recordable;
  defaultValueRef: Ref<Recordable>;
  formElRef: Ref<FormActionType>;
  schemaRef: Ref<FormSchema[]>;
  handleFormValues: Fn;
}

/**
 * 尝试构造数组
 * @param field 字段
 * @param values 可选参数
 * @returns any[] | undefined 数组或者undefined
 */
function tryConstructArray(field: string, values: Recordable = {}): any[] | undefined {
  // 匹配正则
  const pattern = /^\[(.+)\]$/;
  // 判断是否匹配
  if (pattern.test(field)) {
    // 获取匹配结果
    const match = field.match(pattern);
    // 判断是否有匹配结果
    if (match && match[1]) {
      // 以逗号分割
      const keys = match[1].split(',');
      // 判断分割结果是否为空
      if (!keys.length) {
        return undefined;
      }

      // 构造结果数组
      const result = [];
      // 遍历keys，并设置结果数组的值
      keys.forEach((k, index) => {
        set(result, index, values[k.trim()]);
      });

      // 返回过滤后的结果数组
      return result.filter(Boolean).length ? result : undefined;
    }
  }
}

function tryConstructObject(field: string, values: Recordable = {}): Recordable | undefined {
  const pattern = /^\{(.+)\}$/;
  if (pattern.test(field)) {
    const match = field.match(pattern);
    if (match && match[1]) {
      const keys = match[1].split(',');
      if (!keys.length) {
        return;
      }

      const result = {};
      keys.forEach((k) => {
        set(result, k.trim(), values[k.trim()]);
      });

      return Object.values(result).filter(Boolean).length ? result : undefined;
    }
  }
}

/**
 * 处理表单的 创建、更新、重置、验证等操作
 * @param emit
 * @param getProps
 * @param formModel
 * @param getSchema
 * @param defaultValueRef
 * @param formElRef
 * @param schemaRef
 * @param handleFormValues
 */
export function useFormEvents({
  emit,
  getProps,
  formModel,
  getSchema,
  defaultValueRef,
  formElRef,
  schemaRef,
  handleFormValues,
}: UseFormActionContext) {
  /**
   * 重置表单字段
   */
  async function resetFields(): Promise<void> {
    // 从props中获取resetFunc和submitOnReset属性
    const { resetFunc, submitOnReset } = unref(getProps);
    // 如果有resetFunc且为函数，则执行resetFunc
    resetFunc && isFunction(resetFunc) && (await resetFunc());

    // 获取表单元素引用
    const formEl = unref(formElRef);
    // 如果没有表单元素，则直接返回
    if (!formEl) return;

    // 遍历表单模型，为每个字段设置默认值
    Object.keys(formModel).forEach((key) => {
      // 获取字段对应的schema
      const schema = unref(getSchema).find((item) => item.field === key);
      // 获取字段默认值对象
      const defaultValueObj = schema?.defaultValueObj;
      // 获取默认值对象的key
      const fieldKeys = Object.keys(defaultValueObj || {});
      // 如果默认值对象存在，则遍历key，并为formModel设置默认值
      if (fieldKeys.length) {
        fieldKeys.map((field) => (formModel[field] = defaultValueObj![field]));
      }
      // 为formModel设置当前字段的默认值
      formModel[key] = getDefaultValue(schema, defaultValueRef, key);
    });
    // 执行nextTick，以清除验证
    nextTick(() => clearValidate());

    // 触发reset事件，并将formModel转换为raw格式
    emit('reset', toRaw(formModel));
    // 如果submitOnReset存在，则执行handleSubmit
    submitOnReset && handleSubmit();
  }

  /**
   * 获取表单所有字段, 并且转成一维数组
   */
  const getAllFields = () =>
    unref(getSchema)
      .map((item) => [...(item.fields || []), item.field])
      // flat 函数的作用是将一个多维数组转换为一维数组。在这个例子中，flat(1) 的作用是将 map 函数生成的二维数组转换为一维数组
      .flat(1)
      // 过滤掉空置
      .filter(Boolean);

  /**
   * 设置表单字段值
   */
  async function setFieldsValue(values: Recordable): Promise<void> {
    if (Object.keys(values).length === 0) {
      return;
    }

    const fields = getAllFields();

    // key 支持 a.b.c 的嵌套写法
    const delimiter = '.';
    const nestKeyArray = fields.filter((item) => String(item).indexOf(delimiter) >= 0);

    const validKeys: string[] = [];
    fields.forEach((key) => {
      const schema = unref(getSchema).find((item) => item.field === key);
      let value = get(values, key);
      const hasKey = Reflect.has(values, key);

      value = handleInputNumberValue(schema?.component, value);
      const { componentProps } = schema || {};
      let _props = componentProps as any;
      if (typeof componentProps === 'function') {
        _props = _props({
          formModel: unref(formModel),
          formActionType,
        });
      }

      const constructValue = tryConstructArray(key, values) || tryConstructObject(key, values);

      // 0| '' is allow
      if (hasKey || !!constructValue) {
        const fieldValue = constructValue || value;
        // time type
        if (itemIsDateType(key)) {
          if (Array.isArray(fieldValue)) {
            const arr: any[] = [];
            for (const ele of fieldValue) {
              arr.push(ele ? dateUtil(ele) : null);
            }
            unref(formModel)[key] = arr;
          } else {
            unref(formModel)[key] = fieldValue
              ? _props?.valueFormat
                ? fieldValue
                : dateUtil(fieldValue)
              : null;
          }
        } else {
          unref(formModel)[key] = fieldValue;
        }
        if (_props?.onChange) {
          _props?.onChange(fieldValue);
        }
        validKeys.push(key);
      } else {
        nestKeyArray.forEach((nestKey: string) => {
          try {
            const value = nestKey.split('.').reduce((out, item) => out[item], values);
            if (isDef(value)) {
              unref(formModel)[nestKey] = unref(value);
              validKeys.push(nestKey);
            }
          } catch (e) {
            // key not exist
            if (isDef(defaultValueRef.value[nestKey])) {
              unref(formModel)[nestKey] = cloneDeep(unref(defaultValueRef.value[nestKey]));
            }
          }
        });
      }
    });
    validateFields(validKeys).catch((_) => {});
  }

  /**
   * 除表单字段
   */
  async function removeSchemaByField(fields: string | string[]): Promise<void> {
    // 克隆深拷贝获取schema列表
    const schemaList: FormSchema[] = cloneDeep(unref(getSchema));
    // 如果没有传入fields参数，直接返回
    if (!fields) {
      return;
    }

    // 将fields参数转换为数组
    let fieldList: string[] = isString(fields) ? [fields] : fields;
    // 如果fields是字符串，将其转换为数组
    if (isString(fields)) {
      fieldList = [fields];
    }
    /*** 根据 field 参数, 从 formModal 和 schemaList 移除数据 ***/
    for (const field of fieldList) {
      _removeSchemaByFeild(field, schemaList);
    }
    // 将修改后的schema列表赋值给schemaRef
    schemaRef.value = schemaList;
  }

  /**
   * 根据 field 参数, 从 formModal 和 schemaList 移除
   */
  // 从formModel中移除指定字段的schema
  function _removeSchemaByFeild(field: string, schemaList: FormSchema[]): void {
    // 判断字段是否为字符串
    if (isString(field)) {
      // 查找指定字段的schema在schemaList中的索引
      const index = schemaList.findIndex((schema) => schema.field === field);
      // 如果索引不为-1，说明找到了指定字段的schema
      if (index !== -1) {
        // 从formModel中移除指定字段的值
        delete formModel[field];
        // 从schemaList中移除指定字段的schema
        schemaList.splice(index, 1);
      }
    }
  }

  /**
   * 添加表单字段
   */
  async function appendSchemaByField(
    schema: FormSchema | FormSchema[],
    prefixField?: string,
    first = false,
  ) {
    // 复制当前的schema
    const schemaList: FormSchema[] = cloneDeep(unref(getSchema));
    // 将传入的schema转换为数组
    const addSchemaIds: string[] = Array.isArray(schema)
      ? schema.map((item) => item.field)
      : [schema.field];
    // 判断传入的schema是否已经存在
    if (schemaList.find((item) => addSchemaIds.includes(item.field))) {
      error('There are schemas that have already been added');
      return;
    }
    // 查找 前缀field 在schemaList中的索引
    const index = schemaList.findIndex((schema) => schema.field === prefixField);
    // 将传入的schema转换为数组
    const _schemaList = isObject(schema) ? [schema as FormSchema] : (schema as FormSchema[]);
    // 根据前缀field的值判断是否插入到第一个位置或者push到末尾
    if (!prefixField || index === -1 || first) {
      first ? schemaList.unshift(..._schemaList) : schemaList.push(..._schemaList);
    } else if (index !== -1) {
      /** 根据 prefixField的index, 插入到指定位置 **/
      schemaList.splice(index + 1, 0, ..._schemaList);
    }
    /*** 更新schemaRef的值 ***/
    schemaRef.value = schemaList;
    // 设置默认值
    _setDefaultValue(schema);
  }

  /**
   * 重置表单字段
   * @param data
   */
  async function resetSchema(data: Partial<FormSchema> | Partial<FormSchema>[]) {
    // 声明一个空的updateData数组
    let updateData: Partial<FormSchema>[] = [];
    // 如果data是对象，则将其添加到updateData数组中
    if (isObject(data)) {
      updateData.push(data as FormSchema);
    }
    // 如果data是数组，则将data中的元素添加到updateData数组中
    if (isArray(data)) {
      updateData = [...data];
    }

    // 判断updateData数组中的每一个元素是否包含field字段
    const hasField = updateData.every(
      (item) =>
        isIncludeSimpleComponents(item.component) || (Reflect.has(item, 'field') && item.field),
    );

    // 如果不包含field字段，则抛出错误
    if (!hasField) {
      error(
        'All children of the form Schema array that need to be updated must contain the `field` field',
      );
      return;
    }
    // 将updateData数组赋值给schemaRef.value
    schemaRef.value = updateData as FormSchema[];
  }

  /**
   * 更新表单字段
   * @param {Partial<FormSchema> | Partial<FormSchema>[]} data - 更新的数据
   */
  async function updateSchema(data: Partial<FormSchema> | Partial<FormSchema>[]) {
    // 定义空数组
    let updateData: Partial<FormSchema>[] = [];
    // 如果传入的数据是对象，则将其添加到数组中
    if (isObject(data)) {
      updateData.push(data as FormSchema);
    }
    // 如果传入的数据是数组，则直接赋值
    if (isArray(data)) {
      updateData = [...data];
    }

    // 判断更新数据中是否包含`field`字段
    const hasField = updateData.every(
      (item) =>
        isIncludeSimpleComponents(item.component) || (Reflect.has(item, 'field') && item.field),
    );

    // 如果不包含，则报错
    if (!hasField) {
      error(
        'All children of the form Schema array that need to be updated must contain the `field` field',
      );
      return;
    }
    // 定义一个空数组，用于存放更新后的表单架构
    const schema: FormSchema[] = [];
    // 定义一个空数组，用于存放 更新的schema
    const updatedSchema: FormSchema[] = [];
    // 遍历表单架构
    unref(getSchema).forEach((val) => {
      // 查找需要更新的数据
      const updatedItem = updateData.find((item) => val.field === item.field);

      // 如果找到需要更新的数据，则进行合并
      if (updatedItem) {
        const newSchema = deepMerge(val, updatedItem);
        updatedSchema.push(newSchema as FormSchema);
        schema.push(newSchema as FormSchema);
      } else {
        // 如果没有找到需要更新的数据，则直接添加到数组中
        schema.push(val);
      }
    });
    // 设置默认值
    _setDefaultValue(updatedSchema);

    // 将更新后的表单架构赋值给`schemaRef`
    schemaRef.value = uniqBy(schema, 'field');
  }

  /**
   * 设置表单字段的默认值
   * @param data
   */
  function _setDefaultValue(data: FormSchema | FormSchema[]) {
    // 声明一个空的FormSchema数组
    let schemas: FormSchema[] = [];
    // 如果传入的数据是对象，则将其作为单个元素添加到数组中
    if (isObject(data)) {
      schemas.push(data as FormSchema);
    }
    // 如果传入的数据是数组，则直接赋值给schemas
    if (isArray(data)) {
      schemas = [...data];
    }

    // 声明一个空的recorder对象
    const obj: Recordable = {};
    // 获取当前表单项的值
    const currentFieldsValue = getFieldsValue();
    // 遍历schemas
    schemas.forEach((item) => {
      // 如果当前组件不是简单组件，且item中有field属性，且item.field不为空，且item.defaultValue不为空，且当前表单项的值中没有item.field，或者当前表单项的值为空
      if (
        !isIncludeSimpleComponents(item.component) &&
        Reflect.has(item, 'field') &&
        item.field &&
        !isNil(item.defaultValue) &&
        (!(item.field in currentFieldsValue) || isNil(currentFieldsValue[item.field]))
      ) {
        // 将item.defaultValue赋值给obj[item.field]
        obj[item.field] = item.defaultValue;
      }
    });
    // 将obj设置为当前表单项的值
    setFieldsValue(obj);
  }

  /**
   * 获取表单字段的值
   */
  function getFieldsValue(): Recordable {
    const formEl = unref(formElRef);
    if (!formEl) return {};
    return handleFormValues(toRaw(unref(formModel)));
  }

  /**
   * 判断字段是否为日期类型
   */
  function itemIsDateType(key: string) {
    return unref(getSchema).some((item) => {
      return item.field === key && item.component ? dateItemType.includes(item.component) : false;
    });
  }

  /**
   * 验证表单字段
   * @param nameList
   */
  async function validateFields(nameList?: NamePath[] | undefined) {
    const values = await unref(formElRef)?.validateFields(nameList);
    return handleFormValues(values);
  }

  /**
   * 设置form属性
   * @param formProps
   */
  async function setProps(formProps: Partial<FormProps>): Promise<void> {
    await unref(formElRef)?.setProps(formProps);
  }

  /**
   * 验证表单
   * @param nameList
   */
  async function validate(nameList?: NamePath[] | false | undefined) {
    // 定义一个变量_nameList，用于存储nameList的值
    let _nameList: any;
    // 如果nameList的值为undefined，则调用getAllFields()函数获取所有的字段
    if (nameList === undefined) {
      _nameList = getAllFields();
      // 如果nameList的值为数组，则将nameList的值赋值给_nameList
    } else {
      _nameList = nameList === Array.isArray(nameList) ? nameList : undefined;
    }
    // 获取表单的值
    const values = await unref(formElRef)?.validate(_nameList);
    // 处理表单的值
    return handleFormValues(values);
  }

  /**
   * 清除表单验证
   * @param name
   */
  async function clearValidate(name?: string | string[]) {
    await unref(formElRef)?.clearValidate(name);
  }

  /**
   * 滚动到指定字段
   * @param name
   * @param options
   */
  async function scrollToField(name: NamePath, options?: ScrollOptions | undefined) {
    await unref(formElRef)?.scrollToField(name, options);
  }

  /**
   * 处理表单提交
   */
  async function handleSubmit(e?: Event): Promise<void> {
    // 阻止表单的默认提交行为
    e && e.preventDefault();
    // 获取 submitFunc 函数
    const { submitFunc } = unref(getProps);
    // 如果 submitFunc 存在且是函数，则执行 submitFunc 函数
    if (submitFunc && isFunction(submitFunc)) {
      await submitFunc();
      return;
    }
    // 获取表单元素
    const formEl = unref(formElRef);
    // 如果表单元素不存在，则直接返回
    if (!formEl) return;
    try {
      // 执行验证函数，获取表单值
      const values = await validate();
      // 触发 submit 事件，传递表单值
      emit('submit', values);
    } catch (error: any) {
      // 如果错误信息中的 outOfDate 为 false，并且 errorFields 存在，则直接返回
      if (error?.outOfDate === false && error?.errorFields) {
        return;
      }
      // 否则抛出错误
      throw new Error(error);
    }
  }

  const formActionType: Partial<FormActionType> = {
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

  return {
    handleSubmit,
    clearValidate,
    validate,
    validateFields,
    getFieldsValue,
    updateSchema,
    resetSchema,
    appendSchemaByField,
    removeSchemaByField,
    resetFields,
    setFieldsValue,
    scrollToField,
  };
}

function getDefaultValue(
  schema: FormSchema | undefined,
  defaultValueRef: UseFormActionContext['defaultValueRef'],
  key: string,
) {
  let defaultValue = cloneDeep(defaultValueRef.value[key]);
  const isInput = checkIsInput(schema);
  if (isInput) {
    return defaultValue || undefined;
  }
  if (!defaultValue && schema && checkIsRangeSlider(schema)) {
    defaultValue = [0, 0];
  }
  if (!defaultValue && schema && schema.component === 'ApiTree') {
    defaultValue = [];
  }
  return defaultValue;
}

function checkIsRangeSlider(schema: FormSchema) {
  if (schema.component === 'Slider' && schema.componentProps && 'range' in schema.componentProps) {
    return true;
  }
}

function checkIsInput(schema?: FormSchema) {
  return schema?.component && defaultValueComponents.includes(schema.component);
}
