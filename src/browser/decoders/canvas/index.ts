import type { PixelData } from '@/types.ts';
import type { BrowserInput, BrowserOptions } from '@/browser';
import { defineDecoder } from '@/shared/decoder.ts';
import { isBrowserInput } from '@/browser/decoders/canvas/validate.ts';

export default defineDecoder<BrowserInput, BrowserOptions>({
  name: 'offscreen-canvas',
  environment: 'browser',
  priority: 50,
  autoRegister: true,
  canDecode(input) {
    return isBrowserInput(input);
  },
  async decode(input, options): Promise<PixelData> {
    console.log('Using OffscreenCanvas decoder 🤤', { input, options });
    return {
      data: new Uint8ClampedArray(),
      width: 0,
      height: 0
    };
  }
});
