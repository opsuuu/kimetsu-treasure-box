import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', '.wrangler']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: {
      'no-unused-vars': 'off',
      'prefer-const': 'off',
      'no-undef': 'off',
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      tanstackQuery.configs['flat/recommended'],
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  // shadcn 元件慣例會一起匯出 variants 等非元件值
  {
    files: ['src/components/ui/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // react-refresh 0.5 起把 React.lazy 視為元件，路由表在 module 頂層宣告 lazy 頁面又 export router 物件，
  // 因此會報錯（web 把 lazy 包在 lazyWithSuspense() 裡，所以不受影響）。
  // 這個檔案 export 的不是元件，本來就無法 HMR；路由表很少改動，整頁 reload 可接受
  {
    files: ['src/routers/index.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // Cloudflare Pages Functions 跑在 Workers runtime，不是瀏覽器
  {
    files: ['functions/**/*.ts'],
    languageOptions: {
      globals: globals.serviceworker,
    },
  },
  {
    files: ['vite.config.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
]);
