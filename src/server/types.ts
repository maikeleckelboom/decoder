import type { Readable } from 'node:stream';
import type { SharpInput } from 'sharp';
import type { CommonDecoderOptions } from '@/types';

export type ServerInput = URL | SharpInput | Readable | ReadableStream;

export interface ServerOptions extends CommonDecoderOptions {
  decoder?: 'sharp';
}
