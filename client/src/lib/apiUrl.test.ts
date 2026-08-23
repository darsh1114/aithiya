import { describe, expect, it } from "vitest";
import { getApiBaseUrl, getSessionTokenFromHash, getTrpcUrl, usesExternalApi } from "./apiUrl";

describe("API URL configuration", () => {
  const currentOrigin = "https://explorer.example";

  it("keeps the existing same-origin API path when no public backend URL is configured", () => {
    expect(getApiBaseUrl("", currentOrigin)).toBe(currentOrigin);
    expect(getTrpcUrl("", currentOrigin)).toBe(`${currentOrigin}/api/trpc`);
    expect(usesExternalApi("", currentOrigin)).toBe(false);
  });

  it("normalizes an independently hosted backend origin", () => {
    expect(getApiBaseUrl("https://india-api.up.railway.app/", currentOrigin)).toBe("https://india-api.up.railway.app");
    expect(getTrpcUrl("https://india-api.up.railway.app/", currentOrigin)).toBe("https://india-api.up.railway.app/api/trpc");
    expect(usesExternalApi("https://india-api.up.railway.app/", currentOrigin)).toBe(true);
  });

  it("reads the external login handoff only from the URL fragment", () => {
    expect(getSessionTokenFromHash("#manus_session=encoded-token")).toBe("encoded-token");
    expect(getSessionTokenFromHash("#section=about")).toBeNull();
  });
});
