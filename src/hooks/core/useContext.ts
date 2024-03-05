import {
  InjectionKey,
  provide,
  inject,
  reactive,
  readonly as defineReadonly,
  UnwrapRef,
} from 'vue';

export interface CreateContextOptions {
  readonly?: boolean;
  createProvider?: boolean;
  native?: boolean;
}

type ShallowUnwrap<T> = {
  [P in keyof T]: UnwrapRef<T[P]>;
};

/**
 * 使用 provide 创建上下文数据, 同时返回 reactive 包裹的 context
 * @param context
 * @param key
 * @param options
 */
export function createContext<T>(
  context: any,
  // InjectionKey: 当使用 TypeScript 时，key 可以是一个类型为 InjectionKey 的 symbol。InjectionKey 是一个 Vue 提供的工具类型，继承自 Symbol，可以用来同步 provide() 和 inject() 之间值的类型
  key: InjectionKey<T> = Symbol(),
  options: CreateContextOptions = {},
) {
  const { readonly = true, createProvider = true, native = false } = options;

  const state = reactive(context);
  // defineReadonly: 接受一个对象 (不论是响应式还是普通的) 或是一个 ref，返回一个原值的只读代理
  const provideData = readonly ? defineReadonly(state) : state;

  // vue3 provide 第二个参数 是提供的值，值可以是任意类型，包括响应式的状态，比如一个 ref / reactive
  createProvider && provide(key, native ? context : provideData);

  return {
    state,
  };
}

export function useContext<T>(key: InjectionKey<T>, native?: boolean): T;

/**
 * 使用inject 读取上下文数据
 * @param key
 * @param defaultValue
 */
export function useContext<T>(
  key: InjectionKey<T> = Symbol(),
  defaultValue?: any,
): ShallowUnwrap<T> {
  return inject(key, defaultValue || {});
}
