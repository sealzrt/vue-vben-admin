import { AppRouteModule } from '@/router/types';
import type { MenuModule, Menu, AppRouteRecordRaw } from '@/router/types';
import { findPath, treeMap } from '@/utils/helper/treeHelper';
import { cloneDeep } from 'lodash-es';
import { isHttpUrl } from '@/utils/is';
import { RouteParams } from 'vue-router';
import { toRaw } from 'vue';

export function getAllParentPath<T = Recordable>(treeData: T[], path: string) {
  const menuList = findPath(treeData, (n) => n.path === path) as Menu[];
  return (menuList || []).map((item) => item.path);
}

// 路径处理
function joinParentPath(menus: Menu[], parentPath = '') {
  for (let index = 0; index < menus.length; index++) {
    const menu = menus[index];
    // https://next.router.vuejs.org/guide/essentials/nested-routes.html
    // Note that nested paths that start with / will be treated as a root path.
    // 请注意，以 / 开头的嵌套路径将被视为根路径。
    // This allows you to leverage the component nesting without having to use a nested URL.
    // 这允许你利用组件嵌套，而无需使用嵌套 URL。
    if (!(menu.path.startsWith('/') || isHttpUrl(menu.path))) {
      // path doesn't start with /, nor is it a url, join parent path
      // 路径不以 / 开头，也不是 url，加入父路径
      menu.path = `${parentPath}/${menu.path}`;
    }
    if (menu?.children?.length) {
      joinParentPath(menu.children, menu.meta?.hidePathForChildren ? parentPath : menu.path);
    }
  }
}

// Parsing the menu module
export function transformMenuModule(menuModule: MenuModule): Menu {
  const { menu } = menuModule;

  const menuList = [menu];

  joinParentPath(menuList);
  return menuList[0];
}

// 将路由转换成菜单
export function transformRouteToMenu(routeModList: AppRouteModule[], routerMapping = false) {
  // 借助 lodash 深拷贝
  const cloneRouteModList = cloneDeep(routeModList);
  const routeList: AppRouteRecordRaw[] = [];

  // 对路由项进行处理
  cloneRouteModList.forEach((item) => {
    // 如果routerMapping存在，且item.meta.hideChildrenInMenu为true，且item.redirect为字符串
    if (routerMapping && item.meta.hideChildrenInMenu && typeof item.redirect === 'string') {
      // 将item.redirect赋值给item.path
      item.path = item.redirect;
    }

    // 如果item.meta?.single为true
    if (item.meta?.single) {
      // 获取item?.children?.[0]
      const realItem = item?.children?.[0];
      // 如果realItem存在，将其添加到routeList中
      realItem && routeList.push(realItem);
    } else {
      // 否则，将item添加到routeList中
      routeList.push(item);
    }
  });

  // 对路由对象 进行树形处理
  const list = treeMap(routeList, {
    conversion: (node: AppRouteRecordRaw) => {
      const { meta: { title, hideMenu = false } = {} } = node;

      return {
        ...(node.meta || {}),
        meta: node.meta,
        name: title,
        hideMenu,
        path: node.path,
        ...(node.redirect ? { redirect: node.redirect } : {}),
      };
    },
  });
  // 路径处理
  joinParentPath(list);
  return cloneDeep(list);
}

/**
 * config menu with given params
 */
const menuParamRegex = /(?::)([\s\S]+?)((?=\/)|$)/g;

// 导出一个函数，用于配置动态参数菜单
export function configureDynamicParamsMenu(menu: Menu, params: RouteParams) {
  // 获取菜单的路径和参数路径
  const { path, paramPath } = toRaw(menu);
  // 如果参数路径不存在，则将路径设置为菜单路径
  let realPath = paramPath ? paramPath : path;
  // 匹配路径中的参数
  const matchArr = realPath.match(menuParamRegex);

  // 遍历匹配到的参数
  matchArr?.forEach((it) => {
    // 获取真实的参数
    const realIt = it.substr(1);
    // 如果参数存在，则将路径中的参数替换为参数值
    if (params[realIt]) {
      realPath = realPath.replace(`:${realIt}`, params[realIt] as string);
    }
  });
  // 保存原始参数路径
  if (!paramPath && matchArr && matchArr.length > 0) {
    menu.paramPath = path;
  }
  // 将路径设置为真实的路径
  menu.path = realPath;
  // 遍历子菜单
  menu.children?.forEach((item) => configureDynamicParamsMenu(item, params));
}
