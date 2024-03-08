export default {
  // 设置环境变量，支持浏览器、Node.js和ES6
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  // 指定解析器为 vue-eslint-parser
  parser: 'vue-eslint-parser',
  // 配置解析器
  parserOptions: {
    // 使用 @typescript-eslint/parser 解析器
    parser: '@typescript-eslint/parser',
    // 使用 ECMAScript 2020 语法
    ecmaVersion: 2020,
    // 使用模块化语法
    sourceType: 'module',
    // 使用 React 作为 JSX 标志
    jsxPragma: 'React',
    // 启用 JSX 语法
    ecmaFeatures: {
      jsx: true,
    },
    // 使用项目中的 tsconfig.json 文件
    project: './tsconfig.*?.json',
    // 不创建默认程序
    createDefaultProgram: false,
    // 添加 .vue 文件扩展
    extraFileExtensions: ['.vue'],
  },
  // 配置插件
  plugins: ['vue', '@typescript-eslint', 'import'],
  extends: [
    // 使用推荐的ESLint规则
    'eslint:recommended',
    // 使用Vue3推荐的插件
    'plugin:vue/vue3-recommended',
    // 使用TypeScript-ESLint推荐的插件
    'plugin:@typescript-eslint/recommended',
    // 使用Prettier推荐的插件
    'plugin:prettier/recommended',
  ],
  rules: {
    // 关闭未使用的变量警告
    'no-unused-vars': 'off',
    // 关闭Case声明警告
    'no-case-declarations': 'off',
    // 关闭使用前定义警告
    'no-use-before-define': 'off',
    // 关闭函数参数前空格警告
    'space-before-function-paren': 'off',

    // 导入模块放在第一
    'import/first': 'error',
    // 导入模块后换行
    'import/newline-after-import': 'error',
    // 禁止重复导入
    'import/no-duplicates': 'error',

    // 禁止未使用的变量
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    // 禁用ts忽略
    '@typescript-eslint/ban-ts-ignore': 'off',
    // 禁用ts注释
    '@typescript-eslint/ban-ts-comment': 'off',
    // 禁用ts类型
    '@typescript-eslint/ban-types': 'off',
    // 显式函数返回类型
    '@typescript-eslint/explicit-function-return-type': 'off',
    // 禁用any
    '@typescript-eslint/no-explicit-any': 'off',
    // 禁用require
    '@typescript-eslint/no-var-requires': 'off',
    // 禁用空函数
    '@typescript-eslint/no-empty-function': 'off',
    // 使用前定义
    '@typescript-eslint/no-use-before-define': 'off',
    // 禁用非空断言
    '@typescript-eslint/no-non-null-assertion': 'off',
    // 显式模块边界类型
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // 脚本设置使用变量
    'vue/script-setup-uses-vars': 'error',
    // 禁用保留组件名称
    'vue/no-reserved-component-names': 'off',
    // 自定义事件名称
    'vue/custom-event-name-casing': 'off',
    // 属性顺序
    'vue/attributes-order': 'off',
    // 每个组件单独一个文件
    'vue/one-component-per-file': 'off',
    // html关闭括号换行
    'vue/html-closing-bracket-newline': 'off',
    // 每行属性数量
    'vue/max-attributes-per-line': 'off',
    // 多行html元素内容换行
    'vue/multiline-html-element-content-newline': 'off',
    // 单行html元素内容换行
    'vue/singleline-html-element-content-newline': 'off',
    // 属性连字符
    'vue/attribute-hyphenation': 'off',
    // 默认属性
    'vue/require-default-prop': 'off',
    // 显式emit
    'vue/require-explicit-emits': 'off',
    // html自闭合
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'never',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    // 多词组件
    'vue/multi-word-component-names': 'off',
    // 导入排序
    // 'sort-imports': [
    //   'error',
    //   {
    //     ignoreCase: true,
    //     ignoreDeclarationSort: false,
    //     ignoreMemberSort: false,
    //     memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
    //     allowSeparatedGroups: false,
    //   },
    // ],
  },
  globals: {
    defineOptions: 'readonly',
  },
};
