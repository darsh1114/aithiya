function withoutTrailingSlash(value: string): string {
  return value.trim().replace(/\/$/, "");
}

/**
 * Uses the current origin by default, so Manus and Vercel keep their existing
 * same-origin `/api` behavior. Set VITE_API_BASE_URL only when the frontend is
 * deployed separately from the Express/tRPC backend.
 */
export function getApiBaseUrl(configuredUrl = import.meta.env.VITE_API_BASE_URL, currentOrigin = window.location.origin): string {
  return configuredUrl?.trim() ? withoutTrailingSlash(configuredUrl) : currentOrigin;
}

export function getTrpcUrl(configuredUrl = import.meta.env.VITE_API_BASE_URL, currentOrigin = window.location.origin): string {
  return `${getApiBaseUrl(configuredUrl, currentOrigin)}/api/trpc`;
}
