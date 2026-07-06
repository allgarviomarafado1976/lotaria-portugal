import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";
import { suggestionHistory } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("End-to-End Suggestion Flow", () => {
  const testUserId = 999;
  
  beforeAll(async () => {
    const database = await db.getDb();
    if (database) {
      // Clean up test data before running tests
      await database.delete(suggestionHistory).where(eq(suggestionHistory.userId, testUserId));
    }
  });

  describe("EuroMillion Suggestion Flow", () => {
    it("should generate hot strategy suggestion with valid numbers", async () => {
      const suggestion = await db.suggestEuroMillionKey("hot");
      
      expect(suggestion).toBeDefined();
      expect(suggestion.numbers).toBeDefined();
      expect(suggestion.stars).toBeDefined();
      expect(suggestion.strategy).toBe("hot");
      
      // Validate numbers
      expect(suggestion.numbers.length).toBe(5);
      expect(suggestion.numbers.every(n => n >= 1 && n <= 50)).toBe(true);
      expect(new Set(suggestion.numbers).size).toBe(5); // All unique
      
      // Validate stars
      expect(suggestion.stars.length).toBe(2);
      expect(suggestion.stars.every(s => s >= 1 && s <= 12)).toBe(true);
      expect(new Set(suggestion.stars).size).toBe(2); // All unique
    });

    it("should generate cold strategy suggestion with valid numbers", async () => {
      const suggestion = await db.suggestEuroMillionKey("cold");
      
      expect(suggestion).toBeDefined();
      expect(suggestion.numbers.length).toBe(5);
      expect(suggestion.numbers.every(n => n >= 1 && n <= 50)).toBe(true);
      expect(new Set(suggestion.numbers).size).toBe(5);
      expect(suggestion.strategy).toBe("cold");
    });

    it("should generate balanced strategy suggestion with valid numbers", async () => {
      const suggestion = await db.suggestEuroMillionKey("balanced");
      
      expect(suggestion).toBeDefined();
      expect(suggestion.numbers.length).toBe(5);
      expect(suggestion.numbers.every(n => n >= 1 && n <= 50)).toBe(true);
      expect(new Set(suggestion.numbers).size).toBe(5);
      expect(suggestion.strategy).toBe("balanced");
    });

    it("should add suggestion to history", async () => {
      const suggestion = await db.suggestEuroMillionKey("hot");
      
      const result = await db.addSuggestionHistory(
        testUserId,
        "euroMillion",
        suggestion.strategy,
        suggestion.numbers,
        suggestion.stars
      );
      
      expect(result).toBeDefined();
    });

    it("should retrieve suggestion from history", async () => {
      // Clean up before test
      const database = await db.getDb();
      if (database) {
        await database.delete(suggestionHistory).where(eq(suggestionHistory.userId, testUserId));
      }
      
      // Add a suggestion first
      const suggestion = await db.suggestEuroMillionKey("cold");
      await db.addSuggestionHistory(
        testUserId,
        "euroMillion",
        suggestion.strategy,
        suggestion.numbers,
        suggestion.stars
      );
      
      // Retrieve history
      const history = await db.getUserSuggestionHistory(testUserId, "euroMillion");
      
      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      
      // Validate last entry
      const lastEntry = history[0];
      expect(lastEntry.gameType).toBe("euroMillion");
      expect(lastEntry.strategy).toBe("cold");
      expect(Array.isArray(lastEntry.numbers)).toBe(true);
      expect(lastEntry.numbers.length).toBe(5);
      expect(Array.isArray(lastEntry.stars)).toBe(true);
      expect(lastEntry.stars.length).toBe(2);
    });

    it("should parse JSON correctly in history", async () => {
      const suggestion = await db.suggestEuroMillionKey("balanced");
      await db.addSuggestionHistory(
        testUserId,
        "euroMillion",
        suggestion.strategy,
        suggestion.numbers,
        suggestion.stars
      );
      
      const history = await db.getUserSuggestionHistory(testUserId, "euroMillion");
      const entry = history.find(h => h.strategy === "balanced");
      
      expect(entry).toBeDefined();
      expect(Array.isArray(entry?.numbers)).toBe(true);
      expect(Array.isArray(entry?.stars)).toBe(true);
    });
  });

  describe("Totoloto Suggestion Flow", () => {
    it("should generate hot strategy suggestion with valid numbers", async () => {
      const suggestion = await db.suggestTotoKey("hot");
      
      expect(suggestion).toBeDefined();
      expect(suggestion.numbers).toBeDefined();
      expect(suggestion.luckyNumber).toBeDefined();
      expect(suggestion.strategy).toBe("hot");
      
      // Validate numbers
      expect(suggestion.numbers.length).toBe(6);
      expect(suggestion.numbers.every(n => n >= 1 && n <= 49)).toBe(true);
      expect(new Set(suggestion.numbers).size).toBe(6); // All unique
      
      // Validate lucky number
      expect(suggestion.luckyNumber).toBeGreaterThanOrEqual(0);
      expect(suggestion.luckyNumber).toBeLessThanOrEqual(9);
    });
  });
});
