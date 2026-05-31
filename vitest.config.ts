import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // Only the unit-tested logic layer is imported by Vitest; .astro pages and
      // components are exercised by Playwright, not instrumented here.
      include: ['src/lib/**/*.ts'],
      exclude: ['src/lib/**/*.test.ts', 'src/lib/testStats.ts'],
      // src/lib is fully covered (#105). CI fails if any metric drops below
      // 100% — keep new logic in src/lib unit-tested to stay green.
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
