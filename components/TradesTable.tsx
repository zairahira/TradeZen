"use client";

import Link from "next/link";
import { format } from "date-fns";
import type { TradeWithComputed } from "@/lib/queries";
import { EMOTION_LABELS } from "@/lib/constants";

interface Props {
  trades: TradeWithComputed[];
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TradesTable({ trades }: Props) {
  if (trades.length === 0) {
    return (
      <div className="text-center py-16 text-[#444]">
        No trades yet.{" "}
        <Link href="/trades/new" className="text-blue-500 hover:underline">
          Add your first trade
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-[#555] text-xs uppercase tracking-wider border-b border-[#1a1a1a]">
            <th className="text-left py-2 pr-4">Date</th>
            <th className="text-left py-2 pr-4">Symbol</th>
            <th className="text-left py-2 pr-4">Dir</th>
            <th className="text-right py-2 pr-4">Entry</th>
            <th className="text-right py-2 pr-4">Exit</th>
            <th className="text-right py-2 pr-4">Lots</th>
            <th className="text-right py-2 pr-4">Net P&L</th>
            <th className="text-right py-2 pr-4">R</th>
            <th className="text-left py-2 pr-4">Emotion</th>
            <th className="text-left py-2 pr-4">Setup</th>
            <th className="text-left py-2 pr-4">Model</th>
            <th className="text-left py-2">Result</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr
              key={t.id}
              className="border-b border-[#111] hover:bg-[#111] transition-colors cursor-pointer"
              onClick={() => (window.location.href = `/trades/${t.id}`)}
            >
              <td className="py-2.5 pr-4 text-[#888] whitespace-nowrap">
                {format(new Date(t.tradeDate + "T00:00:00"), "MMM d, yy")}
              </td>
              <td className="py-2.5 pr-4 font-medium text-white">{t.symbol}</td>
              <td className="py-2.5 pr-4">
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    t.direction === "long"
                      ? "bg-emerald-900/30 text-emerald-400"
                      : "bg-red-900/30 text-red-400"
                  }`}
                >
                  {t.direction}
                </span>
              </td>
              <td className="py-2.5 pr-4 text-right text-[#aaa]">{t.entryPrice}</td>
              <td className="py-2.5 pr-4 text-right text-[#aaa]">{t.exitPrice}</td>
              <td className="py-2.5 pr-4 text-right text-[#aaa]">{t.lotSize}</td>
              <td className={`py-2.5 pr-4 text-right font-medium ${t.netPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {t.netPnl >= 0 ? "+" : ""}{fmt(t.netPnl)}
              </td>
              <td className={`py-2.5 pr-4 text-right ${t.rMultiple == null ? "text-[#444]" : t.rMultiple >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {t.rMultiple != null ? t.rMultiple.toFixed(2) + "R" : "-"}
              </td>
              <td className="py-2.5 pr-4 text-[#888]">
                {EMOTION_LABELS[t.preEmotion as keyof typeof EMOTION_LABELS] ?? t.preEmotion}
              </td>
              <td className="py-2.5 pr-4 text-[#666] text-xs">{t.setup ?? "-"}</td>
              <td className="py-2.5 pr-4 text-[#666] text-xs">{t.modelName ?? "-"}</td>
              <td className="py-2.5">
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                    t.outcome === "win"
                      ? "bg-emerald-900/30 text-emerald-400"
                      : t.outcome === "loss"
                      ? "bg-red-900/30 text-red-400"
                      : "bg-[#222] text-[#888]"
                  }`}
                >
                  {t.outcome}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
