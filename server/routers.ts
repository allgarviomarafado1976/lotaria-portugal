import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
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

  lottery: router({
    euroMillion: router({
      getDraws: publicProcedure
        .input(
          z.object({
            page: z.number().int().positive().default(1),
            limit: z.number().int().positive().default(20),
          })
        )
        .query(async ({ input }) => {
          const offset = (input.page - 1) * input.limit;
          const [draws, total] = await Promise.all([
            db.getAllEuroMillionDraws(input.limit, offset),
            db.getEuroMillionDrawsCount(),
          ]);
          return { draws, total, page: input.page, limit: input.limit };
        }),

      checkKey: publicProcedure
        .input(
          z.object({
            numbers: z.array(z.number().int().min(1).max(50)).length(5),
            stars: z.array(z.number().int().min(1).max(12)).length(2),
          })
        )
        .query(async ({ input }) => {
          const draw = await db.checkEuroMillionKey(input.numbers, input.stars);
          return {
            wasDrawn: draw !== null,
            drawnDate: draw?.date || null,
          };
        }),

      getStatistics: publicProcedure.query(async () => {
        const stats = await db.getEuroMillionStatistics();
        return stats;
      }),

      suggestKey: publicProcedure
        .input(z.object({ strategy: z.enum(["hot", "cold", "balanced"]) }))
        .query(async ({ input }) => {
          const suggestion = await db.suggestEuroMillionKey(input.strategy);
          return suggestion;
        }),
    }),

    toto: router({
      getDraws: publicProcedure
        .input(
          z.object({
            page: z.number().int().positive().default(1),
            limit: z.number().int().positive().default(20),
          })
        )
        .query(async ({ input }) => {
          const offset = (input.page - 1) * input.limit;
          const [draws, total] = await Promise.all([
            db.getAllTotoDraws(input.limit, offset),
            db.getTotoDrawsCount(),
          ]);
          return { draws, total, page: input.page, limit: input.limit };
        }),

      checkKey: publicProcedure
        .input(
          z.object({
            numbers: z.array(z.number().int().min(1).max(50)).length(6),
            luckyNumber: z.number().int().min(0).max(9),
          })
        )
        .query(async ({ input }) => {
          const draw = await db.checkTotoKey(input.numbers, input.luckyNumber);
          return {
            wasDrawn: draw !== null,
            drawnDate: draw?.date || null,
          };
        }),

      getStatistics: publicProcedure.query(async () => {
        const stats = await db.getTotoStatistics();
        return stats;
      }),

      suggestKey: publicProcedure
        .input(z.object({ strategy: z.enum(["hot", "cold", "balanced"]) }))
        .query(async ({ input }) => {
          const suggestion = await db.suggestTotoKey(input.strategy);
          return suggestion;
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
