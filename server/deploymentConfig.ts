export function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/$/, "");
}

export function getConfiguredFrontendOrigins(value = process.env.FRONTEND_URL ?? ""): string[] {
  return value.split(",").map(normalizeOrigin).filter(Boolean);
}

export function validateStandaloneOriginConfiguration(frontendUrl = process.env.FRONTEND_URL ?? ""): void {
  if (process.env.NODE_ENV === "production" && !frontendUrl.trim()) {
    throw new Error("Set FRONTEND_URL to the Vercel frontend origin before starting the production API.");
  }
}
