import { describe, expect, it } from "vitest";
import {
  getConfiguredFrontendOrigins,
  getOAuthCompletionRedirect,
  getSafeFrontendRedirect,
  normalizeOrigin,
  validateStandaloneOriginConfiguration,
} from "./deploymentConfig";

describe("deployment configuration", () => {
  it("normalizes a comma-separated frontend allowlist", () => {
    expect(getConfiguredFrontendOrigins(" https://explorer.example/ , https://preview.example ")).toEqual([
      "https://explorer.example",
      "https://preview.example",
    ]);
    expect(normalizeOrigin("https://explorer.example/")).toBe("https://explorer.example");
  });

  it("redirects OAuth only to an allowed frontend origin", () => {
    const fallback = "https://explorer.example";
    const allowedOrigins = [fallback];

    expect(getSafeFrontendRedirect("https://explorer.example/discover", fallback, allowedOrigins)).toBe(fallback);
    expect(getSafeFrontendRedirect("https://attacker.example", fallback, allowedOrigins)).toBe(fallback);
    expect(getSafeFrontendRedirect("not-a-url", fallback, allowedOrigins)).toBe(fallback);
  });

  it("uses a URL fragment for the external frontend session handoff", () => {
    expect(
      getOAuthCompletionRedirect(
        "https://explorer.example",
        "https://explorer.example",
        ["https://explorer.example"],
        "https://api.example",
        "session-token",
      ),
    ).toBe("https://explorer.example/#manus_session=session-token");

    expect(
      getOAuthCompletionRedirect(
        undefined,
        "https://api.example",
        [],
        "https://api.example",
        "session-token",
      ),
    ).toBe("https://api.example");
  });

  it("requires both origins when configuring separate hosting", () => {
    expect(() => validateStandaloneOriginConfiguration("https://explorer.example", "")).toThrow(/FRONTEND_URL and BACKEND_URL/);
    expect(() => validateStandaloneOriginConfiguration("", "https://api.example")).toThrow(/FRONTEND_URL and BACKEND_URL/);
    expect(() => validateStandaloneOriginConfiguration("https://explorer.example", "https://api.example")).not.toThrow();
    expect(() => validateStandaloneOriginConfiguration()).not.toThrow();
  });
});
