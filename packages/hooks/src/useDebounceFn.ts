import { TimeoutHandle } from '@vben/types';
import { onMounted, onUnmounted, ref, unref } from 'vue';

type DebouncedFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => void;

/**
 * 使用防抖功能的hooks
 * @param fn 需要防抖的功能函数
 * @param delay 防抖延迟时间，默认为200ms
 * @returns 装饰后的函数
 */
function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay = 200,
): DebouncedFunction<T> {
  // 声明定时器变量
  // let timeout: ReturnType<typeof setTimeout>;
  let timeout: TimeoutHandle;

  // 创建一个ref变量，用于判断是否可以执行fn
  const isReady = ref(true);

  /**
   * 装饰后的函数
   * @param args 函数参数
   */
  function debouncedFn(...args: Parameters<T>): void {
    // 如果ref为false，则不执行fn
    if (!unref(isReady)) {
      return;
    }

    // 设置ref为false
    isReady.value = false;
    // 清除定时器
    clearTimeout(timeout);

    // 设置定时器，delay后执行fn
    timeout = setTimeout(() => {
      fn(...args);
      // 执行后重新设置ref为true
      isReady.value = true;
    }, delay);
  }

  // 组件挂载时，设置ref为true
  onMounted(() => {
    isReady.value = true;
  });

  // 组件卸载时，清除定时器
  onUnmounted(() => {
    clearTimeout(timeout);
  });

  return debouncedFn;
}

export default useDebounceFn;
