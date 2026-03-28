import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: [
    {
      // 1) MSW HTTP mock 서버 (포트 9090) — Next.js보다 먼저 실행
      command: 'node_modules/.bin/tsx src/mocks/http.ts',
      url: 'http://localhost:9090',
      reuseExistingServer: !process.env.CI,
      timeout: 30 * 1000,
    },
    {
      // 2) Next.js dev server — API_BASE_URL을 mock 서버로 지정
      command: 'API_BASE_URL=http://localhost:9090 yarn dev',
      url: 'http://localhost:8080',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
