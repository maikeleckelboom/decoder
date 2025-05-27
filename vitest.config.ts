import { defineConfig, type UserConfigExport } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig({
  test: {
    workspace: [
      {
        ...viteConfig,
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
        ...viteConfig,
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
