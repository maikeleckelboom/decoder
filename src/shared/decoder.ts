import type { PixelData } from '@/types';

export interface Decoder<TSource = unknown, TResult = PixelData, TOptions = unknown> {
  name: string;
  priority: number;
  metadata?: Record<string, any>;
  isEnvSupported?(): boolean;
  isTypeSupported(type: TSource): Promise<boolean> | boolean;

  decode(source: TSource, options: TOptions): Promise<TResult>;
}

export function defineDecoder<
  TSource,
  TResult extends PixelData = PixelData,
  TOptions = unknown
>(decoder: Decoder<TSource, TResult, TOptions>): Decoder<TSource, TResult, TOptions> {
  return decoder;
}
