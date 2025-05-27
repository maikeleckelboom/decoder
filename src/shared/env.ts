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

/**
 * Detects if running in a Node.js environment (main thread or worker).
 */
export function isServer(): boolean {
  try {
    return (
      typeof process !== 'undefined' &&
      process.versions != null &&
      typeof process.versions.node === 'string'
    );
  } catch {
    return false;
  }
}

export function getCurrentEnvironment(): 'browser' | 'server' {
  if (isBrowser()) return 'browser';
  if (isServer()) return 'server';

  throw new Error(
    [
      'Unable to detect environment.',
      '',
      'Supported environments:',
      '  • Browser',
      '  • Server'
    ].join('\n')
  );
}
