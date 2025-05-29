import type { Decoder } from '@/shared/decoder';
import { resolveDecoderForInput } from '@/shared/decoder';
import type { PixelData } from '@/types.ts';

interface ProgressInfo {
  loaded: number;
  total: number;
  percent: number | null;
}

export interface FetchAndDecodeOptions {
  decoder?: Decoder<Blob, any, PixelData>;
  onProgress?: (info: ProgressInfo) => void;
  signal?: AbortSignal;
}

export async function fetchStreamAndDecode(
  url: string,
  options: FetchAndDecodeOptions = {}
): Promise<PixelData> {
  const { decoder: overrideDecoder, onProgress, signal } = options;

  const response = await fetch(url, signal ? { signal } : {});
  if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);
  if (!response.body) throw new Error('ReadableStream not supported in response');

  const mimeType = response.headers.get('content-type') ?? undefined;
  const contentLength = parseInt(response.headers.get('content-length') ?? '0', 10);

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      loaded += value.byteLength;
      if (onProgress) {
        onProgress({
          loaded,
          total: contentLength,
          percent: contentLength ? (loaded / contentLength) * 100 : null
        });
      }
    }
  }

  const blob = new Blob(chunks);

  // Resolve decoder for Blob input and MIME type
  const decoder =
    overrideDecoder ??
    (await resolveDecoderForInput(blob, mimeType ? { mimeType } : undefined));

  // Decode and return PixelData
  return decoder.decode(
    blob,
    mimeType ? { type: mimeType, decoder: decoder.name } : undefined
  );
}
