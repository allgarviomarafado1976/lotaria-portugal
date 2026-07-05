import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("End-to-End Suggestion Flow", () => {
  const testUserId = 999;
  
  beforeAll(async () => {
    await db.getDb();
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

    it("should save suggestion to history", async () => {
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
      expect(typeof entry.numbers).toBe("object");
      expect(typeof entry.stars).toBe("object");
      expect(entry.numbers.every(n => typeof n === "number")).toBe(true);
      expect(entry.stars.every(s => typeof s === "number")).toBe(true);
    });
  });

  describe("Totoloto Suggestion Flow", () => {
    it("should generate hot strategy suggestion with valid numbers", async () => {
      const suggestion = await db.suggestTotoKey("hot");
      
      expect(suggestion).toBeDefined();
      expect(suggestion.numbers).toBeDefined();
      expect(suggestion.luckyNumber).toBeDefined();
      expect(suggestion.strategy).toBe("hot");
      
      // Validate numbers (Totoloto needs 6 numbers)
      expect(suggestion.numbers.length).toBe(6);
      expect(suggestion.numbers.every(n => n >= 1 && n <= 49)).toBe(true);
      expect(new Set(suggestion.numbers).size).toBe(6);
      
      // Validate lucky number
      expect(suggestion.luckyNumber).toBeGreaterThanOrEqual(1);
      expect(suggestion.luckyNumber).toBeLessThanOrEqual(13);
    });

    it("should save Totoloto suggestion to history", async () => {
      const suggestion = await db.suggestTotoKey("hot");
      
      const result = await db.addSuggestionHistory(
        testUserId,
        "toto",
        suggestion.strategy,
        suggestion.numbers,
        undefined,
        suggestion.luckyNumber
      );
      
      expect(result).toBeDefined();
    });

    it("should retrieve Totoloto suggestion from history", async () => {
      const suggestion = await db.suggestTotoKey("cold");
      await db.addSuggestionHistory(
        testUserId,
        "toto",
        suggestion.strategy,
        suggestion.numbers,
        undefined,
        suggestion.luckyNumber
      );
      
      const history = await db.getUserSuggestionHistory(testUserId, "toto");
      
      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      
      const entry = history.find(h => h.strategy === "cold");
      expect(entry).toBeDefined();
      expect(entry.gameType).toBe("toto");
      expect(entry.numbers.length).toBe(6);
      expect(entry.luckyNumber).toBeGreaterThanOrEqual(1);
      expect(entry.luckyNumber).toBeLessThanOrEqual(13);
    });
  });

  describe("Mixed Game History", () => {
    it("should retrieve only EuroMillion suggestions when filtered", async () => {
      // Add both types
      const euroSuggestion = await db.suggestEuroMillionKey("hot");
      const totoSuggestion = await db.suggestTotoKey("hot");
      
      await db.addSuggestionHistory(
        testUserId,
        "euroMillion",
        euroSuggestion.strategy,
        euroSuggestion.numbers,
        euroSuggestion.stars
      );
      
      await db.addSuggestionHistory(
        testUserId,
        "toto",
        totoSuggestion.strategy,
        totoSuggestion.numbers,
        undefined,
        totoSuggestion.luckyNumber
      );
      
      // Retrieve only EuroMillion
      const euroHistory = await db.getUserSuggestionHistory(testUserId, "euroMillion");
      expect(euroHistory.every(h => h.gameType === "euroMillion")).toBe(true);
      
      // Retrieve only Totoloto
      const totoHistory = await db.getUserSuggestionHistory(testUserId, "toto");
      expect(totoHistory.every(h => h.gameType === "toto")).toBe(true);
    });

    it("should retrieve all suggestions when no filter", async () => {
      const allHistory = await db.getUserSuggestionHistory(testUserId);
      
      expect(allHistory).toBeDefined();
      expect(Array.isArray(allHistory)).toBe(true);
      expect(allHistory.length).toBeGreaterThan(0);
    });
  });
});
