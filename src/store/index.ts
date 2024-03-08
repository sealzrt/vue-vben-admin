import type { App } from 'vue';
import { createPinia } from 'pinia';
import { registerPiniaPersistPlugin } from '@/store/plugin/persist';

// 创建 Pinia 实例
const store = createPinia();
// 注册 Pinia 持久化插件
registerPiniaPersistPlugin(store);

// 在应用程序中使用 Pinia 实例
export function setupStore(app: App<Element>) {
  app.use(store);
}

export { store };
