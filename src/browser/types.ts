import type { CommonDecoderOptions } from '../types';
import type { FetchWithControlsOptions } from '@/browser/utils/fetch.ts';

export type BrowserInput =
  | string
  | Response
  | ReadableStream
  | BufferSource
  | SVGElement
  | ImageBitmapSource;

export interface BrowserOptions extends CommonDecoderOptions, FetchWithControlsOptions {
  decoder?: 'canvas';
}
