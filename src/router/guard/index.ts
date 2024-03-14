import type { Router, RouteLocationNormalized } from 'vue-router';
import { useAppStoreWithOut } from '@/store/modules/app';
import { useUserStoreWithOut } from '@/store/modules/user';
import { useTransitionSetting } from '@/hooks/setting/useTransitionSetting';
import { AxiosCanceler } from '@/utils/http/axios/axiosCancel';
import { Modal, notification } from 'ant-design-vue';
import { warn } from '@/utils/log';
import { unref } from 'vue';
import { setRouteChange } from '@/logics/mitt/routeChange';
import { createPermissionGuard } from './permissionGuard';
import { createStateGuard } from './stateGuard';
import nProgress from 'nprogress';
import projectSetting from '@/settings/projectSetting';
import { createParamMenuGuard } from './paramMenuGuard';

// Don't change the order of creation
export function setupRouterGuard(router: Router) {
  createPageGuard(router);
  createPageLoadingGuard(router);
  createHttpGuard(router);
  createScrollGuard(router);
  createMessageGuard(router);
  createProgressGuard(router);
  // 权限
  createPermissionGuard(router);
  // 菜单
  createParamMenuGuard(router); // must after createPermissionGuard (menu has been built.)
  createStateGuard(router);
}

/**
 * Hooks for handling page state
 * 为路由添加页面守护
 * @param router 路由
 */
function createPageGuard(router: Router) {
  // 创建一个Map，用于存储页面是否已经加载
  const loadedPageMap = new Map<string, boolean>();

  /**
   * 全局前置守卫: 路由跳转前
   */
  router.beforeEach(async (to) => {
    // 页面已经加载，再次打开时不需要重新加载，不需要加载和其它处理
    to.meta.loaded = !!loadedPageMap.get(to.path);
    // 设置路由变化
    setRouteChange(to);

    return true;
  });

  /**
   * 全局前置守卫: 路由跳转后
   */
  router.afterEach((to) => {
    // 页面加载后，将页面加载状态存入Map
    loadedPageMap.set(to.path, true);
  });
}

// Used to handle page loading status
// 页面loading状态
function createPageLoadingGuard(router: Router) {
  // 使用用户存储
  const userStore = useUserStoreWithOut();
  // 使用应用存储
  const appStore = useAppStoreWithOut();
  // 使用过渡设置
  const { getOpenPageLoading } = useTransitionSetting();
  /**
   * 全局前置守卫: 路由跳转前
   *   返回 undefined 或返回 true:  则导航是有效的
   */
  router.beforeEach(async (to) => {
    // 如果没有用户令牌
    if (!userStore.getToken) {
      return true;
    }

    // 如果页面已加载
    if (to.meta.loaded) {
      return true;
    }

    // 如果页面加载动作打开
    if (unref(getOpenPageLoading)) {
      // 设置页面加载状态
      appStore.setPageLoadingAction(true);
      return true;
    }

    return true;
  });

  /**
   * 全局前置守卫: 路由跳转后
   */
  router.afterEach(async () => {
    // 如果页面加载动作打开
    if (unref(getOpenPageLoading)) {
      // TODO Looking for a better way
      // 设置页面加载计时，防止闪屏
      setTimeout(() => {
        appStore.setPageLoading(false);
      }, 220);
    }
    return true;
  });
}

/**
 * 为router添加beforeEach路由守卫，在每次路由切换时删除所有 pending 的 axios 请求
 * The interface used to close the current page to complete the request when the route is switched
 * @param router
 */
function createHttpGuard(router: Router) {
  // 从 projectSetting 中获取 removeAllHttpPending 属性
  const { removeAllHttpPending } = projectSetting;
  // 声明一个 AxiosCanceler 变量，如果有 removeAllHttpPending，则为其分配新值
  let axiosCanceler: Nullable<AxiosCanceler>;
  if (removeAllHttpPending) {
    axiosCanceler = new AxiosCanceler();
  }
  // 为 router 添加 beforeEach 路由守卫
  router.beforeEach(async () => {
    // 在每次路由切换时删除所有 pending 的 axios 请求
    axiosCanceler?.removeAllPending();
    // 返回 true，允许路由切换
    return true;
  });
}

// Routing switch back to the top
// 为router创建滚动守卫
function createScrollGuard(router: Router) {
  // 判断是否为哈希
  const isHash = (href: string) => {
    return /^#/.test(href);
  };

  // 每次路由跳转后执行
  router.afterEach(async (to) => {
    // 从顶部开始滚动
    isHash((to as RouteLocationNormalized & { href: string })?.href) &&
      document.querySelector('.vben-layout-content')?.scrollTo(0, 0);
    return true;
  });
}

/**
 * Used to close the message instance when the route is switched
 * @param router
 */
// 导出一个函数，用于创建消息守卫，参数为router
export function createMessageGuard(router: Router) {
  // 从项目配置中获取closeMessageOnSwitch属性
  const { closeMessageOnSwitch } = projectSetting;

  // 在路由进入之前执行
  router.beforeEach(async () => {
    try {
      // 如果closeMessageOnSwitch为true，则销毁所有Modal和notification
      if (closeMessageOnSwitch) {
        Modal.destroyAll();
        notification.destroy();
      }
    } catch (error) {
      // 捕获错误并警告
      warn('message guard error:' + error);
    }
    // 返回true，允许路由进入
    return true;
  });
}

// 导出一个函数，用于创建进度守卫
export function createProgressGuard(router: Router) {
  // 使用transitionSetting获取getOpenNProgress
  const { getOpenNProgress } = useTransitionSetting();
  // 为router添加beforeEach守卫
  router.beforeEach(async (to) => {
    // 如果to.meta.loaded为true，则返回true
    if (to.meta.loaded) {
      return true;
    }
    // 如果没有getOpenNProgress，则开始nProgress
    unref(getOpenNProgress) && nProgress.start();
    return true;
  });

  // 为router添加afterEach守卫
  router.afterEach(async () => {
    // 如果没有getOpenNProgress，则完成nProgress
    unref(getOpenNProgress) && nProgress.done();
    return true;
  });
}
