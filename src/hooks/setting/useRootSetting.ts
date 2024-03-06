import type { ProjectConfig } from '#/config';

import { computed } from 'vue';

import { useAppStore } from '@/store/modules/app';
import { ContentEnum, ThemeEnum } from '@/enums/appEnum';

type RootSetting = Omit<
  ProjectConfig,
  'locale' | 'headerSetting' | 'menuSetting' | 'multiTabsSetting'
>;

export function useRootSetting() {
  // 使用AppStore
  const appStore = useAppStore();

  // 获取页面加载状态
  const getPageLoading = computed(() => appStore.getPageLoading);

  // 获取是否开启缓存
  const getOpenKeepAlive = computed(() => appStore.getProjectConfig.openKeepAlive);

  // 获取设置按钮位置
  const getSettingButtonPosition = computed(() => appStore.getProjectConfig.settingButtonPosition);

  // 获取是否可以嵌入IFrame页面
  const getCanEmbedIFramePage = computed(() => appStore.getProjectConfig.canEmbedIFramePage);

  // 获取权限模式
  const getPermissionMode = computed(() => appStore.getProjectConfig.permissionMode);

  // 获取是否显示Logo
  const getShowLogo = computed(() => appStore.getProjectConfig.showLogo);

  // 获取内容模式
  const getContentMode = computed(() => appStore.getProjectConfig.contentMode);

  // 获取是否开启返回顶部
  const getUseOpenBackTop = computed(() => appStore.getProjectConfig.useOpenBackTop);

  // 获取是否显示设置按钮
  const getShowSettingButton = computed(() => appStore.getProjectConfig.showSettingButton);

  // 获取是否开启错误处理
  const getUseErrorHandle = computed(() => appStore.getProjectConfig.useErrorHandle);

  // 获取是否显示底部
  const getShowFooter = computed(() => appStore.getProjectConfig.showFooter);

  // 获取是否显示面包屑
  const getShowBreadCrumb = computed(() => appStore.getProjectConfig.showBreadCrumb);

  // 获取主题颜色
  const getThemeColor = computed(() => appStore.getProjectConfig.themeColor);

  // 获取是否显示面包屑图标
  const getShowBreadCrumbIcon = computed(() => appStore.getProjectConfig.showBreadCrumbIcon);

  // 获取是否开启全屏
  const getFullContent = computed(() => appStore.getProjectConfig.fullContent);

  // 获取是否开启灰色模式
  const getColorWeak = computed(() => appStore.getProjectConfig.colorWeak);

  // 获取是否开启灰色模式
  const getGrayMode = computed(() => appStore.getProjectConfig.grayMode);

  // 获取锁定时间
  const getLockTime = computed(() => appStore.getProjectConfig.lockTime);

  // 获取是否显示深色模式切换
  const getShowDarkModeToggle = computed(() => appStore.getProjectConfig.showDarkModeToggle);

  // 获取深色模式
  const getDarkMode = computed(() => appStore.getDarkMode);

  // 获取布局内容模式
  const getLayoutContentMode = computed(() =>
    appStore.getProjectConfig.contentMode === ContentEnum.FULL
      ? ContentEnum.FULL
      : ContentEnum.FIXED,
  );

  // 设置根设置
  function setRootSetting(setting: Partial<RootSetting>) {
    appStore.setProjectConfig(setting);
  }

  // 设置深色模式
  function setDarkMode(mode: ThemeEnum) {
    appStore.setDarkMode(mode);
  }
  return {
    setRootSetting,

    getSettingButtonPosition,
    getFullContent,
    getColorWeak,
    getGrayMode,
    getLayoutContentMode,
    getPageLoading,
    getOpenKeepAlive,
    getCanEmbedIFramePage,
    getPermissionMode,
    getShowLogo,
    getUseErrorHandle,
    getShowBreadCrumb,
    getShowBreadCrumbIcon,
    getUseOpenBackTop,
    getShowSettingButton,
    getShowFooter,
    getContentMode,
    getLockTime,
    getThemeColor,
    getDarkMode,
    setDarkMode,
    getShowDarkModeToggle,
  };
}
