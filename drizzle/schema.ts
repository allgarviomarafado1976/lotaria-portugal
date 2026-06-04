import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * EuroMilhões draws table
 * Format: 5 numbers (1-50) + 2 stars (1-12)
 */
export const euroMillionDraws = mysqlTable("euro_million_draws", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).unique().notNull(), // YYYY-MM-DD
  number1: int("number1").notNull(), // 1-50
  number2: int("number2").notNull(),
  number3: int("number3").notNull(),
  number4: int("number4").notNull(),
  number5: int("number5").notNull(),
  star1: int("star1").notNull(), // 1-12
  star2: int("star2").notNull(),
  hasWinner: int("hasWinner").default(0).notNull(), // 0 or 1
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EuroMillionDraw = typeof euroMillionDraws.$inferSelect;
export type InsertEuroMillionDraw = typeof euroMillionDraws.$inferInsert;

/**
 * Totoloto draws table
 * Format: 6 numbers (1-49) + 1 lucky number (1-13)
 */
export const totoDraws = mysqlTable("toto_draws", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).unique().notNull(), // YYYY-MM-DD
  number1: int("number1").notNull(), // 1-49
  number2: int("number2").notNull(),
  number3: int("number3").notNull(),
  number4: int("number4").notNull(),
  number5: int("number5").notNull(),
  number6: int("number6").notNull(),
  luckyNumber: int("luckyNumber").notNull(), // 1-13
  hasWinner: int("hasWinner").default(0).notNull(), // 0 or 1
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TotoDraw = typeof totoDraws.$inferSelect;
export type InsertTotoDraw = typeof totoDraws.$inferInsert;

// TODO: Add your tables here

/**
 * User favorites table - stores favorite numbers for each user
 */
export const userFavorites = mysqlTable("user_favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  gameType: mysqlEnum("gameType", ["euroMillion", "toto"]).notNull(),
  numbers: text("numbers").notNull(), // JSON array of numbers
  stars: text("stars"), // JSON array of stars (only for euroMillion)
  luckyNumber: int("luckyNumber"), // for toto
  name: varchar("name", { length: 255 }), // optional name for the set
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = typeof userFavorites.$inferInsert;

/**
 * Alerts table - tracks when favorite numbers are drawn
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  favoriteId: int("favoriteId").notNull(),
  gameType: mysqlEnum("gameType", ["euroMillion", "toto"]).notNull(),
  drawDate: varchar("drawDate", { length: 10 }).notNull(), // YYYY-MM-DD
  matchedNumbers: text("matchedNumbers").notNull(), // JSON array of matched numbers
  matchedStars: text("matchedStars"), // for euroMillion
  isRead: int("isRead").default(0).notNull(), // 0 or 1
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;
