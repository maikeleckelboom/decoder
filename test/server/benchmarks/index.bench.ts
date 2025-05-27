import { pixelift } from '@/server';
import * as fs from 'node:fs';
import { bench } from 'vitest';

const MIME_TYPE_MAP: Record<string, string> = {
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  heic: 'image/heic',
  bmp: 'image/bmp'
};

const TEST_IMAGE_EXTENSIONS = Object.keys(MIME_TYPE_MAP) as Array<
  keyof typeof MIME_TYPE_MAP
>;

describe('pixelift browser benchmarks', () => {
  const fixtures = TEST_IMAGE_EXTENSIONS.map((ext) => ({
    buffer: fs.readFileSync(`test/fixtures/images/pixelift.${ext}`),
    mime: MIME_TYPE_MAP[ext],
    ext
  }));

  for (const fixture of fixtures) {
    const { ext, buffer } = fixture;
    bench(
      `decode ${ext} image`,
      async () => {
        await pixelift(buffer, { decoder: 'sharp' });
      },
      {
        iterations: 50,
        warmupIterations: 5
      }
    );
  }
});
