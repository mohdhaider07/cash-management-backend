export function ensureError(err: unknown) {
  if (err instanceof Error) {
    return err;
  }
  return new Error(`Caught a non-error value ${err}`);
}

// Function to escape regex special characters in search queries
export function escapeRegExp(s: string): string {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
