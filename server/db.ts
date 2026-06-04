import { eq, desc, and, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, euroMillionDraws, EuroMillionDraw, totoDraws, TotoDraw } from "../drizzle/schema";
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

// ==================== EuroMilhões Queries ====================

export async function getAllEuroMillionDraws(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(euroMillionDraws)
    .orderBy(desc(euroMillionDraws.date))
    .limit(limit)
    .offset(offset);
}

export async function getEuroMillionDrawsCount() {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db
    .select({ count: count() })
    .from(euroMillionDraws);
  
  return result[0]?.count || 0;
}

export async function checkEuroMillionKey(
  numbers: number[],
  stars: number[]
) {
  const db = await getDb();
  if (!db) return null;
  
  const [n1, n2, n3, n4, n5] = numbers.sort((a, b) => a - b);
  const [s1, s2] = stars.sort((a, b) => a - b);
  
  const result = await db
    .select()
    .from(euroMillionDraws)
    .where(
      and(
        eq(euroMillionDraws.number1, n1),
        eq(euroMillionDraws.number2, n2),
        eq(euroMillionDraws.number3, n3),
        eq(euroMillionDraws.number4, n4),
        eq(euroMillionDraws.number5, n5),
        eq(euroMillionDraws.star1, s1),
        eq(euroMillionDraws.star2, s2)
      )
    )
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getEuroMillionNumberFrequencies() {
  const db = await getDb();
  if (!db) return [];
  
  const draws = await db.select().from(euroMillionDraws);
  const frequencies: Record<number, number> = {};
  
  draws.forEach((draw) => {
    [draw.number1, draw.number2, draw.number3, draw.number4, draw.number5].forEach(
      (num) => {
        frequencies[num] = (frequencies[num] || 0) + 1;
      }
    );
  });
  
  return Object.entries(frequencies)
    .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
    .sort((a, b) => b.frequency - a.frequency);
}

export async function getEuroMillionStarFrequencies() {
  const db = await getDb();
  if (!db) return [];
  
  const draws = await db.select().from(euroMillionDraws);
  const frequencies: Record<number, number> = {};
  
  draws.forEach((draw) => {
    [draw.star1, draw.star2].forEach((star) => {
      frequencies[star] = (frequencies[star] || 0) + 1;
    });
  });
  
  return Object.entries(frequencies)
    .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
    .sort((a, b) => b.frequency - a.frequency);
}

// ==================== Totoloto Queries ====================

export async function getAllTotoDraws(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(totoDraws)
    .orderBy(desc(totoDraws.date))
    .limit(limit)
    .offset(offset);
}

export async function getTotoDrawsCount() {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db
    .select({ count: count() })
    .from(totoDraws);
  
  return result[0]?.count || 0;
}

export async function checkTotoKey(
  numbers: number[],
  luckyNumber: number
) {
  const db = await getDb();
  if (!db) return null;
  
  const [n1, n2, n3, n4, n5, n6] = numbers.sort((a, b) => a - b);
  
  const result = await db
    .select()
    .from(totoDraws)
    .where(
      and(
        eq(totoDraws.number1, n1),
        eq(totoDraws.number2, n2),
        eq(totoDraws.number3, n3),
        eq(totoDraws.number4, n4),
        eq(totoDraws.number5, n5),
        eq(totoDraws.number6, n6),
        eq(totoDraws.luckyNumber, luckyNumber)
      )
    )
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getTotoNumberFrequencies() {
  const db = await getDb();
  if (!db) return [];
  
  const draws = await db.select().from(totoDraws);
  const frequencies: Record<number, number> = {};
  
  draws.forEach((draw) => {
    [draw.number1, draw.number2, draw.number3, draw.number4, draw.number5, draw.number6].forEach(
      (num) => {
        frequencies[num] = (frequencies[num] || 0) + 1;
      }
    );
  });
  
  return Object.entries(frequencies)
    .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
    .sort((a, b) => b.frequency - a.frequency);
}

export async function getTotoLuckyNumberFrequencies() {
  const db = await getDb();
  if (!db) return [];
  
  const draws = await db.select().from(totoDraws);
  const frequencies: Record<number, number> = {};
  
  draws.forEach((draw) => {
    frequencies[draw.luckyNumber] = (frequencies[draw.luckyNumber] || 0) + 1;
  });
  
  return Object.entries(frequencies)
    .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
    .sort((a, b) => b.frequency - a.frequency);
}

// TODO: add feature queries here as your schema grows.
