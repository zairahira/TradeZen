"use client";

interface KpiStripProps {
  totalPnl: number;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  avgR: number | null;
  bestDay: { date: string; pnl: number } | null;
  worstDay: { date: string; pnl: number } | null;
}

function fmt(n: number, digits = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export default function KpiStrip({
  totalPnl,
  totalTrades,
  winRate,
  profitFactor,
  avgR,
  bestDay,
  worstDay,
}: KpiStripProps) {
  const kpis = [
    {
      label: "Net P&L",
      value: `${totalPnl >= 0 ? "+" : ""}${fmt(totalPnl)}`,
      color: totalPnl >= 0 ? "text-emerald-400" : "text-red-400",
    },
    { label: "Trades", value: totalTrades.toString(), color: "text-white" },
    {
      label: "Win Rate",
      value: `${fmt(winRate * 100, 1)}%`,
      color: winRate >= 0.5 ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "Profit Factor",
      value: isFinite(profitFactor) ? fmt(profitFactor) : "∞",
      color: profitFactor >= 1 ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "Avg R",
      value: avgR != null ? fmt(avgR) + "R" : "-",
      color: avgR != null && avgR >= 0 ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "Best Day",
      value: bestDay ? `+${fmt(bestDay.pnl)}` : "-",
      color: "text-emerald-400",
    },
    {
      label: "Worst Day",
      value: worstDay ? fmt(worstDay.pnl) : "-",
      color: "text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {kpis.map((k) => (
        <div key={k.label} className="bg-[#111] border border-[#222] rounded-lg p-4">
          <p className="text-[11px] text-[#666] uppercase tracking-wider mb-1">{k.label}</p>
          <p className={`text-xl font-semibold ${k.color}`}>{k.value}</p>
        </div>
      ))}
    </div>
  );
}
