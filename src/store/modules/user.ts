import type { UserInfo } from '#/store';
import type { ErrorMessageMode } from '#/axios';
import { defineStore } from 'pinia';
import { store } from '@/store';
import { RoleEnum } from '@/enums/roleEnum';
import { PageEnum } from '@/enums/pageEnum';
import { ROLES_KEY, TOKEN_KEY, USER_INFO_KEY } from '@/enums/cacheEnum';
import { getAuthCache, setAuthCache } from '@/utils/auth';
import { GetUserInfoModel, LoginParams } from '@/api/sys/model/userModel';
import { doLogout, getUserInfo, loginApi } from '@/api/sys/user';
import { useI18n } from '@/hooks/web/useI18n';
import { useMessage } from '@/hooks/web/useMessage';
import { router } from '@/router';
import { usePermissionStore } from '@/store/modules/permission';
import { RouteRecordRaw } from 'vue-router';
import { PAGE_NOT_FOUND_ROUTE } from '@/router/routes/basic';
import { isArray } from '@/utils/is';
import { h } from 'vue';

interface UserState {
  userInfo: Nullable<UserInfo>;
  token?: string;
  roleList: RoleEnum[];
  /**
   * 用户登录状态是否失效. 默认值是false,  401状态码时 设置为true;
   */
  sessionTimeout?: boolean;
  lastUpdateTime: number;
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): UserState => ({
    // user info
    userInfo: null,
    // token
    token: undefined,
    // roleList
    roleList: [],
    // Whether the login expired, 登录是否过期
    sessionTimeout: false,
    // Last fetch time
    lastUpdateTime: 0,
  }),
  getters: {
    getUserInfo(state): UserInfo {
      return state.userInfo || getAuthCache<UserInfo>(USER_INFO_KEY) || {};
    },
    getToken(state): string {
      return state.token || getAuthCache<string>(TOKEN_KEY);
    },
    getRoleList(state): RoleEnum[] {
      return state.roleList.length > 0 ? state.roleList : getAuthCache<RoleEnum[]>(ROLES_KEY);
    },
    /**
     * 获取用户登录状态是否失效. 默认值是false,  401状态码时 设置为true;
     * @param state
     */
    getSessionTimeout(state): boolean {
      return !!state.sessionTimeout;
    },
    getLastUpdateTime(state): number {
      return state.lastUpdateTime;
    },
  },
  actions: {
    setToken(info: string | undefined) {
      this.token = info ? info : ''; // for null or undefined value
      setAuthCache(TOKEN_KEY, info);
    },
    setRoleList(roleList: RoleEnum[]) {
      this.roleList = roleList;
      setAuthCache(ROLES_KEY, roleList);
    },
    setUserInfo(info: UserInfo | null) {
      this.userInfo = info;
      this.lastUpdateTime = new Date().getTime();
      setAuthCache(USER_INFO_KEY, info);
    },
    /**
     * 用户登录状态是否失效. 默认值是false,  401状态码时 设置为true;
     * @param flag
     */
    setSessionTimeout(flag: boolean) {
      this.sessionTimeout = flag;
    },
    resetState() {
      this.userInfo = null;
      this.token = '';
      this.roleList = [];
      this.sessionTimeout = false;
    },
    /**
     * @description: login
     */
    async login(
      params: LoginParams & {
        goHome?: boolean;
        mode?: ErrorMessageMode;
      },
    ): Promise<GetUserInfoModel | null> {
      try {
        const { goHome = true, mode, ...loginParams } = params;
        const data = await loginApi(loginParams, mode);
        const { token } = data;

        // save token
        this.setToken(token);
        return this.afterLoginAction(goHome);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    /**
     * 登录后的逻辑
     * @param goHome
     */
    async afterLoginAction(goHome?: boolean): Promise<GetUserInfoModel | null> {
      // 如果没有token，返回null
      if (!this.getToken) return null;
      // get user info
      // 获取用户信息 (包括: 角色信息)
      const userInfo = await this.getUserInfoAction();

      // 获取登录是否过期
      // 用户登录状态是否失效. 正常是false,  401状态码时 设置为true;
      const sessionTimeout = this.sessionTimeout;
      if (sessionTimeout) {
        // 设置为 未过期
        this.setSessionTimeout(false);
      } else {
        // 使用usePermissionStore() 获取permissionStore
        const permissionStore = usePermissionStore();

        // 动态路由加载（首次）
        // 是否已加载了动态路由
        if (!permissionStore.isDynamicAddedRoute) {
          // 如果没有加载过，获取动态路由
          const routes = await permissionStore.buildRoutesAction();
          // 调用 router.addRoute 动态添加路由
          [...routes, PAGE_NOT_FOUND_ROUTE].forEach((route) => {
            router.addRoute(route as unknown as RouteRecordRaw);
          });
          // 记录动态路由加载完成
          permissionStore.setDynamicAddedRoute(true);
        }

        // 如果有goHome参数，跳转到homePath
        goHome && (await router.replace(userInfo?.homePath || PageEnum.BASE_HOME));
      }
      // 返回用户信息
      return userInfo;
    },
    // async 声明一个异步函数，返回一个Promise<UserInfo | null>类型的值
    async getUserInfoAction(): Promise<UserInfo | null> {
      // 如果没有getToken属性，则返回null
      if (!this.getToken) return null;
      // 调用getUserInfo函数，获取用户信息
      const userInfo = await getUserInfo();
      // 获取用户信息中的roles属性，如果没有则默认为空数组
      const { roles = [] } = userInfo;
      // 如果roles是数组，则将roles转换为RoleEnum类型的数组，并调用setRoleList函数设置角色列表
      if (isArray(roles)) {
        const roleList = roles.map((item) => item.value) as RoleEnum[];
        this.setRoleList(roleList);
      } else {
        // 如果roles不是数组，则将roles设置为空数组，并调用setRoleList函数设置角色列表
        userInfo.roles = [];
        this.setRoleList([]);
      }
      // 调用setUserInfo函数设置用户信息
      this.setUserInfo(userInfo);
      // 返回用户信息
      return userInfo;
    },
    /**
     * @description: logout
     */
    async logout(goLogin = false) {
      if (this.getToken) {
        try {
          await doLogout();
        } catch {
          console.log('注销Token失败');
        }
      }
      this.setToken(undefined);
      this.setSessionTimeout(false);
      this.setUserInfo(null);
      if (goLogin) {
        // 直接回登陆页
        router.replace(PageEnum.BASE_LOGIN);
      } else {
        // 回登陆页带上当前路由地址
        router.replace({
          path: PageEnum.BASE_LOGIN,
          query: {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          },
        });
      }
    },

    /**
     * @description: Confirm before logging out
     */
    confirmLoginOut() {
      const { createConfirm } = useMessage();
      const { t } = useI18n();
      createConfirm({
        iconType: 'warning',
        title: () => h('span', t('sys.app.logoutTip')),
        content: () => h('span', t('sys.app.logoutMessage')),
        onOk: async () => {
          // 主动登出，不带redirect地址
          await this.logout(true);
        },
      });
    },
  },
});

/**
 * 如果你想在 setup() 外部使用一个 store，记得把 pinia 对象传给 useStore(), 然后就可以使用它了
 */
// Need to be used outside the setup
export function useUserStoreWithOut() {
  return useUserStore(store);
}
