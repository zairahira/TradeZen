"use client";

import { useEffect } from "react";
import TradeForm from "./TradeForm";
import type { Instrument, Trade, TradingModel } from "@/lib/db/schema";

interface Props {
  open: boolean;
  onClose: () => void;
  instruments: Instrument[];
  models: TradingModel[];
  trade?: Trade;
  title?: string;
}

export default function TradeDrawer({ open, onClose, instruments, models, trade, title }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-canvas border-l border-line flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line shrink-0">
          <h2 className="text-sm font-semibold text-ink">
            {title ?? (trade ? `${trade.tradeDate}` : "Add Trade")}
          </h2>
          <button
            onClick={onClose}
            className="text-ink-4 hover:text-ink-2 transition-colors p-1 rounded"
            aria-label="Close drawer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <TradeForm
            instruments={instruments}
            models={models}
            trade={trade}
            onSuccess={onClose}
          />
        </div>
      </div>
    </>
  );
}
