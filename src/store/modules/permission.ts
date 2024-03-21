import type { AppRouteRecordRaw, Menu } from '@/router/types';

import { defineStore } from 'pinia';
import { store } from '@/store';
import { useI18n } from '@/hooks/web/useI18n';
import { useUserStore } from './user';
import { useAppStoreWithOut } from './app';
import { toRaw } from 'vue';
import { transformObjToRoute, flatMultiLevelRoutes } from '@/router/helper/routeHelper';
import { transformRouteToMenu } from '@/router/helper/menuHelper';

import projectSetting from '@/settings/projectSetting';

import { PermissionModeEnum } from '@/enums/appEnum';

import { asyncRoutes } from '@/router/routes';
import { ERROR_LOG_ROUTE, PAGE_NOT_FOUND_ROUTE } from '@/router/routes/basic';

import { filter } from '@/utils/helper/treeHelper';

import { getMenuList } from '@/api/sys/menu';
import { getPermCode } from '@/api/sys/user';

import { useMessage } from '@/hooks/web/useMessage';
import { PageEnum } from '@/enums/pageEnum';

interface PermissionState {
  // Permission code list
  // 权限代码列表
  permCodeList: string[] | number[];
  // Whether the route has been dynamically added
  // 是否已动态加载了路由
  isDynamicAddedRoute: boolean;
  // To trigger a menu update
  // 触发菜单更新
  lastBuildMenuTime: number;
  // Backstage menu list
  // 后台菜单列表
  backMenuList: Menu[];
  // 菜单列表
  frontMenuList: Menu[];
}

