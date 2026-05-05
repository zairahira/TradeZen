import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const instruments = sqliteTable("instruments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  valuePerPoint: real("value_per_point").notNull().default(1.0),
  currency: text("currency").notNull().default("USD"),
});

export const trades = sqliteTable("trades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  instrumentId: integer("instrument_id")
    .notNull()
    .references(() => instruments.id),
  direction: text("direction", { enum: ["long", "short"] }).notNull(),
  tradeDate: text("trade_date").notNull(),
  entryTime: text("entry_time"),
  entryPrice: real("entry_price").notNull(),
  exitTime: text("exit_time"),
  exitPrice: real("exit_price").notNull(),
  lotSize: real("lot_size").notNull(),
  stopLoss: real("stop_loss"),
  takeProfit: real("take_profit"),
  fees: real("fees").notNull().default(0),
  setup: text("setup"),
  followedPlan: integer("followed_plan", { mode: "boolean" }).notNull().default(false),
  preEmotion: text("pre_emotion", {
    enum: ["calm", "confident", "anxious", "fomo", "revenge", "greedy", "fearful", "bored", "tilted"],
  }).notNull(),
  confidence: integer("confidence").notNull().default(3),
  reflection: text("reflection"),
  notes: text("notes"),
  screenshotPath: text("screenshot_path"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const mistakeTags = sqliteTable("mistake_tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

export const tradeMistakes = sqliteTable("trade_mistakes", {
  tradeId: integer("trade_id")
    .notNull()
    .references(() => trades.id, { onDelete: "cascade" }),
  mistakeTagId: integer("mistake_tag_id")
    .notNull()
    .references(() => mistakeTags.id),
});

export type Instrument = typeof instruments.$inferSelect;
export type NewInstrument = typeof instruments.$inferInsert;
export type Trade = typeof trades.$inferSelect;
export type NewTrade = typeof trades.$inferInsert;
export type MistakeTag = typeof mistakeTags.$inferSelect;
