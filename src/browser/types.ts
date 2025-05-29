import type { CommonDecoderOptions } from '../types';

export type BrowserInput =
  | string
  | ReadableStream
  | BufferSource
  | SVGElement
  | ImageBitmapSource;

export interface BrowserOptions extends CommonDecoderOptions {
  decoder?: string;
}
