import { isArray, isFunction, isEmpty, isObject, isString, isNil } from '@/utils/is';
import { dateUtil } from '@/utils/dateUtil';
import { unref } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import type { FormProps, FormSchemaInner as FormSchema } from '../types/form';
import { cloneDeep, get, set, unset } from 'lodash-es';

interface UseFormValuesContext {
  defaultValueRef: Ref<any>;
  getSchema: ComputedRef<FormSchema[]>;
  getProps: ComputedRef<FormProps>;
  formModel: Recordable;
}

/**
 * @desription deconstruct array-link key. This method will mutate the target.
 * 解构数组链接键。 该方法会改变目标
 */
// 函数tryDeconstructArray接收三个参数：key，value，target
// key是一个字符串，value是一个任意类型的值，target是一个可记录的对象
function tryDeconstructArray(key: string, value: any, target: Recordable) {
  // 定义一个正则表达式，匹配以[]包围的内容
  const pattern = /^\[(.+)\]$/;
  // 如果key符合正则表达式
  if (pattern.test(key)) {
    // 获取匹配结果
    const match = key.match(pattern);
    // 如果匹配结果存在
    if (match && match[1]) {
      // 将匹配结果以逗号分割，存入keys数组
      const keys = match[1].split(',');
      // 如果value是数组，则将其赋值给value，否则将value转换为数组
      value = Array.isArray(value) ? value : [value];
      // 遍历keys数组
      keys.forEach((k, index) => {
        // 将value数组的每一个元素赋值给target对象
        set(target, k.trim(), value[index]);
      });
      // 返回true
      return true;
    }
  }
}

/**
 * @desription deconstruct object-link key. This method will mutate the target.
 * 解构对象链接键。 该方法会改变目标。
 */
// 尝试对对象进行解构
function tryDeconstructObject(key: string, value: any, target: Recordable) {
  // 定义正则表达式，匹配以{}包围的字符串
  const pattern = /^\{(.+)\}$/;
  // 如果匹配成功
  if (pattern.test(key)) {
    // 获取匹配结果
    const match = key.match(pattern);
    // 如果匹配结果存在
    if (match && match[1]) {
      // 将匹配结果以逗号分割
      const keys = match[1].split(',');
      // 如果value是对象，则赋值给value，否则赋值给空对象
      value = isObject(value) ? value : {};
      // 遍历keys，将value中的属性赋值给target
      keys.forEach((k) => {
        set(target, k.trim(), value[k.trim()]);
      });
      // 返回true
      return true;
    }
  }
}

/**
 * 初始化默认值 & 处理表单值; 内部包括 处理时间范围值, 格式化时间
 * @param defaultValueRef
 * @param getSchema
 * @param formModel
 * @param getProps
 */
