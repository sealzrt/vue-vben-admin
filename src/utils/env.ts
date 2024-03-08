import type { GlobEnvConfig } from '#/config';
import pkg from '../../package.json';
import { API_ADDRESS } from '@/enums/cacheEnum';

export function getCommonStoragePrefix() {
  const { VITE_GLOB_APP_TITLE } = getAppEnvConfig();
  return `${VITE_GLOB_APP_TITLE.replace(/\s/g, '_')}__${getEnv()}`.toUpperCase();
}

// Generate cache key according to version
export function getStorageShortName() {
  return `${getCommonStoragePrefix()}${`__${pkg.version}`}__`.toUpperCase();
}

const getVariableName = (title: string) => {
  function strToHex(str: string) {
    const result: string[] = [];
    for (let i = 0; i < str.length; ++i) {
      const hex = str.charCodeAt(i).toString(16);
      result.push(('000' + hex).slice(-4));
    }
    return result.join('').toUpperCase();
  }
  return `__PRODUCTION__${strToHex(title) || '__APP'}__CONF__`.toUpperCase().replace(/\s/g, '');
};

// 获取应用的环境变量配置
export function getAppEnvConfig() {
  // Vite 在一个特殊的 import.meta.env 对象上暴露环境变量
  const ENV_NAME = getVariableName(import.meta.env.VITE_GLOB_APP_TITLE);
  // If the development environment is DEV, get the global configuration
  const ENV = import.meta.env.DEV
    ? // Get the global configuration (the configuration will be extracted independently when packaging)
      (import.meta.env as unknown as GlobEnvConfig)
    : (window[ENV_NAME] as unknown as GlobEnvConfig);
  const { VITE_GLOB_APP_TITLE, VITE_GLOB_API_URL_PREFIX, VITE_GLOB_UPLOAD_URL } = ENV;
  // 获取环境变量VITE_GLOB_API_URL
  let { VITE_GLOB_API_URL } = ENV;
  // 如果本地存储中存在API_ADDRESS变量
  if (localStorage.getItem(API_ADDRESS)) {
    // 从本地存储中获取API_ADDRESS变量，并将其解析为JSON格式
    const address = JSON.parse(localStorage.getItem(API_ADDRESS) || '{}');
    // 如果address变量中存在key属性, 优先使用
    // 否则使用VITE_GLOB_API_URL
    if (address?.key) VITE_GLOB_API_URL = address?.val;
  }
  return {
    VITE_GLOB_APP_TITLE,
    VITE_GLOB_API_URL,
    VITE_GLOB_API_URL_PREFIX,
    VITE_GLOB_UPLOAD_URL,
  };
}

/**
 * @description: Development mode
 */
export const devMode = 'development';

/**
 * @description: Production mode
 */
export const prodMode = 'production';

/**
 * @description: Get environment variables
 * @returns:
 * @example:
 */
export function getEnv(): string {
  return import.meta.env.MODE;
}

/**
 * @description: Is it a development mode
 * @returns:
 * @example:
 */
export function isDevMode(): boolean {
  return import.meta.env.DEV;
}

/**
 * @description: Is it a production mode
 * @returns:
 * @example:
 */
export function isProdMode(): boolean {
  return import.meta.env.PROD;
}
