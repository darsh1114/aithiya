# India Culture Explorer

**India Culture Explorer** is a full-stack discovery application for exploring curated Indian festivals, traditions, foodways, and oral-performance stories on a searchable map.

> **One-line explanation:** Visitors explore 22 approved cultural records from MongoDB Atlas, filter them by search, category, and region, and see the same results on interactive map markers.

## Features

| Feature | Simple explanation |
|---|---|
| Culture discovery | Visitors browse 22 researched pilot records across festivals, traditions, foodways, and stories. |
| Search and filters | A visitor can search a term such as `Pongal`, select a category, or choose a region. |
| Synchronized map | Every visible record becomes a map marker; a marker and its result card select the same record. |
| Trusted sources | Records include source URL, location, seasonal information, and approval status. |
| Safe management | Public queries return only approved content; owner-only procedures import the curated pilot. |

## Architecture

The existing `client/` and `server/` folders already separate the frontend and backend clearly, so they remain in place. This avoids a high-risk file move while allowing them to be built and hosted independently.

```text
Vercel static frontend                         Railway or Render API
──────────────────────                         ─────────────────────
React + Vite                                   Express + tRPC
VITE_API_BASE_URL ───── HTTPS ───────────────► /api/trpc
Google Maps loader                             /health
OAuth login handoff ◄──── HTTPS ───────────── /api/oauth/*
                                                  │
                                                  ├── MongoDB Atlas (culture data)
                                                  └── MySQL/Drizzle (OAuth identities)
```

When the API is on another origin, `VITE_API_BASE_URL` supplies its public URL at frontend build time. The backend uses `FRONTEND_URL` and `BACKEND_URL` to apply CORS and complete OAuth safely. The login callback hands the session to the frontend using a URL fragment, then the existing client sends it as an authorization bearer fallback. This avoids depending on third-party cookies.

## Project structure

```text
client/                         React/Vite user interface
  src/components/Map.tsx        Google Maps loader and fallback UI
  src/lib/apiUrl.ts             Configurable API origin helper
server/                         Express/tRPC application
  app.ts                        Shared routes, CORS, and /health
  standalone.ts                 Railway/Render/Docker API entrypoint
  cultureRepository.ts          MongoDB cultural-record queries
  deploymentConfig.ts           Origin validation and OAuth redirect safety
  _core/                        Manus runtime and OAuth infrastructure
shared/                         Shared TypeScript types and constants
docker/                         Optional frontend/backend container definitions
railway.json                    Railway backend build and health-check config
render.yaml                     Render backend Blueprint
vercel.json                     Vercel static frontend + serverless API config
ENVIRONMENT.md                  Safe variable reference; no secrets included
```

## Local development

Install dependencies once:

```bash
pnpm install
```

For the original integrated development experience, run the Vite frontend and Express API together:

```bash
pnpm dev
```

For independent-backend development, set matching local origins in your private environment, then start only the API:

```bash
FRONTEND_URL=http://localhost:4173 \
BACKEND_URL=http://localhost:3000 \
pnpm dev:backend
```

In a second terminal, point Vite to that backend. `VITE_API_BASE_URL` is public and must be present when the frontend is built.

```bash
VITE_API_BASE_URL=http://localhost:3000 pnpm exec vite --host 0.0.0.0
```

| Command | Purpose |
|---|---|
| `pnpm check` | Type-check the project. |
| `pnpm test` | Run client, server, OAuth, CORS, and deployment-contract tests. |
| `pnpm build:client` | Build the Vite frontend into `dist/public`. |
| `pnpm build:backend` | Bundle the independent backend into `dist/standalone.js`. |
| `pnpm start:backend` | Run the compiled backend using the platform-provided `PORT`. |
| `curl http://localhost:3000/health` | Confirm that the backend process is healthy without querying a database. |

## Environment variables

Read [**ENVIRONMENT.md**](./ENVIRONMENT.md) before configuring a deployment. It documents every backend secret, cross-origin setting, and public `VITE_*` value without storing an `.env` file in Git.

> **Important:** `FRONTEND_URL` and `BACKEND_URL` must be configured together for split hosting. For example, `FRONTEND_URL=https://your-site.vercel.app` and `BACKEND_URL=https://your-api.up.railway.app`. The backend deliberately stops on a partial configuration instead of silently redirecting OAuth to the wrong site.

## Docker

Docker is optional. The project contains separate production-oriented Dockerfiles for the API and static frontend plus a `docker-compose.yml` for local testing:

```bash
# Supply values from your local secret manager rather than committing a .env file.
docker compose up --build
```

The API is available on `http://localhost:3000/health` and the frontend on `http://localhost:4173`. The Compose configuration forwards all public Vite values needed for API access, OAuth, map loading, and optional analytics at **build time**; it keeps database URLs and server credentials only on the API container.

The sandbox cannot run Docker, so perform this final container smoke test on a machine or CI runner with Docker before using the image in production.

