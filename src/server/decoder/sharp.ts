import SharpInstance from 'sharp';

export type SharpConstructor = typeof SharpInstance;

let sharpPromise: Promise<SharpConstructor> | null = null;

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

export async function importSharp(): Promise<SharpConstructor> {
  sharpPromise ??= import('sharp')
    .then((sharpModule) => {
      const sharpFunction = (sharpModule as any).default ?? sharpModule;
      if (typeof sharpFunction !== 'function') {
        throw new Error(
          'Sharp module loaded, but its main export is not a function.\n' +
            'Check your Sharp installation and CJS/ESM interop.'
        );
      }
      return sharpFunction as SharpConstructor;
    })
    .catch((importError) => {
      sharpPromise = null;
      throw new Error(SHARP_IS_MISSING_ERROR_MESSAGE.join('\n'), { cause: importError });
    });
  return sharpPromise;
}
