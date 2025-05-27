import type { PixelData, PixeliftInput, PixeliftOptions } from './types';
import { __autoDecode } from '@/__auto-decode.ts';

export async function pixelift(
  input: PixeliftInput,
  options?: PixeliftOptions
): Promise<PixelData> {
  return __autoDecode(input, options);
}
