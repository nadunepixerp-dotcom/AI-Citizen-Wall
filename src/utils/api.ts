/**
 * Dynamic API URL resolver for Aetheria
 * Automatically routes API requests to Google AI Studio backend server when hosted on external static hosts like Cloudflare Pages (ai-citizen-wall.pages.dev).
 */

const AI_STUDIO_BACKEND_URL =
  (import.meta as any).env?.VITE_API_URL ||
  'https://ais-pre-acphwfeiunkzm3jsb6omjx-256233983823.asia-east1.run.app';

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // If running on an external host (e.g. Cloudflare Pages: *.pages.dev, vercel.app, etc.),
  // target the live AI Studio backend server
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname.endsWith('.pages.dev') ||
      window.location.hostname.endsWith('.vercel.app') ||
      window.location.hostname.endsWith('.netlify.app'))
  ) {
    return `${AI_STUDIO_BACKEND_URL}${cleanPath}`;
  }

  // Otherwise, use relative path for local dev & Cloud Run preview
  return cleanPath;
}

export async function fetchJson<T = any>(path: string, options?: RequestInit): Promise<T> {
  const url = getApiUrl(path);
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const contentType = response.headers.get('content-type') || '';

  // Check if response returned HTML (e.g. 404 fallback page on static host)
  if (contentType.includes('text/html')) {
    throw new Error(
      `Received HTML instead of JSON from ${url}. Check backend endpoint URL configuration.`
    );
  }

  if (!response.ok) {
    let errorText = response.statusText;
    try {
      const errJson = await response.json();
      errorText = errJson.error || errJson.message || errorText;
    } catch (_) {}
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  return response.json();
}
