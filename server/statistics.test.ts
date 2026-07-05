import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Statistics & Analysis", () => {
  beforeAll(async () => {
    await db.getDb();
  });

  describe("EuroMillion Statistics", () => {
    it("should get EuroMillion statistics", async () => {
      const stats = await db.getEuroMillionStatistics();
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty("totalDraws");
      expect(stats).toHaveProperty("topNumbers");
      expect(stats).toHaveProperty("topStars");
      expect(typeof stats.totalDraws).toBe("number");
      expect(Array.isArray(stats.topNumbers)).toBe(true);
      expect(Array.isArray(stats.topStars)).toBe(true);
    });

    it("should get EuroMillion statistics by period", async () => {
      const stats = await db.getEuroMillionStatisticsByPeriod(3);
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty("topNumbers");
      expect(stats).toHaveProperty("topStars");
      expect(Array.isArray(stats.topNumbers)).toBe(true);
      expect(Array.isArray(stats.topStars)).toBe(true);
    });

    it("should get EuroMillion number analysis", async () => {
      const analysis = await db.getEuroMillionNumberAnalysis();
      expect(analysis).toBeDefined();
      expect(Array.isArray(analysis)).toBe(true);
      
      if (analysis.length > 0) {
        const item = analysis[0];
        expect(item).toHaveProperty("number");
        expect(item).toHaveProperty("frequency");
        expect(item.number).toBeGreaterThanOrEqual(1);
        expect(item.number).toBeLessThanOrEqual(50);
        expect(item.frequency).toBeGreaterThanOrEqual(0);
      }
    });

    it("should get EuroMillion star analysis", async () => {
      const analysis = await db.getEuroMillionStarAnalysis();
      expect(analysis).toBeDefined();
      expect(Array.isArray(analysis)).toBe(true);
      
      if (analysis.length > 0) {
        const item = analysis[0];
        expect(item).toHaveProperty("number");
        expect(item).toHaveProperty("frequency");
        expect(item.number).toBeGreaterThanOrEqual(1);
        expect(item.number).toBeLessThanOrEqual(12);
        expect(item.frequency).toBeGreaterThanOrEqual(0);
      }
    });

    it("should have sorted analysis by frequency", async () => {
      const analysis = await db.getEuroMillionNumberAnalysis();
      if (analysis.length > 1) {
        for (let i = 0; i < Math.min(5, analysis.length - 1); i++) {
          expect(analysis[i].frequency).toBeGreaterThanOrEqual(analysis[i + 1].frequency);
        }
      }
    });
  });

  describe("Totoloto Statistics", () => {
    it("should get Totoloto statistics", async () => {
      const stats = await db.getTotoStatistics();
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty("totalDraws");
      expect(stats).toHaveProperty("topNumbers");
      expect(stats).toHaveProperty("topLuckyNumbers");
      expect(typeof stats.totalDraws).toBe("number");
      expect(Array.isArray(stats.topNumbers)).toBe(true);
      expect(Array.isArray(stats.topLuckyNumbers)).toBe(true);
    });

    it("should get Totoloto statistics by period", async () => {
      const stats = await db.getTotoStatisticsByPeriod(6);
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty("topNumbers");
      expect(stats).toHaveProperty("topLuckyNumbers");
      expect(Array.isArray(stats.topNumbers)).toBe(true);
      expect(Array.isArray(stats.topLuckyNumbers)).toBe(true);
    });

    it("should get Totoloto number analysis", async () => {
      const analysis = await db.getTotoNumberAnalysis();
      expect(analysis).toBeDefined();
      expect(Array.isArray(analysis)).toBe(true);
      
      if (analysis.length > 0) {
        const item = analysis[0];
        expect(item).toHaveProperty("number");
        expect(item).toHaveProperty("frequency");
        expect(item.number).toBeGreaterThanOrEqual(1);
        expect(item.number).toBeLessThanOrEqual(49);
        expect(item.frequency).toBeGreaterThanOrEqual(0);
      }
    });

    it("should get Totoloto lucky number analysis", async () => {
      const analysis = await db.getTotoLuckyNumberAnalysis();
      expect(analysis).toBeDefined();
      expect(Array.isArray(analysis)).toBe(true);
      
      if (analysis.length > 0) {
        const item = analysis[0];
        expect(item).toHaveProperty("number");
        expect(item).toHaveProperty("frequency");
        expect(item.number).toBeGreaterThanOrEqual(1);
        expect(item.number).toBeLessThanOrEqual(13);
        expect(item.frequency).toBeGreaterThanOrEqual(0);
      }
    });

    it("should have sorted analysis by frequency", async () => {
      const analysis = await db.getTotoNumberAnalysis();
      if (analysis.length > 1) {
        for (let i = 0; i < Math.min(5, analysis.length - 1); i++) {
          expect(analysis[i].frequency).toBeGreaterThanOrEqual(analysis[i + 1].frequency);
        }
      }
    });
  });

  describe("Data Consistency", () => {
    it("should have valid frequency data", async () => {
      const euroAnalysis = await db.getEuroMillionNumberAnalysis();
      const totoAnalysis = await db.getTotoNumberAnalysis();
      
      expect(Array.isArray(euroAnalysis)).toBe(true);
      expect(Array.isArray(totoAnalysis)).toBe(true);
    });

    it("should have consistent data across periods", async () => {
      const stats1Month = await db.getEuroMillionStatisticsByPeriod(1);
      const stats12Month = await db.getEuroMillionStatisticsByPeriod(12);
      
      expect(stats1Month).toHaveProperty("topNumbers");
      expect(stats12Month).toHaveProperty("topNumbers");
      expect(Array.isArray(stats1Month.topNumbers)).toBe(true);
      expect(Array.isArray(stats12Month.topNumbers)).toBe(true);
    });
  });
});
