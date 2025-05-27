import type { CommonDecoderOptions } from '../types';

export type BrowserInput =
  | string
  | URL
  | Response
  | ReadableStream
  | ArrayBuffer
  | ArrayBufferView
  | SVGElement
  | ImageBitmapSource;

export interface BrowserOptions extends CommonDecoderOptions {
  decoder?: 'offscreen-canvas';
}
