export function isBufferSource(input: any): input is BufferSource {
  return input instanceof ArrayBuffer || ArrayBuffer.isView(input);
}

export function isSVGElement(input: any): input is SVGElement {
  return input instanceof SVGElement;
}

export function isReadableStream(input: any): input is ReadableStream {
  return input instanceof ReadableStream;
}

export function isImageBitmapSource(input: any): input is ImageBitmapSource {
  return (
    input instanceof HTMLImageElement ||
    input instanceof HTMLVideoElement ||
    input instanceof HTMLCanvasElement ||
    input instanceof ImageBitmap ||
    input instanceof OffscreenCanvas ||
    input instanceof VideoFrame ||
    (typeof ImageData !== 'undefined' && input instanceof ImageData) ||
    (typeof createImageBitmap === 'function' && input instanceof Blob)
  );
}
