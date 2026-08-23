import { describe, expect, it } from "vitest";
import { getConfiguredFrontendOrigins, normalizeOrigin, validateStandaloneOriginConfiguration } from "./deploymentConfig";

describe("deployment configuration", () => {
  it("normalizes the frontend CORS allowlist", () => {
    expect(normalizeOrigin(" https://explorer.example/ ")).toBe("https://explorer.example");
    expect(getConfiguredFrontendOrigins("https://one.example/, https://two.example")).toEqual(["https://one.example", "https://two.example"]);
  });

  it("allows the managed API to start without a CORS allowlist", () => {
    expect(() => validateStandaloneOriginConfiguration("")).not.toThrow();
    expect(() => validateStandaloneOriginConfiguration("https://explorer.example")).not.toThrow();
  });
});
