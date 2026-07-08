import { defineConfig, devices } from '@playwright/test'

const port = Number(process.env.WAGGULOUS_TEST_PORT ?? 5173)
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port} --strictPort`,
    env: {
      VITE_WAGGULOUS_STORAGE: 'local',
    },
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'mobile-chrome',
      use: devices['Pixel 7'],
    },
  ],
})
