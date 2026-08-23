import type { Server } from "node:http";
import { describe, expect, it } from "vitest";
import { createApp } from "./app";

async function withServer<T>(app: ReturnType<typeof createApp>, callback: (origin: string) => Promise<T>) {
  const server = await new Promise<Server>((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Test server did not expose a TCP port");
  }

  try {
    return await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

describe("createApp", () => {
  it("creates an Express application without opening a listener", () => {
    const app = createApp();

    expect(typeof app).toBe("function");
    expect(app).toHaveProperty("use");
    expect(app).toHaveProperty("listen");
  });

  it("exposes a lightweight health endpoint without requiring a database call", async () => {
    await withServer(createApp(), async (origin) => {
      const response = await fetch(`${origin}/health`);

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        status: "ok",
        service: "india-culture-explorer-api",
      });
    });
  });

  it("allows credentialed CORS only from explicitly configured frontend origins", async () => {
    await withServer(createApp({ allowedOrigins: ["https://explorer.example"] }), async (origin) => {
      const response = await fetch(`${origin}/api/trpc`, {
        method: "OPTIONS",
        headers: { Origin: "https://explorer.example" },
      });

      expect(response.status).toBe(204);
      expect(response.headers.get("access-control-allow-origin")).toBe("https://explorer.example");
      expect(response.headers.get("access-control-allow-credentials")).toBe("true");

      const rejectedResponse = await fetch(`${origin}/health`, {
        headers: { Origin: "https://untrusted.example" },
      });
      expect(rejectedResponse.headers.get("access-control-allow-origin")).toBeNull();
      expect(rejectedResponse.headers.get("access-control-allow-credentials")).toBeNull();
    });
  });
});
