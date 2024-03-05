import type { App } from 'vue';
import type { I18nOptions } from 'vue-i18n';

import { createI18n } from 'vue-i18n';
import { setHtmlPageLang, setLoadLocalePool } from './helper';
import { localeSetting } from '@/settings/localeSetting';
import { useLocaleStoreWithOut } from '@/store/modules/locale';

const { fallback, availableLocales } = localeSetting;

export let i18n: ReturnType<typeof createI18n>;

/**
 * 创建 vue-i18n 多语言选项
 */
async function createI18nOptions(): Promise<I18nOptions> {
  // 在setup()外部 使用store
  const localeStore = useLocaleStoreWithOut();
  // 语言类型
  const locale = localeStore.getLocale;
  // import() 函数, 按需 异步 动态加载 多语言配置文件
  const defaultLocal = await import(`./lang/${locale}.ts`);
  const message = defaultLocal.default?.message ?? {};

  // HTML标签 添加属性: 语言类型
  setHtmlPageLang(locale);
  // 添加到本地语言池
  setLoadLocalePool((loadLocalePool) => {
    loadLocalePool.push(locale);
  });

  return {
    legacy: false, // 如果要支持compositionAPI，此项必须设置为false;
    locale, // 设置本地场景语言
    fallbackLocale: fallback, // 设置本来的语言
    messages: {
      [locale]: message,
    },
    availableLocales: availableLocales, // 以词法顺序排列的 messages 中的可用语言环境列表。
    sync: true, //If you don’t want to inherit locale from global scope, you need to set sync of i18n component option to false. 是否将根级别语言环境与组件本地化语言环境同步; 如果为 false，则无论根级别语言环境如何，都要为每个组件语言环境进行本地化
    silentTranslationWarn: true, // true - warning off  是否取消本地化失败时输出的警告; 如果为 true，则禁止本地化失败警告
    missingWarn: false, // 是否抑制本地化失败时输出的警告
    silentFallbackWarn: true, // 是否在回退到 fallbackLocale 或 root 时取消警告; 如果为 true，则仅在根本没有可用的转换时生成警告，而不是在回退时
  };
}

// setup i18n instance with glob
export async function setupI18n(app: App) {
  const options = await createI18nOptions();
  i18n = createI18n(options);
  app.use(i18n);
}
