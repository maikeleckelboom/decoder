import type { BrowserInput } from '@/browser/types.ts';

export function isBrowserInput(input: unknown): input is BrowserInput {
  return (
    typeof input === 'string' ||
    (typeof Response !== 'undefined' && input instanceof Response) ||
    (typeof ReadableStream !== 'undefined' && input instanceof ReadableStream) ||
    ArrayBuffer.isView(input) ||
    input instanceof ArrayBuffer ||
    (typeof SVGElement !== 'undefined' && input instanceof SVGElement) ||
    (typeof ImageBitmap !== 'undefined' && input instanceof ImageBitmap) ||
    (typeof HTMLImageElement !== 'undefined' && input instanceof HTMLImageElement) ||
    (typeof HTMLCanvasElement !== 'undefined' && input instanceof HTMLCanvasElement) ||
    (typeof OffscreenCanvas !== 'undefined' && input instanceof OffscreenCanvas) ||
    (typeof VideoFrame !== 'undefined' && input instanceof VideoFrame)
  );
}
