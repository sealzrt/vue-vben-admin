import type { Menu, MenuModule } from '@/router/types';
import type { RouteRecordNormalized } from 'vue-router';

import { useAppStoreWithOut } from '@/store/modules/app';
import { usePermissionStore } from '@/store/modules/permission';
import { transformMenuModule, getAllParentPath } from '@/router/helper/menuHelper';
import { filter } from '@/utils/helper/treeHelper';
import { isHttpUrl } from '@/utils/is';
import { router } from '@/router';
import { PermissionModeEnum } from '@/enums/appEnum';
import { pathToRegexp } from 'path-to-regexp';

/**
 * Vite 支持使用特殊的 import.meta.glob 函数从文件系统导入多个模块（该方式为异步加载模块形式）
 * 匹配到的文件默认是懒加载的，通过动态导入实现，并会在构建时分离为独立的 chunk。
 * 如果你倾向于直接引入（同步加载使用）所有的模块，你可以传入 { eager: true } 作为第二个参数
 *
 *      const modules = import.meta.glob('./dir/*.js')
 *      // vite 生成的代码
 *      const modules = {
 *        './dir/foo.js': () => import('./dir/foo.js'),
 *        './dir/bar.js': () => import('./dir/bar.js'),
 *      }
 *
 *      const modules = import.meta.glob('./dir/*.js', { eager: true })
 *       // vite 生成的代码
 *       import * as __glob__0_0 from './dir/foo.js'
 *       import * as __glob__0_1 from './dir/bar.js'
 *       const modules = {
 *         './dir/foo.js': __glob__0_0,
 *         './dir/bar.js': __glob__0_1
 *       }
 *
 */
const modules = import.meta.glob('./modules/**/*.ts', { eager: true });
// console.log('modules = import.meta.glob', modules);

const menuModules: MenuModule[] = [];

Object.keys(modules).forEach((key) => {
  const mod = (modules as Recordable)[key].default || {};
  const modList = Array.isArray(mod) ? [...mod] : [mod];
  menuModules.push(...modList);
});
// console.log('menuModules', menuModules);

// ===========================
// ==========Helper===========
// ===========================

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

const isRoleMode = () => {
  return getPermissionMode() === PermissionModeEnum.ROLE;
};

const staticMenus: Menu[] = [];
(() => {
  menuModules.sort((a, b) => {
    return (a.orderNo || 0) - (b.orderNo || 0);
  });

  for (const menu of menuModules) {
    staticMenus.push(transformMenuModule(menu));
  }
})();

async function getAsyncMenus() {
  const permissionStore = usePermissionStore();
  //递归过滤所有隐藏的菜单
  const menuFilter = (items) => {
    return items.filter((item) => {
      const show = !item.meta?.hideMenu && !item.hideMenu;
      if (show && item.children) {
        item.children = menuFilter(item.children);
      }
      return show;
    });
  };
  if (isBackMode()) {
    return menuFilter(permissionStore.getBackMenuList);
  }
  if (isRouteMappingMode()) {
    return menuFilter(permissionStore.getFrontMenuList);
  }
  return staticMenus;
}

export const getMenus = async (): Promise<Menu[]> => {
  const menus = await getAsyncMenus();
  if (isRoleMode()) {
    const routes = router.getRoutes();
    return filter(menus, basicFilter(routes));
  }
  return menus;
};

export async function getCurrentParentPath(currentPath: string) {
  const menus = await getAsyncMenus();
  const allParentPath = await getAllParentPath(menus, currentPath);
  return allParentPath?.[0];
}

// Get the level 1 menu, delete children
export async function getShallowMenus(): Promise<Menu[]> {
  const menus = await getAsyncMenus();
  const shallowMenuList = menus.map((item) => ({ ...item, children: undefined }));
  if (isRoleMode()) {
    const routes = router.getRoutes();
    return shallowMenuList.filter(basicFilter(routes));
  }
  return shallowMenuList;
}

// Get the children of the menu
export async function getChildrenMenus(parentPath: string) {
  const menus = await getMenus();
  const parent = menus.find((item) => item.path === parentPath);
  if (!parent || !parent.children || !!parent?.meta?.hideChildrenInMenu) {
    return [] as Menu[];
  }
  if (isRoleMode()) {
    const routes = router.getRoutes();
    return filter(parent.children, basicFilter(routes));
  }
  return parent.children;
}

function basicFilter(routes: RouteRecordNormalized[]) {
  return (menu: Menu) => {
    const matchRoute = routes.find((route) => {
      if (isHttpUrl(menu.path)) return true;

      if (route.meta?.carryParam) {
        return pathToRegexp(route.path).test(menu.path);
      }
      const isSame = route.path === menu.path;
      if (!isSame) return false;

      if (route.meta?.ignoreAuth) return true;

      return isSame || pathToRegexp(route.path).test(menu.path);
    });

    if (!matchRoute) return false;
    menu.icon = (menu.icon || matchRoute.meta.icon) as string;
    menu.meta = matchRoute.meta;
    return true;
  };
}
