import { describe, expect, it } from "vitest";
import { getApiBaseUrl, getTrpcUrl } from "./apiUrl";

describe("API URL configuration", () => {
  const currentOrigin = "https://explorer.example";

  it("keeps the existing same-origin API path when no public backend URL is configured", () => {
    expect(getApiBaseUrl("", currentOrigin)).toBe(currentOrigin);
    expect(getTrpcUrl("", currentOrigin)).toBe(`${currentOrigin}/api/trpc`);
  });

  it("normalizes an independently hosted backend origin", () => {
    expect(getApiBaseUrl("https://aithiya-backend.onrender.com/", currentOrigin)).toBe("https://aithiya-backend.onrender.com");
    expect(getTrpcUrl("https://aithiya-backend.onrender.com/", currentOrigin)).toBe("https://aithiya-backend.onrender.com/api/trpc");
  });
});
