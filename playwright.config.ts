import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Le sandbox de dev fournit Chromium pré-installé à ce chemin ;
        // en local/CI standard, `npx playwright install` suffit et cette
        // variable n'a pas besoin d'être définie.
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
          : undefined,
      },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run dev -- --port 5173',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
      },
})
