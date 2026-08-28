// @see: https://eslint.org/docs/latest/use/configure/configuration-files
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'public/**',
      'docs/**',
      'bin/**',
      'stats.html',
      '*.sh',
      '**/*.md',
      '**/*.woff',
      '**/*.ttf',
      '.vscode/**',
      '.idea/**',
      '.husky/**',
      '.local/**'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ...reactPlugin.configs.flat['jsx-runtime'],
    settings: {
      react: {
        version: 'detect'
      }
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'simple-import-sort': simpleImportSort
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // eslint (http://eslint.cn/docs/rules)
      'no-var': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'no-use-before-define': 'off',
      'prefer-const': 'off',

      // typeScript (https://typescript-eslint.io/rules)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          caughtErrors: 'none'
        }
      ],
      '@typescript-eslint/prefer-ts-expect-error': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',

      // Newly stricter ESLint 10 defaults — keep original template style
      'no-useless-assignment': 'off',

      // react (https://github.com/jsx-eslint/eslint-plugin-react)
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off'
    }
  },
  eslintPluginPrettierRecommended
);
