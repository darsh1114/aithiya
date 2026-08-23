import type { Server } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  upsertUser: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./_core/sdk", () => ({
  sdk: {
    exchangeCodeForToken: vi.fn().mockResolvedValue({ accessToken: "access-token" }),
    getUserInfo: vi.fn().mockResolvedValue({ openId: "user-1", name: "Test User" }),
    createSessionToken: vi.fn().mockResolvedValue("session-token"),
  },
}));

import { OAUTH_STATE_COOKIE, decodeOAuthState, encodeOAuthState } from "@shared/const";
import { createApp } from "./app";

async function withServer<T>(callback: (origin: string) => Promise<T>) {
  const app = createApp();
  const server = await new Promise<Server>((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  const address = server.address();

  if (!address || typeof address === "string") throw new Error("Test server did not expose a TCP port");

  try {
    return await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

const originalEnvironment = {
  FRONTEND_URL: process.env.FRONTEND_URL,
  BACKEND_URL: process.env.BACKEND_URL,
  OAUTH_SERVER_URL: process.env.OAUTH_SERVER_URL,
  VITE_APP_ID: process.env.VITE_APP_ID,
};

afterEach(() => {
  Object.assign(process.env, originalEnvironment);
});

describe("standalone OAuth routes", () => {
  it("starts OAuth from the backend and retains only an allowed frontend return origin", async () => {
    process.env.FRONTEND_URL = "https://explorer.example";
    process.env.OAUTH_SERVER_URL = "https://oauth.example";
    process.env.VITE_APP_ID = "app-id";
    delete process.env.BACKEND_URL;

    await withServer(async (origin) => {
      const response = await fetch(`${origin}/api/oauth/start?returnTo=https://explorer.example/records`, { redirect: "manual" });
      const location = new URL(response.headers.get("location") ?? "");
      const state = decodeOAuthState(location.searchParams.get("state") ?? "");

      expect(response.status).toBe(302);
      expect(location.origin).toBe("https://oauth.example");
      expect(location.searchParams.get("redirectUri")).toBe(`${origin}/api/oauth/callback`);
      expect(state.returnTo).toBe("https://explorer.example");
      expect(response.headers.get("set-cookie")).toContain(OAUTH_STATE_COOKIE);
    });
  });

  it("redirects an external frontend with the session handoff in a URL fragment", async () => {
    process.env.FRONTEND_URL = "https://explorer.example";
    delete process.env.BACKEND_URL;

    await withServer(async (origin) => {
      const state = encodeOAuthState({
        redirectUri: `${origin}/api/oauth/callback`,
        nonce: "csrf-nonce",
        returnTo: "https://explorer.example",
      });
      const response = await fetch(`${origin}/api/oauth/callback?code=code&state=${encodeURIComponent(state)}`, {
        headers: { Cookie: `${OAUTH_STATE_COOKIE}=csrf-nonce` },
        redirect: "manual",
      });

      expect(response.status).toBe(302);
      expect(response.headers.get("location")).toBe("https://explorer.example/#manus_session=session-token");
    });
  });
});

