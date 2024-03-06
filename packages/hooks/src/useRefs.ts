import type { ComponentPublicInstance, Ref } from 'vue';
import { onBeforeUpdate, shallowRef } from 'vue';

function useRefs<T = HTMLElement>(): {
  refs: Ref<T[]>;
  setRefs: (index: number) => (el: Element | ComponentPublicInstance | null) => void;
} {
  // 定义一个 浅层的响应式 变量refs，类型为Ref<T[]>，初始值为空数组
  const refs = shallowRef([]) as Ref<T[]>;

  // 这个钩子可以用来在 Vue 更新 DOM 之前访问 DOM 状态
  // 每一次DOM更新之前 清空 refs 数组
  onBeforeUpdate(() => {
    refs.value = [];
  });

  // 高阶函数, 第一次调用传入 index
  const setRefs = (index: number) => (el: Element | ComponentPublicInstance | null) => {
    refs.value[index] = el as T;
  };

  return {
    refs,
    setRefs,
  };
}

export { useRefs };
