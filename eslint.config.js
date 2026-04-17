/* eslint-disable unicorn/no-null */

import pluginQuery from '@tanstack/eslint-plugin-query';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';
import biome from 'eslint-config-biome';
import boundaries from 'eslint-plugin-boundaries';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';

export default defineConfig([
  sonarjs.configs.recommended,
  unicorn.configs['flat/recommended'],
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      boundaries: boundaries,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@tanstack/query': pluginQuery,
    },
    settings: {
      'boundaries/elements': [
        { type: 'api', pattern: 'src/api/**/*' },
        { type: 'assets', pattern: 'src/assets/**/*' },
        { type: 'components', pattern: 'src/components/**/*' },
        { type: 'composables', pattern: 'src/composables/**/*' },
        { type: 'config', pattern: 'src/config/**/*' },
        { type: 'i18n', pattern: 'src/i18n/**/*' },
        { type: 'layouts', pattern: 'src/layouts/**/*' },
        { type: 'providers', pattern: 'src/providers/**/*' },
        { type: 'router', pattern: 'src/router/**/*' },
        { type: 'stores', pattern: 'src/stores/**/*' },
        { type: 'styles', pattern: 'src/styles/**/*' },
        { type: 'types', pattern: 'src/types/**/*' },
        { type: 'utils', pattern: 'src/utils/**/*' },
        { type: 'views', pattern: 'src/views/**/*' },
      ],
    },
    rules: {
      // 基础：strict-type-checked 规则集
      ...tsPlugin.configs['strict-type-checked'].rules,
      ...pluginQuery.configs['flat/recommended'][0].rules,
      ...reactHooks.configs.recommended.rules,

      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // ===== 类型安全 (Sync from Linguist) =====
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-enum-comparison': 'error',

      // ===== 严格函数签名 =====
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',

      // ===== 类型断言与转换 =====
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
          allowBoolean: false,
          allowAny: false,
          allowNullish: false,
          allowRegExp: false,
          allowNever: false,
        },
      ],

      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'never',
        },
      ],
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowNullableBoolean: true,
          allowNullableString: false,
          allowNullableNumber: false,
          allowNullableObject: true,
          allowAny: false,
        },
      ],

      // ===== Promise 与异步 =====
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/return-await': ['error', 'always'],
      '@typescript-eslint/promise-function-async': 'error',

      // ===== Import 与模块 =====
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports', // React often uses inline type imports for components
        },
      ],
      '@typescript-eslint/consistent-type-exports': [
        'error',
        {
          fixMixedExportsWithInlineTypeSpecifier: true,
        },
      ],

      // ===== 类与继承 =====
      '@typescript-eslint/no-extraneous-class': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
        },
      ],

      // ===== 代码质量 =====
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unnecessary-type-arguments': 'error',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/no-redundant-type-constituents': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        {
          ignoreArrowShorthand: false,
          ignoreVoidOperator: false,
        },
      ],
      '@typescript-eslint/require-array-sort-compare': 'error',
      'prefer-promise-reject-errors': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'error',
      '@typescript-eslint/no-unsafe-unary-minus': 'error',
      '@typescript-eslint/no-invalid-void-type': 'error',
      '@typescript-eslint/method-signature-style': ['error', 'property'],

      // ===== 命名约定 (Sync from Linguist + React support) =====
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'], leadingUnderscore: 'allow' },
        // React 组件函数必须使用 PascalCase
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        // 变量可能是组件引用、常量或解构；允许双下划线前后缀(Vite define 注入)
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allowDouble',
          trailingUnderscore: 'allowDouble',
        },
        { selector: 'variable', modifiers: ['destructured'], format: null },
        // 第三方库导入名不可控 (如 React, ReactMarkdown 等)
        { selector: 'import', format: null },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['UPPER_CASE', 'PascalCase'] },
        { selector: 'property', format: null },
        // 参数允许 PascalCase 以支持 React 组件作为 prop 传入 (如 Icon)，允许 snake_case 以适配 API 字段
        { selector: 'parameter', format: ['camelCase', 'PascalCase', 'snake_case'], leadingUnderscore: 'allow' },
        // 对象字面量方法名放行 (provider 映射等场景)
        { selector: 'objectLiteralMethod', format: null },
      ],

      // ===== 通用 JS/TS 最佳实践 =====
      'no-implied-eval': 'off',
      '@typescript-eslint/no-implied-eval': 'error',
      'no-throw-literal': 'off',
      '@typescript-eslint/only-throw-error': 'error',

      'prefer-const': 'off',
      'no-var': 'off',
      'no-param-reassign': 'off',
      'no-return-assign': 'off',

      // ===== 架构边界 (Sync from Linguist + Frontend elements) =====
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: { type: 'types' },
              disallow: [
                {
                  to: {
                    type: [
                      'views',
                      'components',
                      'composables',
                      'router',
                      'providers',
                      'api',
                      'utils',
                      'stores',
                      'config',
                    ],
                  },
                },
              ],
              message: 'Type 层是最高抽象，不能反向依赖其他业务模块。',
            },
            {
              from: { type: 'utils' },
              disallow: [
                { to: { type: ['views', 'components', 'composables', 'router', 'providers', 'api', 'stores'] } },
              ],
              message: 'Utils 作为纯底层模块，不能去反向依赖业务代码。',
            },
            {
              from: { type: 'config' },
              disallow: [
                {
                  to: { type: ['views', 'components', 'composables', 'router', 'providers', 'api', 'stores', 'utils'] },
                },
              ],
              message: 'Config 层负责基础环境，不应包含业务逻辑。',
            },
            {
              from: { type: 'api' },
              disallow: [{ to: { type: ['views', 'components', 'composables', 'router', 'providers', 'stores'] } }],
              message: 'API 层用于处理网络请求逻辑，禁止直接引用视图或状态层。',
            },
            {
              from: { type: 'composables' },
              disallow: [{ to: { type: ['views', 'components', 'router'] } }],
              message: 'Composables 聚焦逻辑抽象，不应依赖具体的视图组件。',
            },
            {
              from: { type: 'providers' },
              disallow: [{ to: { type: ['views', 'components'] } }],
              message: 'Providers 负责上下文注入，不应反向依赖子视图组件。',
            },
          ],
        },
      ],

      // ===== Unicorn (Sync from Linguist) =====
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-module': 'off',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', 'src/components/ui/**', 'shadcn-admin/', 'src/routeTree.gen.ts'],
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  biome,
]);
