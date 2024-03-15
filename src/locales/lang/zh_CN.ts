import { genMessage } from '../helper';
import antdLocale from 'ant-design-vue/es/locale/zh_CN';
import { deepMerge } from '@/utils';

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

const modules = import.meta.glob('./zh-CN/**/*.{json,ts,js}', { eager: true });

export default {
  message: {
    ...genMessage(modules as Recordable<Recordable>, 'zh-CN'),
    antdLocale: {
      ...antdLocale,
      DatePicker: deepMerge(
        antdLocale.DatePicker,
        genMessage(modules as Recordable<Recordable>, 'zh-CN').antdLocale.DatePicker,
      ),
    },
  },
};
