# Vercel deployment

This project has two deployment surfaces. Vercel builds the React/Vite client as static files from `dist/public`, while `api/[...path].ts` exports the existing Express application as a Vercel Function for `/api/trpc` and `/api/oauth/callback`. The configuration intentionally does **not** run `server/_core/index.ts` on Vercel because that file binds a long-lived Node listener for the Manus runtime.

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

The existing OAuth and storage code uses Manus-provided services. For a Vercel production deployment, ensure the OAuth callback URL includes `https://<your-vercel-domain>/api/oauth/callback` and confirm the required server credentials are valid outside Manus. If those built-in services are unavailable in the external environment, retain the Vercel static frontend and point `/api/*` to an external backend using a Vercel rewrite, or replace those service integrations.

## Validation

Run `pnpm build:vercel` locally. It creates only the Vite frontend in `dist/public`. Vercel separately discovers `api/[...path].ts` as the API function.
