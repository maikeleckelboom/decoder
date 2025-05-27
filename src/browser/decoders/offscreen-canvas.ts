import type { PixelData } from '@/types';
import { defineDecoder } from '@/shared/decoder';
import type { BrowserInput } from '@/browser';

export type OffscreenCanvasInput = BrowserInput;

export default defineDecoder<OffscreenCanvasInput>({
  name: 'offscreen-canvas',
  priority: 10,

  isEnvSupported() {
    return typeof OffscreenCanvas !== 'undefined' && typeof ImageBitmap !== 'undefined';
  },

  isInputSupported(input): boolean {
    return (
      input instanceof OffscreenCanvas ||
      input instanceof ImageBitmap ||
      input instanceof ImageData ||
      input instanceof HTMLImageElement ||
      input instanceof HTMLVideoElement ||
      input instanceof HTMLCanvasElement ||
      input instanceof SVGElement
    );
  },

  async decode(input): Promise<PixelData> {
    return {
      data: new Uint8ClampedArray(),
      width: 0,
      height: 0
    };
  }
});
