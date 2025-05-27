import type { PixelData } from '@/types';
import { getRegisteredDecoders, registerDecoder } from './registry';

export interface Decoder<TSource = unknown, TOptions = unknown, TResult = PixelData> {
  name: string;
  priority: number;
  metadata?: Record<string, any>;
  autoRegister?: boolean;

  /** Checks if current environment supports this decoder */
  isEnvSupported?(): boolean;

  /**
   * Determine if this decoder supports the given input.
   * Input could be MIME type string or raw data.
   */
  isInputSupported(input: TSource): Promise<boolean> | boolean;

  /** Decode the input */
  decode(source: TSource, options?: TOptions): Promise<TResult>;
}

export function defineDecoder<
  TSource = unknown,
  TOptions = unknown,
  TResult extends PixelData = PixelData
>(decoder: Decoder<TSource, TOptions, TResult>): Decoder<TSource, TOptions, TResult> {
  const { autoRegister = true } = decoder;
  if (autoRegister) registerDecoder(decoder);
  return decoder;
}

/**
 * Attempts to resolve a decoder for the given input or optional type string.
 * Returns the highest-priority decoder that supports the input and current environment.
 *
 * @throws If no suitable decoder is found.
 * @param input
 */
export async function resolveDecoderForInput<TSource>(
  input: TSource
): Promise<Decoder<TSource>> {
  const decoders = getRegisteredDecoders();

  if (decoders.length === 0) {
    throw new Error('Decoder registry is empty — no decoders have been registered.');
  }

  const failures: string[] = [];

  for (const decoder of decoders) {
    if (decoder.isEnvSupported && !decoder.isEnvSupported()) {
      failures.push(`[${decoder.name}]: environment unsupported`);
      continue;
    }

    try {
      const supported = await (decoder as Decoder<TSource>).isInputSupported(input);
      if (supported) return decoder as Decoder<TSource>;
      failures.push(`[${decoder.name}]: input not supported`);
    } catch (err) {
      failures.push(
        `[${decoder.name}]: error in isInputSupported - ${(err as Error).message}`
      );
    }
  }

  throw new Error(
    `No suitable decoder found for input: ${typeof input}\n` +
      `Failed decoders:\n${failures.join('\n')}`
  );
}
