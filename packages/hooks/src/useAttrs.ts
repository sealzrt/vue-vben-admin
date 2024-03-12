import { type Recordable } from '@vben/types';
import { getCurrentInstance, reactive, shallowRef, watchEffect } from 'vue';

interface UseAttrsOptions {
  excludeListeners?: boolean;
  excludeKeys?: string[];
  excludeDefaultKeys?: boolean;
}

const DEFAULT_EXCLUDE_KEYS = ['class', 'style'];
const LISTENER_PREFIX = /^on[A-Z]/;

// 函数entries，该函数接受一个参数obj，类型为Recordable<T>，返回一个类型为[string, T][]的数组
function entries<T>(obj: Recordable<T>): [string, T][] {
  // 将obj的key值映射为一个数组，数组中的每个元素都是一个包含两个元素的数组，第一个元素是key，第二个元素是obj[key]
  return Object.keys(obj).map((key: string) => [key, obj[key]]);
}

/**
 * 对vue3的 context.attrs, 创建浅响应式的attrs对象.
 * setup(props, context){}
 *  context.attrs attrs,  非响应式对象, 未在 Props 里定义的属性都将变成 attrs, 等价于 $attrs
 *      注意: attrs.xxx 和 slots.xxx 不要进行解构, 请保持 attrs.xxx、slots.xxx 的方式来使用其数据，
 *      虽然这两个属性不是响应式对象，但对应的数据会随组件本身的更新而更新
 *  context.slots 非响应式对象, 等价于 $slots
 * @param options
 */
function useAttrs(options: UseAttrsOptions = {}): Recordable<any> {
  // 获取当前vue组件实例
  const instance = getCurrentInstance();
  // 如果不存在实例，则返回{}
  if (!instance) return {};

  // 从options中解构出excludeListeners、excludeKeys、excludeDefaultKeys
  const { excludeListeners = false, excludeKeys = [], excludeDefaultKeys = true } = options;

  // 定义一个只读的shallowRef，用来存储实例的属性
  const attrs = shallowRef({});

  // 定义一个allExcludeKeys，将excludeKeys和excludeDefaultKeys合并
  const allExcludeKeys = excludeKeys.concat(excludeDefaultKeys ? DEFAULT_EXCLUDE_KEYS : []);

  // 将实例的attrs 改为响应式
  instance.attrs = reactive(instance.attrs);

  // 监听实例属性的变化
  // watchEffect: 立即运行一个函数，同时响应式地追踪其依赖，并在依赖更改时重新执行
  watchEffect(() => {
    // 将实例的属性按照allExcludeKeys过滤，将不需要监听的属性值存入attrs
    const res = entries(instance.attrs).reduce((acm, [key, val]) => {
      if (!allExcludeKeys.includes(key) && !(excludeListeners && LISTENER_PREFIX.test(key))) {
        acm[key] = val;
      }

      return acm;
    }, {} as Recordable<any>);

    attrs.value = res;
  });

  // 返回attrs
  return attrs;
}

export { useAttrs, type UseAttrsOptions };
