export type Direction = "long" | "short";
export type Outcome = "win" | "loss" | "breakeven";

export function calcPointsPnl(
  entry: number,
  exit: number,
  direction: Direction
): number {
  return direction === "long" ? exit - entry : entry - exit;
}

export function calcGrossPnl(
  pointsPnl: number,
  lotSize: number,
  valuePerPoint: number
): number {
  return pointsPnl * lotSize * valuePerPoint;
}

export function calcNetPnl(grossPnl: number, fees: number): number {
  return grossPnl - fees;
}

export function calcRiskPoints(
  entry: number,
  stopLoss: number | null | undefined,
  direction: Direction
): number | null {
  if (stopLoss == null) return null;
  const risk = direction === "long" ? entry - stopLoss : stopLoss - entry;
  return risk > 0 ? risk : null;
}

export function calcRMultiple(
  pointsPnl: number,
  riskPoints: number | null
): number | null {
  if (riskPoints == null || riskPoints === 0) return null;
  return pointsPnl / riskPoints;
}

export function calcOutcome(netPnl: number): Outcome {
  if (netPnl > 0) return "win";
  if (netPnl < 0) return "loss";
  return "breakeven";
}

export interface TradePnl {
  pointsPnl: number;
  grossPnl: number;
  netPnl: number;
  riskPoints: number | null;
  rMultiple: number | null;
  outcome: Outcome;
}

export function calcTradePnl(params: {
  entry: number;
  exit: number;
  direction: Direction;
  lotSize: number;
  valuePerPoint: number;
  fees: number;
  stopLoss?: number | null;
}): TradePnl {
  const pointsPnl = calcPointsPnl(params.entry, params.exit, params.direction);
  const grossPnl = calcGrossPnl(pointsPnl, params.lotSize, params.valuePerPoint);
  const netPnl = calcNetPnl(grossPnl, params.fees);
  const riskPoints = calcRiskPoints(params.entry, params.stopLoss, params.direction);
  const rMultiple = calcRMultiple(pointsPnl, riskPoints);
  const outcome = calcOutcome(netPnl);

  return { pointsPnl, grossPnl, netPnl, riskPoints, rMultiple, outcome };
}
