import type { AppRouteModule, AppRouteRecordRaw } from '@/router/types';
import type { Router, RouteRecordNormalized } from 'vue-router';

import { getParentLayout, LAYOUT, EXCEPTION_COMPONENT } from '@/router/constant';
import { cloneDeep, omit } from 'lodash-es';
import { warn } from '@/utils/log';
import { createRouter, createWebHashHistory } from 'vue-router';

export type LayoutMapKey = 'LAYOUT';
const IFRAME = () => import('@/views/sys/iframe/FrameBlank.vue');

const LayoutMap = new Map<string, () => Promise<typeof import('*.vue')>>();

LayoutMap.set('LAYOUT', LAYOUT);
LayoutMap.set('IFRAME', IFRAME);

let dynamicViewsModules: Record<string, () => Promise<Recordable>>;

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

// Dynamic introduction
/**
 * 异步导入路由
 * @param routes
 */
function asyncImportRoute(routes: AppRouteRecordRaw[] | undefined) {
  dynamicViewsModules = dynamicViewsModules || import.meta.glob('../../views/**/*.{vue,tsx}');
  if (!routes) return;
  routes.forEach((item) => {
    if (!item.component && item.meta?.frameSrc) {
      item.component = 'IFRAME';
    }
    const { component, name } = item;
    const { children } = item;
    if (component) {
      const layoutFound = LayoutMap.get(component.toUpperCase());
      if (layoutFound) {
        item.component = layoutFound;
      } else {
        item.component = dynamicImport(dynamicViewsModules, component as string);
      }
    } else if (name) {
      item.component = getParentLayout();
    }
    children && asyncImportRoute(children);
  });
}

/**
 * 动态加载组件
 * @param dynamicViewsModules
 * @param component
 */
// 函数dynamicImport用于动态导入组件
// dynamicViewsModules：动态视图模块，是一个对象，key为路径，value为函数，函数返回一个Promise，resolve一个Recordable对象
// component：组件名
function dynamicImport(
  dynamicViewsModules: Record<string, () => Promise<Recordable>>,
  component: string,
) {
  // 获取dynamicViewsModules的所有key
  const keys = Object.keys(dynamicViewsModules);
  // 过滤出符合条件的key
  const matchKeys = keys.filter((key) => {
    // 获取key中"../../views"之后的部分
    const k = key.replace('../../views', '');
    // 判断component是否以"/"开头
    const startFlag = component.startsWith('/');
    // 判断component是否以".vue"或".tsx"结尾
    const endFlag = component.endsWith('.vue') || component.endsWith('.tsx');
    // 如果以"/"开头，从0开始截取，否则从1开始截取
    const startIndex = startFlag ? 0 : 1;
    // 如果以".vue"或".tsx"结尾，取k的长度，否则取k中最后一个"."的位置
    const lastIndex = endFlag ? k.length : k.lastIndexOf('.');
    // 判断k中从startIndex开始，到lastIndex结束的部分是否等于component
    return k.substring(startIndex, lastIndex) === component;
  });
  // 如果matchKeys的长度为1，返回dynamicViewsModules中对应的value
  if (matchKeys?.length === 1) {
    const matchKey = matchKeys[0];
    return dynamicViewsModules[matchKey];
    // 如果matchKeys的长度大于1，报警告
  } else if (matchKeys?.length > 1) {
    warn(
      'Please do not create `.vue` and `.TSX` files with the same file name in the same hierarchical directory under the views folder. This will cause dynamic introduction failure',
    );
    return;
    // 如果matchKeys的长度为0，报警告，并返回EXCEPTION_COMPONENT
  } else {
    warn('在src/views/下找不到`' + component + '.vue` 或 `' + component + '.tsx`, 请自行创建!');
    return EXCEPTION_COMPONENT;
  }
}

