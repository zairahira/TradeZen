import { db } from "./db/client";
import { trades, instruments } from "./db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { calcTradePnl } from "./trade-math";
import { TIME_OF_DAY_BUCKETS } from "./constants";

export interface TradeWithComputed {
  id: number;
  instrumentId: number;
  symbol: string;
  instrumentName: string;
  valuePerPoint: number;
  currency: string;
  direction: "long" | "short";
  tradeDate: string;
  entryTime: string | null;
  entryPrice: number;
  exitTime: string | null;
  exitPrice: number;
  lotSize: number;
  stopLoss: number | null;
  takeProfit: number | null;
  fees: number;
  setup: string | null;
  followedPlan: boolean;
  preEmotion: "calm" | "confident" | "anxious" | "fomo" | "revenge" | "greedy" | "fearful" | "bored" | "tilted";
  confidence: number;
  reflection: string | null;
  notes: string | null;
  screenshotPath: string | null;
  createdAt: string;
  pointsPnl: number;
  grossPnl: number;
  netPnl: number;
  riskPoints: number | null;
  rMultiple: number | null;
  outcome: "win" | "loss" | "breakeven";
}

export interface FilterParams {
  emotions?: string[];
  setups?: string[];
  symbols?: string[];
  outcomes?: string[];
  followedPlan?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export async function getTradesWithComputed(
  filters?: FilterParams
): Promise<TradeWithComputed[]> {
  const rows = await db
    .select({
      trade: trades,
      instrument: instruments,
    })
    .from(trades)
    .innerJoin(instruments, eq(trades.instrumentId, instruments.id));

  let result = rows.map(({ trade, instrument }) => {
    const pnl = calcTradePnl({
      entry: trade.entryPrice,
      exit: trade.exitPrice,
      direction: trade.direction,
      lotSize: trade.lotSize,
      valuePerPoint: instrument.valuePerPoint,
      fees: trade.fees,
      stopLoss: trade.stopLoss,
    });

    return {
      ...trade,
      preEmotion: trade.preEmotion as TradeWithComputed["preEmotion"],
      symbol: instrument.symbol,
      instrumentName: instrument.name,
      valuePerPoint: instrument.valuePerPoint,
      currency: instrument.currency,
      ...pnl,
    } as TradeWithComputed;
  });

  if (filters) {
    if (filters.emotions?.length) {
      result = result.filter((t) => filters.emotions!.includes(t.preEmotion));
    }
    if (filters.setups?.length) {
      result = result.filter((t) => t.setup && filters.setups!.includes(t.setup));
    }
    if (filters.symbols?.length) {
      result = result.filter((t) => filters.symbols!.includes(t.symbol));
    }
    if (filters.outcomes?.length) {
      result = result.filter((t) => filters.outcomes!.includes(t.outcome));
    }
    if (filters.followedPlan !== undefined) {
      result = result.filter((t) => t.followedPlan === filters.followedPlan);
    }
    if (filters.dateFrom) {
      result = result.filter((t) => t.tradeDate >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      result = result.filter((t) => t.tradeDate <= filters.dateTo!);
    }
  }

  return result.sort((a, b) => {
    if (b.tradeDate !== a.tradeDate) return b.tradeDate.localeCompare(a.tradeDate);
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function getTradeById(id: number): Promise<TradeWithComputed | null> {
  const all = await getTradesWithComputed();
  return all.find((t) => t.id === id) ?? null;
}

export interface DashboardStats {
  totalPnl: number;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  avgR: number | null;
  bestDay: { date: string; pnl: number } | null;
  worstDay: { date: string; pnl: number } | null;
  equityCurve: { date: string; cumPnl: number }[];
  byEmotion: { emotion: string; winRate: number; avgPnl: number; count: number }[];
  bySetup: { setup: string; winRate: number; avgPnl: number; count: number }[];
  byTimeOfDay: { bucket: string; winRate: number; avgPnl: number; count: number }[];
  rDistribution: { bucket: string; count: number }[];
}

export async function getDashboardStats(
  filters?: FilterParams
): Promise<DashboardStats> {
  const allTrades = await getTradesWithComputed(filters);

  const totalPnl = allTrades.reduce((s, t) => s + t.netPnl, 0);
  const totalTrades = allTrades.length;
  const wins = allTrades.filter((t) => t.outcome === "win");
  const losses = allTrades.filter((t) => t.outcome === "loss");
  const winRate = totalTrades > 0 ? wins.length / totalTrades : 0;

  const grossWins = wins.reduce((s, t) => s + t.netPnl, 0);
  const grossLosses = Math.abs(losses.reduce((s, t) => s + t.netPnl, 0));
  const profitFactor = grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? Infinity : 0;

  const rValues = allTrades.filter((t) => t.rMultiple != null).map((t) => t.rMultiple!);
  const avgR = rValues.length > 0 ? rValues.reduce((s, r) => s + r, 0) / rValues.length : null;

  // Best/worst day
  const byDay: Record<string, number> = {};
  for (const t of allTrades) {
    byDay[t.tradeDate] = (byDay[t.tradeDate] ?? 0) + t.netPnl;
  }
  const days = Object.entries(byDay).map(([date, pnl]) => ({ date, pnl }));
  const bestDay = days.length > 0 ? days.reduce((a, b) => (b.pnl > a.pnl ? b : a)) : null;
  const worstDay = days.length > 0 ? days.reduce((a, b) => (b.pnl < a.pnl ? b : a)) : null;

  // Equity curve
  const sorted = [...allTrades].sort((a, b) => a.tradeDate.localeCompare(b.tradeDate));
  let cum = 0;
  const equityCurve: { date: string; cumPnl: number }[] = [];
  for (const t of sorted) {
    cum += t.netPnl;
    const last = equityCurve[equityCurve.length - 1];
    if (last?.date === t.tradeDate) {
      last.cumPnl = cum;
    } else {
      equityCurve.push({ date: t.tradeDate, cumPnl: cum });
    }
  }

  // By emotion
  const emotionMap: Record<string, TradeWithComputed[]> = {};
  for (const t of allTrades) {
    if (!emotionMap[t.preEmotion]) emotionMap[t.preEmotion] = [];
    emotionMap[t.preEmotion].push(t);
  }
  const byEmotion = Object.entries(emotionMap).map(([emotion, ts]) => ({
    emotion,
    winRate: ts.filter((t) => t.outcome === "win").length / ts.length,
    avgPnl: ts.reduce((s, t) => s + t.netPnl, 0) / ts.length,
    count: ts.length,
  }));

  // By setup
  const setupMap: Record<string, TradeWithComputed[]> = {};
  for (const t of allTrades) {
    const key = t.setup || "Untagged";
    if (!setupMap[key]) setupMap[key] = [];
    setupMap[key].push(t);
  }
  const bySetup = Object.entries(setupMap).map(([setup, ts]) => ({
    setup,
    winRate: ts.filter((t) => t.outcome === "win").length / ts.length,
    avgPnl: ts.reduce((s, t) => s + t.netPnl, 0) / ts.length,
    count: ts.length,
  }));

  // By time of day
  const todMap: Record<string, TradeWithComputed[]> = {};
  for (const t of allTrades) {
    const time = t.entryTime ?? "00:00";
    const bucket =
      TIME_OF_DAY_BUCKETS.find((b) => time >= b.start && time <= b.end)?.label ?? "Unknown";
    if (!todMap[bucket]) todMap[bucket] = [];
    todMap[bucket].push(t);
  }
  const byTimeOfDay = Object.entries(todMap).map(([bucket, ts]) => ({
    bucket,
    winRate: ts.filter((t) => t.outcome === "win").length / ts.length,
    avgPnl: ts.reduce((s, t) => s + t.netPnl, 0) / ts.length,
    count: ts.length,
  }));

  // R distribution
  const rBuckets = [
    { label: "< -2R", min: -Infinity, max: -2 },
    { label: "-2R to -1R", min: -2, max: -1 },
    { label: "-1R to 0R", min: -1, max: 0 },
    { label: "0R to 1R", min: 0, max: 1 },
    { label: "1R to 2R", min: 1, max: 2 },
    { label: "> 2R", min: 2, max: Infinity },
  ];
  const rDistribution = rBuckets.map(({ label, min, max }) => ({
    bucket: label,
    count: allTrades.filter(
      (t) => t.rMultiple != null && t.rMultiple > min && t.rMultiple <= max
    ).length,
  }));

  return {
    totalPnl,
    totalTrades,
    winRate,
    profitFactor,
    avgR,
    bestDay,
    worstDay,
    equityCurve,
    byEmotion,
    bySetup,
    byTimeOfDay,
    rDistribution,
  };
}

export async function getInstruments() {
  return db.select().from(instruments).all();
}

export async function getMistakeTags() {
  const { mistakeTags } = await import("./db/schema");
  return db.select().from(mistakeTags).all();
}
