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
            hasWinner: draw?.hasWinner ? true : false,
          };
        }),

      getStatistics: publicProcedure.query(async () => {
        const [total, numberFreqs, starFreqs] = await Promise.all([
          db.getEuroMillionDrawsCount(),
          db.getEuroMillionNumberFrequencies(),
          db.getEuroMillionStarFrequencies(),
        ]);

        return {
          totalDraws: total,
          topNumbers: numberFreqs.slice(0, 5),
          bottomNumbers: numberFreqs.slice(-5).reverse(),
          topStars: starFreqs.slice(0, 2),
          bottomStars: starFreqs.slice(-2).reverse(),
        };
      }),

      suggestKey: publicProcedure
        .input(
          z.object({
            strategy: z.enum(["hot", "cold", "balanced"]),
          })
        )
        .query(async ({ input }) => {
          const [numberFreqs, starFreqs] = await Promise.all([
            db.getEuroMillionNumberFrequencies(),
            db.getEuroMillionStarFrequencies(),
          ]);

          let suggestedNumbers: number[];
          let suggestedStars: number[];

          if (input.strategy === "hot") {
            suggestedNumbers = numberFreqs.slice(0, 5).map((f) => f.number);
            suggestedStars = starFreqs.slice(0, 2).map((f) => f.number);
          } else if (input.strategy === "cold") {
            suggestedNumbers = numberFreqs.slice(-5).map((f) => f.number);
            suggestedStars = starFreqs.slice(-2).map((f) => f.number);
          } else {
            // balanced
            const top3 = numberFreqs.slice(0, 3).map((f) => f.number);
            const bottom2 = numberFreqs.slice(-2).map((f) => f.number);
            suggestedNumbers = [...top3, ...bottom2];
            suggestedStars = starFreqs.slice(0, 2).map((f) => f.number);
          }

          return {
            numbers: suggestedNumbers.sort((a, b) => a - b),
            stars: suggestedStars.sort((a, b) => a - b),
            strategy: input.strategy,
          };
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
            numbers: z.array(z.number().int().min(1).max(49)).length(6),
            luckyNumber: z.number().int().min(1).max(13),
          })
        )
        .query(async ({ input }) => {
          const draw = await db.checkTotoKey(input.numbers, input.luckyNumber);
          return {
            wasDrawn: draw !== null,
            drawnDate: draw?.date || null,
            hasWinner: draw?.hasWinner ? true : false,
          };
        }),

      getStatistics: publicProcedure.query(async () => {
        const [total, numberFreqs, luckyFreqs] = await Promise.all([
          db.getTotoDrawsCount(),
          db.getTotoNumberFrequencies(),
          db.getTotoLuckyNumberFrequencies(),
        ]);

        return {
          totalDraws: total,
          topNumbers: numberFreqs.slice(0, 6),
          bottomNumbers: numberFreqs.slice(-6).reverse(),
          topLuckyNumbers: luckyFreqs.slice(0, 3),
          bottomLuckyNumbers: luckyFreqs.slice(-3).reverse(),
        };
      }),

      suggestKey: publicProcedure
        .input(
          z.object({
            strategy: z.enum(["hot", "cold", "balanced"]),
          })
        )
        .query(async ({ input }) => {
          const [numberFreqs, luckyFreqs] = await Promise.all([
            db.getTotoNumberFrequencies(),
            db.getTotoLuckyNumberFrequencies(),
          ]);

          let suggestedNumbers: number[];
          let suggestedLucky: number;

          if (input.strategy === "hot") {
            suggestedNumbers = numberFreqs.slice(0, 6).map((f) => f.number);
            suggestedLucky = luckyFreqs[0]?.number || 1;
          } else if (input.strategy === "cold") {
            suggestedNumbers = numberFreqs.slice(-6).map((f) => f.number);
            suggestedLucky = luckyFreqs[luckyFreqs.length - 1]?.number || 13;
          } else {
            // balanced
            const top4 = numberFreqs.slice(0, 4).map((f) => f.number);
            const bottom2 = numberFreqs.slice(-2).map((f) => f.number);
            suggestedNumbers = [...top4, ...bottom2];
            suggestedLucky = luckyFreqs[Math.floor(luckyFreqs.length / 2)]?.number || 7;
          }

          return {
            numbers: suggestedNumbers.sort((a, b) => a - b),
            luckyNumber: suggestedLucky,
            strategy: input.strategy,
          };
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
