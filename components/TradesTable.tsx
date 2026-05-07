"use client";

import { useState, useEffect, useRef, useTransition } from "react";
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

const ALL_COLUMNS = [
  { key: "date", label: "Date" },
  { key: "symbol", label: "Symbol" },
  { key: "dir", label: "Dir" },
  { key: "entry", label: "Entry" },
  { key: "exit", label: "Exit" },
  { key: "lots", label: "Lots" },
  { key: "pnl", label: "Net P&L" },
  { key: "r", label: "R" },
  { key: "emotion", label: "Emotion" },
  { key: "setup", label: "Setup" },
  { key: "model", label: "Model" },
  { key: "result", label: "Result" },
] as const;

type ColKey = (typeof ALL_COLUMNS)[number]["key"];
const DEFAULT_COLS = ALL_COLUMNS.map((c) => c.key) as ColKey[];
const LS_COLS = "trades-table-cols";

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function TradesTable({ trades, instruments, models }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [editTrade, setEditTrade] = useState<TradeWithComputed | null>(null);
  const [visibleCols, setVisibleCols] = useState<Set<ColKey>>(
    new Set(DEFAULT_COLS)
  );
  const [colsOpen, setColsOpen] = useState(false);
  const colsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_COLS);
      if (saved) {
        const arr = JSON.parse(saved) as ColKey[];
        setVisibleCols(new Set(arr));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!colsOpen) return;
    function onMousedown(e: MouseEvent) {
      if (colsRef.current && !colsRef.current.contains(e.target as Node)) {
        setColsOpen(false);
      }
    }
    document.addEventListener("mousedown", onMousedown);
    return () => document.removeEventListener("mousedown", onMousedown);
  }, [colsOpen]);

  function saveCols(next: Set<ColKey>) {
    setVisibleCols(new Set(next));
    localStorage.setItem(LS_COLS, JSON.stringify([...next]));
  }

  function toggleCol(key: ColKey) {
    const next = new Set(visibleCols);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    saveCols(next);
  }

  function resetCols() {
    saveCols(new Set(DEFAULT_COLS));
  }

  const vis = (key: ColKey) => visibleCols.has(key);
  const isCustomized = visibleCols.size !== DEFAULT_COLS.length ||
    DEFAULT_COLS.some((k) => !visibleCols.has(k));

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
    if (
      !confirm(
        `Delete ${selected.size} trade${selected.size > 1 ? "s" : ""}? This cannot be undone.`
      )
    )
      return;
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

        <div className="flex items-center justify-end gap-3">
          {isCustomized && (
            <button
              onClick={resetCols}
              className="text-xs text-ink-4 hover:text-ink-2 transition-colors cursor-pointer"
            >
              Reset view
            </button>
          )}
          <div className="relative" ref={colsRef}>
            <button
              onClick={() => setColsOpen((o) => !o)}
              className="text-xs text-ink-3 hover:text-ink border border-line rounded px-3 py-1.5 transition-colors cursor-pointer"
            >
              Columns ({visibleCols.size}/{ALL_COLUMNS.length})
            </button>
            {colsOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-line rounded-lg shadow-lg z-20 py-1">
                {ALL_COLUMNS.map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-card-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={visibleCols.has(col.key)}
                      onChange={() => toggleCol(col.key)}
                      className="w-3.5 h-3.5 accent-blue-500 cursor-pointer"
                    />
                    <span className="text-sm text-ink-2">{col.label}</span>
                  </label>
                ))}
                <div className="border-t border-line mt-1 pt-1 px-2 pb-1">
                  <button
                    onClick={() => { resetCols(); setColsOpen(false); }}
                    className="w-full text-xs text-ink-4 hover:text-ink-2 py-1 transition-colors cursor-pointer"
                  >
                    Reset to default
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-ink-4 text-xs uppercase tracking-wider border-b border-line">
                <th className="py-2 pr-3 w-8">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 accent-blue-500 cursor-pointer"
                  />
                </th>
                {vis("date") && <th className="text-left py-2 pr-4">Date</th>}
                {vis("symbol") && <th className="text-left py-2 pr-4">Symbol</th>}
                {vis("dir") && <th className="text-left py-2 pr-4">Dir</th>}
                {vis("entry") && <th className="text-right py-2 pr-4">Entry</th>}
                {vis("exit") && <th className="text-right py-2 pr-4">Exit</th>}
                {vis("lots") && <th className="text-right py-2 pr-4">Lots</th>}
                {vis("pnl") && <th className="text-right py-2 pr-4">Net P&L</th>}
                {vis("r") && <th className="text-right py-2 pr-4">R</th>}
                {vis("emotion") && <th className="text-left py-2 pr-4">Emotion</th>}
                {vis("setup") && <th className="text-left py-2 pr-4">Setup</th>}
                {vis("model") && <th className="text-left py-2 pr-4">Model</th>}
                {vis("result") && <th className="text-left py-2">Result</th>}
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
                    <td
                      className="py-2.5 pr-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(t.id)}
                        className="w-3.5 h-3.5 accent-blue-500 cursor-pointer"
                      />
                    </td>
                    {vis("date") && (
                      <td
                        className="py-2.5 pr-4 text-ink-3 whitespace-nowrap"
                        onClick={() => setEditTrade(t)}
                      >
                        {format(new Date(t.tradeDate + "T00:00:00"), "MMM d, yy")}
                      </td>
                    )}
                    {vis("symbol") && (
                      <td
                        className="py-2.5 pr-4 font-medium text-ink"
                        onClick={() => setEditTrade(t)}
                      >
                        {t.symbol}
                      </td>
                    )}
                    {vis("dir") && (
                      <td className="py-2.5 pr-4" onClick={() => setEditTrade(t)}>
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
                    )}
                    {vis("entry") && (
                      <td
                        className="py-2.5 pr-4 text-right text-ink-2"
                        onClick={() => setEditTrade(t)}
                      >
                        {t.entryPrice}
                      </td>
                    )}
                    {vis("exit") && (
                      <td
                        className="py-2.5 pr-4 text-right text-ink-2"
                        onClick={() => setEditTrade(t)}
                      >
                        {t.exitPrice}
                      </td>
                    )}
                    {vis("lots") && (
                      <td
                        className="py-2.5 pr-4 text-right text-ink-2"
                        onClick={() => setEditTrade(t)}
                      >
                        {t.lotSize}
                      </td>
                    )}
                    {vis("pnl") && (
                      <td
                        className={`py-2.5 pr-4 text-right font-medium ${
                          t.netPnl >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                        onClick={() => setEditTrade(t)}
                      >
                        {t.netPnl >= 0 ? "+" : ""}
                        {fmt(t.netPnl)}
                      </td>
                    )}
                    {vis("r") && (
                      <td
                        className={`py-2.5 pr-4 text-right ${
                          t.rMultiple == null
                            ? "text-ink-4"
                            : t.rMultiple >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                        onClick={() => setEditTrade(t)}
                      >
                        {t.rMultiple != null ? t.rMultiple.toFixed(2) + "R" : "-"}
                      </td>
                    )}
                    {vis("emotion") && (
                      <td
                        className="py-2.5 pr-4 text-ink-3"
                        onClick={() => setEditTrade(t)}
                      >
                        {EMOTION_LABELS[t.preEmotion as keyof typeof EMOTION_LABELS] ??
                          t.preEmotion}
                      </td>
                    )}
                    {vis("setup") && (
                      <td
                        className="py-2.5 pr-4 text-ink-3 text-xs"
                        onClick={() => setEditTrade(t)}
                      >
                        {t.setup ?? "-"}
                      </td>
                    )}
                    {vis("model") && (
                      <td
                        className="py-2.5 pr-4 text-ink-3 text-xs"
                        onClick={() => setEditTrade(t)}
                      >
                        {t.modelName ?? "-"}
                      </td>
                    )}
                    {vis("result") && (
                      <td className="py-2.5" onClick={() => setEditTrade(t)}>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            t.outcome === "win"
                              ? "bg-emerald-900/30 text-emerald-400"
                              : t.outcome === "loss"
                              ? "bg-red-900/30 text-red-400"
                              : "bg-card-3 text-ink-3"
                          }`}
                        >
                          {t.outcome}
                        </span>
                      </td>
                    )}
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
