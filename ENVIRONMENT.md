# Environment variable reference

This project deliberately does **not** commit `.env` or `.env.example` files. Configure the variables below in your local secret manager, Docker Compose environment, Railway, Render, or Vercel settings. Never paste real secrets into this repository.

## Backend-only variables

| Variable | Required for | Description |
|---|---|---|
| `MONGODB_URI` | Cultural records | MongoDB Atlas connection string. The application uses the `india_culture_explorer` database. |
| `DATABASE_URL` | User identity storage | MySQL/Drizzle connection URL for Manus OAuth user records. |
| `JWT_SECRET` | Auth sessions | Long, random server-only signing secret. |
| `OAUTH_SERVER_URL` | OAuth | Manus OAuth service base URL. |
| `VITE_APP_ID` | OAuth | Application identifier used by the OAuth exchange. Although named `VITE_`, the backend needs it too. |
| `OWNER_OPEN_ID` | Administration | Open ID granted owner-only import and status procedures. |
| `OWNER_NAME` | Administration | Display name for the owner record. |
| `BUILT_IN_FORGE_API_URL` | Storage proxy | Server-side Forge API base URL, if the Manus storage integration remains enabled. |
| `BUILT_IN_FORGE_API_KEY` | Storage proxy | Server-side Forge credential. |

## Deployment-boundary variables

| Variable | Example shape | Purpose |
|---|---|---|
| `NODE_ENV` | `production` | Enables production runtime behavior. |
| `PORT` | Platform-provided | HTTP port. Railway and Render set it automatically. |
| `FRONTEND_URL` | `https://your-site.vercel.app` | Exact Vercel frontend origin. Required together with `BACKEND_URL` for separate hosting; comma-separate allowed preview origins if needed. |
| `BACKEND_URL` | `https://your-api.up.railway.app` | Public Railway or Render API origin. Required together with `FRONTEND_URL` for separate hosting. |
| `VITE_API_BASE_URL` | `https://your-api.up.railway.app` | **Public build-time** frontend setting. Vercel bakes it into the client so it can call the independent tRPC backend. |

## Public frontend integration settings

| Variable | Purpose |
|---|---|
| `VITE_OAUTH_PORTAL_URL` | Public OAuth portal base URL used only for same-origin hosting. Separate hosting starts login through the backend. |
| `VITE_FRONTEND_FORGE_API_URL` | Public Manus Forge endpoint used by the map loader. |
| `VITE_FRONTEND_FORGE_API_KEY` | Public frontend Forge credential used by the map loader. Configure it only through the deployment platform’s protected environment-variable UI. |
| `VITE_ANALYTICS_ENDPOINT` | Optional analytics endpoint. |
| `VITE_ANALYTICS_WEBSITE_ID` | Optional analytics site identifier. |

> **Separate-hosting rule:** Set `FRONTEND_URL`, `BACKEND_URL`, and `VITE_API_BASE_URL` as matching deployment origins. The backend rejects a partial `FRONTEND_URL`/`BACKEND_URL` configuration at startup rather than silently redirecting OAuth to the wrong origin.

## Docker build note

The frontend is a static Vite bundle, so every `VITE_*` value it uses must be supplied as a **Docker build argument** before `docker compose up --build`. `docker-compose.yml` forwards the required API, OAuth, map, and analytics variables from your local environment. Do not place server-only values such as `MONGODB_URI`, `DATABASE_URL`, `JWT_SECRET`, or `BUILT_IN_FORGE_API_KEY` in the frontend image.
