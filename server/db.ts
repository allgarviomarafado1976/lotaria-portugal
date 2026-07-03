import { eq, and, inArray, desc, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, euroMillionDraws, totoDraws, userFavorites, alerts, suggestionHistory, hitAnalysis, SuggestionHistory, InsertSuggestionHistory, HitAnalysis, InsertHitAnalysis } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// EuroMillion Functions
// ============================================================================

export async function getAllEuroMillionDraws(limit: number, offset: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(euroMillionDraws)
    .orderBy(desc(euroMillionDraws.date))
    .limit(limit)
    .offset(offset);
}

export async function getEuroMillionDrawsCount() {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ count: count() }).from(euroMillionDraws);
  return result[0]?.count || 0;
}

export async function checkEuroMillionKey(numbers: number[], stars: number[]) {
  const db = await getDb();
  if (!db) return null;

  const sortedNumbers = numbers.sort((a, b) => a - b);
  const sortedStars = stars.sort((a, b) => a - b);

  const draws = await db.select().from(euroMillionDraws);

  for (const draw of draws) {
    const drawNumbers = [draw.number1, draw.number2, draw.number3, draw.number4, draw.number5].sort((a, b) => a - b);
    const drawStars = [draw.star1, draw.star2].sort((a, b) => a - b);

    if (
      JSON.stringify(sortedNumbers) === JSON.stringify(drawNumbers) &&
      JSON.stringify(sortedStars) === JSON.stringify(drawStars)
    ) {
      return draw;
    }
  }

  return null;
}

export async function getEuroMillionStatistics() {
  const db = await getDb();
  if (!db) {
    return {
      totalDraws: 0,
      topNumbers: [],
      bottomNumbers: [],
      topStars: [],
      bottomStars: [],
    };
  }

  const draws = await db.select().from(euroMillionDraws);
  const totalDraws = draws.length;

  // Count frequency of each number
  const numberFreq: Record<number, number> = {};
  const starFreq: Record<number, number> = {};

  draws.forEach((draw) => {
    [draw.number1, draw.number2, draw.number3, draw.number4, draw.number5].forEach((num) => {
      numberFreq[num] = (numberFreq[num] || 0) + 1;
    });
    [draw.star1, draw.star2].forEach((star) => {
      starFreq[star] = (starFreq[star] || 0) + 1;
    });
  });

  const topNumbers = Object.entries(numberFreq)
    .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);

  const bottomNumbers = Object.entries(numberFreq)
    .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
    .sort((a, b) => a.frequency - b.frequency)
    .slice(0, 10);

  const topStars = Object.entries(starFreq)
    .map(([star, freq]) => ({ number: parseInt(star), frequency: freq }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  const bottomStars = Object.entries(starFreq)
    .map(([star, freq]) => ({ number: parseInt(star), frequency: freq }))
    .sort((a, b) => a.frequency - b.frequency)
    .slice(0, 5);

  return { totalDraws, topNumbers, bottomNumbers, topStars, bottomStars };
}

export async function suggestEuroMillionKey(strategy: "hot" | "cold" | "balanced") {
  const db = await getDb();
  
  const stats = await getEuroMillionStatistics();
  let suggestedNumbers: number[] = [];
  let suggestedStars: number[] = [];

  // If no data, generate random suggestions
  if (stats.totalDraws === 0) {
    const allNumbers = Array.from({ length: 50 }, (_, i) => i + 1);
    const allStars = Array.from({ length: 12 }, (_, i) => i + 1);
    
    // Shuffle and pick 5 random numbers
    suggestedNumbers = allNumbers.sort(() => Math.random() - 0.5).slice(0, 5).sort((a, b) => a - b);
    suggestedStars = allStars.sort(() => Math.random() - 0.5).slice(0, 2).sort((a, b) => a - b);
  } else if (strategy === "hot") {
    suggestedNumbers = stats.topNumbers.slice(0, 5).map((n) => n.number);
    suggestedStars = stats.topStars.slice(0, 2).map((s) => s.number);
  } else if (strategy === "cold") {
    suggestedNumbers = stats.bottomNumbers.slice(0, 5).map((n) => n.number);
    suggestedStars = stats.bottomStars.slice(0, 2).map((s) => s.number);
  } else {
    // Balanced: mix of hot and cold
    suggestedNumbers = [
      ...stats.topNumbers.slice(0, 3).map((n) => n.number),
      ...stats.bottomNumbers.slice(0, 2).map((n) => n.number),
    ];
    suggestedStars = [
      stats.topStars[0]?.number || 1,
      stats.bottomStars[0]?.number || 2,
    ];
  }

  return {
    numbers: suggestedNumbers.sort((a, b) => a - b),
    stars: suggestedStars.sort((a, b) => a - b),
    strategy,
  };
}

// ============================================================================
// Totoloto Functions
// ============================================================================

export async function getAllTotoDraws(limit: number, offset: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(totoDraws)
    .orderBy(desc(totoDraws.date))
    .limit(limit)
    .offset(offset);
}

export async function getTotoDrawsCount() {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ count: count() }).from(totoDraws);
  return result[0]?.count || 0;
}

