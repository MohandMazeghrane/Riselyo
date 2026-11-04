import { defineConfig } from 'vitest/config';

const PRESENTATION_TESTS = 'apps/web/src/presentation/**/*.test.{ts,tsx}';

export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      {
        test: {
          name: 'logic',
          environment: 'node',
          include: [
            'apps/*/src/**/*.test.{ts,tsx}',
            'apps/*/test/**/*.test.{ts,tsx}',
            'packages/*/src/**/*.test.ts',
          ],
          exclude: [PRESENTATION_TESTS],
        },
      },
      {
        test: {
          name: 'ui',
          environment: 'jsdom',
          include: [PRESENTATION_TESTS],
          setupFiles: ['apps/web/test/setupDom.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['apps/web/src/domain/**', 'apps/web/src/application/**'],
      exclude: ['**/*.test.ts', '**/ports/**'],
      thresholds: {
        'apps/web/src/domain/**': { statements: 90, branches: 90, functions: 90, lines: 90 },
        'apps/web/src/application/**': { statements: 80, branches: 80, functions: 80, lines: 80 },
      },
    },
  },
});
