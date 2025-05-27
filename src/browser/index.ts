import type { PixelData } from '@/types';
import { resolveDecoderForInput } from '@/shared/decoder';
import type { BrowserInput, BrowserOptions } from '@/browser/types.ts';

/**
 * Server-side entry point for the Pixelift library.
 *
 * @param {BrowserInput} input - The input data to be processed by the Pixelift decoders.
 * @param {BrowserOptions?} [options] - Optional configuration settings for the decoding process.
 * @return {Promise<PixelData>} A promise that resolves to the processed pixel data.
 */
export async function decode(
  input: BrowserInput,
  options?: BrowserOptions
): Promise<PixelData> {
  const decoder = await resolveDecoderForInput(input);
  return decoder.decode(input, options);
}

export type { BrowserInput, BrowserOptions } from './types';
