export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isResponse(value: unknown): value is Response {
  return value instanceof Response;
}
