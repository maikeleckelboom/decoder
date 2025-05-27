import type { PixelData } from '@/types';
import type { BrowserInput, BrowserOptions } from '@/browser';

export async function decode(
  input: BrowserInput,
  options: BrowserOptions = {}
): Promise<PixelData> {
  // Placeholder for browser-specific decoding logic

  return {
    data: new Uint8ClampedArray([]),
    width: 0,
    height: 0
  };
}
