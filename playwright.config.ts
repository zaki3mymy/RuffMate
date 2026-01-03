import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Test Configuration
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // テストディレクトリ
  testDir: './tests/e2e',

  // 各テストのタイムアウト
  timeout: 30 * 1000,

  // テスト並列実行の設定
  fullyParallel: true,

  // CI環境でのリトライ設定
  retries: process.env.CI ? 2 : 0,

  // 並列実行ワーカー数
  workers: process.env.CI ? 1 : undefined,

  // レポーター設定
  reporter: 'html',

  use: {
    // ベースURL（Astroのプレビューサーバー）
    baseURL: 'http://localhost:4321',

    // スクリーンショット設定
    screenshot: 'only-on-failure',

    // 動画記録設定
    video: 'retain-on-failure',

    // トレース設定
    trace: 'on-first-retry',
  },

  // テスト対象ブラウザの設定
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Webサーバーの起動設定
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
