import type { RouteLocationRaw, Router } from 'vue-router';

import { PageEnum } from '@/enums/pageEnum';
import { unref } from 'vue';

import { useRouter } from 'vue-router';
import { REDIRECT_NAME } from '@/router/constant';
import { isHttpUrl } from '@/utils/is';
import { openWindow } from '@/utils';

import { useMultipleTabStore } from '@/store/modules/multipleTab';

/**
 * 将一个类型 T 转换为另一个类型，如果 T 中有一个 path 属性且其类型为 string，则该属性的类型将被替换为 PageEnum 类型
 * 判断 T 是否包含 path 属性，如果包含，则判断其类型是否为 string，如果是 string，则将 type 类型替换为 PageEnum 类型
 * 否则，保持 T 不变
 */
export type PathAsPageEnum<T> = T extends { path: string } ? T & { path: PageEnum } : T;
export type RouteLocationRawEx = PathAsPageEnum<RouteLocationRaw>;

function handleError(e: Error) {
  console.error(e);
}

export enum GoType {
  'replace',
  'after',
}

/**
 * page switch
 * 基于 useRouter 进行路由跳转
 */
export function useGo(_router?: Router) {
  // 获取路由器
  const { push, replace, currentRoute } = _router || useRouter();

  // go函数
  function go(opt?: RouteLocationRawEx): void;
  // go函数
  function go(opt: RouteLocationRawEx, isReplace: boolean): void;
  // go函数
  function go(opt: RouteLocationRawEx, goType: GoType): void;
  // go函数
  function go(
    opt: RouteLocationRawEx = PageEnum.BASE_HOME,
    goTypeOrIsReplace: boolean | GoType = false,
  ) {
    // 如果参数不存在，则直接返回
    if (!opt) {
      return;
    }
    // 获取路径
    let path = unref(opt) as string;
    // 如果路径以/开头，则去掉
    if (path[0] === '/') {
      path = path.slice(1);
    }
    // 如果路径是http://或https://，则打开新窗口
    if (isHttpUrl(path)) {
      return openWindow(path);
    }

    // 判断是否替换
    const isReplace = goTypeOrIsReplace === true || goTypeOrIsReplace === GoType.replace;
    // 判断是否在当前tab后面
    const isAfter = goTypeOrIsReplace === GoType.after;

    // 如果替换，则替换
    if (isReplace) {
      replace(opt).catch(handleError);
      // 如果在新tab后面，则替换
    } else if (isAfter) {
      // 获取tab store
      const tabStore = useMultipleTabStore();
      // 获取当前路由名称
      const currentName = unref(currentRoute).name;
      // 当前 tab
      const currentIndex = tabStore.getTabList.findIndex((item) => item.name === currentName);
      // 当前 tab 数量
      const currentCount = tabStore.getTabList.length;
      // 替换
      push(opt)
        .then(() => {
          // 如果tab数量增加，则说明产生了新tab
          if (tabStore.getTabList.length > currentCount) {
            // 新 tab（也是最后一个）
            const targetIndex = tabStore.getTabList.length - 1;
            // 新 tab 在 当前 tab 的后面
            if (currentIndex > -1 && targetIndex > currentIndex) {
              // 移动 tab
              tabStore.sortTabs(targetIndex, currentIndex + 1);
            }
          }
        })
        .catch(handleError);
      // 否则，正常替换
    } else {
      push(opt).catch(handleError);
    }
  }
  return go;
}

/**
 * @description: redo current page
 */
// 导出一个函数，用于实现重做功能
export const useRedo = (_router?: Router) => {
  // 获取路由器实例
  const { replace, currentRoute } = _router || useRouter();
  // 获取当前路由的查询参数、参数、名称和完整路径
  const { query, params = {}, name, fullPath } = unref(currentRoute.value);
  // 定义重做函数
  function redo(): Promise<boolean> {
    // 创建一个Promise对象
    return new Promise((resolve) => {
      // 如果当前路由的名称是REDIRECT_NAME，则直接返回false
      if (name === REDIRECT_NAME) {
        resolve(false);
        return;
      }
      // 如果当前路由有名称和参数，则将参数和查询参数替换为_origin_params和_redirect_type
      if (name && Object.keys(params).length > 0) {
        params['_origin_params'] = JSON.stringify(params ?? {});
        params['_redirect_type'] = 'name';
        params['path'] = String(name);
      } else {
        // 否则将查询参数和参数替换为_redirect_type和path
        params['_redirect_type'] = 'path';
        params['path'] = fullPath;
      }
      // 使用replace方法替换路由，并返回true
      replace({ name: REDIRECT_NAME, params, query }).then(() => resolve(true));
    });
  }
  // 返回重做函数
  return redo;
};
