import { defineConfig, type UserConfigExport } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

const resolve = {
  alias: {
    '@': path.resolve(__dirname, 'src')
  }
} as const;

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    workspace: [
      {
        resolve,
        test: {
          globals: true,
          name: 'browser',
          include: ['test/browser/**', 'test/shared/**'],
          environment: 'browser',
          browser: {
            provider: 'playwright',
            enabled: true,
            headless: true,
            screenshotFailures: false,
            instances: [
              { browser: 'chromium' }
              // { browser: 'firefox' },
              // { browser: 'webkit' },
            ]
          }
        }
      },
      {
        resolve,
        test: {
          globals: true,
          name: 'server',
          include: ['test/server/**', 'test/shared/**'],
          environment: 'node'
        }
      }
    ]
  }
} satisfies UserConfigExport);
