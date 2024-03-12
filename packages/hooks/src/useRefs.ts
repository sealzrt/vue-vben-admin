import type { ComponentPublicInstance, Ref } from 'vue';
import { onBeforeUpdate, shallowRef } from 'vue';

/**
 * 在一次 渲染/更新 的过程中 && for循环里 设置DOM节点的ref引用
 */
function useRefs<T = HTMLElement>(): {
  refs: Ref<T[]>;
  setRefs: (index: number) => (el: Element | ComponentPublicInstance | null) => void;
} {
  // 定义一个 浅层的响应式 变量refs，类型为Ref<T[]>，初始值为空数组
  const refs = shallowRef([]) as Ref<T[]>;

  // onBeforeUpdate(callback): 注册一个钩子，在组件即将因为响应式状态变更而更新其 DOM 树之前调用
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
