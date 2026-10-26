import { defineConfig, devices } from '@playwright/test';

// Isolated stack: own ports and database, so e2e never touches dev data
const API_PORT = 5002;
const WEB_PORT = 5174;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node server.js',
      cwd: '../backend',
      url: `http://localhost:${API_PORT}/api/health`,
      reuseExistingServer: !process.env.CI,
      env: {
        NODE_ENV: 'development',
        PORT: String(API_PORT),
        MONGO_URI: 'mongodb://localhost:27017/relationshipapp_e2e',
        FRONTEND_URL: `http://localhost:${WEB_PORT}`,
        JWT_SECRET: 'e2e_secret',
        API_RATE_LIMIT_MAX: '1000000',
        AUTH_RATE_LIMIT_MAX: '100000', // the suite signs up and logs in far more than a person would
      },
    },
    {
      command: `npx vite --port ${WEB_PORT} --strictPort`,
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: !process.env.CI,
      env: {
        VITE_API_BASE_URL: `http://localhost:${API_PORT}/api`,
        VITE_API_URL: `http://localhost:${API_PORT}/api`,
      },
    },
  ],
});
