import type { RouteRecordRaw } from 'vue-router';

import { useAppStore } from '@/store/modules/app';
import { usePermissionStore } from '@/store/modules/permission';
import { useUserStore } from '@/store/modules/user';

import { useTabs } from './useTabs';

import { router, resetRouter } from '@/router';
// import { RootRoute } from '@/router/routes';

import projectSetting from '@/settings/projectSetting';
import { PermissionModeEnum } from '@/enums/appEnum';
import { RoleEnum } from '@/enums/roleEnum';

import { intersection } from 'lodash-es';
import { isArray } from '@/utils/is';
import { useMultipleTabStore } from '@/store/modules/multipleTab';

// User permissions related operations
export function usePermission() {
  // 引入用户仓库
  const userStore = useUserStore();
  // 引入应用仓库
  const appStore = useAppStore();
  // 引入权限仓库
  const permissionStore = usePermissionStore();
  // 引入标签页仓库
  const { closeAll } = useTabs(router);

  /**
   * 切换权限模式
   */
  async function togglePermissionMode() {
    // 设置项目配置
    appStore.setProjectConfig({
      // 权限模式
      permissionMode:
        appStore.projectConfig?.permissionMode === PermissionModeEnum.BACK // 如果当前权限模式是后台模式
          ? // 则切换为路由映射模式
            PermissionModeEnum.ROUTE_MAPPING
          : // 否则切换为后台模式
            PermissionModeEnum.BACK,
    });
    // 刷新页面
    location.reload();
  }

  /**
   * Reset and regain authority resource information
   * 重置和重新获得权限资源信息
   */
  async function resume() {
    // 获取多标签页store
    const tabStore = useMultipleTabStore();
    // 清除缓存标签页
    tabStore.clearCacheTabs();
    // 重置路由
    resetRouter();

    // 动态加载路由（再次）
    const routes = await permissionStore.buildRoutesAction();
    // 遍历路由，将路由添加到路由器中
    routes.forEach((route) => {
      router.addRoute(route as unknown as RouteRecordRaw);
    });

    // 设置最后一次构建菜单的时间
    permissionStore.setLastBuildMenuTime();
    // 关闭所有标签页
    closeAll();
  }

  /**
   * 判断是否有权限
   * @param value 权限值
   * @param def 默认值
   * @returns 是否有权限
   */
  function hasPermission(value?: RoleEnum | RoleEnum[] | string | string[], def = true): boolean {
    // Visible by default
    // 如果value值为空，则返回def
    if (!value) {
      return def;
    }

    // 获取当前项目的权限模式
    const permMode = appStore.getProjectConfig.permissionMode;

    // 如果权限模式为路由映射或角色，则进行以下操作
    if ([PermissionModeEnum.ROUTE_MAPPING, PermissionModeEnum.ROLE].includes(permMode)) {
      // 如果value不是数组，则判断value是否在用户角色列表中
      if (!isArray(value)) {
        return userStore.getRoleList?.includes(value as RoleEnum);
      }
      // 如果value是数组，则判断数组交集是否大于0
      return (intersection(value, userStore.getRoleList) as RoleEnum[]).length > 0;
    }

    // 如果权限模式为后端，则进行以下操作
    if (PermissionModeEnum.BACK === permMode) {
      // 获取所有权限代码列表
      const allCodeList = permissionStore.getPermCodeList as string[];
      // 如果value不是数组，则进行以下操作
      if (!isArray(value)) {
        // 判断value是否包含||或&&
        const splits = ['||', '&&'];
        const splitName = splits.find((item) => value.includes(item));
        // 如果包含，则进行分割
        if (splitName) {
          const splitCodes = value.split(splitName);
          // 如果包含||，则判断交集是否大于0
          return splitName === splits[0]
            ? intersection(splitCodes, allCodeList).length > 0
            : // 如果包含&&，则判断交集是否等于分割长度
              intersection(splitCodes, allCodeList).length === splitCodes.length;
        }
        // 如果不包含||或&&，则判断value是否在权限代码列表中
        return allCodeList.includes(value);
      }
      // 如果value是数组，则判断数组交集是否大于0
      return (intersection(value, allCodeList) as string[]).length > 0;
    }
    // 其他情况，则返回true
    return true;
  }

  /**
   * Change roles
   * @param roles
   */
  async function changeRole(roles: RoleEnum | RoleEnum[]): Promise<void> {
    if (projectSetting.permissionMode !== PermissionModeEnum.ROUTE_MAPPING) {
      throw new Error(
        'Please switch PermissionModeEnum to ROUTE_MAPPING mode in the configuration to operate!',
      );
    }

    if (!isArray(roles)) {
      roles = [roles];
    }
    userStore.setRoleList(roles);
    await resume();
  }

  /**
   * refresh menu data
   */
  async function refreshMenu() {
    resume();
  }

  return { changeRole, hasPermission, togglePermissionMode, refreshMenu };
}
