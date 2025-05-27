import { bench, describe } from 'vitest';
import { pixelift } from '@/browser';

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
    url: new URL(`../../fixtures/images/pixelift.${ext}`, import.meta.url).href,
    mime: MIME_TYPE_MAP[ext],
    ext
  }));

  for (const fixture of fixtures) {
    const { ext, url } = fixture;
    bench(
      `decode ${ext} image`,
      async () => {
        await pixelift(url, { decoder: 'canvas' });
      },
      {
        iterations: 50,
        warmupIterations: 5
      }
    );
  }
});
