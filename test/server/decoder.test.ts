import { beforeAll, describe, expect, it } from 'vitest';
import { pixelift } from '@/server';
import * as fs from 'node:fs';

const TEST_IMAGE_EXTENSIONS = [
  'avif',
  'gif',
  'heic',
  'jpeg',
  'jpg',
  'png',
  'webp'
] as const;

const MIME_TYPE_MAP: Record<string, string> = {
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  heic: 'image/heic'
};

interface TestFixture {
  buffer: Buffer;
  mime: string;
  ext: string;
}

describe('Server Decoder', () => {
  let fixtures: TestFixture[];

  beforeAll(() => {
    fixtures = TEST_IMAGE_EXTENSIONS.map(
      (ext) =>
        ({
          buffer: fs.readFileSync(`test/fixtures/images/pixelift.${ext}`),
          mime: MIME_TYPE_MAP[ext],
          ext
        }) as TestFixture
    );
  });

  it('should export pixelift function', async () => {
    expect(typeof pixelift).toBe('function');
  });

  it.each(TEST_IMAGE_EXTENSIONS)('should decode %s images', async (ext) => {
    const fixture = fixtures.find((f) => f.ext === ext);
    expect(fixture).toBeDefined();

    if (!fixture) {
      throw new Error(`No fixture found for extension: ${ext}`);
    }

    const result = await pixelift(fixture.buffer, { decoder: 'sharp' });
    expect(result).toBeDefined();
    expect(result.data).toBeInstanceOf(Uint8ClampedArray);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });
});
