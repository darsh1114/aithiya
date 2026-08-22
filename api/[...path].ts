import { createApp } from "../server/app";

/**
 * Vercel deploys every file under /api as a serverless function. Keeping this
 * catch-all function separate from the Vite client prevents server TypeScript
 * from being treated as the frontend entrypoint.
 */
export default createApp({ storagePathPrefix: "/api/manus-storage" });
