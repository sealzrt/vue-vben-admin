import type { Router, RouteRecordRaw } from 'vue-router';

import { usePermissionStoreWithOut } from '@/store/modules/permission';

import { PageEnum } from '@/enums/pageEnum';
import { useUserStoreWithOut } from '@/store/modules/user';

import { PAGE_NOT_FOUND_ROUTE } from '@/router/routes/basic';

import { RootRoute } from '@/router/routes';

const LOGIN_PATH = PageEnum.BASE_LOGIN;

const ROOT_PATH = RootRoute.path;

const whitePathList: PageEnum[] = [LOGIN_PATH];

/**
 * 权限路由守卫
 * @param router
 */
export function createPermissionGuard(router: Router) {
  const userStore = useUserStoreWithOut();
  const permissionStore = usePermissionStoreWithOut();

  /**
   * 全局前置守卫: 路由跳转前
   * 确保 next 在所有分支 都被调用一次
   */
  router.beforeEach(async (to, from, next) => {
    /*** 处理默认首页 & 个人首页 不一致的问题 ***/
    if (
      from.path === ROOT_PATH &&
      to.path === PageEnum.BASE_HOME &&
      userStore.getUserInfo.homePath &&
      userStore.getUserInfo.homePath !== PageEnum.BASE_HOME
    ) {
      /**
       * next(): 进行管道中的下一个钩子
       * next('/xxx') 或者 next({ path: '/xxx' }): 跳到不同的地址都会再次执行 router.beforeEach 钩子函数
       */
      next(userStore.getUserInfo.homePath);
      return;
    }

    const token = userStore.getToken;

    // Whitelist can be directly entered
    // 判断路径是否在白名单中, 如登录页
    if (whitePathList.includes(to.path as PageEnum)) {
      // 登录页 && 有token
      if (to.path === LOGIN_PATH && token) {
        // 获取用户登录状态是否失效. 默认值是false,  401状态码时 设置为true;
        const isSessionTimeout = userStore.getSessionTimeout;
        try {
          // 登录页 && 有token, 直接执行登录后的操作
          await userStore.afterLoginAction();
          // 用户登录状态是否失效. 正常是false,  401状态码时 设置为true;
          // 根据 QueryString redirect参数 跳转页面, 兜底: 首页
          if (!isSessionTimeout) {
            /**
             * next(): 进行管道中的下一个钩子
             * next('/xxx') 或者 next({ path: '/xxx' }): 跳到不同的地址都会再次执行 router.beforeEach 钩子函数
             */
            next(decodeURIComponent((to.query?.redirect as string) || '/'));
            return;
          }
        } catch {
          // 捕获异常
        }
      }
      // 跳过当前中间件, 进行管道中的下一个钩子
      next();
      return;
    }

    // 没有token
    if (!token) {
      // You can access without permission. You need to set the routing meta.ignoreAuth to true
      // 如果没有token, 并且目标页面 不需要认证, 则继续进行管道中的下一个钩子
      if (to.meta.ignoreAuth) {
        next();
        return;
      }

      // redirect login page
      const redirectData: { path: string; replace: boolean; query?: Recordable<string> } = {
        path: LOGIN_PATH,
        replace: true,
      };
      if (to.path) {
        redirectData.query = {
          ...redirectData.query,
          redirect: to.path,
        };
      }
      // 如果没有token,并且目标页面 需要认证, 则跳转到登录页, 同时url参数里携带目标url
      next(redirectData);
      return;
    }

    // get userinfo while last fetch time is empty
    // 用户信息为空, 则获取用户信息
    if (userStore.getLastUpdateTime === 0) {
      try {
        await userStore.getUserInfoAction();
      } catch (err) {
        next();
        return;
      }
    }

    // 动态路由加载（首次）,  如果动态路由未加载
    if (!permissionStore.getIsDynamicAddedRoute) {
      const routes = await permissionStore.buildRoutesAction();
      [...routes, PAGE_NOT_FOUND_ROUTE].forEach((route) => {
        // 调用 router.addRoute 添加动态路由
        router.addRoute(route as unknown as RouteRecordRaw);
      });
      // 记录动态路由加载完成
      permissionStore.setDynamicAddedRoute(true);

      // 现在的to动态路由加载之前的，可能为PAGE_NOT_FOUND_ROUTE（例如，登陆后，刷新的时候）
      // 此处应当重定向到fullPath，否则会加载404页面内容
      next({ path: to.fullPath, replace: true, query: to.query });
      return;
    }

    if (to.name === PAGE_NOT_FOUND_ROUTE.name) {
      // 遇到不存在页面，后续逻辑不再处理redirect（阻止下面else逻辑）
      from.query.redirect = '';

      if (
        from.path === LOGIN_PATH &&
        to.fullPath !== (userStore.getUserInfo.homePath || PageEnum.BASE_HOME)
      ) {
        // 登陆重定向不存在路由，转去“首页”
        next({ path: userStore.getUserInfo.homePath || PageEnum.BASE_HOME, replace: true });
      } else {
        // 正常前往“404”页面
        next();
      }
    } else if (from.query.redirect) {
      // 存在redirect
      const redirect = decodeURIComponent((from.query.redirect as string) || '');

      // 只处理一次 from.query.redirect
      // 也避免某场景（指向路由定义了 redirect）下的死循环
      from.query.redirect = '';

      if (redirect === to.fullPath) {
        // 已经被redirect
        next();
      } else {
        // 指向redirect
        next({ path: redirect, replace: true });
      }
      next();
    } else {
      // 正常访问
      next();
    }
  });
}
