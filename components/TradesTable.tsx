"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import type { TradeWithComputed } from "@/lib/queries";
import { EMOTION_LABELS } from "@/lib/constants";
import { bulkDeleteTrades } from "@/app/actions/trades";

interface Props {
  trades: TradeWithComputed[];
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TradesTable({ trades }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();
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
      <div className="text-center py-16 text-[#444]">
        No trades yet.{" "}
        <Link href="/trades/new" className="text-blue-500 hover:underline">
          Add your first trade
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2">
          <span className="text-sm text-[#aaa]">
            {selected.size} trade{selected.size > 1 ? "s" : ""} selected
          </span>
          <button
            onClick={handleDeleteSelected}
            disabled={isPending}
            className="ml-auto text-xs text-red-400 hover:text-red-300 border border-red-900/50 hover:border-red-700 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
          >
            {isPending ? "Deleting..." : `Delete ${selected.size}`}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-[#555] hover:text-[#aaa] transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-[#555] text-xs uppercase tracking-wider border-b border-[#1a1a1a]">
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
                  className={`border-b border-[#111] transition-colors ${
                    isSelected ? "bg-blue-950/30" : "hover:bg-[#111]"
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
                  <td
                    className="py-2.5 pr-4 text-[#888] whitespace-nowrap cursor-pointer"
                    onClick={() => router.push(`/trades/${t.id}`)}
                  >
                    {format(new Date(t.tradeDate + "T00:00:00"), "MMM d, yy")}
                  </td>
                  <td className="py-2.5 pr-4 font-medium text-white cursor-pointer" onClick={() => router.push(`/trades/${t.id}`)}>
                    {t.symbol}
                  </td>
                  <td className="py-2.5 pr-4 cursor-pointer" onClick={() => router.push(`/trades/${t.id}`)}>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${t.direction === "long" ? "bg-emerald-900/30 text-emerald-400" : "bg-red-900/30 text-red-400"}`}>
                      {t.direction}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-right text-[#aaa] cursor-pointer" onClick={() => router.push(`/trades/${t.id}`)}>{t.entryPrice}</td>
                  <td className="py-2.5 pr-4 text-right text-[#aaa] cursor-pointer" onClick={() => router.push(`/trades/${t.id}`)}>{t.exitPrice}</td>
                  <td className="py-2.5 pr-4 text-right text-[#aaa] cursor-pointer" onClick={() => router.push(`/trades/${t.id}`)}>{t.lotSize}</td>
                  <td className={`py-2.5 pr-4 text-right font-medium cursor-pointer ${t.netPnl >= 0 ? "text-emerald-400" : "text-red-400"}`} onClick={() => router.push(`/trades/${t.id}`)}>
                    {t.netPnl >= 0 ? "+" : ""}{fmt(t.netPnl)}
                  </td>
                  <td className={`py-2.5 pr-4 text-right cursor-pointer ${t.rMultiple == null ? "text-[#444]" : t.rMultiple >= 0 ? "text-emerald-400" : "text-red-400"}`} onClick={() => router.push(`/trades/${t.id}`)}>
                    {t.rMultiple != null ? t.rMultiple.toFixed(2) + "R" : "-"}
                  </td>
                  <td className="py-2.5 pr-4 text-[#888] cursor-pointer" onClick={() => router.push(`/trades/${t.id}`)}>
                    {EMOTION_LABELS[t.preEmotion as keyof typeof EMOTION_LABELS] ?? t.preEmotion}
                  </td>
                  <td className="py-2.5 pr-4 text-[#666] text-xs cursor-pointer" onClick={() => router.push(`/trades/${t.id}`)}>{t.setup ?? "-"}</td>
                  <td className="py-2.5 pr-4 text-[#666] text-xs cursor-pointer" onClick={() => router.push(`/trades/${t.id}`)}>{t.modelName ?? "-"}</td>
                  <td className="py-2.5 cursor-pointer" onClick={() => router.push(`/trades/${t.id}`)}>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${t.outcome === "win" ? "bg-emerald-900/30 text-emerald-400" : t.outcome === "loss" ? "bg-red-900/30 text-red-400" : "bg-[#222] text-[#888]"}`}>
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
  );
}
