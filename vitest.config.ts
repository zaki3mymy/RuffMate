import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // テスト環境の設定
    environment: 'jsdom',

    // セットアップファイル
    setupFiles: ['./tests/setup.ts'],

    // テストファイルのパターン
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],

    // E2Eテストを除外
    exclude: ['node_modules', 'dist', '.git', 'tests/e2e/**'],
  },
})
