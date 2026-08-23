import type { Request } from "express";

export function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/$/, "");
}

export function getConfiguredFrontendOrigins(value = process.env.FRONTEND_URL ?? ""): string[] {
  return value.split(",").map(normalizeOrigin).filter(Boolean);
}

export function validateStandaloneOriginConfiguration(
  frontendUrl = process.env.FRONTEND_URL ?? "",
  backendUrl = process.env.BACKEND_URL ?? "",
): void {
  const hasFrontendUrl = Boolean(frontendUrl.trim());
  const hasBackendUrl = Boolean(backendUrl.trim());

  if (hasFrontendUrl !== hasBackendUrl) {
    throw new Error(
      "Set both FRONTEND_URL and BACKEND_URL when hosting the frontend and backend separately. Leave both unset only for same-origin hosting.",
    );
  }
}

export function getRequestOrigin(req: Pick<Request, "protocol" | "get">): string {
  const configuredBackendUrl = process.env.BACKEND_URL?.trim();
  if (configuredBackendUrl) return normalizeOrigin(configuredBackendUrl);

  const host = req.get("host");
  if (!host) throw new Error("Request host is required to determine the backend URL");

  return `${req.protocol}://${host}`;
}

export function getSafeFrontendRedirect(returnTo: string | undefined, fallback: string, allowedOrigins: string[]): string {
  if (!returnTo) return fallback;

  try {
    const candidate = new URL(returnTo).origin;
    return allowedOrigins.includes(candidate) ? candidate : fallback;
  } catch {
    return fallback;
  }
}

export function getOAuthCompletionRedirect(
  returnTo: string | undefined,
  fallback: string,
  allowedOrigins: string[],
  backendOrigin: string,
  sessionToken: string,
): string {
  const redirectTarget = getSafeFrontendRedirect(returnTo, fallback, allowedOrigins);

  if (normalizeOrigin(redirectTarget) === normalizeOrigin(backendOrigin)) {
    return redirectTarget;
  }

  const url = new URL(redirectTarget);
  // A fragment is not sent to the server or included in the Referer header.
  // The frontend transfers this short handoff value into sessionStorage and
  // forwards it as the existing Authorization bearer fallback.
  url.hash = new URLSearchParams({ manus_session: sessionToken }).toString();
  return url.toString();
}
