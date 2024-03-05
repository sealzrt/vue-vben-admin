import type {
  ProjectConfig,
  HeaderSetting,
  MenuSetting,
  TransitionSetting,
  MultiTabsSetting,
} from '#/config';
import type { BeforeMiniState, ApiAddress } from '#/store';

import { defineStore } from 'pinia';
import { store } from '@/store';

import { ThemeEnum } from '@/enums/appEnum';
import { APP_DARK_MODE_KEY, PROJ_CFG_KEY, API_ADDRESS } from '@/enums/cacheEnum';
import { Persistent } from '@/utils/cache/persistent';
import { darkMode } from '@/settings/designSetting';
import { resetRouter } from '@/router';
import { deepMerge } from '@/utils';

interface AppState {
  darkMode?: ThemeEnum;
  // Page loading status
  pageLoading: boolean;
  // project config
  projectConfig: ProjectConfig | null;
  // 当窗口缩小时，记住一些状态，当窗口恢复时恢复这些状态
  // When the window shrinks, remember some states, and restore these states when the window is restored
  beforeMiniInfo: BeforeMiniState;
}
let timeId: TimeoutHandle;

/**
 * Option Store
 *    你可以任意命名 `defineStore()` 的返回值，但最好使用 store 的名字，同时以 `use` 开头且以 `Store` 结尾。
 *    第一个参数是你的应用中 Store 的唯一 ID。
 *    state 是 store 的数据 (data)，
 *    getters 是 store 的计算属性 (computed)，
 *    actions 则是方法 (methods)
 *
 * Setup Store
 *    export const useCounterStore = defineStore('counter', () => {});
 *    ref() 就是 state 属性
 *    computed() 就是 getters
 *    function() 就是 actions
 *    Setup store 也可以依赖于全局提供的属性，比如路由。任何应用层面提供的属性都可以在 store 中使用 inject() 访问，就像在组件中一样
 *
 * 使用Store
 *    可以在组件中(<script setup>) 使用 `store` ✨
 *    const store = useCounterStore();
 *
 */
export const useAppStore = defineStore({
  id: 'app',
  state: (): AppState => ({
    darkMode: undefined,
    pageLoading: false,
    projectConfig: Persistent.getLocal(PROJ_CFG_KEY),
    beforeMiniInfo: {},
  }),
  getters: {
    getPageLoading(state): boolean {
      return state.pageLoading;
    },
    getDarkMode(state): 'light' | 'dark' | string {
      return state.darkMode || localStorage.getItem(APP_DARK_MODE_KEY) || darkMode;
    },

    getBeforeMiniInfo(state): BeforeMiniState {
      return state.beforeMiniInfo;
    },

    getProjectConfig(state): ProjectConfig {
      return state.projectConfig || ({} as ProjectConfig);
    },

    getHeaderSetting(): HeaderSetting {
      return this.getProjectConfig.headerSetting;
    },
    getMenuSetting(): MenuSetting {
      return this.getProjectConfig.menuSetting;
    },
    getTransitionSetting(): TransitionSetting {
      return this.getProjectConfig.transitionSetting;
    },
    getMultiTabsSetting(): MultiTabsSetting {
      return this.getProjectConfig.multiTabsSetting;
    },
    getApiAddress() {
      return JSON.parse(localStorage.getItem(API_ADDRESS) || '{}');
    },
  },
  actions: {
    setPageLoading(loading: boolean): void {
      this.pageLoading = loading;
    },

    setDarkMode(mode: ThemeEnum): void {
      this.darkMode = mode;
      localStorage.setItem(APP_DARK_MODE_KEY, mode);
    },

    setBeforeMiniInfo(state: BeforeMiniState): void {
      this.beforeMiniInfo = state;
    },

    setProjectConfig(config: DeepPartial<ProjectConfig>): void {
      this.projectConfig = deepMerge(this.projectConfig || {}, config) as ProjectConfig;
      Persistent.setLocal(PROJ_CFG_KEY, this.projectConfig);
    },
    setMenuSetting(setting: Partial<MenuSetting>): void {
      this.projectConfig!.menuSetting = deepMerge(this.projectConfig!.menuSetting, setting);
      Persistent.setLocal(PROJ_CFG_KEY, this.projectConfig);
    },

    async resetAllState() {
      resetRouter();
      Persistent.clearAll();
    },
    async setPageLoadingAction(loading: boolean): Promise<void> {
      if (loading) {
        clearTimeout(timeId);
        // Prevent flicker
        timeId = setTimeout(() => {
          this.setPageLoading(loading);
        }, 50);
      } else {
        this.setPageLoading(loading);
        clearTimeout(timeId);
      }
    },
    setApiAddress(config: ApiAddress): void {
      localStorage.setItem(API_ADDRESS, JSON.stringify(config));
    },
  },
});

/**
 * 如果你想在 setup() 外部使用一个 store，记得把 pinia 对象传给 useStore(), 然后就可以使用它了
 * https://pinia.vuejs.org/zh/ssr/nuxt.html#using-the-store-outside-of-setup
 */
// Need to be used outside the setup
export function useAppStoreWithOut() {
  return useAppStore(store);
}
