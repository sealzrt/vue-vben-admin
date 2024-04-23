import type { ComputedRef, Ref } from 'vue';

/**
 *
 * P in keyof T 表示 对T的所有属性 进行迭代
 *
 * Ref<T[P]>：表示属性值的引用，即响应式数据
 * T[P]：表示属性值的普通值，即非响应式数据
 * ComputedRef<T[P]>：表示属性值的计算属性引用，即通过其他属性计算得到的响应式数据。
 */
export type DynamicProps<T> = {
  [P in keyof T]: Ref<T[P]> | T[P] | ComputedRef<T[P]>;
};
