import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { registerOAuthRoutes } from "./_core/oauth";
import { registerStorageProxy } from "./_core/storageProxy";
import { getConfiguredFrontendOrigins, normalizeOrigin } from "./deploymentConfig";

type AppOptions = {
  storagePathPrefix?: string;
  allowedOrigins?: string[];
};

function getAllowedOrigins(allowedOrigins?: string[]): Set<string> {
  return new Set(allowedOrigins?.map(normalizeOrigin) ?? getConfiguredFrontendOrigins());
}

/**
 * Builds the shared HTTP application without binding a port. The Manus runtime
 * starts it from server/_core/index.ts; Vercel imports it from an /api function;
 * and Railway/Render can start it from server/standalone.ts.
 */
export function createApp({ storagePathPrefix = "/manus-storage", allowedOrigins }: AppOptions = {}) {
  const app = express();
  const permittedOrigins = getAllowedOrigins(allowedOrigins);

  // Railway, Render, and Vercel terminate TLS before forwarding to Express.
  // Trusting the first proxy preserves secure-cookie detection in those setups.
  app.set("trust proxy", 1);

  app.use((req, res, next) => {
    const requestOrigin = req.header("origin");
    const normalizedOrigin = requestOrigin ? normalizeOrigin(requestOrigin) : undefined;

    if (normalizedOrigin && permittedOrigins.has(normalizedOrigin)) {
      res.header("Access-Control-Allow-Origin", normalizedOrigin);
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.vary("Origin");
    }

    if (req.method === "OPTIONS" && req.path.startsWith("/api/")) {
      res.sendStatus(204);
      return;
    }

    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", service: "india-culture-explorer-api" });
  });
  registerStorageProxy(app, storagePathPrefix);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  return app;
}
