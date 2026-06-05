import { eq, and, inArray, desc, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, euroMillionDraws, totoDraws, userFavorites, alerts } from "../drizzle/schema";
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
