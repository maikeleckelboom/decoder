import type { CommonDecoderOptions } from '../types';

export type BrowserInput =
  | string
  | Response
  | ReadableStream
  | BufferSource
  | SVGElement
  | ImageBitmapSource;

export interface BrowserOptions extends CommonDecoderOptions {
  decoder?: 'canvas';
}