export function useFormValues({
  defaultValueRef,
  getSchema,
  formModel,
  getProps,
}: UseFormValuesContext) {
  // Processing form values
  /**
   * handleFormValues：处理表单值。
   * 这个函数会遍历表单值的键值对，根据键的格式进行解构，将解构后的值赋值给 res 对象。
   * 解构失败的键值对会按原样赋值给 res 对象。最后，调用 handleRangeTimeValue 函数处理时间范围值。
   * @param values 表单值
   * @returns 处理后的表单值
   */
  function handleFormValues(values: Recordable) {
    // 如果values不是对象，则返回空对象
    if (!isObject(values)) {
      return {};
    }
    // 定义一个空对象，用于存放处理后的表单值
    const res: Recordable = {};
    // 遍历表单值的键值对
    for (const item of Object.entries(values)) {
      // 获取键值对中的值
      let [, value] = item;
      // 获取键值对中的键
      const [key] = item;
      // 如果键不存在，或者值是空数组，或者是函数，则跳过
      if (!key || (isArray(value) && value.length === 0) || isFunction(value)) {
        continue;
      }
      // 获取转换日期函数
      const transformDateFunc = unref(getProps).transformDateFunc;
      // 如果值是对象，则调用转换日期函数
      if (isObject(value)) {
        value = transformDateFunc?.(value);
      }

      // 如果值是数组，且数组中的元素有format属性，则调用转换日期函数
      if (isArray(value) && value[0]?.format && value[1]?.format) {
        value = value.map((item) => transformDateFunc?.(item));
      }
      // 移除空格
      if (isString(value)) {
        value = value.trim();
      }
      // 如果解构失败，则按原样赋值
      if (!tryDeconstructArray(key, value, res) && !tryDeconstructObject(key, value, res)) {
        // 没有解构成功的，按原样赋值
        set(res, key, value);
      }
    }
    // 处理范围时间值
    return handleRangeTimeValue(res);
  }

  /**
   * Processing time interval parameters
   * 处理时间范围值。
   * 这个函数会遍历 fieldMapToTime 属性，
   * 根据 fieldMapToTime 的配置，将时间范围值格式化为指定的格式，并将格式化后的值赋值给 values 对象。
   */
  // 处理时间范围值
  function handleRangeTimeValue(values: Recordable) {
    // 获取fieldMapToTime属性
    const fieldMapToTime = unref(getProps).fieldMapToTime;

    // 如果fieldMapToTime属性不存在或者不是数组，直接返回values
    if (!fieldMapToTime || !Array.isArray(fieldMapToTime)) {
      return values;
    }

    // 遍历fieldMapToTime
    for (const [field, [startTimeKey, endTimeKey], format = 'YYYY-MM-DD'] of fieldMapToTime) {
      // 如果field或者startTimeKey或者endTimeKey不存在，跳过本次循环
      if (!field || !startTimeKey || !endTimeKey) {
        continue;
      }
      // 如果需要转换的值为空，删除该字段
      if (!get(values, field)) {
        unset(values, field);
        continue;
      }

      // 获取startTime和endTime
      const [startTime, endTime]: string[] = get(values, field);

      // 如果format是数组，分别设置startTimeFormat和endTimeFormat，否则都设置为format
      const [startTimeFormat, endTimeFormat] = Array.isArray(format) ? format : [format, format];

      // 如果startTime不为空，格式化startTime
      if (!isNil(startTime) && !isEmpty(startTime)) {
        set(values, startTimeKey, formatTime(startTime, startTimeFormat));
      }
      // 如果endTime不为空，格式化endTime
      if (!isNil(endTime) && !isEmpty(endTime)) {
        set(values, endTimeKey, formatTime(endTime, endTimeFormat));
      }
      // 删除该字段
      unset(values, field);
    }

    return values;
  }

  /**
   * 格式化时间。
   * 这个函数接收两个参数：time（字符串类型）和 format（字符串类型）。
   * 根据 format 参数返回对应格式的时间。
   * 如果 format 参数为 timestamp，则返回时间戳；
   * 如果 format 参数为 timestampStartDay，则返回当天开始时间的时间戳；否则返回对应格式的日期字符串。
   * @param time
   * @param format
   */
  function formatTime(time: string, format: string) {
    // 如果format参数为timestamp
    if (format === 'timestamp') {
      // 返回dateUtil函数处理后的时间戳
      return dateUtil(time).unix();
    } else if (format === 'timestampStartDay') {
      // 返回dateUtil函数处理后的当天开始时间的时间戳
      return dateUtil(time).startOf('day').unix();
    }
    // 否则返回dateUtil函数处理后的对应格式时间
    return dateUtil(time).format(format);
  }

  /**
   * 初始化默认值。
   * 这个函数会遍历 schema数组，将默认值和默认值对象赋值给 obj 对象。然后将 obj 对象的值赋值给 defaultValueRef 和 formModel。
   */
  function initDefault() {
    // 获取schema
    const schemas = unref(getSchema);
    // 定义一个空对象
    const obj: Recordable = {};
    // 遍历schema
    schemas.forEach((item) => {
      /*** 默认值可以是 Object 也可以是 其他类型 ***/
      const { defaultValue, defaultValueObj } = item;
      /*** 判断 默认值对象 defaultValueObj ***/
      const fieldKeys = Object.keys(defaultValueObj || {});
      // 如果默认值对象 存在
      if (fieldKeys.length) {
        // 遍历默认值对象的key
        fieldKeys.map((field) => {
          // 将默认值对象的值赋值给obj
          obj[field] = defaultValueObj![field];
          // 如果formModel中不存在该key，则将默认值对象的值赋值给formModel
          if (formModel[field] === undefined) {
            formModel[field] = defaultValueObj![field];
          }
        });
      }
      /*** 判断 默认值 defaultValue ***/
      // 如果默认值 存在.   isNil: 检查 value 是否是 null 或者 undefined。
      if (!isNil(defaultValue)) {
        // 将默认值赋值给obj
        obj[item.field] = defaultValue;
        // 如果formModel中不存在该key，则将默认值赋值给formModel
        if (formModel[item.field] === undefined) {
          formModel[item.field] = defaultValue;
        }
      }
    });
    // 将obj赋值给defaultValueRef
    defaultValueRef.value = cloneDeep(obj);
  }

  return { handleFormValues, initDefault };
}
