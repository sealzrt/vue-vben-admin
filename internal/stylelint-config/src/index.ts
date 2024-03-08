export default {
  // 继承配置
  extends: ['stylelint-config-standard', 'stylelint-config-property-sort-order-smacss'],
  // 插件
  plugins: ['stylelint-order', 'stylelint-prettier'],
  // customSyntax: 'postcss-html',
  // 设置覆盖，针对不同类型的文件使用不同的自定义语法
  overrides: [
    // 对css、html、vue文件使用postcss-html语法
    {
      files: ['**/*.(css|html|vue)'],
      customSyntax: 'postcss-html',
    },
    // 对less、less文件使用postcss-less语法，并继承stylelint-config-standard和stylelint-config-recommended-vue规则
    {
      files: ['*.less', '**/*.less'],
      customSyntax: 'postcss-less',
      extends: ['stylelint-config-standard', 'stylelint-config-recommended-vue'],
    },
    // 对scss、scss文件使用postcss-scss语法，并继承stylelint-config-standard-scss和stylelint-config-recommended-vue/scss规则
    {
      files: ['*.scss', '**/*.scss'],
      customSyntax: 'postcss-scss',
      extends: ['stylelint-config-standard-scss', 'stylelint-config-recommended-vue/scss'],
      // 删除scss/percent-placeholder-pattern规则
      rule: {
        'scss/percent-placeholder-pattern': null,
      },
    },
  ],
  // 设置规则
  rules: {
    // prettier规则，启用prettier格式化
    'prettier/prettier': true,
    // 媒体特性范围表示法，禁用
    'media-feature-range-notation': null,
    // 选择器表示法，禁用
    'selector-not-notation': null,
    // 导入表示法，禁用
    'import-notation': null,
    // 函数未知，禁用
    'function-no-unknown': null,
    // 选择器类模式，禁用
    'selector-class-pattern': null,
    // 选择器伪类未知，禁用，忽略全局和深伪类
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global', 'deep'],
      },
    ],
    // 选择器伪元素未知，禁用，忽略v-deep伪元素
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep'],
      },
    ],
    // at规则未知，禁用，忽略tailwind、apply、variants、responsive、screen、function、if、each、include、mixin、extend等at规则
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'function',
          'if',
          'each',
          'include',
          'mixin',
          'extend',
        ],
      },
    ],
    // 源码不能为空，禁用
    'no-empty-source': null,
    // 命名网格区域不无效，禁用
    'named-grid-areas-no-invalid': null,
    // 没有降序特定性，禁用
    'no-descending-specificity': null,
    // 字体家族没有缺失的通用家族关键字，禁用
    'font-family-no-missing-generic-family-keyword': null,
    // 规则前空行，启用，忽略注释后和第一层嵌套
    'rule-empty-line-before': [
      'always',
      {
        ignore: ['after-comment', 'first-nested'],
      },
    ],
    // 单位未知，禁用，忽略rpx单位
    'unit-no-unknown': [true, { ignoreUnits: ['rpx'] }],
    // 顺序，启用，按照美元变量、自定义属性、at规则、声明、支持、媒体、规则的顺序
    'order/order': [
      [
        'dollar-variables',
        'custom-properties',
        'at-rules',
        'declarations',
        {
          type: 'at-rule',
          name: 'supports',
        },
        {
          type: 'at-rule',
          name: 'media',
        },
        'rules',
      ],
      { severity: 'error' },
    ],
  },
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts'],
};
