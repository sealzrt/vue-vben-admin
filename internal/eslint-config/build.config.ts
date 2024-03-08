import { defineBuildConfig } from 'unbuild';

// unbuild 的配置文件
export default defineBuildConfig({
  // 构建前清空
  clean: true,
  // 入口文件
  entries: ['src/index', 'src/strict'],
  // 生成声明文件
  declaration: true,
  // rollup配置
  rollup: {
    // 输出commonjs模块
    emitCJS: true,
  },
});
