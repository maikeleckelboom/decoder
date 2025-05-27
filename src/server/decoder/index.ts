import type { PixelData } from '@/types.ts';
import type { ServerInput, ServerOptions } from '@/server/types.ts';
import { importSharp, type SharpConstructor } from '@/server/decoder/sharp.ts';

export async function decode(
  input: ServerInput,
  options?: ServerOptions
): Promise<PixelData> {
  const sharp: SharpConstructor = await importSharp();

  return {
    data: new Uint8ClampedArray(),
    width: 0,
    height: 0
  };
}
