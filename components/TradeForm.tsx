"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import { createTrade, updateTrade } from "@/app/actions/trades";
import { calcTradePnl } from "@/lib/trade-math";
import { EMOTIONS, EMOTION_LABELS, SETUP_SUGGESTIONS } from "@/lib/constants";
import type { Instrument, Trade } from "@/lib/db/schema";

interface FormValues {
  instrumentId: string;
  direction: "long" | "short";
  tradeDate: string;
  entryTime: string;
  entryPrice: string;
  exitTime: string;
  exitPrice: string;
  lotSize: string;
  stopLoss: string;
  takeProfit: string;
  fees: string;
  setup: string;
  followedPlan: boolean;
  preEmotion: "calm" | "confident" | "anxious" | "fomo" | "revenge" | "greedy" | "fearful" | "bored" | "tilted";
  confidence: string;
  reflection: string;
  notes: string;
}

interface Props {
  instruments: Instrument[];
  trade?: Trade;
}

const inputCls =
  "w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#555] transition-colors";
const labelCls = "block text-xs text-[#666] uppercase tracking-wider mb-1";
const sectionCls = "space-y-4";
const sectionHeadCls = "text-xs font-semibold text-[#555] uppercase tracking-wider pb-1 border-b border-[#1a1a1a] mb-4";

