import type { PixelData } from '@/types';
import { getRegisteredDecoders, registerDecoder } from './registry';

export type PixeliftEnvironment = 'browser' | 'server';

export interface Decoder<
  TSource = unknown,
  TOptions = unknown,
  TResult extends PixelData = PixelData
> {
  name: string;
  priority: number;
  metadata?: Record<string, any>;
  autoRegister?: boolean;
  environment?: PixeliftEnvironment | PixeliftEnvironment[];

  /**
   * Determine if this decoder supports the given input.
   * Input could be MIME type string or raw data.
   */
  canDecode(input: unknown, mime?: string): Promise<boolean> | boolean;

  /** Decode the input */
  decode(source: TSource, options?: TOptions): Promise<TResult>;
}

export function defineDecoder<
  TSource = unknown,
  TOptions = unknown,
  TResult extends PixelData = PixelData
>(decoder: Decoder<TSource, TOptions, TResult>): Decoder<TSource, TOptions, TResult> {
  const { autoRegister = false } = decoder;
  if (autoRegister) registerDecoder(decoder);
  return decoder;
}

export async function resolveDecoderForInput<TSource>(
  input: TSource,
  options?: { mimeType?: string }
): Promise<Decoder<TSource>> {
  const decoders = getRegisteredDecoders() as Decoder<TSource, any, any>[];

  if (decoders.length === 0) {
    throw new Error('Decoder registry is empty — no decoders have been registered.');
  }

  const failures: string[] = [];
  const candidates: Decoder<TSource, any, any>[] = [];

  // Check each decoder for environment support and input support
  for (const decoder of decoders) {
    if (typeof (decoder as any).isEnvSupported === 'function') {
      if (!(decoder as any).isEnvSupported()) {
        failures.push(`[${decoder.name}] environment not supported`);
        continue;
      }
    }

    let canDecodeResult: boolean;
    try {
      const result = decoder.canDecode(input, options?.mimeType);
      canDecodeResult = result instanceof Promise ? await result : result;
    } catch (err) {
      failures.push(
        `[${decoder.name}] threw error during canDecode: ${(err as Error).message}`
      );
      continue;
    }

    if (canDecodeResult) {
      candidates.push(decoder);
    } else {
      failures.push(`[${decoder.name}] cannot decode input`);
    }
  }

  if (candidates.length === 0) {
    throw new Error(
      `No suitable decoder found for input type: ${typeof input}\n` +
        `Failures:\n${failures.join('\n')}`
    );
  }

  candidates.sort((a, b) => b.priority - a.priority);

  return candidates[0] as Decoder<TSource>;
}
