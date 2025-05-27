import type { BrowserInput, BrowserOptions } from '@/browser';
import type { PixelData } from '@/types.ts';

export async function decode(
  input: BrowserInput,
  options?: BrowserOptions
): Promise<PixelData> {
  const { default: decoder } = await import('./offscreen-canvas');
  return decoder.decode(input, options);
}
