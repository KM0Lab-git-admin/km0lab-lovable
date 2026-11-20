/** Replace only this boundary when installed-app links differ from web links. */
export function getShareLink(path: string, searchParams?: Record<string, string | null | undefined>): string {
  const url = new URL(path, window.location.origin);
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value !== null && value !== undefined) url.searchParams.set(key, value);
  }
  return url.toString();
}

export function getCanonicalWebLink(path: string, searchParams?: Record<string, string | null | undefined>): string {
  return getShareLink(path, searchParams);
}