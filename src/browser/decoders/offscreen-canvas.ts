import { defineDecoder } from '@/shared/decoder';
import type { BrowserInput, BrowserOptions } from '@/browser';

export default defineDecoder<BrowserInput>({
  name: 'offscreen-canvas',

  priority: 10,

  isEnvSupported() {
    return typeof OffscreenCanvas !== 'undefined' && typeof ImageBitmap !== 'undefined';
  },

  isTypeSupported(type: string): boolean {
    return type.startsWith('image/') || type === 'image/svg+xml';
  },

  async decode(input: BrowserInput, options: BrowserOptions) {
    return {
      data: new Uint8ClampedArray(),
      width: 0,
      height: 0
    };
  }
});