export async function checkTotoKey(numbers: number[], luckyNumber: number) {
  const db = await getDb();
  if (!db) return null;

  const sortedNumbers = numbers.sort((a, b) => a - b);

  const draws = await db.select().from(totoDraws);

  for (const draw of draws) {
    const drawNumbers = [draw.number1, draw.number2, draw.number3, draw.number4, draw.number5, draw.number6].sort((a, b) => a - b);

    if (
      JSON.stringify(sortedNumbers) === JSON.stringify(drawNumbers) &&
      luckyNumber === draw.luckyNumber
    ) {
      return draw;
    }
  }

  return null;
}

export async function getTotoStatistics() {
  const db = await getDb();
  if (!db) {
    return {
      totalDraws: 0,
      topNumbers: [],
      bottomNumbers: [],
      topLuckyNumbers: [],
      bottomLuckyNumbers: [],
    };
  }

  const draws = await db.select().from(totoDraws);
  const totalDraws = draws.length;

  // Count frequency of each number
  const numberFreq: Record<number, number> = {};
  const luckyFreq: Record<number, number> = {};

  draws.forEach((draw) => {
    [draw.number1, draw.number2, draw.number3, draw.number4, draw.number5, draw.number6].forEach((num) => {
      numberFreq[num] = (numberFreq[num] || 0) + 1;
    });
    luckyFreq[draw.luckyNumber] = (luckyFreq[draw.luckyNumber] || 0) + 1;
  });

  const topNumbers = Object.entries(numberFreq)
    .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);

  const bottomNumbers = Object.entries(numberFreq)
    .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
    .sort((a, b) => a.frequency - b.frequency)
    .slice(0, 10);

  const topLuckyNumbers = Object.entries(luckyFreq)
    .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  const bottomLuckyNumbers = Object.entries(luckyFreq)
    .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
    .sort((a, b) => a.frequency - b.frequency)
    .slice(0, 5);

  return { totalDraws, topNumbers, bottomNumbers, topLuckyNumbers, bottomLuckyNumbers };
}

export async function suggestTotoKey(strategy: "hot" | "cold" | "balanced") {
  const db = await getDb();
  
  const stats = await getTotoStatistics();
  let suggestedNumbers: number[] = [];
  let suggestedLucky: number = 0;

  // If no data, generate random suggestions
  if (stats.totalDraws === 0) {
    const allNumbers = Array.from({ length: 49 }, (_, i) => i + 1);
    const allLucky = Array.from({ length: 13 }, (_, i) => i + 1);
    
    // Shuffle and pick 6 random numbers
    suggestedNumbers = allNumbers.sort(() => Math.random() - 0.5).slice(0, 6).sort((a, b) => a - b);
    suggestedLucky = allLucky[Math.floor(Math.random() * allLucky.length)];
  } else if (strategy === "hot") {
    suggestedNumbers = stats.topNumbers.slice(0, 6).map((n) => n.number);
    suggestedLucky = stats.topLuckyNumbers[0]?.number || 1;
  } else if (strategy === "cold") {
    suggestedNumbers = stats.bottomNumbers.slice(0, 6).map((n) => n.number);
    suggestedLucky = stats.bottomLuckyNumbers[0]?.number || 1;
  } else {
    // Balanced: mix of hot and cold
    suggestedNumbers = [
      ...stats.topNumbers.slice(0, 4).map((n) => n.number),
      ...stats.bottomNumbers.slice(0, 2).map((n) => n.number),
    ];
    suggestedLucky = stats.topLuckyNumbers[0]?.number || 1;
  }

  return {
    numbers: suggestedNumbers.sort((a, b) => a - b),
    luckyNumber: suggestedLucky,
    strategy,
  };
}


