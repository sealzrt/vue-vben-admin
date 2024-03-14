import type { App } from 'vue';
import { createPinia } from 'pinia';
import { registerPiniaPersistPlugin } from '@/store/plugin/persist';

// 创建 Pinia 实例
const store = createPinia();
// 注册 Pinia 持久化插件
registerPiniaPersistPlugin(store);

// 在应用程序中使用 Pinia 实例
// Vue.prototype.use() 方法至少传入一个参数，该参数类型必须是 Object 或 Function
// 如果是 Object 那么这个 Object 需要定义一个 install 方法，
// 如果是 Function 那么这个函数就被当做 install 方法
export function setupStore(app: App<Element>) {
  app.use(store);
}

export { store };
