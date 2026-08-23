# Vercel deployment

This project has two deployment surfaces. Vercel builds the React/Vite client as static files from `dist/public`, while the build process bundles `server/vercelHandler.ts` into the checked-in `api/[...path].js` entrypoint for `/api/trpc` and `/api/oauth/callback`. The entrypoint is versioned so Vercel can discover the API function from the Git checkout before it runs the build command. The configuration intentionally does **not** run `server/_core/index.ts` on Vercel because that file binds a long-lived Node listener for the Manus runtime.

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

## Optional independent backend

The repository now supports Railway or Render as an independent API host. In that layout, set Vercel’s public `VITE_API_BASE_URL` to the final backend URL before the Vite build, and configure the backend with matching `FRONTEND_URL` and `BACKEND_URL` values. The frontend calls `https://<backend>/api/trpc` directly; the backend exposes `/health`, applies origin-specific CORS, and starts OAuth through `/api/oauth/start`.

Use the dedicated instructions in [README.md](./README.md#deploy-the-backend-to-railway), [render.yaml](./render.yaml), [railway.json](./railway.json), and [ENVIRONMENT.md](./ENVIRONMENT.md). Do not mix this mode with the same-origin Vercel function configuration unless you deliberately keep the Vercel function as the backend.

## Validation

Run `pnpm build:vercel` locally. It creates the Vite frontend in `dist/public` and refreshes the versioned serverless function source at `api/[...path].js`. Commit that refreshed file with any changes to `server/vercelHandler.ts` or its server-side dependencies. This lets Vercel use the JavaScript function entrypoint without separately compiling the shared Express/tRPC TypeScript tree.
