import type * as SharpModule from 'sharp';

// Augment Sharp type to optionally support __esModule interop
declare module 'sharp' {
  interface Sharp {
    __esModule?: boolean;
  }
}

export type SharpConstructor = typeof SharpModule.default;

// Developer-friendly error message for missing Sharp installation
const SHARP_IS_MISSING_ERROR_MESSAGE = [
  '❌ Failed to load the required `sharp` package for server-side image processing.',
  '',
  '💡 To fix this, install `sharp` with one of the following commands:',
  '   - `npm install sharp`',
  '   - `pnpm add sharp`',
  '   - `yarn add sharp`',
  '   - `bun add sharp`',
  '',
  '⚠️ Pixelift server features depend on `sharp`.',
  '   It looks like it was not installed or could not be found.',
  '   This may happen if it was skipped during Pixelift installation (it’s optional).'
] as const;

class SharpLoaderError extends Error {
  static readonly MISSING_MESSAGE = SHARP_IS_MISSING_ERROR_MESSAGE.join('\n');

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'SharpLoaderError';
  }
}

let sharpPromise: Promise<SharpConstructor> | null = null;

/**
 * Dynamically imports the `sharp` module and ensures it's a valid constructor.
 * Caches the result to avoid repeated imports.
 */
export async function importSharp(): Promise<SharpConstructor> {
  if (sharpPromise) return sharpPromise;

  sharpPromise = new Promise(async (resolve, reject) => {
    try {
      const sharpModule = await import('sharp');

      // Handle possible interop format
      const sharpExport =
        sharpModule.default?.constructor === Function
          ? (sharpModule as typeof SharpModule).default
          : (sharpModule as typeof SharpModule);

      if (typeof sharpExport !== 'function') {
        throw new SharpLoaderError(
          'Invalid `sharp` export — expected constructor function.\n' +
            'Check your Sharp installation and module resolution.'
        );
      }

      resolve(sharpExport as SharpConstructor);
    } catch (error) {
      sharpPromise = null;

      if (error instanceof SharpLoaderError) {
        reject(error);
        return;
      }

      if (
        error instanceof Error &&
        'code' in error &&
        (error as any).code === 'MODULE_NOT_FOUND'
      ) {
        reject(new SharpLoaderError(SharpLoaderError.MISSING_MESSAGE, { cause: error }));
        return;
      }

      const message = error instanceof Error ? error.message : String(error);
      reject(
        new SharpLoaderError(`Sharp initialization failed: ${message}`, { cause: error })
      );
    }
  });

  return sharpPromise;
}
