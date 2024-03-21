import type { Router } from 'vue-router';
import { configureDynamicParamsMenu } from '../helper/menuHelper';
import { Menu } from '../types';
import { PermissionModeEnum } from '@/enums/appEnum';
import { useAppStoreWithOut } from '@/store/modules/app';

import { usePermissionStoreWithOut } from '@/store/modules/permission';

// 导出一个函数，用于创建参数菜单守卫
export function createParamMenuGuard(router: Router) {
  // 使用 PermissionStore
  const permissionStore = usePermissionStoreWithOut();
  // router.beforeEach 用于在路由跳转之前执行
  router.beforeEach(async (to, _, next) => {
    // 过滤没有 name 的路由
    if (!to.name) {
      next();
      return;
    }

    // 是否已动态加载了路由
    if (!permissionStore.getIsDynamicAddedRoute) {
      next();
      return;
    }

    let menus: Menu[] = [];
    // 判断模式
    if (isBackMode()) {
      // 获取后台菜单
      menus = permissionStore.getBackMenuList;
    } else if (isRouteMappingMode()) {
      // 获取前台菜单
      menus = permissionStore.getFrontMenuList;
    }
    // 遍历菜单，配置动态参数菜单
    menus.forEach((item) => configureDynamicParamsMenu(item, to.params));

    next();
  });
}

const getPermissionMode = () => {
  const appStore = useAppStoreWithOut();
  return appStore.getProjectConfig.permissionMode;
};

const isBackMode = () => {
  return getPermissionMode() === PermissionModeEnum.BACK;
};

const isRouteMappingMode = () => {
  return getPermissionMode() === PermissionModeEnum.ROUTE_MAPPING;
};