## Deploy the backend to Railway

Railway reads the checked-in `railway.json`, which builds `pnpm build:backend`, starts `pnpm start:backend`, and checks `/health`. Railway’s current configuration reference documents these build, start, health-check, and restart settings. [1]

Create a Railway service from this GitHub repository and configure these variables in its protected environment-variable UI: `FRONTEND_URL`, `BACKEND_URL`, `MONGODB_URI`, `DATABASE_URL`, `JWT_SECRET`, `OAUTH_SERVER_URL`, `VITE_APP_ID`, `OWNER_OPEN_ID`, `OWNER_NAME`, and any required server-side Forge variables. Set `BACKEND_URL` to the generated Railway domain and `FRONTEND_URL` to the final Vercel domain before deploying.

After the deployment completes, verify:

```bash
curl https://your-api.up.railway.app/health
```

## Deploy the backend to Render

Render reads the root `render.yaml` Blueprint. The Blueprint defines a Node **free** web service, custom build and start commands, `/health`, and prompts for secrets through `sync: false` instead of committing their values. Render documents these fields for native Node web services and Blueprints. [2]

Create a Blueprint from this repository, provide the same backend variables listed for Railway, and set the final public Render URL as `BACKEND_URL`. Confirm the service returns a successful `GET /health` response after the first deployment.

> **Free-tier behavior:** Render spins down an idle Free web service after 15 minutes; the next request wakes it, which can take about one minute. Free services receive 750 instance-hours per workspace each month and use an ephemeral local filesystem, which is compatible with this stateless API because cultural records remain in MongoDB Atlas. [3]

## Deploy the frontend to Vercel

Vercel can continue to serve the existing static Vite client. Before the Vercel build, set these **public build-time** variables:

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | Final Railway or Render API URL, without a trailing slash. |
| `VITE_FRONTEND_FORGE_API_URL` | Map-loader Forge endpoint. |
| `VITE_FRONTEND_FORGE_API_KEY` | Map-loader frontend credential. |
| `VITE_APP_ID` and `VITE_OAUTH_PORTAL_URL` | Existing OAuth client settings. |
| `VITE_ANALYTICS_ENDPOINT` and `VITE_ANALYTICS_WEBSITE_ID` | Optional analytics settings. |

Vercel must rebuild after changing `VITE_*` values because Vite writes those public settings into the static bundle. For the current Vercel serverless option, see [**VERCEL_DEPLOYMENT.md**](./VERCEL_DEPLOYMENT.md). Do not place `MONGODB_URI`, `JWT_SECRET`, or server-only Forge credentials in Vercel frontend variables.

## Production order of operations

First decide the exact frontend and backend domains. Set `FRONTEND_URL` and `BACKEND_URL` in Railway or Render, then deploy the backend and confirm `/health`. Register `${BACKEND_URL}/api/oauth/callback` with the Manus OAuth application. Next set `VITE_API_BASE_URL=${BACKEND_URL}` plus the public map/OAuth settings in Vercel and redeploy the frontend. Finally reload the site, confirm cultural records appear, complete one login, and check the map.

## Troubleshooting

| Symptom | What to check |
|---|---|
| No cultural records | Open `${BACKEND_URL}/health`, then inspect the backend logs for `/api/trpc/culture.list`. Verify `MONGODB_URI`, Atlas database/user permissions, and Atlas Network Access. |
| Browser CORS error | `FRONTEND_URL` must exactly match the frontend origin, without a path. Configure `BACKEND_URL` at the same time and redeploy the backend. |
| Login returns to API instead of UI | Confirm both origins are set and `${BACKEND_URL}/api/oauth/callback` is registered with the OAuth provider. |
| Map unavailable | Verify Vercel has both `VITE_FRONTEND_FORGE_API_URL` and `VITE_FRONTEND_FORGE_API_KEY`, then rebuild. The map loader already shows a retry/fallback state. |
| Vercel UI loads but API fails | Inspect the latest Function logs and ensure `api/[...path].js` is present in the deployment source. The handler is intentionally committed for discovery. |

## Presentation-ready explanations

| Question | Student-friendly answer |
|---|---|
| Why React? | It updates the map, filters, and result cards when a visitor changes state. |
| Why TypeScript? | It catches mistakes by using a clear `CultureRecord` shape across the frontend and backend. |
| Why tRPC? | It provides typed API calls without manually writing separate REST request code. |
| Why MongoDB Atlas? | Cultural records have nested source, location, and seasonal data that fit naturally in documents. |
| Why separate hosting? | Vercel can serve a fast static frontend while Railway or Render runs the API, database integrations, health checks, and server secrets. |

## References

[1]: https://docs.railway.com/config-as-code/reference "Railway Config as Code reference"
[2]: https://render.com/docs/blueprint-spec "Render Blueprint specification"
[3]: https://render.com/docs/free "Render Free instance documentation"
