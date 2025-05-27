import type { PixelData } from '@/types.ts';
import type { ServerInput, ServerOptions } from '@/server/types.ts';
import { importSharp, type SharpConstructor } from '@/server/decoders/sharp.ts';
import type { SharpInput } from 'sharp';

export async function decode(
  input: SharpInput,
  options: ServerOptions = { decoder: 'sharp' }
): Promise<PixelData> {
  const sharp: SharpConstructor = await importSharp();

  const instance = sharp(input);
  const metadata = await instance.metadata();

  return {
    data: new Uint8ClampedArray(),
    width: 0,
    height: 0
  };
}
