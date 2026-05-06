"use client";

import { useState } from "react";

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

const EXPLANATIONS: Record<string, string> = {
  "Net P&L": "Total profit or loss across all trades after fees. Gross P&L minus commissions and spreads paid.",
  "Win Rate": "Percentage of trades that closed profitable. 50% means half your trades were winners. Needs to be read alongside Profit Factor — a 40% win rate can still be profitable with large winners.",
  "Profit Factor": "Total gross profit divided by total gross loss. Above 1.0 means you're net profitable. 2.0 means you made $2 for every $1 lost. Below 1.0 means you're losing money overall.",
  "Avg R": "Average R-multiple across trades where a stop loss was set. R measures how much you made or lost relative to your risk on each trade. +1R means you made exactly what you risked. Aim for positive Avg R consistently.",
};

export default function KpiStrip({
  totalPnl,
  totalTrades,
  winRate,
  profitFactor,
  avgR,
  bestDay,
  worstDay,
}: KpiStripProps) {
  const [open, setOpen] = useState<string | null>(null);

  const kpis = [
    {
      label: "Net P&L",
      value: `${totalPnl >= 0 ? "+" : ""}${fmt(totalPnl)}`,
      color: totalPnl >= 0 ? "text-emerald-400" : "text-red-400",
    },
    { label: "Trades", value: totalTrades.toString(), color: "text-ink" },
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
      {kpis.map((k) => {
        const hasInfo = k.label in EXPLANATIONS;
        const isOpen = open === k.label;

        return (
          <div key={k.label} className="relative bg-card border border-line rounded-lg p-4">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-[11px] text-ink-3 uppercase tracking-wider">{k.label}</p>
              {hasInfo && (
                <button
                  onClick={() => setOpen(isOpen ? null : k.label)}
                  className="text-ink-4 hover:text-ink-2 transition-colors leading-none"
                  aria-label={`About ${k.label}`}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1" fill="none" />
                    <text x="6" y="9" textAnchor="middle" fontSize="7.5" fontWeight="600">?</text>
                  </svg>
                </button>
              )}
            </div>
            <p className={`text-xl font-semibold ${k.color}`}>{k.value}</p>

            {isOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpen(null)}
                />
                <div className="absolute z-20 top-full left-0 mt-2 w-64 bg-card-2 border border-line-strong rounded-lg p-3 shadow-xl text-xs text-ink-2 leading-relaxed">
                  <p className="font-medium text-ink mb-1">{k.label}</p>
                  {EXPLANATIONS[k.label]}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
