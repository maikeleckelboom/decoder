import type { Decoder } from '@/shared/decoder';
import { getCurrentEnvironment } from '@/shared/env.ts';

export const MIN_PRIORITY = 0 as const;
export const MAX_PRIORITY = 1000 as const;

let locked = false;
let freezeOnRegister = false;

const decoders: Decoder[] = [];

/**
 * Registers a decoder with validation and ordered insertion.
 * Throws if the registry is locked or the decoder is invalid.
 */
export function registerDecoder<D extends Decoder>(decoder: D): Readonly<D> {
  if (locked) {
    throw new Error(
      `Decoder registry is locked. Cannot register '${decoder?.name ?? 'unknown'}'.`
    );
  }

  if (!decoder || typeof decoder !== 'object') {
    throw new TypeError(`Invalid decoder: expected object, got ${typeof decoder}`);
  }

  const { name, priority, decode, canDecode } = decoder;
  const normalizedName = name?.trim().toLowerCase();

  if (!name || name.trim() === '') {
    throw new TypeError(`Decoder must have a non-empty string 'name' property`);
  }

  if (!Number.isFinite(priority)) {
    throw new TypeError(
      `Decoder '${name}' requires finite number priority, got ${String(priority)}`
    );
  }
  if (priority < MIN_PRIORITY || priority > MAX_PRIORITY) {
    throw new RangeError(
      `Decoder '${name}' priority must be between ${MIN_PRIORITY} and ${MAX_PRIORITY} (got ${priority})`
    );
  }

  if (typeof decode !== 'function') {
    throw new TypeError(`Decoder '${name}' must implement decode() function`);
  }
  if (typeof canDecode !== 'function') {
    throw new TypeError(`Decoder '${name}' must implement isTypeSupported() function`);
  }

  const exists = decoders.some((d) => d.name.trim().toLowerCase() === normalizedName);
  if (exists) {
    const existing = decoders.find((d) => d.name.trim().toLowerCase() === normalizedName)!;
    throw new Error(
      `Decoder '${name}' conflicts with existing decoder '${existing.name}' ` +
        `(case-insensitive match, existing priority: ${existing.priority})`
    );
  }

  const finalDecoder = freezeOnRegister ? Object.freeze(decoder) : decoder;

  const insertIndex = decoders.findIndex((d) => d.priority < priority);
  if (insertIndex === -1) {
    decoders.push(finalDecoder);
  } else {
    decoders.splice(insertIndex, 0, finalDecoder);
  }

  if (process.env.NODE_ENV === 'development') {
    console.debug(`Decoder '${decoder.name}' registered at priority ${decoder.priority}`);
  }

  return finalDecoder;
}

/**
 * Unregisters a decoder by name. Safe for test environments.
 */
export function unregisterDecoder(name: string): void {
  const normalizedName = name.trim().toLowerCase();
  const index = decoders.findIndex((d) => d.name.trim().toLowerCase() === normalizedName);
  if (index !== -1) {
    decoders.splice(index, 1);
  }
}

/**
 * Returns a snapshot of all registered decoders in descending priority order.
 */
export function getRegisteredDecoders(): readonly Decoder[] {
  return [...decoders];
}

/**
 * Clears the decoder registry. Intended for test environments.
 */
export function clearDecoderRegistry(): void {
  decoders.length = 0;
  locked = false;
  freezeOnRegister = false;
}

export function printDecoderRegistry(): void {
  if (decoders.length === 0) {
    console.log('🧩 Decoder Registry is empty.');
    return;
  }

  const currentEnv = getCurrentEnvironment();

  console.table(
    decoders.map((d, i) => {
      let envSupported: string;
      if (!d.env) {
        envSupported = 'all';
      } else if (Array.isArray(d.env)) {
        envSupported = d.env.includes(currentEnv) ? 'yes' : 'no';
      } else {
        envSupported = d.env === currentEnv ? 'yes' : 'no';
      }

      return {
        '#': i + 1,
        Name: d.name,
        Priority: d.priority,
        'Env Supported': envSupported,
        Methods: [
          typeof d.decode === 'function' ? 'decode' : '',
          typeof d.canDecode === 'function' ? 'canDecode' : ''
        ]
          .filter(Boolean)
          .join(', ')
      };
    })
  );
}
