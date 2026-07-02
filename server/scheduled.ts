import { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import * as db from "./db";

/**
 * Handler para atualizar sorteios e verificar sugestões contra o último sorteio
 * Chamado diariamente via cron job
 */
export async function handleScheduledUpdate(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    
    // Verificar se é uma chamada de cron
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    console.log(`[Scheduled] Starting update for taskUid: ${user.taskUid}`);

    // Atualizar sorteios de EuroMilhões
    console.log("[Scheduled] Checking EuroMilhões suggestions against latest draw...");
    const euroUpdated = await db.checkSuggestionsAgainstDraw("euroMillion");
    console.log(`[Scheduled] Updated ${euroUpdated.length} EuroMilhões suggestions`);

    // Atualizar sorteios de Totoloto
    console.log("[Scheduled] Checking Totoloto suggestions against latest draw...");
    const totoUpdated = await db.checkSuggestionsAgainstDraw("toto");
    console.log(`[Scheduled] Updated ${totoUpdated.length} Totoloto suggestions`);

    return res.json({
      ok: true,
      euroMillionUpdated: euroUpdated.length,
      totolotoUpdated: totoUpdated.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Scheduled] Error:", error);
    const err = error instanceof Error ? error : new Error(String(error));
    return res.status(500).json({
      error: err.message,
      stack: err.stack,
      context: {
        url: req.url,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

/**
 * Handler para verificar e atualizar análise de acertos para um utilizador
 * Pode ser chamado manualmente ou via cron
 */
export async function handleUpdateAnalysis(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    console.log(`[Scheduled] Updating analysis for taskUid: ${user.taskUid}`);

    const strategies = ["hot", "cold", "balanced"] as const;
    const gameTypes = ["euroMillion", "toto"] as const;

    let updateCount = 0;

    for (const gameType of gameTypes) {
      for (const strategy of strategies) {
        // Get all users with suggestions for this game/strategy
        const history = await db.getUserSuggestionHistory(user.id, gameType);
        const userSuggestions = history.filter((h) => h.strategy === strategy);

        if (userSuggestions.length > 0) {
          await db.updateHitAnalysis(user.id, gameType, strategy);
          updateCount++;
        }
      }
    }

    return res.json({
      ok: true,
      analysisUpdated: updateCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Scheduled] Analysis update error:", error);
    const err = error instanceof Error ? error : new Error(String(error));
    return res.status(500).json({
      error: err.message,
      stack: err.stack,
      context: {
        url: req.url,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
