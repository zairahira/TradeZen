export const EMOTIONS = [
  "calm",
  "confident",
  "anxious",
  "fomo",
  "revenge",
  "greedy",
  "fearful",
  "bored",
  "tilted",
] as const;

export type Emotion = (typeof EMOTIONS)[number];

export const EMOTION_LABELS: Record<Emotion, string> = {
  calm: "Calm",
  confident: "Confident",
  anxious: "Anxious",
  fomo: "FOMO",
  revenge: "Revenge",
  greedy: "Greedy",
  fearful: "Fearful",
  bored: "Bored",
  tilted: "Tilted",
};

export const SETUP_SUGGESTIONS = [
  "Breakout",
  "Pullback",
  "Trend continuation",
  "Reversal",
  "Range",
  "News play",
  "Gap fill",
  "Support/Resistance",
  "Moving average bounce",
  "VWAP reclaim",
];

export const MISTAKE_TAGS = [
  "Chased entry",
  "Moved stop",
  "Oversized",
  "No stop",
  "Early exit",
  "Late entry",
  "News ignored",
  "Overtraded",
  "Revenge trade",
  "Poor risk/reward",
];

export const DEFAULT_INSTRUMENTS = [
  { symbol: "US100", name: "Nasdaq 100", valuePerPoint: 1.0, currency: "USD" },
  { symbol: "US30", name: "Dow Jones 30", valuePerPoint: 1.0, currency: "USD" },
  { symbol: "GER40", name: "DAX 40", valuePerPoint: 1.0, currency: "EUR" },
  { symbol: "UK100", name: "FTSE 100", valuePerPoint: 1.0, currency: "GBP" },
  { symbol: "JPN225", name: "Nikkei 225", valuePerPoint: 1.0, currency: "JPY" },
  { symbol: "US500", name: "S&P 500", valuePerPoint: 1.0, currency: "USD" },
];

export const TIME_OF_DAY_BUCKETS = [
  { label: "Pre-market", start: "00:00", end: "09:29" },
  { label: "Morning", start: "09:30", end: "11:59" },
  { label: "Lunch", start: "12:00", end: "13:59" },
  { label: "Afternoon", start: "14:00", end: "23:59" },
];
