/**
 * Detects if running in a web worker (browser only).
 */
export function isWebWorker(): boolean {
  try {
    return typeof importScripts === 'function' && typeof Window === 'undefined';
  } catch {
    return false;
  }
}

/**
 * Detects if running in a browser context (main thread or worker).
 */
export function isBrowser(): boolean {
  try {
    return typeof window !== 'undefined' || isWebWorker();
  } catch {
    return false;
  }
}