export const usePermissionStore = defineStore({
  id: 'app-permission',
  state: (): PermissionState => ({
    // 权限代码列表
    permCodeList: [],
    // Whether the route has been dynamically added
    // 路由是否动态添加
    isDynamicAddedRoute: false,
    // To trigger a menu update
    // 触发菜单更新
    lastBuildMenuTime: 0,
    // Backstage menu list
    // 后台菜单列表
    backMenuList: [],
    // menu List
    // 菜单列表
    frontMenuList: [],
  }),
  getters: {
    getPermCodeList(state): string[] | number[] {
      return state.permCodeList;
    },
    getBackMenuList(state): Menu[] {
      return state.backMenuList;
    },
    getFrontMenuList(state): Menu[] {
      return state.frontMenuList;
    },
    getLastBuildMenuTime(state): number {
      return state.lastBuildMenuTime;
    },
    getIsDynamicAddedRoute(state): boolean {
      return state.isDynamicAddedRoute;
    },
  },
  actions: {
    setPermCodeList(codeList: string[]) {
      this.permCodeList = codeList;
    },

    setBackMenuList(list: Menu[]) {
      this.backMenuList = list;
      list?.length > 0 && this.setLastBuildMenuTime();
    },

    setFrontMenuList(list: Menu[]) {
      this.frontMenuList = list;
    },

    setLastBuildMenuTime() {
      this.lastBuildMenuTime = new Date().getTime();
    },

    setDynamicAddedRoute(added: boolean) {
      this.isDynamicAddedRoute = added;
    },
    resetState(): void {
      this.isDynamicAddedRoute = false;
      this.permCodeList = [];
      this.backMenuList = [];
      this.lastBuildMenuTime = 0;
    },
    async changePermissionCode() {
      const codeList = await getPermCode();
      this.setPermCodeList(codeList);
    },

    /**
     * 构建路由
     */
    async buildRoutesAction(): Promise<AppRouteRecordRaw[]> {
      // 获取i18n实例
      const { t } = useI18n();
      // 获取用户仓库实例
      const userStore = useUserStore();
      // 获取应用仓库实例
      const appStore = useAppStoreWithOut();

      // 定义路由数组
      let routes: AppRouteRecordRaw[] = [];
      // 获取角色列表
      const roleList = toRaw(userStore.getRoleList) || [];
      // 获取项目配置
      const { permissionMode = projectSetting.permissionMode } = appStore.getProjectConfig;

      // 路由过滤器 在 函数filter 作为回调传入遍历使用
      const routeFilter = (route: AppRouteRecordRaw) => {
        const { meta } = route;
        // 抽出角色
        const { roles } = meta || {};
        if (!roles) return true;
        // 进行角色权限判断
        return roleList.some((role) => roles.includes(role));
      };

      // 路由过滤器 在 函数filter 作为回调传入遍历使用
      const routeRemoveIgnoreFilter = (route: AppRouteRecordRaw) => {
        const { meta } = route;
        // ignoreRoute 为true 则路由仅用于菜单生成，不会在实际的路由表中出现
        const { ignoreRoute } = meta || {};
        // arr.filter 返回 true 表示该元素通过测试
        return !ignoreRoute;
      };

      /**
       * @description 根据设置的首页path，修正routes中的affix标记（固定首页）
       * */
      // 给首页路由添加affix固钉
      const patchHomeAffix = (routes: AppRouteRecordRaw[]) => {
        // 如果路由为空，则返回
        if (!routes || routes.length === 0) return;
        // 获取用户信息中的homePath，如果没有则默认为PageEnum.BASE_HOME
        let homePath: string = userStore.getUserInfo.homePath || PageEnum.BASE_HOME;

        // 遍历路由，给符合条件的路由添加affix属性
        function patcher(routes: AppRouteRecordRaw[], parentPath = '') {
          // 如果父路径存在，则拼接
          if (parentPath) parentPath = parentPath + '/';
          // 遍历路由
          routes.forEach((route: AppRouteRecordRaw) => {
            const { path, children, redirect } = route;
            // 获取当前路径
            const currentPath = path.startsWith('/') ? path : parentPath + path;
            // 如果当前路径等于homePath
            if (currentPath === homePath) {
              // 如果存在重定向，则更新homePath
              if (redirect) {
                homePath = route.redirect! as string;
              } else {
                // 否则给路由添加affix属性
                route.meta = Object.assign({}, route.meta, { affix: true });
                // 处理哦玩首页的路径, 则抛出错误，已处理完毕
                throw new Error('end');
              }
            }
            // 如果存在子路由，则递归调用patcher
            children && children.length > 0 && patcher(children, currentPath);
          });
        }

        try {
          // 调用patcher
          patcher(routes);
        } catch (e) {
          // 已处理完毕跳出循环
        }
        // 返回
        return;
      };

      // debugger;

      switch (permissionMode) {
        // 角色权限
        case PermissionModeEnum.ROLE:
          // 对非一级路由进行过滤
          routes = filter(asyncRoutes, routeFilter);
          // 对一级路由根据角色权限过滤
          routes = routes.filter(routeFilter);
          // Convert multi-level routing to level 2 routing
          // 将多级路由转换为 2 级路由
          routes = flatMultiLevelRoutes(routes);
          break;

        // 路由映射， 默认进入该case
        case PermissionModeEnum.ROUTE_MAPPING:
          // 对非一级路由进行过滤
          routes = filter(asyncRoutes, routeFilter);
          // 对一级路由再次根据角色权限过滤
          routes = routes.filter(routeFilter);
          // 将路由转换成菜单
          const menuList = transformRouteToMenu(routes, true);
          // 移除掉 ignoreRoute: true 的路由 非一级路由
          routes = filter(routes, routeRemoveIgnoreFilter);
          // 移除掉 ignoreRoute: true 的路由 一级路由；
          routes = routes.filter(routeRemoveIgnoreFilter);
          // 对菜单进行排序
          menuList.sort((a, b) => {
            return (a.meta?.orderNo || 0) - (b.meta?.orderNo || 0);
          });

          // 设置菜单列表
          this.setFrontMenuList(menuList);

          // Convert multi-level routing to level 2 routing
          // 将多级路由转换为 2 级路由
          routes = flatMultiLevelRoutes(routes);
          break;

        //  If you are sure that you do not need to do background dynamic permissions, please comment the entire judgment below
        //  如果确定不需要做后台动态权限，请在下方注释整个判断
        case PermissionModeEnum.BACK:
          const { createMessage } = useMessage();

          // 显示loading
          createMessage.loading({
            content: t('sys.app.menuLoading'),
            duration: 1,
          });

          // !Simulate to obtain permission codes from the background,
          // 模拟从后台获取权限码，
          // this function may only need to be executed once, and the actual project can be put at the right time by itself
          // 这个功能可能只需要执行一次，实际项目可以自己放在合适的时间
          let routeList: AppRouteRecordRaw[] = [];
          try {
            // 获取并保存 权限码
            await this.changePermissionCode();
            // 获取菜单
            routeList = (await getMenuList()) as AppRouteRecordRaw[];
          } catch (error) {
            console.error(error);
          }

          // Dynamically introduce components
          // 根据菜单数据 转换成前端路由
          routeList = transformObjToRoute(routeList);

          //  Background routing to menu structure
          //  转换后台路由 为菜单
          const backMenuList = transformRouteToMenu(routeList);
          this.setBackMenuList(backMenuList);

          // remove meta.ignoreRoute item
          // 删除 meta.ignoreRoute 项
          routeList = filter(routeList, routeRemoveIgnoreFilter);
          routeList = routeList.filter(routeRemoveIgnoreFilter);

          routeList = flatMultiLevelRoutes(routeList);
          routes = [PAGE_NOT_FOUND_ROUTE, ...routeList];
          break;
      }

      routes.push(ERROR_LOG_ROUTE);
      patchHomeAffix(routes);
      return routes;
    },
  },
});

// Need to be used outside the setup
// 需要在设置之外使用
export function usePermissionStoreWithOut() {
  return usePermissionStore(store);
}
