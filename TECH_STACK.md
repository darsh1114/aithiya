# Technology Stack

> **Presentation version:** React shows the interface, tRPC connects it to the backend, Express runs the API, and MongoDB Atlas stores the cultural records.

| Area | Technology | Why it is used |
|---|---|---|
| Language | TypeScript | Makes data shapes and API calls easier to understand and safer to change. |
| Frontend | React 19 + Vite | Builds the fast, interactive map and search interface. |
| Styling | Tailwind CSS 4 + shadcn/ui | Creates consistent responsive components with less custom CSS. |
| Interaction | Framer Motion + Lucide icons | Adds small visual feedback and clear interface icons. |
| Charts | Recharts | Available for seasonality and culture-data visualizations. |
| API | tRPC 11 + Express 4 | Provides typed frontend-to-backend calls in one TypeScript project. |
| Identity | Manus OAuth + Drizzle/MySQL | Keeps sign-in users and roles separate from cultural content. |
| Content database | MongoDB Atlas | Stores nested cultural records, locations, sources, imports, and moderation data. |
| Map | Google Maps JavaScript API | Shows cultural records by geographic location. |
| Testing | Vitest | Checks filter helpers, imports, database access, and API setup. |
| Build | pnpm, Vite, esbuild | Installs packages and creates frontend/server production builds. |
| Deployment | Manus hosting or Vercel | Supports managed project hosting or a Vite static frontend plus serverless API. |

## Five technologies to remember

1. **React** — user interface.
2. **TypeScript** — safer code and shared data types.
3. **tRPC + Express** — backend API.
4. **MongoDB Atlas** — cultural-record database.
5. **Google Maps** — location-based discovery.

## References

[1]: https://react.dev/ "React documentation"
[2]: https://www.typescriptlang.org/docs/ "TypeScript documentation"
[3]: https://trpc.io/docs "tRPC documentation"
[4]: https://expressjs.com/ "Express documentation"
[5]: https://www.mongodb.com/docs/atlas/ "MongoDB Atlas documentation"
[6]: https://developers.google.com/maps/documentation/javascript "Google Maps JavaScript API documentation"
