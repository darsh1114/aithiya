# Vercel deployment

This project has two deployment surfaces. Vercel builds the React/Vite client as static files from `dist/public`, while the build process bundles `server/vercelHandler.ts` into `api/[...path].js` for `/api/trpc` and `/api/oauth/callback`. The configuration intentionally does **not** run `server/_core/index.ts` on Vercel because that file binds a long-lived Node listener for the Manus runtime.

## Vercel project settings

| Setting | Value |
|---|---|
| Framework preset | `Vite` |
| Build command | `pnpm build:vercel` |
| Output directory | `dist/public` |
| Install command | `pnpm install --frozen-lockfile` |
| Node.js | 22.x |

The checked-in `vercel.json` supplies the build command, output directory, SPA fallback, and `/manus-storage/*` rewrite. Do not set the output directory to `server`, `api`, or the repository root; doing so can expose source files instead of the compiled client.

## Required environment configuration

Set the server-side environment variables that the API function needs in Vercel’s Project Settings for each target environment. At a minimum, this includes `MONGODB_URI`, `JWT_SECRET`, `OAUTH_SERVER_URL`, `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL`, `OWNER_OPEN_ID`, `OWNER_NAME`, and any required Forge/storage credentials. Do not commit credentials.

> **MongoDB Atlas is required for cultural records.** Add `MONGODB_URI` as a server-side Vercel environment variable using the same `mongodb+srv://.../india_culture_explorer` value configured for development. If the API builds but the list is empty, confirm this variable is set for the production environment and that Atlas Network Access permits the Vercel function to connect.

The existing OAuth and storage code uses Manus-provided services. For a Vercel production deployment, ensure the OAuth callback URL includes `https://<your-vercel-domain>/api/oauth/callback` and confirm the required server credentials are valid outside Manus. If those built-in services are unavailable in the external environment, retain the Vercel static frontend and point `/api/*` to an external backend using a Vercel rewrite, or replace those service integrations.

## Validation

Run `pnpm build:vercel` locally. It creates the Vite frontend in `dist/public` and bundles the serverless function to `api/[...path].js`. Vercel executes that JavaScript entrypoint directly, avoiding a second TypeScript compilation of the shared Express/tRPC server tree.
