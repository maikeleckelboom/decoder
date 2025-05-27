import type { PixelData } from '@/types.ts';
import type { ServerInput, ServerOptions } from '@/server/types.ts';
import { importSharp, type SharpConstructor } from '@/server/decoders/sharp-loader.ts';

export async function decode(
  input: ServerInput,
  options: ServerOptions = { decoder: 'sharp' }
): Promise<PixelData> {
  const sharp: SharpConstructor = await importSharp();

  return {
    data: new Uint8ClampedArray(),
    width: 0,
    height: 0
  };
}
