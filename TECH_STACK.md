# Technology Stack

> **Presentation version:** React shows the interface, tRPC connects it to the backend, Express runs the API, and MongoDB Atlas stores the cultural records.

| Area | Technology | Why it is used |
|---|---|---|
| Language | TypeScript | Makes data shapes and API calls easier to understand and safer to change. |
| Frontend | React 19 + Vite | Builds the fast, interactive map and search interface. |
| Styling | Tailwind CSS 4 | Creates a consistent responsive interface with minimal custom CSS. |
| Interaction | Lucide icons | Adds familiar, lightweight interface icons. |
| API | tRPC 11 + Express 4 | Provides typed frontend-to-backend calls in one TypeScript project. |
| Content database | MongoDB Atlas | Stores nested cultural records, locations, sources, and approval status. |
| Map | Built-in cultural atlas | Draws an India-focused map with record markers from stored coordinates. |
| Testing | Vitest | Checks filters, API setup, deployment configuration, and MongoDB access. |
| Build | pnpm, Vite, esbuild | Installs packages and creates frontend/server production builds. |
| Deployment | Vercel + Render | Vercel hosts the static frontend; Render hosts the public API. |

## Five technologies to remember

1. **React** — user interface.
2. **TypeScript** — safer code and shared data types.
3. **tRPC + Express** — backend API.
4. **MongoDB Atlas** — cultural-record database.
5. **Built-in cultural atlas** — location-based discovery without a browser map key.

## References

[1]: https://react.dev/ "React documentation"
[2]: https://www.typescriptlang.org/docs/ "TypeScript documentation"
[3]: https://trpc.io/docs "tRPC documentation"
[4]: https://expressjs.com/ "Express documentation"
[5]: https://www.mongodb.com/docs/atlas/ "MongoDB Atlas documentation"