// ============================================================================
// Statistics by Period Functions
// ============================================================================

export async function getEuroMillionStatisticsByPeriod(months: number) {
  const db = await getDb();
  if (!db) {
    return {
      totalDraws: 0,
      topNumbers: [],
      bottomNumbers: [],
      topStars: [],
      bottomStars: [],
    };
  }

  const draws = await db.select().from(euroMillionDraws);

  // Filter by period
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);

  const filteredDraws = draws.filter((draw) => {
    const drawDate = new Date(draw.date);
    return drawDate >= cutoffDate;
  });

  // Count frequency of each number
  const numberFreq: Record<number, number> = {};
  const starFreq: Record<number, number> = {};

  filteredDraws.forEach((draw) => {
    [draw.number1, draw.number2, draw.number3, draw.number4, draw.number5].forEach((num) => {
      numberFreq[num] = (numberFreq[num] || 0) + 1;
    });
    [draw.star1, draw.star2].forEach((star) => {
      starFreq[star] = (starFreq[star] || 0) + 1;
    });
  });

  const topNumbers = Object.entries(numberFreq)
    .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);

  const bottomNumbers = Object.entries(numberFreq)
    .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
    .sort((a, b) => a.frequency - b.frequency)
    .slice(0, 10);

  const topStars = Object.entries(starFreq)
    .map(([star, freq]) => ({ number: parseInt(star), frequency: freq }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  const bottomStars = Object.entries(starFreq)
    .map(([star, freq]) => ({ number: parseInt(star), frequency: freq }))
    .sort((a, b) => a.frequency - b.frequency)
    .slice(0, 5);

  return { totalDraws: filteredDraws.length, topNumbers, bottomNumbers, topStars, bottomStars };
}

export async function getTotoStatisticsByPeriod(months: number) {
  const db = await getDb();
  if (!db) {
    return {
      totalDraws: 0,
      topNumbers: [],
      bottomNumbers: [],
      topLuckyNumbers: [],
      bottomLuckyNumbers: [],
    };
  }

  const draws = await db.select().from(totoDraws);

  // Filter by period
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);

  const filteredDraws = draws.filter((draw) => {
    const drawDate = new Date(draw.date);
    return drawDate >= cutoffDate;
  });

  // Count frequency of each number
  const numberFreq: Record<number, number> = {};
  const luckyFreq: Record<number, number> = {};

  filteredDraws.forEach((draw) => {
    [draw.number1, draw.number2, draw.number3, draw.number4, draw.number5, draw.number6].forEach((num) => {
      numberFreq[num] = (numberFreq[num] || 0) + 1;
    });
    luckyFreq[draw.luckyNumber] = (luckyFreq[draw.luckyNumber] || 0) + 1;
  });

  const topNumbers = Object.entries(numberFreq)
    .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);

  const bottomNumbers = Object.entries(numberFreq)
    .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
    .sort((a, b) => a.frequency - b.frequency)
    .slice(0, 10);

  const topLuckyNumbers = Object.entries(luckyFreq)
    .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  const bottomLuckyNumbers = Object.entries(luckyFreq)
    .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
    .sort((a, b) => a.frequency - b.frequency)
    .slice(0, 5);

  return { totalDraws: filteredDraws.length, topNumbers, bottomNumbers, topLuckyNumbers, bottomLuckyNumbers };
}


// ============================================================================
// Favorites Functions
// ============================================================================

export async function addFavorite(
  userId: number,
  gameType: "euroMillion" | "toto",
  numbers: number[],
  stars?: number[],
  luckyNumber?: number,
  name?: string
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(userFavorites).values({
      userId,
      gameType,
      numbers: JSON.stringify(numbers),
      stars: stars ? JSON.stringify(stars) : null,
      luckyNumber: luckyNumber || null,
      name: name || null,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to add favorite:", error);
    throw error;
  }
}

export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const favorites = await db.select().from(userFavorites).where(eq(userFavorites.userId, userId));
    return favorites.map((fav) => ({
      ...fav,
      numbers: JSON.parse(fav.numbers),
      stars: fav.stars ? JSON.parse(fav.stars) : undefined,
    }));
  } catch (error) {
    console.error("[Database] Failed to get favorites:", error);
    return [];
  }
}

