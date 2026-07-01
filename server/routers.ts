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

      getStatisticsByPeriod: publicProcedure
        .input(z.object({ months: z.number().int().positive().default(12) }))
        .query(async ({ input }) => {
          const stats = await db.getEuroMillionStatisticsByPeriod(input.months);
          return stats;
        }),

      getNumberAnalysis: publicProcedure.query(async () => {
        const analysis = await db.getEuroMillionNumberAnalysis();
        return analysis;
      }),

      getStarAnalysis: publicProcedure.query(async () => {
        const analysis = await db.getEuroMillionStarAnalysis();
        return analysis;
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

      getStatisticsByPeriod: publicProcedure
        .input(z.object({ months: z.number().int().positive().default(12) }))
        .query(async ({ input }) => {
          const stats = await db.getTotoStatisticsByPeriod(input.months);
          return stats;
        }),

      getNumberAnalysis: publicProcedure.query(async () => {
        const analysis = await db.getTotoNumberAnalysis();
        return analysis;
      }),

      getLuckyNumberAnalysis: publicProcedure.query(async () => {
        const analysis = await db.getTotoLuckyNumberAnalysis();
        return analysis;
      }),
    }),
  }),

  favorites: router({
    add: publicProcedure
      .input(
        z.object({
          gameType: z.enum(["euroMillion", "toto"]),
          numbers: z.array(z.number().int().positive()),
          stars: z.array(z.number().int().positive()).optional(),
          luckyNumber: z.number().int().positive().optional(),
          name: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Not authenticated");
        const result = await db.addFavorite(
          ctx.user.id,
          input.gameType,
          input.numbers,
          input.stars,
          input.luckyNumber,
          input.name
        );
        return result;
      }),

    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      return await db.getUserFavorites(ctx.user.id);
    }),

    delete: publicProcedure
      .input(z.object({ favoriteId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Not authenticated");
        return await db.deleteFavorite(input.favoriteId);
      }),

    getAlerts: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      return await db.getUserAlerts(ctx.user.id);
    }),

    markAlertAsRead: publicProcedure
      .input(z.object({ alertId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Not authenticated");
        return await db.markAlertAsRead(input.alertId);
      }),
  }),

  admin: router({
    importDraws: publicProcedure
      .input(
        z.object({
          game: z.enum(["euroMillion", "totoloto"]),
        })
      )
      .mutation(async ({ input }) => {
        try {
          if (input.game === "euroMillion") {
            await db.importEuroMillionDraws();
            return { success: true, message: "EuroMilhões importado com sucesso" };
          } else {
            await db.importTotolotoDraws();
            return { success: true, message: "Totoloto importado com sucesso" };
          }
        } catch (error) {
          return { success: false, message: error instanceof Error ? error.message : "Erro na importação" };
        }
      }),

    getImportStatus: publicProcedure.query(async () => {
      const euroCount = await db.getEuroMillionDrawsCount();
      const totoCount = await db.getTotoDrawsCount();
      return {
        euroMillion: euroCount,
        totoloto: totoCount,
        lastUpdated: new Date(),
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
