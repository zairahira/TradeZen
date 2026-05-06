"use client";

import { useState } from "react";
import { getTradeFormData } from "@/app/actions/form-data";
import TradeDrawer from "./TradeDrawer";
import type { Instrument, TradingModel } from "@/lib/db/schema";

export default function AddTradeButton() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<{ instruments: Instrument[]; models: TradingModel[] } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleOpen() {
    if (!data) {
      setLoading(true);
      const result = await getTradeFormData();
      setData(result);
      setLoading(false);
    }
    setOpen(true);
  }

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={loading}
        className="ml-auto bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer"
      >
        {loading ? "Loading..." : "+ Add Trade"}
      </button>

      {data && (
        <TradeDrawer
          open={open}
          onClose={() => setOpen(false)}
          instruments={data.instruments}
          models={data.models}
          title="Add Trade"
        />
      )}
    </>
  );
}