export async function deleteFavorite(favoriteId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(userFavorites).where(eq(userFavorites.id, favoriteId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete favorite:", error);
    return false;
  }
}

export async function checkFavoritesAgainstDraw(gameType: "euroMillion" | "toto") {
  const db = await getDb();
  if (!db) return [];

  try {
    const favorites = await db.select().from(userFavorites).where(eq(userFavorites.gameType, gameType));
    const latestDraw = gameType === "euroMillion"
      ? await db.select().from(euroMillionDraws).orderBy(desc(euroMillionDraws.date)).limit(1)
      : await db.select().from(totoDraws).orderBy(desc(totoDraws.date)).limit(1);

    if (!latestDraw || latestDraw.length === 0) return [];

    const draw = latestDraw[0];
    const newAlerts = [];

    for (const fav of favorites) {
      const favNumbers = JSON.parse(fav.numbers);
      let matchedNumbers: number[] = [];
      let matchedStars: number[] = [];

      if (gameType === "euroMillion" && "star1" in draw) {
        const drawnNumbers = [draw.number1, draw.number2, draw.number3, draw.number4, draw.number5];
        const drawnStars = [draw.star1, draw.star2];
        const favStars = fav.stars ? JSON.parse(fav.stars) : [];

        matchedNumbers = favNumbers.filter((n: number) => drawnNumbers.includes(n));
        matchedStars = favStars.filter((s: number) => drawnStars.includes(s));
      } else if (gameType === "toto" && "luckyNumber" in draw) {
        const drawnNumbers = [draw.number1, draw.number2, draw.number3, draw.number4, draw.number5, draw.number6];
        matchedNumbers = favNumbers.filter((n: number) => drawnNumbers.includes(n));
      }

      if (matchedNumbers.length > 0 || matchedStars.length > 0) {
        const alertResult = await db.insert(alerts).values({
          userId: fav.userId,
          favoriteId: fav.id,
          gameType,
          drawDate: draw.date,
          matchedNumbers: JSON.stringify(matchedNumbers),
          matchedStars: matchedStars.length > 0 ? JSON.stringify(matchedStars) : null,
        });
        newAlerts.push(alertResult);
      }
    }

    return newAlerts;
  } catch (error) {
    console.error("[Database] Failed to check favorites:", error);
    return [];
  }
}

export async function getUserAlerts(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const userAlerts = await db.select().from(alerts).where(eq(alerts.userId, userId));
    return userAlerts.map((alert) => ({
      ...alert,
      matchedNumbers: JSON.parse(alert.matchedNumbers),
      matchedStars: alert.matchedStars ? JSON.parse(alert.matchedStars) : undefined,
    }));
  } catch (error) {
    console.error("[Database] Failed to get alerts:", error);
    return [];
  }
}

