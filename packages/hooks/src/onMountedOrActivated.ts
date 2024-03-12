import { type AnyFunction } from '@vben/types';
import { nextTick, onActivated, onMounted } from 'vue';

/**
 * 在 OnMounted 或者 OnActivated 时触发
 * @param hook 任何函数（包括异步函数）
 */
function onMountedOrActivated(hook: AnyFunction) {
  // 定义一个布尔类型的变量mounted
  let mounted: boolean;

  // 当组件被挂载时，执行hook函数
  onMounted(() => {
    hook();
    // 在下一个tick中，将mounted设置为true
    nextTick(() => {
      mounted = true;
    });
  });

  // 当组件被激活时，如果mounted为true，则执行hook函数
  onActivated(() => {
    if (mounted) {
      hook();
    }
  });
}

export { onMountedOrActivated };