// Turn background objects into routing objects
// 将对象变成路由对象
// 将对象转换为路由
export function transformObjToRoute<T = AppRouteModule>(routeList: AppRouteModule[]): T[] {
  // 遍历路由列表
  routeList.forEach((route) => {
    // 将路由的组件转换为字符串
    const component = route.component as string;
    // 如果组件存在
    if (component) {
      // 如果组件是大写字母，则将其转换为LayoutMap中的值
      if (component.toUpperCase() === 'LAYOUT') {
        route.component = LayoutMap.get(component.toUpperCase());
      } else {
        // 将路由的子路由设置为当前路由的克隆
        route.children = [cloneDeep(route)];
        // 将路由的组件设置为Layout
        route.component = LAYOUT;

        //某些情况下如果name如果没有值， 多个一级路由菜单会导致页面404
        if (!route.name) {
          warn('找不到菜单对应的name, 请检查数据!' + JSON.stringify(route));
        }
        // 将路由的name设置为父路由的name
        route.name = `${route.name}Parent`;
        // 将路由的path设置为空
        route.path = '';
        // 获取路由的meta属性
        const meta = route.meta || {};
        // 将meta属性的single设置为true
        meta.single = true;
        // 将meta属性的affix设置为false
        meta.affix = false;
        // 将路由的meta属性设置为meta
        route.meta = meta;
      }
    } else {
      // 如果组件不存在，则警告
      warn('请正确配置路由：' + route?.name + '的component属性');
    }
    // 如果路由有子路由，则异步导入子路由
    route.children && asyncImportRoute(route.children);
  });
  // 将路由列表转换为T类型
  return routeList as unknown as T[];
}

/**
 * Convert multi-level routing to level 2 routing
 * 将多级路由转换为 2 级路由
 */
export function flatMultiLevelRoutes(routeModules: AppRouteModule[]) {
  const modules: AppRouteModule[] = cloneDeep(routeModules);

  for (let index = 0; index < modules.length; index++) {
    const routeModule = modules[index];
    // 判断级别是否 多级 路由
    if (!isMultipleRoute(routeModule)) {
      // 声明终止当前循环， 即跳过此次循环，进行下一轮
      continue;
    }
    // 路由等级提升
    promoteRouteLevel(routeModule);
  }
  return modules;
}

// Routing level upgrade
// 路由等级提升
function promoteRouteLevel(routeModule: AppRouteModule) {
  // Use vue-router to splice menus
  // 使用vue-router拼接菜单
  // createRouter 创建一个可以被 Vue 应用程序使用的路由实例
  let router: Router | null = createRouter({
    routes: [routeModule as unknown as RouteRecordNormalized],
    history: createWebHashHistory(),
  });
  // getRoutes： 获取所有 路由记录的完整列表。
  const routes = router.getRoutes();
  // 将所有子路由添加到二级路由
  addToChildren(routes, routeModule.children || [], routeModule);
  router = null;

  // omit lodash的函数 对传入的item对象的children进行删除
  routeModule.children = routeModule.children?.map((item) => omit(item, 'children'));
}

// Add all sub-routes to the secondary route
// 将所有子路由添加到二级路由
function addToChildren(
  routes: RouteRecordNormalized[],
  children: AppRouteRecordRaw[],
  routeModule: AppRouteModule,
) {
  for (let index = 0; index < children.length; index++) {
    const child = children[index];
    const route = routes.find((item) => item.name === child.name);
    if (!route) {
      continue;
    }
    routeModule.children = routeModule.children || [];
    if (!routeModule.children.find((item) => item.name === route.name)) {
      routeModule.children?.push(route as unknown as AppRouteModule);
    }
    if (child.children?.length) {
      addToChildren(routes, child.children, routeModule);
    }
  }
}

// Determine whether the level exceeds 2 levels
// 判断级别是否超过2级
function isMultipleRoute(routeModule: AppRouteModule) {
  // Reflect.has 与 in 操作符 相同, 用于检查一个对象(包括它原型链上)是否拥有某个属性
  if (!routeModule || !Reflect.has(routeModule, 'children') || !routeModule.children?.length) {
    return false;
  }

  const children = routeModule.children;

  let flag = false;
  for (let index = 0; index < children.length; index++) {
    const child = children[index];
    if (child.children?.length) {
      flag = true;
      break;
    }
  }
  return flag;
}
