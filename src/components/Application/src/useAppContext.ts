import { InjectionKey, Ref } from 'vue';
import { createContext, useContext } from '@/hooks/core/useContext';

export interface AppProviderContextProps {
  prefixCls: Ref<string>;
  isMobile: Ref<boolean>;
}

// InjectionKey: 当使用 TypeScript 时，key 可以是一个类型为 InjectionKey 的 symbol。InjectionKey 是一个 Vue 提供的工具类型，继承自 Symbol，可以用来同步 provide() 和 inject() 之间值的类型
const key: InjectionKey<AppProviderContextProps> = Symbol();

/**
 * 创建应用的上下文数据
 * @param context
 */
export function createAppProviderContext(context: AppProviderContextProps) {
  return createContext<AppProviderContextProps>(context, key);
}

/**
 * 读取应用的上下文数据
 */
export function useAppProviderContext() {
  return useContext<AppProviderContextProps>(key);
}
