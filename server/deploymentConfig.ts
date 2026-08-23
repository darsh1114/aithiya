export function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/$/, "");
}

export function getConfiguredFrontendOrigins(value = process.env.FRONTEND_URL ?? ""): string[] {
  return value.split(",").map(normalizeOrigin).filter(Boolean);
}

export function validateStandaloneOriginConfiguration(frontendUrl = process.env.FRONTEND_URL ?? ""): void {
  // FRONTEND_URL is required by Render for browser CORS, but the managed
  // project preview can run without it because it does not serve the Vercel UI.
  // An empty value therefore starts the API with no cross-origin allowlist.
  if (frontendUrl && getConfiguredFrontendOrigins(frontendUrl).length === 0) {
    throw new Error("FRONTEND_URL must contain at least one valid origin.");
  }
}
