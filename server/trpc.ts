import { initTRPC } from "@trpc/server";
import superjson from "superjson";

// The public culture API has no login or session state. Keeping its context
// empty makes the Render service easy to explain and deploy.
const t = initTRPC.context<Record<string, never>>().create({ transformer: superjson });

export const router = t.router;
export const publicProcedure = t.procedure;
