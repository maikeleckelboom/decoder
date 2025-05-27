import type { Decoder } from '@/shared/decoder';

export const MIN_PRIORITY = 0 as const;
export const MAX_PRIORITY = 1000 as const;

let locked = false;
let freezeOnRegister = false;

const decoders: Decoder[] = [];

/**
 * Locks the decoder registry to prevent further mutations.
 * Recommended for production usage to avoid dynamic behavior.
 */
export function lockDecoderRegistry(): void {
  locked = true;
}

/**
 * Configures whether registered decoders should be frozen (immutable).
 * Recommended to be true in production for robustness.
 */
export function enableDecoderFreezing(): void {
  freezeOnRegister = true;
}

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

  const { name, priority, decode, isInputSupported, isEnvSupported } = decoder;
  const normalizedName = name?.trim().toLowerCase();

  // Validate name
  if (!name || name.trim() === '') {
    throw new TypeError(`Decoder must have a non-empty string 'name' property`);
  }

  // Validate priority
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

  // Validate required methods
  if (typeof decode !== 'function') {
    throw new TypeError(`Decoder '${name}' must implement decode() function`);
  }
  if (typeof isInputSupported !== 'function') {
    throw new TypeError(`Decoder '${name}' must implement isTypeSupported() function`);
  }

  // Validate optional methods
  if (isEnvSupported && typeof isEnvSupported !== 'function') {
    throw new TypeError(`Decoder '${name}' isEnvSupported must be a function when present`);
  }

  // Check for case-insensitive name conflicts
  const exists = decoders.some((d) => d.name.trim().toLowerCase() === normalizedName);
  if (exists) {
    const existing = decoders.find((d) => d.name.trim().toLowerCase() === normalizedName)!;
    throw new Error(
      `Decoder '${name}' conflicts with existing decoder '${existing.name}' ` +
        `(case-insensitive match, existing priority: ${existing.priority})`
    );
  }

  // Optionally freeze the decoder
  const finalDecoder = freezeOnRegister ? Object.freeze(decoder) : decoder;

  // Priority-ordered insertion
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

/**
 * Returns a map of all registered decoders keyed by normalized (lowercase) name.
 * Useful for fast lookup without repeated iteration.
 */
export function getDecoderMapByName(): Record<string, Decoder> {
  const map: Record<string, Decoder> = {};
  for (const decoder of decoders) {
    map[decoder.name.trim().toLowerCase()] = decoder;
  }
  return map;
}

/**
 * Prints a table of all registered decoders to the console.
 * Useful for debugging in dev/test environments.
 */
export function printDecoderRegistry(): void {
  if (decoders.length === 0) {
    console.log('🧩 Decoder Registry is empty.');
    return;
  }

  console.table(
    decoders.map((d, i) => ({
      '#': i + 1,
      Name: d.name,
      Priority: d.priority,
      'Env-Supported':
        typeof d.isEnvSupported === 'function' ? d.isEnvSupported() : 'unknown',
      Methods: [
        typeof d.decode === 'function' ? 'decode' : '',
        typeof d.isInputSupported === 'function' ? 'isInputSupported' : '',
        typeof d.isEnvSupported === 'function' ? 'isEnvSupported' : ''
      ]
        .filter(Boolean)
        .join(', ')
    }))
  );
}
