import { beforeAll, describe, expect, it } from 'vitest';
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

interface TestFixture {
  url: string;
  mime: string;
  ext: string;
}

describe('Browser Decoder', () => {
  let fixtures: TestFixture[];

  beforeAll(() => {
    fixtures = TEST_IMAGE_EXTENSIONS.map((ext) => {
      return {
        url: new URL(`../fixtures/images/pixelift.${ext}`, import.meta.url).href,
        mime: MIME_TYPE_MAP[ext],
        ext
      } as TestFixture;
    });
  });

  it.each(TEST_IMAGE_EXTENSIONS)(
    'should decode %s images',
    async (ext) => {
      const fixture = fixtures.find((f) => f.ext === ext)!;
      const result = await pixelift(fixture.url);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Uint8ClampedArray);
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    },
    0
  );

  // test as readable streams
  it.each(TEST_IMAGE_EXTENSIONS)(
    'should decode %s images as readable streams',
    async (ext) => {
      const fixture = fixtures.find((f) => f.ext === ext)!;
      const response = await fetch(fixture.url);
      const stream = response.body;

      if (!stream) {
        throw new Error(`Failed to fetch ${fixture.url}`);
      }

      const result = await pixelift(stream);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Uint8ClampedArray);
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    },
    0
  );
}, 0);
