import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { cultureCategories } from "../shared/culture";
import { getApprovedCultureRecordBySlug, listApprovedCultureRecords } from "./cultureRepository";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access is required." });
  }
  return next({ ctx });
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  culture: router({
    list: publicProcedure
      .input(
        z
          .object({
            category: z.enum(cultureCategories).optional(),
            region: z.string().trim().min(1).max(80).optional(),
            query: z.string().trim().min(1).max(120).optional(),
          })
          .optional(),
      )
      .query(({ input }) => listApprovedCultureRecords(input)),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string().trim().min(1).max(160) }))
      .query(async ({ input }) => {
        const record = await getApprovedCultureRecordBySlug(input.slug);
        if (!record) throw new TRPCError({ code: "NOT_FOUND", message: "Culture record not found." });
        return record;
      }),
    connectionStatus: adminProcedure.query(async () => {
      const { pingCultureDatabase } = await import("./mongodb");
      const { database } = await pingCultureDatabase();
      return { connected: true, database };
    }),
  }),

});

export type AppRouter = typeof appRouter;
