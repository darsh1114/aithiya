import { COOKIE_NAME, ONE_YEAR_MS, OAUTH_STATE_COOKIE, decodeOAuthState, encodeOAuthState } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { getConfiguredFrontendOrigins, getOAuthCompletionRedirect, getRequestOrigin, getSafeFrontendRedirect } from "../deploymentConfig";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/start", (req: Request, res: Response) => {
    const frontendOrigins = getConfiguredFrontendOrigins();
    const backendOrigin = getRequestOrigin(req);
    const fallbackFrontendUrl = frontendOrigins[0] ?? backendOrigin;
    const requestedReturnTo = getQueryParam(req, "returnTo");
    const returnTo = getSafeFrontendRedirect(requestedReturnTo, fallbackFrontendUrl, frontendOrigins);
    const nonce = crypto.randomUUID();
    const redirectUri = `${backendOrigin}/api/oauth/callback`;
    const state = encodeOAuthState({ redirectUri, nonce, returnTo });
    const oauthUrl = new URL(`${process.env.OAUTH_SERVER_URL ?? ""}/app-auth`);

    oauthUrl.searchParams.set("appId", process.env.VITE_APP_ID ?? "");
    oauthUrl.searchParams.set("redirectUri", redirectUri);
    oauthUrl.searchParams.set("state", state);
    oauthUrl.searchParams.set("type", "signIn");
    res.cookie(OAUTH_STATE_COOKIE, nonce, { path: "/", maxAge: 600_000, secure: true, sameSite: "none" });
    res.redirect(302, oauthUrl.toString());
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    // CSRF guard: the nonce in `state` must match the one-time cookie that
    // startLogin set in the browser that began this login. An attacker can
    // forge `state`, but cannot plant this cookie in the victim's browser.
    const { nonce, returnTo } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      const frontendOrigins = getConfiguredFrontendOrigins();
      const backendOrigin = getRequestOrigin(req);
      const fallbackFrontendUrl = frontendOrigins[0] ?? backendOrigin;
      res.redirect(
        302,
        getOAuthCompletionRedirect(returnTo, fallbackFrontendUrl, frontendOrigins, backendOrigin, sessionToken),
      );
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
