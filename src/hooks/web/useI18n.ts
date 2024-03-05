import { i18n } from '@/locales/setupI18n';

type I18nGlobalTranslation = {
  (key: string): string;
  (key: string, locale: string): string;
  (key: string, locale: string, list: unknown[]): string;
  (key: string, locale: string, named: Record<string, unknown>): string;
  (key: string, list: unknown[]): string;
  (key: string, named: Record<string, unknown>): string;
};

type I18nTranslationRestParameters = [string, any];

function getKey(namespace: string | undefined, key: string) {
  if (!namespace) {
    return key;
  }
  if (key.startsWith(namespace)) {
    return key;
  }
  return `${namespace}.${key}`;
}

export function useI18n(namespace?: string): {
  t: I18nGlobalTranslation;
} {
  // 兜底: 多语言函数
  const normalFn = {
    t: (key: string) => {
      return getKey(namespace, key);
    },
  };

  if (!i18n) {
    return normalFn;
  }

  // 如果要切换整个应用程序的区域设置，则需要通过使用 createI18n 创建的 i18n 实例的 global 属性进行更改
  // ref: https://vue-i18n.intlify.dev/guide/essentials/scope
  // case1: when vue-i18n is being used with legacy: false, note that i18n.global.locale is a ref, so we must set it via .value:
  //    i18n.global.locale.value = 'en'
  // case2: otherwise - when using legacy: true, we set it like this:
  //    i18n.global.locale = 'en'

  const { t, ...methods } = i18n.global;

  const tFn: I18nGlobalTranslation = (key: string, ...arg: any[]) => {
    if (!key) return '';
    if (!key.includes('.') && !namespace) return key;

    // 调用t函数, 参数为(key,...arg)
    return (t as (arg0: string, ...arg: I18nTranslationRestParameters) => string)(
      getKey(namespace, key),
      ...(arg as I18nTranslationRestParameters),
    );
  };
  return {
    ...methods,
    t: tFn,
  };
}

// Why write this function？
// Mainly to configure the vscode i18nn ally plugin. This function is only used for routing and menus. Please use useI18n for other places

// 为什么要编写此函数？
// 主要用于配合vscode i18nn ally插件。此功能仅用于路由和菜单。请在其他地方使用useI18n
export const t = (key: string) => key;
