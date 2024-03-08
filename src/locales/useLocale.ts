/**
 * Multi-language related operations
 */
import type { LocaleType } from '#/config';

import { i18n } from './setupI18n';
import { useLocaleStoreWithOut } from '@/store/modules/locale';
import { unref, computed } from 'vue';
import { loadLocalePool, setHtmlPageLang } from './helper';
import { Locale } from 'ant-design-vue/es/locale';

interface LangModule {
  message: Recordable;
  dateLocale: Recordable;
  dateLocaleName: string;
}

// 设置国际化语言
function setI18nLanguage(locale: LocaleType) {
  // 使用localeStore
  const localeStore = useLocaleStoreWithOut();

  // 判断i18n的模式
  if (i18n.mode === 'legacy') {
    // 如果是legacy模式，将locale赋值给i18n.global.locale
    i18n.global.locale = locale;
  } else {
    // 如果不是legacy模式，将locale赋值给i18n.global.locale的value属性
    (i18n.global.locale as any).value = locale;
  }
  // 设置localeStore的locale信息
  localeStore.setLocaleInfo({ locale });
  // 设置html页面的语言
  setHtmlPageLang(locale);
}

// 导出一个函数，用于获取当前语言环境
export function useLocale() {
  // 在 setup() 外部使用 localeStore
  const localeStore = useLocaleStoreWithOut();
  // 计算属性，获取当前语言环境
  const getLocale = computed(() => localeStore.getLocale);
  // 计算属性，获取是否显示语言选择器
  const getShowLocalePicker = computed(() => localeStore.getShowPicker);

  // 计算属性，获取antd的语言环境
  const getAntdLocale = computed((): any => {
    // 获取当前语言环境
    const localeMessage = i18n.global.getLocaleMessage<{ antdLocale: Locale }>(unref(getLocale));
    // 返回antd的语言环境
    return localeMessage?.antdLocale ?? {};
  });

  // 切换语言，会改变useI18n的locale，并提交配置修改
  async function changeLocale(locale: LocaleType) {
    // 获取全局i18n
    const globalI18n = i18n.global;
    // 获取当前语言环境
    const currentLocale = unref(globalI18n.locale);
    // 如果当前语言环境等于要切换的语言，直接返回
    if (currentLocale === locale) {
      return locale;
    }

    // 如果加载语言池中包含要切换的语言，直接设置语言并返回
    if (loadLocalePool.includes(locale)) {
      setI18nLanguage(locale);
      return locale;
    }
    // 按需加载语言文件
    const langModule = ((await import(`./lang/${locale}.ts`)) as any).default as LangModule;
    // 如果没有语言文件，直接返回
    if (!langModule) return;

    // 获取语言文件中的message
    const { message } = langModule;

    // 设置全局i18n的localeMessage
    globalI18n.setLocaleMessage(locale, message);
    // 将要切换的语言添加到加载语言池中
    loadLocalePool.push(locale);

    // 设置语言
    setI18nLanguage(locale);
    // 返回语言
    return locale;
  }

  // 返回当前语言环境，是否显示语言选择器，切换语言函数，antd的语言环境
  return {
    getLocale,
    getShowLocalePicker,
    changeLocale,
    getAntdLocale,
  };
}
