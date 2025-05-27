import type { PixelData } from '@/types';
import type { BrowserInput, BrowserOptions } from '@/browser';
import { defineDecoder } from '@/shared/decoder';
import { isBrowserInput } from '@/browser/decoders/guard.ts';

export default defineDecoder<BrowserInput>({
  name: 'offscreen-canvas',
  env: 'browser',
  priority: 50,
  autoRegister: true,
  canDecode(input) {
    return isBrowserInput(input);
  },
  async decode(input: BrowserInput, options?: BrowserOptions): Promise<PixelData> {
    console.log('Using OffscreenCanvas decoder 🤤');
    return {
      data: new Uint8ClampedArray(),
      width: 0,
      height: 0
    };
  }
});
