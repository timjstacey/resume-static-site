import { describe, it, expect } from 'vitest';
import { isExternalUrl } from './links';

describe('isExternalUrl', () => {
  it.each([
    'https://github.com/timjstacey',
    'http://example.com',
    'https://x.com/intent/tweet?text=hi',
    'HTTPS://EXAMPLE.COM',
    '  https://example.com  ',
  ])('treats absolute http(s) URLs as external: %s', (href) => {
    expect(isExternalUrl(href)).toBe(true);
  });

  it.each(['/blog', '/', '/blog/some-post', '#section', './rel', '../up', 'rel/path'])(
    'treats internal/relative links as internal: %s',
    (href) => {
      expect(isExternalUrl(href)).toBe(false);
    }
  );

  it.each(['mailto:a@b.com', 'tel:+15551234', 'ftp://files.example.com'])(
    'treats non-http schemes as internal (no new tab): %s',
    (href) => {
      expect(isExternalUrl(href)).toBe(false);
    }
  );

  it.each([undefined, null, '', '   '])('treats nullish/blank as internal: %p', (href) => {
    expect(isExternalUrl(href as string | undefined | null)).toBe(false);
  });
});