export async function markAlertAsRead(alertId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(alerts).set({ isRead: 1 }).where(eq(alerts.id, alertId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to mark alert as read:", error);
    return false;
  }
}


// ============================================================================
// Import Functions
// ============================================================================

// Dados históricos de EuroMilhões
const EUROMILLION_DATA = [
  { date: "2026-07-02", numbers: [4, 11, 23, 37, 44], stars: [3, 10] },
  { date: "2026-06-28", numbers: [6, 15, 29, 39, 46], stars: [1, 11] },
  { date: "2026-06-25", numbers: [2, 18, 31, 41, 48], stars: [5, 9] },
  { date: "2026-06-21", numbers: [7, 19, 26, 40, 50], stars: [2, 12] },
  { date: "2026-06-18", numbers: [3, 14, 28, 42, 47], stars: [4, 8] },
  { date: "2026-06-14", numbers: [8, 22, 33, 45, 49], stars: [6, 10] },
  { date: "2026-06-11", numbers: [1, 16, 30, 38, 43], stars: [2, 7] },
  { date: "2026-06-07", numbers: [9, 20, 27, 36, 44], stars: [1, 12] },
  { date: "2026-06-04", numbers: [5, 12, 25, 39, 46], stars: [3, 11] },
  { date: "2026-05-31", numbers: [10, 17, 32, 41, 48], stars: [5, 9] },
];

// Dados históricos de Totoloto
const TOTOLOTO_DATA = [
  { date: "2026-07-02", numbers: [4, 11, 23, 37, 44, 48], luckyNumber: 3 },
  { date: "2026-06-29", numbers: [6, 15, 29, 39, 46, 49], luckyNumber: 1 },
  { date: "2026-06-26", numbers: [2, 18, 31, 41, 45, 47], luckyNumber: 5 },
  { date: "2026-06-22", numbers: [7, 19, 26, 40, 43, 48], luckyNumber: 2 },
  { date: "2026-06-19", numbers: [3, 14, 28, 42, 46, 49], luckyNumber: 4 },
  { date: "2026-06-15", numbers: [8, 22, 33, 45, 47, 48], luckyNumber: 6 },
  { date: "2026-06-12", numbers: [1, 16, 30, 38, 43, 44], luckyNumber: 2 },
  { date: "2026-06-08", numbers: [9, 20, 27, 36, 44, 49], luckyNumber: 1 },
  { date: "2026-06-05", numbers: [5, 12, 25, 39, 46, 47], luckyNumber: 3 },
  { date: "2026-06-01", numbers: [10, 17, 32, 41, 45, 48], luckyNumber: 5 },
];

export async function importEuroMillionDraws() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    for (const draw of EUROMILLION_DATA) {
      const [n1, n2, n3, n4, n5] = draw.numbers.sort((a, b) => a - b);
      const [s1, s2] = draw.stars.sort((a, b) => a - b);

      await db.insert(euroMillionDraws).values({
        date: draw.date,
        number1: n1,
        number2: n2,
        number3: n3,
        number4: n4,
        number5: n5,
        star1: s1,
        star2: s2,
      }).onDuplicateKeyUpdate({
        set: {
          number1: n1,
          number2: n2,
          number3: n3,
          number4: n4,
          number5: n5,
          star1: s1,
          star2: s2,
        }
      });
    }
    console.log(`✅ ${EUROMILLION_DATA.length} sorteios de EuroMilhões importados`);
    return { success: true, count: EUROMILLION_DATA.length };
  } catch (error) {
    console.error("[Database] Failed to import EuroMillion draws:", error);
    throw error;
  }
}

export async function importTotolotoDraws() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    for (const draw of TOTOLOTO_DATA) {
      const [n1, n2, n3, n4, n5, n6] = draw.numbers.sort((a, b) => a - b);

      await db.insert(totoDraws).values({
        date: draw.date,
        number1: n1,
        number2: n2,
        number3: n3,
        number4: n4,
        number5: n5,
        number6: n6,
        luckyNumber: draw.luckyNumber,
      }).onDuplicateKeyUpdate({
        set: {
          number1: n1,
          number2: n2,
          number3: n3,
          number4: n4,
          number5: n5,
          number6: n6,
          luckyNumber: draw.luckyNumber,
        }
      });
    }
    console.log(`✅ ${TOTOLOTO_DATA.length} sorteios de Totoloto importados`);
    return { success: true, count: TOTOLOTO_DATA.length };
  } catch (error) {
    console.error("[Database] Failed to import Totoloto draws:", error);
    throw error;
  }
}


// ============================================================================
// Detailed Analysis Functions
// ============================================================================

export async function getEuroMillionNumberAnalysis() {
  const db = await getDb();
  if (!db) return [];

  try {
    const draws = await db.select().from(euroMillionDraws);
    const totalDraws = draws.length;

    if (totalDraws === 0) {
      // Return default analysis for all numbers
      return Array.from({ length: 50 }, (_, i) => ({
        number: i + 1,
        frequency: 0,
        probability: 0.1,
        trend: "neutral" as const,
      }));
    }

    const numberFreq: Record<number, number> = {};

    // Count frequency
    draws.forEach((draw) => {
      [draw.number1, draw.number2, draw.number3, draw.number4, draw.number5].forEach((num) => {
        numberFreq[num] = (numberFreq[num] || 0) + 1;
      });
    });

    // Calculate mean frequency
    const meanFrequency = Object.values(numberFreq).reduce((a, b) => a + b, 0) / 50;
    const stdDev = Math.sqrt(
      Object.values(numberFreq).reduce((sum, freq) => sum + Math.pow(freq - meanFrequency, 2), 0) / 50
    );

    // Build analysis for all numbers
    const analysis = Array.from({ length: 50 }, (_, i) => {
      const number = i + 1;
      const frequency = numberFreq[number] || 0;
      const probability = frequency / totalDraws;

      // Determine trend
      let trend: "hot" | "cold" | "neutral" = "neutral";
      if (frequency > meanFrequency + stdDev) {
        trend = "hot";
      } else if (frequency < meanFrequency - stdDev) {
        trend = "cold";
      }

      return { number, frequency, probability, trend };
    });

    return analysis;
  } catch (error) {
    console.error("[Database] Failed to get number analysis:", error);
    return [];
  }
}

