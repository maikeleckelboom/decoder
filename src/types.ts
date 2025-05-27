import type { BrowserInput, BrowserOptions } from '@/browser/types';
import type { ServerInput, ServerOptions } from '@/server/types';

export interface PixelData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export interface CommonDecoderOptions {
  type?: string;
  decoder?: string;
}

export type PixeliftInput = BrowserInput | ServerInput;

export type PixeliftOptions = BrowserOptions | ServerOptions;
