import type { AppRouteRecordRaw, AppRouteModule } from '@/router/types';

import { PAGE_NOT_FOUND_ROUTE, REDIRECT_ROUTE } from '@/router/routes/basic';

import { mainOutRoutes } from './mainOut';
import { PageEnum } from '@/enums/pageEnum';
import { t } from '@/hooks/web/useI18n';

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
const routeModuleList: AppRouteModule[] = [];

// 加入到路由集合中
Object.keys(modules).forEach((key) => {
  const mod = (modules as Recordable)[key].default || {};
  const modList = Array.isArray(mod) ? [...mod] : [mod];
  routeModuleList.push(...modList);
});

export const asyncRoutes = [PAGE_NOT_FOUND_ROUTE, ...routeModuleList];

// 根路由
export const RootRoute: AppRouteRecordRaw = {
  path: '/',
  name: 'Root',
  /**
   * 根目录 重定向到 /dashboard
   */
  redirect: PageEnum.BASE_HOME + '?a=123',
  meta: {
    title: 'Root',
  },
};

export const LoginRoute: AppRouteRecordRaw = {
  path: '/login',
  name: 'Login',
  component: () => import('@/views/sys/login/Login.vue'),
  meta: {
    title: t('routes.basic.login'),
  },
};

// Basic routing without permission
// 未经许可的基本路由
export const basicRoutes = [
  LoginRoute,
  RootRoute,
  ...mainOutRoutes,
  REDIRECT_ROUTE,
  PAGE_NOT_FOUND_ROUTE,
];
