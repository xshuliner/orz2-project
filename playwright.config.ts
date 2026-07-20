import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'line',
  use: {
    baseURL: 'http://localhost:5173',
    browserName: 'chromium',
  },
  webServer: {
    command: 'pnpm run dev -- --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});
