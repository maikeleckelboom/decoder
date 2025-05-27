import type { PixelData, PixeliftInput, PixeliftOptions } from './types';
import { resolveDecoderForInput } from '@/shared/decoder.ts';

export async function pixelift(
  input: PixeliftInput,
  options?: PixeliftOptions
): Promise<PixelData> {
  const decoder = await resolveDecoderForInput(input, options);
  return decoder.decode(input, options);
}
