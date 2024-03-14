/**
 * Used to monitor routing changes to change the status of menus and tabs. There is no need to monitor the route, because the route status change is affected by the page rendering time, which will be slow
 */

import { mitt } from '@/utils/mitt';
import type { RouteLocationNormalized } from 'vue-router';
import { getRawRoute } from '@/utils';

const key = Symbol();

const emitter = mitt<{
  [key]: RouteLocationNormalized;
}>();

let lastChangeTab: RouteLocationNormalized;

// 触发emit事件, 并设置当前的路由
export function setRouteChange(lastChangeRoute: RouteLocationNormalized) {
  // 获取原始路由
  const r = getRawRoute(lastChangeRoute);
  // 触发事件，参数为原始路由
  emitter.emit(key, r);
  // 将原始路由赋值给lastChangeTab
  lastChangeTab = r;
}

export function listenerRouteChange(
  callback: (route: RouteLocationNormalized) => void,
  immediate = true,
) {
  emitter.on(key, callback);
  immediate && lastChangeTab && callback(lastChangeTab);
}

export function removeTabChangeListener() {
  emitter.clear();
}
