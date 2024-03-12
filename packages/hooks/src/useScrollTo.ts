import { shallowRef, unref } from 'vue';

interface UseScrollToOptions {
  el: any;
  to: number;
  duration?: number;
  callback?: () => any;
}

function easeInOutQuad(t: number, b: number, c: number, d: number) {
  // 计算每次移动的距离
  t /= d / 2;
  // 如果移动距离小于1
  if (t < 1) {
    // 返回计算结果
    return (c / 2) * t * t + b;
  }
  // 移动距离大于等于1
  t--;
  // 返回计算结果
  return (-c / 2) * (t * (t - 2) - 1) + b;
}

// 定义一个移动函数，el为要移动的元素，amount为移动的距离
function move(el: HTMLElement, amount: number) {
  // 设置元素的滚动Top值
  el.scrollTop = amount;
}

// 获取元素滚动的位置
const position = (el: HTMLElement) => {
  return el.scrollTop;
};

/**
 * 使用UseScrollToOptions选项定义一个函数useScrollTo
 * @param {HTMLElement} el      - 需要滚动到的元素
 * @param {number} to    - 要滚动到的位置
 * @param {number} duration=500    - 动画的持续时间
 * @param {function} callback    - 动画完成的回调函数
 * @returns {ReturnType<Start, Stop}>
 */
function useScrollTo({ el, to, duration = 500, callback }: UseScrollToOptions) {
  // 创建一个isActiveRef，用来记录是否正在滚动
  const isActiveRef = shallowRef(false);
  // 获取元素当前的位置
  const start = position(el);
  // 计算要滚动的位置与当前位置的差值
  const change = to - start;
  // 设置动画的增量
  const increment = 20;
  // 设置当前动画的时间
  let currentTime = 0;

  // 定义动画滚动函数
  const animateScroll = function () {
    // 如果不在动画过程中，直接返回
    if (!unref(isActiveRef)) {
      return;
    }
    // 更新当前动画时间
    currentTime += increment;
    // 计算动画的当前位置
    const val = easeInOutQuad(currentTime, start, change, duration);
    // 移动元素
    move(el, val);
    // 如果动画还没有完成，并且还在动画过程中，继续下一帧
    if (currentTime < duration && unref(isActiveRef)) {
      requestAnimationFrame(animateScroll);
    } else {
      // 否则，如果存在回调函数，执行回调函数
      if (callback && typeof callback === 'function') {
        callback();
      }
    }
  };
  // 定义开始动画的函数
  const run = () => {
    // 设置isActiveRef为true
    isActiveRef.value = true;
    // 开始动画
    animateScroll();
  };

  // 定义停止动画的函数
  const stop = () => {
    // 设置isActiveRef为false
    isActiveRef.value = false;
  };

  // 返回开始动画和停止动画的方法
  return { start: run, stop };
}

export { useScrollTo, type UseScrollToOptions };
