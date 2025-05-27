import { FetchAbortedError, HttpError } from '@/shared/error.ts';
import { throwIfAborted } from '@/shared/abort.ts';
import { isValidUrl } from '@/shared/guard.ts';

/**
 * Information about the download progress.
 */
export interface ProgressInfo {
  /** Bytes loaded so far. */
  loaded: number;
  /** Total bytes to load (if known, otherwise 0). */
  total: number;
  /** Percentage of download completion (0-100), or null if total is unknown. */
  percent: number | null;
}

/**
 * Options for `fetchWithControls`.
 */
export interface FetchWithControlsOptions extends RequestInit {
  /**
   * Callback to be invoked with progress updates.
   * Note: Errors in this callback will abort the entire fetch operation.
   */
  onProgress?: (info: ProgressInfo) => void;
  /**
   * Maximum time (ms) between progress updates (default: 100ms)
   */
  progressInterval?: number;
  /**
   * Maximum allowed buffer size in bytes before aborting (default: 10MB)
   */
  maxBufferSize?: number;
}

const DEFAULT_HEADERS: HeadersInit = {
  Accept: '*/*'
};

const DEFAULT_FETCH_OPTIONS: Omit<RequestInit, 'headers' | 'signal' | 'body' | 'method'> =
  {};
const DEFAULT_PROGRESS_INTERVAL = 100; // ms
const DEFAULT_MAX_BUFFER_SIZE = 10 * 1024 * 1024; // 10MB

async function fetchWithErrorHandling(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(input, init);
  if (!response.ok) throw new HttpError(response);
  return response;
}

async function manageProgressProcessing(
  progressStreamReader: ReadableStreamDefaultReader<Uint8Array>,
  totalBytes: number,
  signal: AbortSignal,
  onProgress: (info: ProgressInfo) => void,
  controller: ReadableStreamDefaultController<Uint8Array>,
  progressInterval: number
): Promise<void> {
  let loadedBytes = 0;
  let lastUpdate = 0;

  try {
    while (true) {
      throwIfAborted(signal);
      const { done, value } = await progressStreamReader.read();

      if (done) {
        handleFinalProgress(totalBytes, loadedBytes, onProgress);
        break;
      }

      loadedBytes += value.byteLength;
      const now = Date.now();

      if (now - lastUpdate >= progressInterval || loadedBytes === totalBytes) {
        reportProgress(loadedBytes, totalBytes, onProgress);
        lastUpdate = now;
      }
    }
  } catch (error) {
    if (!signal.aborted && controller.desiredSize !== null) {
      controller.error(error);
    }
    throw error;
  } finally {
    progressStreamReader.releaseLock();
  }
}

function handleFinalProgress(
  totalBytes: number,
  loadedBytes: number,
  onProgress: (info: ProgressInfo) => void
) {
  const finalTotal = totalBytes > 0 ? Math.max(totalBytes, loadedBytes) : loadedBytes;
  const percent = totalBytes > 0 ? 100 : null;

  onProgress({
    loaded: finalTotal,
    total: finalTotal,
    percent
  });
}

function reportProgress(
  loaded: number,
  total: number,
  onProgress: (info: ProgressInfo) => void
) {
  onProgress({
    loaded,
    total,
    percent: total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : null
  });
}

export async function fetchWithControls(
  input: RequestInfo | URL,
  options: FetchWithControlsOptions = {}
): Promise<Response> {
  const {
    onProgress,
    signal: providedSignal,
    progressInterval = DEFAULT_PROGRESS_INTERVAL,
    maxBufferSize = DEFAULT_MAX_BUFFER_SIZE,
    ...fetchOpts
  } = options;

  const abortController = providedSignal ? undefined : new AbortController();
  const signal = providedSignal ?? abortController!.signal;
  throwIfAborted(signal);

  if (typeof input === 'string' && !isValidUrl(input)) {
    const error = new TypeError(`Invalid URL: ${input}`);
    abortController?.abort(error);
    throw error;
  }

  const headers = new Headers({ ...DEFAULT_HEADERS, ...fetchOpts.headers });
  const fetchOptions: RequestInit = {
    ...DEFAULT_FETCH_OPTIONS,
    ...fetchOpts,
    headers,
    signal
  };

  try {
    const response = await fetchWithErrorHandling(input, fetchOptions);

    if (!onProgress || !response.body) return response;

    const totalBytes = parseContentLength(response.headers);
    const [progressStream, bodyStream] = response.body.tee();

    let bodyReader: ReadableStreamDefaultReader<Uint8Array>;
    let bufferSize = 0;

    const managedStream = new ReadableStream<Uint8Array>({
      start(controller) {
        bodyReader = bodyStream.getReader();

        manageProgressProcessing(
          progressStream.getReader(),
          totalBytes,
          signal,
          onProgress,
          controller,
          progressInterval
        ).catch(() => {
          /* Handled in error propagation */
        });
      },

      async pull(controller) {
        try {
          const { done, value } = await bodyReader.read();

          if (done) {
            controller.close();
            return;
          }

          bufferSize += value.byteLength;
          if (bufferSize > maxBufferSize) {
            throw new Error(`Buffer size exceeded ${maxBufferSize} bytes`);
          }

          controller.enqueue(value);
          bufferSize -= value.byteLength; // Reset after enqueue
        } catch (error) {
          controller.error(error);
          abortController?.abort(error);
        }
      },

      async cancel(reason) {
        await Promise.allSettled([
          bodyReader?.cancel(reason),
          progressStream.cancel(reason),
          bodyStream.cancel(reason)
        ]);
        abortController?.abort(reason);
      }
    });

    return new Response(managedStream, response);
  } catch (error) {
    handleFetchError(error, abortController, signal);
  }
}

function parseContentLength(headers: Headers): number {
  const contentLength = headers.get('content-length');
  if (!contentLength) return 0;

  const parsed = parseInt(contentLength, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0;
}

function handleFetchError(
  error: unknown,
  abortController?: AbortController,
  signal?: AbortSignal
): never {
  if (error instanceof DOMException && error.name === 'AbortError') {
    throw new FetchAbortedError(error.message, { cause: error });
  }

  if (abortController && !signal?.aborted) {
    abortController.abort(error instanceof Error ? error : new Error(String(error)));
  }

  throw error;
}