export default function TradeForm({ instruments, trade }: Props) {
  const [isPending, startTransition] = useTransition();
  const [pnlPreview, setPnlPreview] = useState<ReturnType<typeof calcTradePnl> | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: trade
      ? {
          instrumentId: String(trade.instrumentId),
          direction: trade.direction,
          tradeDate: trade.tradeDate,
          entryTime: trade.entryTime ?? "",
          entryPrice: String(trade.entryPrice),
          exitTime: trade.exitTime ?? "",
          exitPrice: String(trade.exitPrice),
          lotSize: String(trade.lotSize),
          stopLoss: trade.stopLoss != null ? String(trade.stopLoss) : "",
          takeProfit: trade.takeProfit != null ? String(trade.takeProfit) : "",
          fees: String(trade.fees),
          setup: trade.setup ?? "",
          followedPlan: trade.followedPlan,
          preEmotion: trade.preEmotion,
          confidence: String(trade.confidence),
          reflection: trade.reflection ?? "",
          notes: trade.notes ?? "",
        }
      : {
          tradeDate: today,
          direction: "long",
          fees: "0",
          confidence: "3",
          followedPlan: false,
          preEmotion: "calm",
          entryTime: "",
          exitTime: "",
          stopLoss: "",
          takeProfit: "",
          setup: "",
          reflection: "",
          notes: "",
          instrumentId: "",
          entryPrice: "",
          exitPrice: "",
          lotSize: "",
        },
  });

  const watchedFields = watch(["instrumentId", "direction", "entryPrice", "exitPrice", "lotSize", "fees", "stopLoss"]);

  useEffect(() => {
    const [instId, direction, entryPrice, exitPrice, lotSize, fees, stopLoss] = watchedFields;
    const inst = instruments.find((i) => i.id === Number(instId));
    if (!inst || !entryPrice || !exitPrice || !lotSize) {
      setPnlPreview(null);
      return;
    }
    try {
      const preview = calcTradePnl({
        entry: Number(entryPrice),
        exit: Number(exitPrice),
        direction: direction as "long" | "short",
        lotSize: Number(lotSize),
        valuePerPoint: inst.valuePerPoint,
        fees: Number(fees) || 0,
        stopLoss: stopLoss !== "" && stopLoss != null ? Number(stopLoss) : null,
      });
      setPnlPreview(preview);
    } catch {
      setPnlPreview(null);
    }
  }, [watchedFields, instruments]);

  function onSubmit(data: FormValues) {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        fd.append(k, String(v));
      }
    });
    if (data.followedPlan) fd.set("followedPlan", "on");
    else fd.delete("followedPlan");

    startTransition(async () => {
      if (trade) {
        await updateTrade(trade.id, fd);
      } else {
        await createTrade(fd);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* P&L Preview */}
      {pnlPreview && (
        <div className="bg-[#0d1a0d] border border-[#1a3a1a] rounded-lg px-5 py-3 flex flex-wrap gap-6 text-sm">
          <Stat label="Points" value={pnlPreview.pointsPnl.toFixed(2)} color={pnlPreview.pointsPnl >= 0 ? "text-emerald-400" : "text-red-400"} />
          <Stat label="Gross P&L" value={pnlPreview.grossPnl.toFixed(2)} color={pnlPreview.grossPnl >= 0 ? "text-emerald-400" : "text-red-400"} />
          <Stat label="Net P&L" value={pnlPreview.netPnl.toFixed(2)} color={pnlPreview.netPnl >= 0 ? "text-emerald-400" : "text-red-400"} />
          {pnlPreview.rMultiple != null && (
            <Stat label="R Multiple" value={pnlPreview.rMultiple.toFixed(2) + "R"} color={pnlPreview.rMultiple >= 0 ? "text-emerald-400" : "text-red-400"} />
          )}
          <span className={`self-center text-xs font-semibold px-2 py-0.5 rounded ${pnlPreview.outcome === "win" ? "bg-emerald-900/50 text-emerald-400" : pnlPreview.outcome === "loss" ? "bg-red-900/50 text-red-400" : "bg-[#222] text-[#aaa]"}`}>
            {pnlPreview.outcome.toUpperCase()}
          </span>
        </div>
      )}

      {/* Trade Details */}
      <div className={sectionCls}>
        <p className={sectionHeadCls}>Trade</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className={labelCls}>Instrument</label>
            <select {...register("instrumentId", { required: "Select an instrument" })} className={inputCls}>
              <option value="">Select...</option>
              {instruments.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.symbol} - {i.name}
                </option>
              ))}
            </select>
            {errors.instrumentId && <p className="text-xs text-red-400 mt-1">{errors.instrumentId.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Direction</label>
            <div className="flex gap-2">
              {(["long", "short"] as const).map((d) => (
                <label key={d} className="flex-1">
                  <input type="radio" value={d} {...register("direction")} className="sr-only peer" />
                  <span className="block text-center py-2 rounded border border-[#333] text-sm cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-900/30 transition-colors capitalize">
                    {d}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Date</label>
            <input type="date" {...register("tradeDate", { required: true })} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Entry Time</label>
            <input type="time" {...register("entryTime")} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Entry Price</label>
            <input type="number" step="any" {...register("entryPrice", { required: true })} className={inputCls} placeholder="0.00" />
          </div>

          <div>
            <label className={labelCls}>Exit Time</label>
            <input type="time" {...register("exitTime")} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Exit Price</label>
            <input type="number" step="any" {...register("exitPrice", { required: true })} className={inputCls} placeholder="0.00" />
          </div>

          <div>
            <label className={labelCls}>Lot Size</label>
            <input type="number" step="any" {...register("lotSize", { required: true })} className={inputCls} placeholder="1.0" />
          </div>
        </div>
      </div>

      {/* Risk */}
      <div className={sectionCls}>
        <p className={sectionHeadCls}>Risk</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Stop Loss (price)</label>
            <input type="number" step="any" {...register("stopLoss")} className={inputCls} placeholder="optional" />
          </div>
          <div>
            <label className={labelCls}>Take Profit (price)</label>
            <input type="number" step="any" {...register("takeProfit")} className={inputCls} placeholder="optional" />
          </div>
          <div>
            <label className={labelCls}>Fees</label>
            <input type="number" step="any" {...register("fees")} className={inputCls} placeholder="0" />
          </div>
        </div>
      </div>

      {/* Psychology */}
      <div className={sectionCls}>
        <p className={sectionHeadCls}>Psychology</p>
        <div>
          <label className={labelCls}>Pre-trade Emotion</label>
          <Controller
            control={control}
            name="preEmotion"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {EMOTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => field.onChange(e)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      field.value === e
                        ? "border-blue-500 bg-blue-900/40 text-blue-300"
                        : "border-[#333] text-[#888] hover:border-[#555]"
                    }`}
                  >
                    {EMOTION_LABELS[e]}
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Confidence (1-5)</label>
            <input type="range" min={1} max={5} {...register("confidence")} className="w-full accent-blue-500" />
            <div className="flex justify-between text-[10px] text-[#555] mt-0.5">
              {[1, 2, 3, 4, 5].map((n) => <span key={n}>{n}</span>)}
            </div>
          </div>

          <div>
            <label className={labelCls}>Setup</label>
            <input
              list="setups"
              {...register("setup")}
              className={inputCls}
              placeholder="e.g. Breakout"
            />
            <datalist id="setups">
              {SETUP_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
            </datalist>
          </div>

          <div className="flex items-center gap-3 pt-5">
            <input type="checkbox" id="followedPlan" {...register("followedPlan")} className="w-4 h-4 accent-blue-500" />
            <label htmlFor="followedPlan" className="text-sm text-[#aaa] cursor-pointer">
              Followed plan
            </label>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className={sectionCls}>
        <p className={sectionHeadCls}>Notes & Screenshot</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Reflection (post-trade)</label>
            <textarea rows={3} {...register("reflection")} className={inputCls} placeholder="What went well / wrong?" />
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea rows={3} {...register("notes")} className={inputCls} placeholder="Context, news, etc." />
          </div>
        </div>
        <div>
          <label className={labelCls}>Chart Screenshot</label>
          <input
            type="file"
            name="screenshot"
            accept="image/*"
            className="text-sm text-[#888] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-[#333] file:bg-[#111] file:text-[#aaa] file:text-xs hover:file:border-[#555] cursor-pointer"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded text-sm font-medium transition-colors"
      >
        {isPending ? "Saving..." : trade ? "Update Trade" : "Save Trade"}
      </button>
    </form>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="text-[10px] text-[#555] uppercase tracking-wider">{label}</p>
      <p className={`text-base font-semibold ${color}`}>{value}</p>
    </div>
  );
}
