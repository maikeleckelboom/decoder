import type * as SharpModule from 'sharp';

export type SharpConstructor = typeof SharpModule.default;

const SHARP_IS_MISSING_ERROR_MESSAGE = `
❌ Failed to load the required \`sharp\` package for server-side image processing.

💡 To fix this, install \`sharp\` with one of the following commands:
   - \`npm install sharp\`
   - \`pnpm add sharp\`
   - \`yarn add sharp\`
   - \`bun add sharp\`

⚠️ Pixelift server features depend on \`sharp\`.
   It looks like it was not installed or could not be found.
   This may happen if it was skipped during Pixelift installation (it's optional).

📝 Additional troubleshooting:
   - Ensure Node.js version matches sharp's requirements (v18+ recommended)
   - Verify build tools for native extensions are installed
   - Check for conflicting dependencies in your package.json
`.trim();

const GENERIC_IMPORT_ERROR_MESSAGE = (error: string) =>
  `
❌ Unexpected error while loading \`sharp\` module:

${error}

💡 Please check:
   1. File system permissions
   2. Network connectivity if using corporate VPN
   3. Antivirus/firewall settings blocking module installation
   4. Disk space availability
`.trim();

export class SharpLoaderError extends Error {
  readonly cause?: Error;

  constructor(message: string, options: ErrorOptions = {}) {
    super(message, options);
    this.name = 'SharpLoaderError';
    if (options.cause instanceof Error) {
      this.cause = options.cause;
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SharpLoaderError);
    }
  }
}

let sharpPromise: Promise<SharpConstructor> | null = null;

/**
 * Dynamically imports and validates the `sharp` module with proper error handling
 * and caching mechanism. Retries failed imports on subsequent calls.
 *
 * @throws {SharpLoaderError} When sharp cannot be loaded, with actionable error messages
 *
 * @example
 * try {
 *   const sharp = await importSharp();
 * } catch (error) {
 *   if (SharpLoaderError.isMissingError(error)) {
 *     // Show installation instructions
 *   }
 * }
 */
export async function importSharp(): Promise<SharpConstructor> {
  if (sharpPromise) return sharpPromise;

  sharpPromise = (async () => {
    try {
      const sharpModule = await import('sharp');

      return sharpModule.default as SharpConstructor;
    } catch (error: unknown) {
      sharpPromise = null;

      if (isModuleNotFoundError(error)) {
        throw new SharpLoaderError(SHARP_IS_MISSING_ERROR_MESSAGE, {
          cause: error instanceof Error ? error : undefined
        });
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new SharpLoaderError(GENERIC_IMPORT_ERROR_MESSAGE(errorMessage), {
        cause: error instanceof Error ? error : undefined
      });
    }
  })();

  sharpPromise.catch(() => {
    sharpPromise = null;
  });

  return sharpPromise;
}

function isModuleNotFoundError(error: unknown): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    error.code === 'MODULE_NOT_FOUND' &&
    error.message.includes('sharp')
  );
}
