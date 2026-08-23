import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { getConfiguredFrontendOrigins, normalizeOrigin } from "./deploymentConfig";

type AppOptions = {
  allowedOrigins?: string[];
};

function getAllowedOrigins(allowedOrigins?: string[]): Set<string> {
  return new Set(allowedOrigins?.map(normalizeOrigin) ?? getConfiguredFrontendOrigins());
}

/**
 * Builds the public culture API without binding a port. Local development and
 * Render both use this same small Express application.
 */
export function createApp({ allowedOrigins }: AppOptions = {}) {
  const app = express();
  const permittedOrigins = getAllowedOrigins(allowedOrigins);

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
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext: () => ({}),
    }),
  );

  return app;
}
