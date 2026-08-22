# India Culture Explorer

**India Culture Explorer** is a full-stack web application for discovering curated Indian festivals, traditions, foodways, and oral-performance stories on a searchable map.

> **One-line project explanation:** The app reads approved cultural records from MongoDB Atlas, lets visitors filter them by search, category, and region, and keeps the result list synchronized with a map.

## What the project does

| Feature | Simple explanation |
|---|---|
| Culture discovery | Visitors browse 22 researched pilot records across four cultural categories. |
| Search and filters | A visitor can search words such as `Pongal`, choose a category, or select a region. |
| Interactive map | Each visible record becomes a map marker; selecting a marker or result card focuses the same record. |
| Trusted source links | Every record keeps its source URL, location, season, and public review status. |
| Safe data management | Only approved records are public; owner-only actions can import the curated pilot. |

## Project map

The project is intentionally divided by responsibility. Start with the bold files when explaining the system.

```text
client/src/
├── pages/Home.tsx                 # Main discovery screen
├── components/CultureMap.tsx      # Turns records into map markers
├── lib/cultureDiscovery.ts        # Small helpers for filters and labels
└── lib/trpc.ts                    # Typed frontend-to-backend connection

shared/
├── culture.ts                     # One shared TypeScript shape for a culture record
└── culturePilot.ts                # The 22 curated starter records

server/
├── app.ts                         # Shared Express app: routes, tRPC, OAuth, storage
├── routers.ts                     # API actions available to the frontend
├── cultureRepository.ts           # MongoDB read/write functions
├── cultureImport.ts               # Validate → import the pilot dataset
└── mongodb.ts                     # Safe cached MongoDB Atlas connection

server/vercelHandler.ts            # Source for the Vercel serverless wrapper
api/[...path].js                   # Generated during the Vercel build; not committed
```

The `server/_core/` folder is framework infrastructure. It is normally left alone; application features belong in the files listed above.

## How data moves through the app

```text
MongoDB Atlas
     ↓
cultureRepository.ts
     ↓
routers.ts (tRPC API)
     ↓
Home.tsx
     ↓
CultureMap.tsx + result cards
```

When a visitor changes a filter, `Home.tsx` creates a small filter object. tRPC sends it to `routers.ts`, which calls `cultureRepository.ts`. MongoDB returns only matching **approved** records, and React redraws both the result cards and map markers.

## Run the project locally

| Command | Purpose |
|---|---|
| `pnpm install` | Install project packages. |
| `pnpm dev` | Start local development with the React UI and Express API. |
| `pnpm check` | Check TypeScript types. |
| `pnpm test` | Run automated client and server tests. |
| `pnpm build` | Build the Vite frontend and local Express server. |
| `pnpm build:vercel` | Build only the static Vite frontend for Vercel into `dist/public`. |

The server needs a secure `MONGODB_URI` to load real cultural records. Keep all credentials in deployment settings or a secure secret manager; never commit them to Git.

## Import the curated pilot

After configuring MongoDB Atlas, run:

```bash
pnpm tsx scripts/importCuratedCulturePilot.mjs
```

The importer validates each record first and uses MongoDB upserts, so running it again updates the same records instead of creating duplicates.

## Explain it in a presentation

| Question | Student-friendly answer |
|---|---|
| Why React? | It makes the map, filters, and result cards update instantly when state changes. |
| Why TypeScript? | It catches mistakes by defining one clear `CultureRecord` shape used by both frontend and backend. |
| Why tRPC? | It gives typed API calls without manually writing separate REST request code. |
| Why MongoDB Atlas? | Cultural records have nested data such as location, source, and seasonal months, which fit naturally in documents. |
| How is the map synchronized? | The selected record slug is shared state; a marker or result card changes the same value. |
| How is public content protected? | Public queries always request only records whose status is `approved`; import and connection actions are role-protected. |

## Deployment

For Manus hosting, use the normal project publishing workflow. For Vercel, use `pnpm build:vercel` and set the output directory to **`dist/public`**. The checked-in [`VERCEL_DEPLOYMENT.md`](./VERCEL_DEPLOYMENT.md) explains the Vite frontend and serverless API split.

## Technology reference

See the short, presentation-ready [**TECH_STACK.md**](./TECH_STACK.md) file.

## References

[1]: https://react.dev/ "React documentation"
[2]: https://www.typescriptlang.org/docs/ "TypeScript documentation"
[3]: https://trpc.io/docs "tRPC documentation"
[4]: https://www.mongodb.com/docs/atlas/ "MongoDB Atlas documentation"
[5]: https://vite.dev/guide/ "Vite documentation"
