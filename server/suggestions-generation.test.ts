import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Suggestion Generation & Analysis", () => {
  beforeAll(async () => {
    // Ensure database is initialized
    await db.getDb();
  });

  describe("EuroMillion Suggestions", () => {
    it("should generate hot strategy suggestions with valid numbers", async () => {
      const suggestion = await db.suggestEuroMillionKey("hot");
      
      expect(suggestion).toBeDefined();
      expect(suggestion.numbers).toHaveLength(5);
      expect(suggestion.stars).toHaveLength(2);
      expect(suggestion.strategy).toBe("hot");
      
      // Validate number ranges
      suggestion.numbers.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(50);
      });
      
      suggestion.stars.forEach((star) => {
        expect(star).toBeGreaterThanOrEqual(1);
        expect(star).toBeLessThanOrEqual(12);
      });
      
      // Numbers should be unique
      expect(new Set(suggestion.numbers).size).toBe(5);
      expect(new Set(suggestion.stars).size).toBe(2);
    });

    it("should generate cold strategy suggestions with valid numbers", async () => {
      const suggestion = await db.suggestEuroMillionKey("cold");
      
      expect(suggestion).toBeDefined();
      expect(suggestion.numbers).toHaveLength(5);
      expect(suggestion.stars).toHaveLength(2);
      expect(suggestion.strategy).toBe("cold");
      
      // Validate number ranges
      suggestion.numbers.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(50);
      });
    });

    it("should generate balanced strategy suggestions with valid numbers", async () => {
      const suggestion = await db.suggestEuroMillionKey("balanced");
      
      expect(suggestion).toBeDefined();
      expect(suggestion.numbers).toHaveLength(5);
      expect(suggestion.stars).toHaveLength(2);
      expect(suggestion.strategy).toBe("balanced");
      
      // Validate number ranges
      suggestion.numbers.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(50);
      });
    });

    it("should generate different suggestions for different strategies", async () => {
      const hot = await db.suggestEuroMillionKey("hot");
      const cold = await db.suggestEuroMillionKey("cold");
      const balanced = await db.suggestEuroMillionKey("balanced");
      
      // At least one should be different (statistically very likely)
      const allSame = 
        JSON.stringify(hot.numbers) === JSON.stringify(cold.numbers) &&
        JSON.stringify(cold.numbers) === JSON.stringify(balanced.numbers);
      
      expect(allSame).toBe(false);
    });
  });

  describe("Totoloto Suggestions", () => {
    it("should generate hot strategy suggestions with valid numbers", async () => {
      const suggestion = await db.suggestTotoKey("hot");
      
      expect(suggestion).toBeDefined();
      expect(suggestion.numbers).toHaveLength(6);
      expect(suggestion.luckyNumber).toBeDefined();
      expect(suggestion.strategy).toBe("hot");
      
      // Validate number ranges
      suggestion.numbers.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(49);
      });
      
      expect(suggestion.luckyNumber).toBeGreaterThanOrEqual(1);
      expect(suggestion.luckyNumber).toBeLessThanOrEqual(13);
      
      // Numbers should be unique
      expect(new Set(suggestion.numbers).size).toBe(6);
    });

    it("should generate cold strategy suggestions with valid numbers", async () => {
      const suggestion = await db.suggestTotoKey("cold");
      
      expect(suggestion).toBeDefined();
      expect(suggestion.numbers).toHaveLength(6);
      expect(suggestion.luckyNumber).toBeDefined();
      expect(suggestion.strategy).toBe("cold");
      
      // Validate number ranges
      suggestion.numbers.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(49);
      });
    });

    it("should generate balanced strategy suggestions with valid numbers", async () => {
      const suggestion = await db.suggestTotoKey("balanced");
      
      expect(suggestion).toBeDefined();
      expect(suggestion.numbers).toHaveLength(6);
      expect(suggestion.luckyNumber).toBeDefined();
      expect(suggestion.strategy).toBe("balanced");
      
      // Validate number ranges
      suggestion.numbers.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(49);
      });
    });

    it("should generate different suggestions for different strategies", async () => {
      const hot = await db.suggestTotoKey("hot");
      const cold = await db.suggestTotoKey("cold");
      const balanced = await db.suggestTotoKey("balanced");
      
      // At least one should be different (statistically very likely)
      const allSame = 
        JSON.stringify(hot.numbers) === JSON.stringify(cold.numbers) &&
        JSON.stringify(cold.numbers) === JSON.stringify(balanced.numbers);
      
      expect(allSame).toBe(false);
    });
  });

  describe("Number Analysis", () => {
    it("should provide EuroMillion number analysis", async () => {
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

    it("should provide EuroMillion star analysis", async () => {
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

    it("should provide Totoloto number analysis", async () => {
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

    it("should provide Totoloto lucky number analysis", async () => {
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
  });
});
