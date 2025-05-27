import type { PixelData } from '@/types';
import type { BrowserInput, BrowserOptions } from '@/browser';

export async function decode(
  input: BrowserInput,
  options: BrowserOptions = {}
): Promise<PixelData> {
  return {
    data: new Uint8ClampedArray([]),
    width: 0,
    height: 0
  };
}
