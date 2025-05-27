export enum ErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  DECODE_FAILED = 'DECODE_FAILED',
  MEMORY_EXHAUSTED = 'MEMORY_EXHAUSTED',
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT'
}

export class PixeliftError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public recoverable: boolean = false,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PixeliftError';
  }
}

export const createError = {
  invalidInput: (message: string, context?: Record<string, unknown>): PixeliftError => {
    return new PixeliftError(ErrorCode.INVALID_INPUT, message, true, context);
  },

  decodeFailed: (message: string, context?: Record<string, unknown>): PixeliftError => {
    return new PixeliftError(ErrorCode.DECODE_FAILED, message, false, context);
  },

  memoryExhausted: (message: string, context?: Record<string, unknown>): PixeliftError => {
    return new PixeliftError(ErrorCode.MEMORY_EXHAUSTED, message, false, context);
  },

  timeout: (message: string): PixeliftError => {
    return new PixeliftError(ErrorCode.TIMEOUT, message, false);
  },

  networkError: (message: string, context?: Record<string, unknown>): PixeliftError => {
    return new PixeliftError(ErrorCode.NETWORK_ERROR, message, true, context);
  },

  unsupportedFormat: (
    message: string,
    context?: Record<string, unknown>
  ): PixeliftError => {
    return new PixeliftError(ErrorCode.UNSUPPORTED_FORMAT, message, false, context);
  }
} as const;
