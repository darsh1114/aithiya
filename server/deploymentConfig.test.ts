import { describe, expect, it } from "vitest";
import { getConfiguredFrontendOrigins, normalizeOrigin, validateStandaloneOriginConfiguration } from "./deploymentConfig";

describe("deployment configuration", () => {
  it("normalizes the frontend CORS allowlist", () => {
    expect(normalizeOrigin(" https://explorer.example/ ")).toBe("https://explorer.example");
    expect(getConfiguredFrontendOrigins("https://one.example/, https://two.example")).toEqual(["https://one.example", "https://two.example"]);
  });

  it("requires FRONTEND_URL when the public API starts in production", () => {
    const originalEnvironment = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    expect(() => validateStandaloneOriginConfiguration("")).toThrow("Set FRONTEND_URL");
    expect(() => validateStandaloneOriginConfiguration("https://explorer.example")).not.toThrow();
    process.env.NODE_ENV = originalEnvironment;
  });
});
