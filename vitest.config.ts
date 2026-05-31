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
      // Ratchet floor — the baseline at the time coverage was added (see #104).
      // CI fails if any metric drops below. Raise these as coverage climbs; the
      // push toward 100% is tracked in #105.
      thresholds: {
        statements: 89,
        branches: 87,
        functions: 87,
        lines: 89,
      },
    },
  },
});
