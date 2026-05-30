// One-shot favicon rasterizer. Reads public/favicon.svg and writes
// public/favicon-32.png + public/apple-touch-icon.png. Sharp uses fontconfig
// for SVG <text>, so any missing-font fallback is system-default sans —
// acceptable at favicon scale. Re-run after editing the SVG.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const svg = readFileSync(join(root, 'public', 'favicon.svg'));

async function render(size, out) {
  await sharp(svg, { density: Math.round((size / 100) * 96 * 4) })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(join(root, 'public', out));
  console.log(`wrote public/${out} (${size}×${size})`);
}

await render(32, 'favicon-32.png');
await render(180, 'apple-touch-icon.png');
