import { describe, expect, it } from 'vitest';
import { ogSnippetPath, ogTitle, pickHeroFence } from './ogSnippet';

describe('ogSnippetPath', () => {
  it('returns the canonical path for a slug', () => {
    expect(ogSnippetPath('playwright-clock-control')).toBe('src/og-snippets/playwright-clock-control.ts');
  });

  it('handles slugs with multiple hyphens', () => {
    expect(ogSnippetPath('k6-closed-vs-open-load-models')).toBe('src/og-snippets/k6-closed-vs-open-load-models.ts');
  });
});

describe('pickHeroFence', () => {
  const bodyWithFence = [
    'Some intro text.',
    '',
    '```typescript title="session-timeout.spec.ts"',
    "import { test } from '@playwright/test';",
    '',
    "test('times out', async ({ page }) => {",
    '  await page.clock.install({ time: new Date() });',
    '});',
    '```',
    '',
    'More text after.',
  ].join('\n');

  const bodyWithLangOnly = ['```ts', 'const x = 1;', '```'].join('\n');

  const bodyWithNoFence = 'Just some text without any code blocks.';

  it('extracts lang and title from the first fence', () => {
    const block = pickHeroFence(bodyWithFence);
    expect(block).not.toBeNull();
    expect(block!.lang).toBe('typescript');
    expect(block!.title).toBe('session-timeout.spec.ts');
  });

  it('extracts code content from the first fence', () => {
    const block = pickHeroFence(bodyWithFence);
    expect(block!.code).toContain("import { test } from '@playwright/test'");
  });

  it('returns empty title when no title attribute is present', () => {
    const block = pickHeroFence(bodyWithLangOnly);
    expect(block).not.toBeNull();
    expect(block!.lang).toBe('ts');
    expect(block!.title).toBe('');
    expect(block!.code.trim()).toBe('const x = 1;');
  });

  it('returns null when no fenced code block exists', () => {
    expect(pickHeroFence(bodyWithNoFence)).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(pickHeroFence('')).toBeNull();
  });

  it('picks the first fence when multiple are present', () => {
    const body = [
      '```ts title="first.ts"',
      'const a = 1;',
      '```',
      '',
      '```ts title="second.ts"',
      'const b = 2;',
      '```',
    ].join('\n');
    const block = pickHeroFence(body);
    expect(block!.title).toBe('first.ts');
  });
});

describe('ogTitle', () => {
  it('uses the snippet block title when present', () => {
    expect(ogTitle('my-post', { lang: 'ts', title: 'session-timeout.spec.ts', code: '' })).toBe(
      'session-timeout.spec.ts'
    );
  });

  it('falls back to slug.ts when snippet has no title', () => {
    expect(ogTitle('playwright-clock-control', { lang: 'ts', title: '', code: '' })).toBe(
      'playwright-clock-control.ts'
    );
  });

  it('falls back to slug.ts when snippet is null', () => {
    expect(ogTitle('my-post', null)).toBe('my-post.ts');
  });
});