export async function getEuroMillionStarAnalysis() {
  const db = await getDb();
  if (!db) return [];

  try {
    const draws = await db.select().from(euroMillionDraws);
    const totalDraws = draws.length;

    if (totalDraws === 0) {
      return Array.from({ length: 12 }, (_, i) => ({
        number: i + 1,
        frequency: 0,
        probability: 0.083,
        trend: "neutral" as const,
      }));
    }

    const starFreq: Record<number, number> = {};

    draws.forEach((draw) => {
      [draw.star1, draw.star2].forEach((star) => {
        starFreq[star] = (starFreq[star] || 0) + 1;
      });
    });

    const meanFrequency = Object.values(starFreq).reduce((a, b) => a + b, 0) / 12;
    const stdDev = Math.sqrt(
      Object.values(starFreq).reduce((sum, freq) => sum + Math.pow(freq - meanFrequency, 2), 0) / 12
    );

    const analysis = Array.from({ length: 12 }, (_, i) => {
      const number = i + 1;
      const frequency = starFreq[number] || 0;
      const probability = frequency / (totalDraws * 2); // 2 stars per draw

      let trend: "hot" | "cold" | "neutral" = "neutral";
      if (frequency > meanFrequency + stdDev) {
        trend = "hot";
      } else if (frequency < meanFrequency - stdDev) {
        trend = "cold";
      }

      return { number, frequency, probability, trend };
    });

    return analysis;
  } catch (error) {
    console.error("[Database] Failed to get star analysis:", error);
    return [];
  }
}

export async function getTotoNumberAnalysis() {
  const db = await getDb();
  if (!db) return [];

  try {
    const draws = await db.select().from(totoDraws);
    const totalDraws = draws.length;

    if (totalDraws === 0) {
      return Array.from({ length: 49 }, (_, i) => ({
        number: i + 1,
        frequency: 0,
        probability: 0.02,
        trend: "neutral" as const,
      }));
    }

    const numberFreq: Record<number, number> = {};

    draws.forEach((draw) => {
      [draw.number1, draw.number2, draw.number3, draw.number4, draw.number5, draw.number6].forEach((num) => {
        numberFreq[num] = (numberFreq[num] || 0) + 1;
      });
    });

    const meanFrequency = Object.values(numberFreq).reduce((a, b) => a + b, 0) / 49;
    const stdDev = Math.sqrt(
      Object.values(numberFreq).reduce((sum, freq) => sum + Math.pow(freq - meanFrequency, 2), 0) / 49
    );

    const analysis = Array.from({ length: 49 }, (_, i) => {
      const number = i + 1;
      const frequency = numberFreq[number] || 0;
      const probability = frequency / totalDraws;

      let trend: "hot" | "cold" | "neutral" = "neutral";
      if (frequency > meanFrequency + stdDev) {
        trend = "hot";
      } else if (frequency < meanFrequency - stdDev) {
        trend = "cold";
      }

      return { number, frequency, probability, trend };
    });

    return analysis;
  } catch (error) {
    console.error("[Database] Failed to get number analysis:", error);
    return [];
  }
}

export async function getTotoLuckyNumberAnalysis() {
  const db = await getDb();
  if (!db) return [];

  try {
    const draws = await db.select().from(totoDraws);
    const totalDraws = draws.length;

    if (totalDraws === 0) {
      return Array.from({ length: 13 }, (_, i) => ({
        number: i + 1,
        frequency: 0,
        probability: 0.077,
        trend: "neutral" as const,
      }));
    }

    const luckyFreq: Record<number, number> = {};

    draws.forEach((draw) => {
      luckyFreq[draw.luckyNumber] = (luckyFreq[draw.luckyNumber] || 0) + 1;
    });

    const meanFrequency = Object.values(luckyFreq).reduce((a, b) => a + b, 0) / 13;
    const stdDev = Math.sqrt(
      Object.values(luckyFreq).reduce((sum, freq) => sum + Math.pow(freq - meanFrequency, 2), 0) / 13
    );

    const analysis = Array.from({ length: 13 }, (_, i) => {
      const number = i + 1;
      const frequency = luckyFreq[number] || 0;
      const probability = frequency / totalDraws;

      let trend: "hot" | "cold" | "neutral" = "neutral";
      if (frequency > meanFrequency + stdDev) {
        trend = "hot";
      } else if (frequency < meanFrequency - stdDev) {
        trend = "cold";
      }

      return { number, frequency, probability, trend };
    });

    return analysis;
  } catch (error) {
    console.error("[Database] Failed to get lucky number analysis:", error);
    return [];
  }
}


