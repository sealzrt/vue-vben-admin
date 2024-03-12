import { type AnyFunction } from '@vben/types';
import { tryOnMounted, tryOnUnmounted, useDebounceFn } from '@vueuse/core';

interface UseWindowSizeOptions {
  wait?: number;
  once?: boolean;
  immediate?: boolean;
  listenerOptions?: AddEventListenerOptions | boolean;
}

function useWindowSizeFn(fn: AnyFunction, options: UseWindowSizeOptions = {}) {
  // 从 options 中解构出 wait 和 immediate 属性
  const { wait = 150, immediate } = options;
  // 定义一个函数用于渲染
  let handler = () => {
    fn();
  };
  // 使用 useDebounceFn 装饰器，使函数延迟执行
  const handleSize = useDebounceFn(handler, wait);
  // 将延迟执行的函数赋值给 handler
  handler = handleSize;

  // 定义一个函数，用于在窗口大小改变时执行
  const start = () => {
    // 如果 immediate 为 true，则立即执行 handler 函数
    if (immediate) {
      handler();
    }
    // 添加窗口大小改变监听器，当窗口大小改变时执行 handler 函数
    window.addEventListener('resize', handler);
  };

  // 定义一个函数，用于移除窗口大小改变监听器
  const stop = () => {
    // 移除窗口大小改变监听器
    window.removeEventListener('resize', handler);
  };

  // tryOnMounted: 安全执行onMounted。如果它在组件生命周期内，则调用 onMounted()，如果不在，则调用该函数
  tryOnMounted(() => {
    start();
  });

  // 安全执行 onUnmounted。如果在组件生命周期内，则调用 onUnmounted()，如果不在，则什么都不做
  tryOnUnmounted(() => {
    stop();
  });
  // 返回 start 和 stop 函数
  return { start, stop };
}

export { useWindowSizeFn, type UseWindowSizeOptions };
