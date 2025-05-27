import type { PixelData, PixeliftInput, PixeliftOptions } from './types';

async function resolveDecoder(input: PixeliftInput, options?: PixeliftOptions) {
  return {
    decode: async (input: PixeliftInput, options?: PixeliftOptions): Promise<PixelData> => {
      // Placeholder for actual decoding logic
      return {
        data: new Uint8ClampedArray(),
        width: 0,
        height: 0
      };
    }
  };
}

export async function pixelift(
  input: PixeliftInput,
  options?: PixeliftOptions
): Promise<PixelData> {
  const decoder = await resolveDecoder(input, options);
  return decoder.decode(input, options);
}