// ============================================================================
// Suggestion History & Hit Analysis Functions
// ============================================================================

export async function addSuggestionHistory(
  userId: number,
  gameType: "euroMillion" | "toto",
  strategy: "hot" | "cold" | "balanced",
  numbers: number[],
  stars?: number[],
  luckyNumber?: number
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(suggestionHistory).values({
      userId,
      gameType,
      strategy,
      numbers: JSON.stringify(numbers),
      stars: stars ? JSON.stringify(stars) : null,
      luckyNumber: luckyNumber || null,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to add suggestion history:", error);
    throw error;
  }
}

export async function getUserSuggestionHistory(userId: number, gameType?: "euroMillion" | "toto") {
  const db = await getDb();
  if (!db) return [];

  try {
    let query = db.select().from(suggestionHistory).where(eq(suggestionHistory.userId, userId));
    
    if (gameType) {
      query = db.select().from(suggestionHistory).where(
        and(eq(suggestionHistory.userId, userId), eq(suggestionHistory.gameType, gameType))
      );
    }
    
    const history = await query.orderBy(desc(suggestionHistory.generatedAt));
    return history.map((item) => ({
      ...item,
      numbers: JSON.parse(item.numbers),
      stars: item.stars ? JSON.parse(item.stars) : undefined,
    }));
  } catch (error) {
    console.error("[Database] Failed to get suggestion history:", error);
    return [];
  }
}

export async function updateSuggestionHit(
  suggestionId: number,
  drawDate: string,
  matchedNumbers: number,
  matchedStars?: number,
  matchedLucky?: number
) {
  const db = await getDb();
  if (!db) return false;

  try {
    // Mark as hit=1 if there are any matches, otherwise hit=0 (but still mark as checked with drawDate)
    const isHit = matchedNumbers > 0 || (matchedStars && matchedStars > 0) || (matchedLucky && matchedLucky > 0) ? 1 : 0;
    
    await db.update(suggestionHistory)
      .set({
        drawDate,
        matchedNumbers,
        matchedStars: matchedStars || 0,
        matchedLucky: matchedLucky || 0,
        isHit,
        hitType: isHit ? "partial" : "none",
        updatedAt: new Date(),
      })
      .where(eq(suggestionHistory.id, suggestionId));
    
    return true;
  } catch (error) {
    console.error("[Database] Failed to update suggestion hit:", error);
    return false;
  }
}

export async function getHitAnalysis(
  userId: number,
  gameType: "euroMillion" | "toto",
  strategy: "hot" | "cold" | "balanced"
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(hitAnalysis).where(
      and(
        eq(hitAnalysis.userId, userId),
        eq(hitAnalysis.gameType, gameType),
        eq(hitAnalysis.strategy, strategy)
      )
    ).limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get hit analysis:", error);
    return null;
  }
}

