import type { TransitionSetting } from '#/config';

import { computed } from 'vue';

import { useAppStore } from '@/store/modules/app';

// 设置过渡设置
export function useTransitionSetting() {
  // 获取appStore
  const appStore = useAppStore();

  // 获取是否启用过渡设置
  const getEnableTransition = computed(() => appStore.getTransitionSetting?.enable);

  // 获取打开进度条
  const getOpenNProgress = computed(() => appStore.getTransitionSetting?.openNProgress);

  // 获取打开页面加载中
  const getOpenPageLoading = computed((): boolean => {
    return !!appStore.getTransitionSetting?.openPageLoading;
  });

  // 获取基本过渡设置
  const getBasicTransition = computed(() => appStore.getTransitionSetting?.basicTransition);

  // 设置过渡设置
  function setTransitionSetting(transitionSetting: Partial<TransitionSetting>) {
    // 设置项目配置
    appStore.setProjectConfig({ transitionSetting });
  }
  // 返回一个对象，包含设置过渡设置和获取过渡设置相关属性
  return {
    setTransitionSetting,

    getEnableTransition,
    getOpenNProgress,
    getOpenPageLoading,
    getBasicTransition,
  };
}
