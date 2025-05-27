import type { PixelData } from '@/types.ts';
import type { ServerInput, ServerOptions } from '@/server/types.ts';
import { importSharp, type SharpConstructor } from '@/server/decoder/sharp.ts';
import { Readable } from 'node:stream';
import type sharp from 'sharp';

export class ImageProcessingError extends Error {
  readonly cause?: Error | undefined;

  constructor(message: string, options?: { cause?: Error }) {
    super(message);
    this.name = 'ImageProcessingError';
    this.cause = options?.cause;
    Error.captureStackTrace(this, this.constructor);
  }
}

const isNodeReadable = (input: unknown): input is Readable =>
  input instanceof Readable && typeof (input as Readable).pipe === 'function';

const isWebReadableStream = (input: unknown): input is ReadableStream =>
  typeof ReadableStream !== 'undefined' && input instanceof ReadableStream;

async function webStreamToNodeBuffer(stream: ReadableStream): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      totalLength += value.length;
    }

    return Buffer.concat(chunks, totalLength);
  } finally {
    reader.releaseLock();
  }
}

// Pipeline configuration with type safety
function configurePipeline(pipeline: sharp.Sharp, _options?: ServerOptions): sharp.Sharp {
  return pipeline.ensureAlpha().raw();
}

// Input handling strategies
const inputHandlers: Record<
  string,
  (input: ServerInput, sharp: SharpConstructor) => Promise<sharp.Sharp>
> = {
  buffer: async (input, sharp) => sharp(input as Buffer),
  path: async (input, sharp) => sharp(input as string),
  nodeStream: async (input, sharp) => {
    const pipeline = sharp();
    (input as Readable).pipe(pipeline);
    return pipeline;
  },
  webStream: async (input, sharp) => {
    const buffer = await webStreamToNodeBuffer(input as ReadableStream);
    return sharp(buffer);
  }
};

function determineInputType(input: ServerInput): string | null {
  if (Buffer.isBuffer(input)) return 'buffer';
  if (typeof input === 'string') return 'path';
  if (isNodeReadable(input)) return 'nodeStream';
  if (isWebReadableStream(input)) return 'webStream';
  return null;
}

// Core processing logic with enhanced safety
async function processWithSharp(pipeline: sharp.Sharp): Promise<PixelData> {
  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  if (!info?.width || !info?.height) {
    throw new ImageProcessingError('Invalid image dimensions from Sharp processing');
  }

  if (data.byteLength !== info.width * info.height * 4) {
    throw new ImageProcessingError('Pixel data buffer size mismatch');
  }

  return {
    data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength),
    width: info.width,
    height: info.height
  };
}

// Refactored main decode function
export async function decode(
  input: ServerInput,
  options?: ServerOptions
): Promise<PixelData> {
  const sharp = await importSharp();
  const inputType = determineInputType(input);

  if (!inputType || !inputHandlers[inputType]) {
    throw new ImageProcessingError(`Unsupported input type: ${typeof input}`);
  }

  try {
    const pipeline = configurePipeline(
      await inputHandlers[inputType](input, sharp),
      options
    );

    return await processWithSharp(pipeline);
  } catch (error) {
    throw error instanceof ImageProcessingError
      ? error
      : new ImageProcessingError('Image processing failed', {
          cause: error instanceof Error ? error : new Error(String(error))
        });
  }
}
