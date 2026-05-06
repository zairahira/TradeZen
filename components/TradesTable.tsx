"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { TradeWithComputed } from "@/lib/queries";
import type { Instrument, TradingModel } from "@/lib/db/schema";
import { EMOTION_LABELS } from "@/lib/constants";
import { bulkDeleteTrades } from "@/app/actions/trades";
import TradeDrawer from "./TradeDrawer";

interface Props {
  trades: TradeWithComputed[];
  instruments: Instrument[];
  models: TradingModel[];
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TradesTable({ trades, instruments, models }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [editTrade, setEditTrade] = useState<TradeWithComputed | null>(null);
  const router = useRouter();

  const allSelected = trades.length > 0 && selected.size === trades.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(trades.map((t) => t.id)));
    }
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleDeleteSelected() {
    if (!confirm(`Delete ${selected.size} trade${selected.size > 1 ? "s" : ""}? This cannot be undone.`)) return;
    startTransition(async () => {
      await bulkDeleteTrades(Array.from(selected));
      setSelected(new Set());
      router.refresh();
    });
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-16 text-ink-4">
        No trades match your filters.{" "}
        <button
          onClick={() => router.push("/trades")}
          className="text-blue-500 hover:underline cursor-pointer"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {selected.size > 0 && (
          <div className="flex items-center gap-3 bg-card-2 border border-line rounded-lg px-4 py-2">
            <span className="text-sm text-ink-2">
              {selected.size} trade{selected.size > 1 ? "s" : ""} selected
            </span>
            <button
              onClick={handleDeleteSelected}
              disabled={isPending}
              className="ml-auto text-xs text-red-400 hover:text-red-300 border border-red-900/50 hover:border-red-700 px-3 py-1.5 rounded transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Deleting..." : `Delete ${selected.size}`}
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs text-ink-4 hover:text-ink-2 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-ink-4 text-xs uppercase tracking-wider border-b border-line">
                <th className="py-2 pr-3 w-8">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 accent-blue-500 cursor-pointer"
                  />
                </th>
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
              {trades.map((t) => {
                const isSelected = selected.has(t.id);
                return (
                  <tr
                    key={t.id}
                    className={`border-b border-line transition-colors cursor-pointer ${
                      isSelected ? "bg-blue-950/30" : "hover:bg-card-2"
                    }`}
                  >
                    <td className="py-2.5 pr-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(t.id)}
                        className="w-3.5 h-3.5 accent-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 pr-4 text-ink-3 whitespace-nowrap" onClick={() => setEditTrade(t)}>
                      {format(new Date(t.tradeDate + "T00:00:00"), "MMM d, yy")}
                    </td>
                    <td className="py-2.5 pr-4 font-medium text-ink" onClick={() => setEditTrade(t)}>
                      {t.symbol}
                    </td>
                    <td className="py-2.5 pr-4" onClick={() => setEditTrade(t)}>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${t.direction === "long" ? "bg-emerald-900/30 text-emerald-400" : "bg-red-900/30 text-red-400"}`}>
                        {t.direction}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right text-ink-2" onClick={() => setEditTrade(t)}>{t.entryPrice}</td>
                    <td className="py-2.5 pr-4 text-right text-ink-2" onClick={() => setEditTrade(t)}>{t.exitPrice}</td>
                    <td className="py-2.5 pr-4 text-right text-ink-2" onClick={() => setEditTrade(t)}>{t.lotSize}</td>
                    <td className={`py-2.5 pr-4 text-right font-medium ${t.netPnl >= 0 ? "text-emerald-400" : "text-red-400"}`} onClick={() => setEditTrade(t)}>
                      {t.netPnl >= 0 ? "+" : ""}{fmt(t.netPnl)}
                    </td>
                    <td className={`py-2.5 pr-4 text-right ${t.rMultiple == null ? "text-ink-4" : t.rMultiple >= 0 ? "text-emerald-400" : "text-red-400"}`} onClick={() => setEditTrade(t)}>
                      {t.rMultiple != null ? t.rMultiple.toFixed(2) + "R" : "-"}
                    </td>
                    <td className="py-2.5 pr-4 text-ink-3" onClick={() => setEditTrade(t)}>
                      {EMOTION_LABELS[t.preEmotion as keyof typeof EMOTION_LABELS] ?? t.preEmotion}
                    </td>
                    <td className="py-2.5 pr-4 text-ink-3 text-xs" onClick={() => setEditTrade(t)}>{t.setup ?? "-"}</td>
                    <td className="py-2.5 pr-4 text-ink-3 text-xs" onClick={() => setEditTrade(t)}>{t.modelName ?? "-"}</td>
                    <td className="py-2.5" onClick={() => setEditTrade(t)}>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${t.outcome === "win" ? "bg-emerald-900/30 text-emerald-400" : t.outcome === "loss" ? "bg-red-900/30 text-red-400" : "bg-card-3 text-ink-3"}`}>
                        {t.outcome}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <TradeDrawer
        open={editTrade !== null}
        onClose={() => setEditTrade(null)}
        instruments={instruments}
        models={models}
        trade={editTrade ?? undefined}
        title={editTrade ? `${editTrade.symbol} - ${editTrade.tradeDate}` : undefined}
      />
    </>
  );
}
