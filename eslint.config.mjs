import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import unocss from '@unocss/eslint-plugin';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// ESLint 10 flat config。等价还原迁移前 .eslintrc.cjs 的规则，并叠加 UnoCSS 类名排序。
// 代码格式化交给 Prettier（见 .prettierrc.cjs）；eslint-config-prettier 关闭风格类规则避免冲突。
export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', 'public', 'docs', '.husky', 'stats.html', '**/*.d.ts']
  },
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    // 注：eslint-plugin-react-hooks v7 的预设仍是旧数组格式，无法 spread 进 flat config，
    // 故在下方手动注册 react-hooks 插件并直接开启规则。
    extends: [js.configs.recommended, ...tseslint.configs.recommended, react.configs.flat['jsx-runtime']],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    settings: { react: { version: 'detect' } },
    plugins: { unocss, 'react-hooks': reactHooks },
    rules: {
      // eslint
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@iconify/react',
              message: '离线部署：图标一律从 @iconify/react/offline 导入（本地集合注册见 src/assets/icons/register.ts）'
            }
          ]
        }
      ],
      'no-var': 'error',
      'no-use-before-define': 'off',
      'prefer-const': 'off',
      // TS 已做未定义检查，关闭 no-undef 避免对类型/全局类型误报
      'no-undef': 'off',

      // typescript-eslint
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      // 关闭 JS 基础规则，由 TS 版本接管（支持短路/三元等副作用写法）
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true, // condition && sideEffect()
          allowTernary: true,
          allowTaggedTemplates: true
        }
      ],
      'no-useless-assignment': 'off',

      // react-hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',

      // unocss：规范 class 属性内工具类顺序，并合并多余空格（保存时自动修复）
      'unocss/order': 'error'
    }
  },
  // eslint-config-prettier 必须放最后，关闭与 Prettier 冲突的风格规则
  prettier
);
