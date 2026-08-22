import { describe, expect, it } from "vitest";
import { createApp } from "./app";

describe("createApp", () => {
  it("creates an Express application without opening a listener", () => {
    const app = createApp();

    expect(typeof app).toBe("function");
    expect(app).toHaveProperty("use");
    expect(app).toHaveProperty("listen");
  });

  it("supports a Vercel-specific storage path without changing app creation", () => {
    expect(() => createApp({ storagePathPrefix: "/api/manus-storage" })).not.toThrow();
  });
});
