# India Culture Explorer

India Culture Explorer is a public map-first website for discovering Indian festivals, traditions, foods, and stories. The site reads approved records from MongoDB Atlas and displays them as searchable cultural cards and interactive geographic markers.

## Simple architecture

| Part | Technology | Job |
|---|---|---|
| Frontend | React + Vite on Vercel | Shows the map, filters, and cultural records. |
| Backend | Express + tRPC on Render | Provides the public culture API and health check. |
| Database | MongoDB Atlas | Stores every cultural record. |

The Vercel frontend uses `VITE_API_BASE_URL=https://aithiya-backend.onrender.com`. The Render backend uses `MONGODB_URI` and `FRONTEND_URL=https://aithiyaa-miattlpvp-legacy-trackers.vercel.app`.

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Run the Vite frontend locally. |
| `pnpm dev:api` | Run the Render-style API locally on port 3000. |
| `pnpm build` | Build both the frontend and API. |
| `pnpm test` | Run the project tests. |
| `pnpm start` | Start the built API for Render. |

## Adding records

Add records to the `cultureRecords` collection in the `india_culture_explorer` MongoDB database. A record appears publicly when `status` is `approved`. The public API returns up to 250 matching records and the page provides a **Load more** control, so the design can grow beyond the original 22-record pilot.

Read [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for a student-friendly file map and data flow.
