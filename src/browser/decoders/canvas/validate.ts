import type { BrowserInput } from '@/browser/types.ts';

export function isBrowserInput(input: unknown): input is BrowserInput {
  return (
    typeof input === 'string' ||
    (typeof ReadableStream !== 'undefined' && input instanceof ReadableStream) ||
    (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView(input)) ||
    (typeof ArrayBuffer !== 'undefined' && input instanceof ArrayBuffer) ||
    (typeof SVGElement !== 'undefined' && input instanceof SVGElement) ||
    (typeof HTMLImageElement !== 'undefined' && input instanceof HTMLImageElement) ||
    (typeof HTMLVideoElement !== 'undefined' && input instanceof HTMLVideoElement) ||
    (typeof HTMLCanvasElement !== 'undefined' && input instanceof HTMLCanvasElement) ||
    (typeof ImageBitmap !== 'undefined' && input instanceof ImageBitmap) ||
    (typeof OffscreenCanvas !== 'undefined' && input instanceof OffscreenCanvas) ||
    (typeof Blob !== 'undefined' && input instanceof Blob) ||
    (typeof ImageData !== 'undefined' && input instanceof ImageData)
  );
}
