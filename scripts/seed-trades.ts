import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { trades } from "../lib/db/schema";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "journal.db");
const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite);

const instruments = [
  { id: 1, symbol: "US100", valuePerPoint: 1 },
  { id: 2, symbol: "US30",  valuePerPoint: 1 },
  { id: 3, symbol: "GER40", valuePerPoint: 1 },
  { id: 4, symbol: "UK100", valuePerPoint: 1 },
  { id: 6, symbol: "US500", valuePerPoint: 1 },
];

const modelIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, null, null]; // null = no model tagged
type Emotion = "calm" | "confident" | "anxious" | "fomo" | "revenge" | "greedy" | "fearful" | "bored" | "tilted";
const emotions: Emotion[] = ["calm", "confident", "anxious", "fomo", "revenge", "greedy", "fearful", "bored", "tilted"];
const setups = ["Breakout", "Pullback", "Trend continuation", "Reversal", "FVG fill", "OB mitigation", "Liquidity sweep", "Gap fill", null];
const directions: ("long" | "short")[] = ["long", "short"];
const killZoneTimes = ["08:30", "09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00", "16:00"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randBetween(min: number, max: number, dp = 0) {
  const val = Math.random() * (max - min) + min;
  return Math.round(val * Math.pow(10, dp)) / Math.pow(10, dp);
}

// Generate dates spread over the last 60 days
function randomDate(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d.toISOString().split("T")[0];
}

const rows = [];

for (let i = 0; i < 50; i++) {
  const inst = pick(instruments);
  const direction = pick(directions);
  const emotion = pick(emotions);

  // Base price per instrument
  const basePrices: Record<number, number> = {
    1: 18500,  // US100
    2: 39000,  // US30
    3: 18200,  // GER40
    4: 8200,   // UK100
    6: 5200,   // US500
  };
  const base = basePrices[inst.id];

  const entry = randBetween(base * 0.99, base * 1.01, 1);

  // Stop is 20-80 points away
  const riskPoints = randBetween(20, 80, 1);
  const stopLoss = direction === "long"
    ? Math.round((entry - riskPoints) * 10) / 10
    : Math.round((entry + riskPoints) * 10) / 10;

  // Exit: biased toward winners for realistic data (~60% win rate)
  const isWinner = Math.random() < 0.60;
  const rMultiple = isWinner ? randBetween(0.8, 3.5, 2) : randBetween(-0.4, -1.8, 2);
  const pointsPnl = riskPoints * rMultiple;
  const exit = direction === "long"
    ? Math.round((entry + pointsPnl) * 10) / 10
    : Math.round((entry - pointsPnl) * 10) / 10;

  const lotSize = pick([0.5, 1, 1, 1, 2, 2, 3]);
  const fees = pick([0, 0, 2, 5, 10]);
  const entryTime = pick(killZoneTimes);
  const exitHour = parseInt(entryTime.split(":")[0]);
  const exitTime = `${exitHour + pick([0, 0, 1])}:${pick(["00", "15", "30", "45"])}`;

  rows.push({
    instrumentId: inst.id,
    direction,
    tradeDate: randomDate(60),
    entryTime,
    entryPrice: entry,
    exitTime,
    exitPrice: exit,
    lotSize,
    stopLoss,
    takeProfit: null,
    fees,
    setup: pick(setups),
    modelId: pick(modelIds),
    followedPlan: Math.random() > 0.3,
    preEmotion: emotion,
    confidence: 3,
    reflection: pick([
      "Waited for confirmation, good entry.",
      "Jumped in too early, should have waited for the FVG fill.",
      "Perfect execution, followed the model.",
      "Got stopped out on the wick, valid setup though.",
      "Moved stop to breakeven too soon.",
      "Held through drawdown, trusted the setup.",
      null,
      null,
    ]),
    notes: null,
    screenshotPath: null,
  });
}

db.insert(trades).values(rows).run();
console.log(`Inserted ${rows.length} dummy trades.`);
sqlite.close();
