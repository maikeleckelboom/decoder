import type { PixelData, PixeliftInput, PixeliftOptions } from '@/types.ts';
import { isBrowser } from '@/shared/env.ts';
import type { BrowserInput, BrowserOptions } from '@/browser';
import type { ServerInput, ServerOptions } from '@/server';

/**
 * @internal
 */
export async function __autoDecode(
  input: PixeliftInput,
  options?: PixeliftOptions
): Promise<PixelData> {
  if (isBrowser()) {
    const { decode } = await import('./browser/decoder');
    return decode(input as BrowserInput, options as BrowserOptions);
  } else {
    const { decode } = await import('./server/decoder');
    return decode(input as ServerInput, options as ServerOptions);
  }
}
