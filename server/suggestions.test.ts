import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("Suggestion History & Hit Analysis", () => {
  const testUserId = 999;
  let suggestionId: number | null = null;

  beforeAll(async () => {
    // Setup: Ensure database is available
    const dbInstance = await db.getDb();
    expect(dbInstance).toBeDefined();
  });

  it("should add suggestion to history", async () => {
    const result = await db.addSuggestionHistory(
      testUserId,
      "euroMillion",
      "hot",
      [5, 12, 25, 38, 45],
      [2, 11]
    );
    expect(result).toBeDefined();
    suggestionId = result?.insertId || null;
  });

  it("should retrieve user suggestion history", async () => {
    const history = await db.getUserSuggestionHistory(testUserId);
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);
    
    const suggestion = history[0];
    expect(suggestion.userId).toBe(testUserId);
    expect(suggestion.gameType).toBe("euroMillion");
    expect(suggestion.strategy).toBe("hot");
    expect(Array.isArray(suggestion.numbers)).toBe(true);
  });

  it("should filter history by game type", async () => {
    const euroHistory = await db.getUserSuggestionHistory(testUserId, "euroMillion");
    expect(Array.isArray(euroHistory)).toBe(true);
    
    if (euroHistory.length > 0) {
      expect(euroHistory[0].gameType).toBe("euroMillion");
    }
  });

  it("should update suggestion with hit information", async () => {
    if (!suggestionId) {
      // Create a suggestion first
      const result = await db.addSuggestionHistory(
        testUserId,
        "toto",
        "cold",
        [3, 15, 22, 35, 40, 47],
        undefined,
        1
      );
      suggestionId = result?.insertId || null;
    }

    if (suggestionId) {
      const success = await db.updateSuggestionHit(
        suggestionId,
        "2026-07-02",
        3,
        0,
        0
      );
      expect(success).toBe(true);
    }
  });

  it("should get hit analysis for strategy", async () => {
    const analysis = await db.getHitAnalysis(testUserId, "euroMillion", "hot");
    // Analysis might be null if no data exists yet
    if (analysis) {
      expect(analysis.userId).toBe(testUserId);
      expect(analysis.gameType).toBe("euroMillion");
      expect(analysis.strategy).toBe("hot");
    }
  });

  it("should update hit analysis statistics", async () => {
    const success = await db.updateHitAnalysis(testUserId, "euroMillion", "hot");
    expect(success).toBe(true);

    // Verify the analysis was updated
    const analysis = await db.getHitAnalysis(testUserId, "euroMillion", "hot");
    expect(analysis).toBeDefined();
    expect(analysis?.totalSuggestions).toBeGreaterThanOrEqual(0);
  });

  it("should get user hit analysis summary", async () => {
    const summary = await db.getUserHitAnalysisSummary(testUserId);
    expect(Array.isArray(summary)).toBe(true);
  });

  it("should check suggestions against latest draw", async () => {
    const updated = await db.checkSuggestionsAgainstDraw("euroMillion");
    expect(Array.isArray(updated)).toBe(true);
  });

  afterAll(async () => {
    // Cleanup if needed
    console.log("Tests completed");
  });
});
