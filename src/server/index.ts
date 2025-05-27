import type { PixelData } from '@/types.ts';
import type { ServerInput, ServerOptions } from './types';
import { resolveDecoderForInput } from '@/shared/decoder.ts';

/**
 * Server-side entry point for the Pixelift library.
 *
 * @param {ServerInput} input - The input data to be processed by the Pixelift decoders.
 * @param {ServerOptions?} [options] - Optional configuration settings for the decoding process.
 * @return {Promise<PixelData>} A promise that resolves to the processed pixel data.
 */
export async function decode(
  input: ServerInput,
  options?: ServerOptions
): Promise<PixelData> {
  const decoder = await resolveDecoderForInput(input);
  return decoder.decode(input, options);
}

export type { ServerInput, ServerOptions };
