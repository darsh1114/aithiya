# Project Structure

The project has four small sections. The frontend is deployed on Vercel, the API is deployed on Render, MongoDB Atlas stores cultural records, and `shared/` keeps the record type consistent.

```text
client/                 React + Vite frontend (Vercel)
  src/components/       Culture map and small reusable UI pieces
  src/pages/Home.tsx    Search, filters, map, and results
  src/lib/apiUrl.ts     Render API address helper

server/                 Express + tRPC API (Render)
  index.ts              Small server entrypoint for Render and managed hosting
  app.ts                CORS, /health, and /api/trpc
  routers.ts            Public culture.list procedure
  cultureRepository.ts  MongoDB Atlas query and indexes
  mongodb.ts            Server-only Atlas connection

shared/                 CultureRecord type and category definitions

docs/                   Research notes kept out of the source root
render.yaml             Free-tier Render backend settings
vercel.json             Static Vercel frontend settings
```

## Data flow

```text
Vercel frontend → Render /api/trpc/culture.list → MongoDB Atlas → approved culture records
```

New MongoDB records appear automatically when their `status` is `approved` and they contain the required culture fields. The API returns up to 250 records per filter, and the browser shows 24 cards at a time with a **Load more** control.

The cultural map is now a built-in, marker-based India view. It uses each record’s MongoDB longitude/latitude and has no Google Maps key, Forge proxy, or external-origin approval requirement. Render must still set `FRONTEND_URL` to the exact Vercel origin so browser requests receive the required CORS header.