export async function updateHitAnalysis(
  userId: number,
  gameType: "euroMillion" | "toto",
  strategy: "hot" | "cold" | "balanced"
) {
  const db = await getDb();
  if (!db) return false;

  try {
    // Get all suggestions for this user/game/strategy
    const suggestions = await db.select().from(suggestionHistory).where(
      and(
        eq(suggestionHistory.userId, userId),
        eq(suggestionHistory.gameType, gameType),
        eq(suggestionHistory.strategy, strategy)
      )
    );

    const totalSuggestions = suggestions.length;
    const totalHits = suggestions.filter((s) => s.isHit === 1).length;
    const accuracyRate = totalSuggestions > 0 ? `${Math.round((totalHits / totalSuggestions) * 100)}%` : "0%";
    
    // Calculate averages
    const totalMatchedNumbers = suggestions.reduce((sum, s) => sum + (s.matchedNumbers || 0), 0);
    const avgMatchedNumbers = totalSuggestions > 0 ? (totalMatchedNumbers / totalSuggestions).toFixed(2) : "0";
    
    const totalMatchedStars = suggestions.reduce((sum, s) => sum + (s.matchedStars || 0), 0);
    const avgMatchedStars = totalSuggestions > 0 ? (totalMatchedStars / totalSuggestions).toFixed(2) : "0";

    // Check if analysis exists
    const existing = await db.select().from(hitAnalysis).where(
      and(
        eq(hitAnalysis.userId, userId),
        eq(hitAnalysis.gameType, gameType),
        eq(hitAnalysis.strategy, strategy)
      )
    ).limit(1);

    if (existing.length > 0) {
      // Update existing
      await db.update(hitAnalysis)
        .set({
          totalSuggestions,
          totalHits,
          accuracyRate,
          avgMatchedNumbers,
          avgMatchedStars: gameType === "euroMillion" ? avgMatchedStars : undefined,
          lastUpdated: new Date(),
        })
        .where(
          and(
            eq(hitAnalysis.userId, userId),
            eq(hitAnalysis.gameType, gameType),
            eq(hitAnalysis.strategy, strategy)
          )
        );
    } else {
      // Create new
      await db.insert(hitAnalysis).values({
        userId,
        gameType,
        strategy,
        totalSuggestions,
        totalHits,
        accuracyRate,
        avgMatchedNumbers,
        avgMatchedStars: gameType === "euroMillion" ? avgMatchedStars : undefined,
      });
    }

    return true;
  } catch (error) {
    console.error("[Database] Failed to update hit analysis:", error);
    return false;
  }
}

export async function getUserHitAnalysisSummary(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const analysis = await db.select().from(hitAnalysis).where(eq(hitAnalysis.userId, userId));
    return analysis;
  } catch (error) {
    console.error("[Database] Failed to get hit analysis summary:", error);
    return [];
  }
}

export async function checkSuggestionsAgainstDraw(gameType: "euroMillion" | "toto") {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get the latest draw
    const latestDraw = gameType === "euroMillion"
      ? await db.select().from(euroMillionDraws).orderBy(desc(euroMillionDraws.date)).limit(1)
      : await db.select().from(totoDraws).orderBy(desc(totoDraws.date)).limit(1);

    if (!latestDraw || latestDraw.length === 0) return [];

    const draw = latestDraw[0];
    const drawDate = draw.date;

    // Get all unmatched suggestions for this game type
    const unmatched = await db.select().from(suggestionHistory).where(
      and(
        eq(suggestionHistory.gameType, gameType),
        eq(suggestionHistory.isHit, 0)
      )
    );

    const updatedSuggestions = [];

    for (const suggestion of unmatched) {
      const suggestedNumbers = JSON.parse(suggestion.numbers);
      let matchedNumbers = 0;
      let matchedStars = 0;
      let matchedLucky = 0;

      if (gameType === "euroMillion" && "star1" in draw) {
        const drawnNumbers = [draw.number1, draw.number2, draw.number3, draw.number4, draw.number5];
        const drawnStars = [draw.star1, draw.star2];
        const suggestedStars = suggestion.stars ? JSON.parse(suggestion.stars) : [];

        matchedNumbers = suggestedNumbers.filter((n: number) => drawnNumbers.includes(n)).length;
        matchedStars = suggestedStars.filter((s: number) => drawnStars.includes(s)).length;
      } else if (gameType === "toto" && "luckyNumber" in draw) {
        const drawnNumbers = [draw.number1, draw.number2, draw.number3, draw.number4, draw.number5, draw.number6];
        matchedNumbers = suggestedNumbers.filter((n: number) => drawnNumbers.includes(n)).length;
        matchedLucky = suggestion.luckyNumber === draw.luckyNumber ? 1 : 0;
      }

      // Always update, even if no matches (mark as checked)
      await updateSuggestionHit(suggestion.id, drawDate, matchedNumbers, matchedStars, matchedLucky);
      updatedSuggestions.push(suggestion.id);
      
      // Update hit analysis for this user/game/strategy
      await updateHitAnalysis(suggestion.userId, gameType, suggestion.strategy);
    }

    return updatedSuggestions;
  } catch (error) {
    console.error("[Database] Failed to check suggestions against draw:", error);
    return [];
  }
}
