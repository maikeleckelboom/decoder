import type { PixelData } from '@/types';
import { isResponse, isValidUrl } from '@/shared/guard';
import { controlledFetch } from '@/browser/utils/fetch.ts';
import type { BrowserInput, BrowserOptions } from '@/browser';
import {
  CANVAS_RENDERING_CONTEXT_2D_DEFAULTS,
  CREATE_IMAGE_BITMAP_DEFAULTS,
  GET_IMAGE_DATA_DEFAULTS
} from '@/browser/decoder/defaults';
import {
  isBufferSource,
  isImageBitmapSource,
  isReadableStream,
  isSVGElement
} from '@/browser/utils/validate.ts';

function bufferSourceToArrayBuffer(bufferSource: BufferSource): ArrayBuffer {
  if (bufferSource instanceof ArrayBuffer) return bufferSource;
  return bufferSource.buffer.slice(
    bufferSource.byteOffset,
    bufferSource.byteOffset + bufferSource.byteLength
  ) as ArrayBuffer;
}

async function streamToArrayBuffer(
  stream: ReadableStream,
  onProgress?: (loaded: number) => void
): Promise<ArrayBuffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      totalLength += value.length;
      if (onProgress) onProgress(totalLength);
    }
  } finally {
    reader.releaseLock();
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result.buffer;
}

async function svgToArrayBuffer(svg: SVGElement): Promise<ArrayBuffer> {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });

  const img = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  return new Promise((resolve, reject) => {
    img.onload = () => {
      canvas.width = img.naturalWidth || 300;
      canvas.height = img.naturalHeight || 150;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          blob.arrayBuffer().then(resolve).catch(reject);
        } else {
          reject(new Error('Failed to convert SVG to blob'));
        }
      }, 'image/png');
    };

    img.onerror = () => reject(new Error('Failed to load SVG'));
    img.src = URL.createObjectURL(svgBlob);
  });
}

async function decodeImageBitmapSource(source: ImageBitmapSource): Promise<PixelData> {
  const img = await createImageBitmap(source, CREATE_IMAGE_BITMAP_DEFAULTS);

  const offscreenCanvas = new OffscreenCanvas(img.width, img.height);
  const context = offscreenCanvas.getContext('2d', CANVAS_RENDERING_CONTEXT_2D_DEFAULTS);

  if (!context) throw new Error('Failed to get 2D context');

  context.drawImage(img, 0, 0);

  const imageData = context.getImageData(
    0,
    0,
    offscreenCanvas.width,
    offscreenCanvas.height,
    GET_IMAGE_DATA_DEFAULTS
  );

  img.close();

  return {
    data: imageData.data,
    width: imageData.width,
    height: imageData.height
  };
}

export async function decode(
  input: BrowserInput,
  options: BrowserOptions = {}
): Promise<PixelData> {
  try {
    let arrayBuffer: ArrayBuffer;

    if (typeof input === 'string') {
      const response = await controlledFetch(input, options);
      arrayBuffer = await response.arrayBuffer();
    } else if (isResponse(input)) {
      arrayBuffer = await input.arrayBuffer();
    } else if (isReadableStream(input)) {
      arrayBuffer = await streamToArrayBuffer(input);
    } else if (isBufferSource(input)) {
      arrayBuffer = input instanceof ArrayBuffer ? input : bufferSourceToArrayBuffer(input);
    } else if (isSVGElement(input)) {
      arrayBuffer = await svgToArrayBuffer(input);
    } else if (isImageBitmapSource(input)) {
      return await decodeImageBitmapSource(input);
    } else {
      throw new TypeError(
        `Unsupported input type: ${typeof input}. Expected string, Response, ReadableStream, BufferSource, SVGElement, or ImageBitmapSource.`
      );
    }

    const blob = new Blob([arrayBuffer]);
    return await decodeImageBitmapSource(blob);
  } catch (error) {
    throw new Error(
      `Decode failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
