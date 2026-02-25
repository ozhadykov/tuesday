const rawApiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

export const API_BASE = rawApiBase.endsWith('/') ? rawApiBase.slice(0, -1) : rawApiBase;

export function buildApiUrl(
  path: string,
  query?: Record<string, string | number | boolean | null | undefined>,
): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}
