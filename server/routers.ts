import { z } from "zod";
import { cultureCategories } from "../shared/culture";
import { listApprovedCultureRecords } from "./cultureRepository";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  // Visitors can browse approved records only. New entries are added directly
  // to MongoDB Atlas, then appear here without a code deployment.
  culture: router({
    list: publicProcedure
      .input(
        z
          .object({
            category: z.enum(cultureCategories).optional(),
            region: z.string().trim().min(1).max(80).optional(),
            query: z.string().trim().min(1).max(120).optional(),
            limit: z.number().int().min(1).max(250).optional(),
          })
          .optional(),
      )
      .query(({ input }) => listApprovedCultureRecords(input)),
  }),
});

export type AppRouter = typeof appRouter;
