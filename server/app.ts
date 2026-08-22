import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { registerOAuthRoutes } from "./_core/oauth";
import { registerStorageProxy } from "./_core/storageProxy";

type AppOptions = {
  storagePathPrefix?: string;
};

/**
 * Builds the shared HTTP application without binding a port. The Manus runtime
 * starts it from server/_core/index.ts; Vercel imports it from an /api function.
 */
export function createApp({ storagePathPrefix = "/manus-storage" }: AppOptions = {}) {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
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
