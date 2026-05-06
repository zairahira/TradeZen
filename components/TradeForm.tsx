"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { createTrade, updateTrade } from "@/app/actions/trades";
import { createInstrumentInline } from "@/app/actions/instruments";
import { createTradingModelInline } from "@/app/actions/trading-models";
import { calcTradePnl } from "@/lib/trade-math";
import { EMOTIONS, EMOTION_LABELS, SETUP_SUGGESTIONS } from "@/lib/constants";
import type { Instrument, Trade, TradingModel } from "@/lib/db/schema";

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
  modelId: string;
  followedPlan: boolean;
  preEmotion: "calm" | "confident" | "anxious" | "fomo" | "revenge" | "greedy" | "fearful" | "bored" | "tilted";
  reflection: string;
  notes: string;
}

interface Props {
  instruments: Instrument[];
  models: TradingModel[];
  trade?: Trade;
}

const inputCls =
  "w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#555] transition-colors";
const labelCls = "block text-xs text-[#666] uppercase tracking-wider mb-1";
const sectionCls = "space-y-4";
const sectionHeadCls = "text-xs font-semibold text-[#555] uppercase tracking-wider pb-1 border-b border-[#1a1a1a] mb-4";

export default function TradeForm({ instruments, models, trade }: Props) {
  const [isPending, startTransition] = useTransition();
  const [pnlPreview, setPnlPreview] = useState<ReturnType<typeof calcTradePnl> | null>(null);
  const [localInstruments, setLocalInstruments] = useState(instruments);
  const [showAddInstrument, setShowAddInstrument] = useState(false);
  const [addInstPending, setAddInstPending] = useState(false);
  const [newInst, setNewInst] = useState({ symbol: "", name: "", valuePerPoint: "", currency: "USD" });
  const [localModels, setLocalModels] = useState(models);
  const [showAddModel, setShowAddModel] = useState(false);
  const [addModelPending, setAddModelPending] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
    trade?.screenshotPath ? `/api/uploads/${trade.screenshotPath}` : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function applyFile(file: File) {
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
  }

  function clearScreenshot() {
    setScreenshotFile(null);
    setScreenshotPreview(trade?.screenshotPath ? `/api/uploads/${trade.screenshotPath}` : null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) applyFile(file);
          e.preventDefault();
          break;
        }
      }
    }
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const today = format(new Date(), "yyyy-MM-dd");

  const {
    register,
    handleSubmit,
    control,
    setValue,
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
          modelId: trade.modelId != null ? String(trade.modelId) : "",
          followedPlan: trade.followedPlan,
          preEmotion: trade.preEmotion,
          reflection: trade.reflection ?? "",
          notes: trade.notes ?? "",
        }
      : {
          tradeDate: today,
          direction: "long",
          fees: "0",
          followedPlan: false,
          preEmotion: "calm",
          entryTime: "",
          exitTime: "",
          stopLoss: "",
          takeProfit: "",
          setup: "",
          modelId: "",
          reflection: "",
          notes: "",
          instrumentId: "",
          entryPrice: "",
          exitPrice: "",
          lotSize: "",
        },
  });

  const instId = useWatch({ control, name: "instrumentId" });
  const direction = useWatch({ control, name: "direction" });
  const entryPrice = useWatch({ control, name: "entryPrice" });
  const exitPrice = useWatch({ control, name: "exitPrice" });
  const lotSize = useWatch({ control, name: "lotSize" });
  const fees = useWatch({ control, name: "fees" });
  const stopLoss = useWatch({ control, name: "stopLoss" });

  useEffect(() => {
    const inst = localInstruments.find((i) => i.id === Number(instId));
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
  }, [instId, direction, entryPrice, exitPrice, lotSize, fees, stopLoss, localInstruments]);

  function onSubmit(data: FormValues) {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        fd.append(k, String(v));
      }
    });
    if (data.followedPlan) fd.set("followedPlan", "on");
    else fd.delete("followedPlan");

    if (screenshotFile) fd.append("screenshot", screenshotFile);

    startTransition(async () => {
      const result = trade
        ? await updateTrade(trade.id, fd)
        : await createTrade(fd);
      if (result && "redirect" in result && result.redirect) {
        router.push(result.redirect as string);
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
            <Controller
              control={control}
              name="instrumentId"
              rules={{ required: "Select an instrument" }}
              render={({ field }) => (
                <select
                  value={field.value}
                  onChange={(e) => {
                    if (e.target.value === "__add_new__") {
                      setShowAddInstrument(true);
                      field.onChange("");
                    } else {
                      setShowAddInstrument(false);
                      field.onChange(e.target.value);
                    }
                  }}
                  className={inputCls}
                >
                  <option value="">Select...</option>
                  {localInstruments.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.symbol} - {i.name}
                    </option>
                  ))}
                  <option value="__add_new__">+ Add new instrument...</option>
                </select>
              )}
            />
            {errors.instrumentId && <p className="text-xs text-red-400 mt-1">{errors.instrumentId.message}</p>}

            {showAddInstrument && (
              <div className="mt-2 p-3 border border-[#333] rounded bg-[#0d0d0d] space-y-2">
                <p className="text-xs text-[#666] uppercase tracking-wider font-semibold">New Instrument</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="Symbol (e.g. US100)"
                    value={newInst.symbol}
                    onChange={(e) => setNewInst((p) => ({ ...p, symbol: e.target.value.toUpperCase() }))}
                    className={inputCls}
                  />
                  <input
                    placeholder="Name (e.g. Nasdaq 100)"
                    value={newInst.name}
                    onChange={(e) => setNewInst((p) => ({ ...p, name: e.target.value }))}
                    className={inputCls}
                  />
                  <input
                    placeholder="Value/Point (e.g. 1)"
                    type="number"
                    step="any"
                    value={newInst.valuePerPoint}
                    onChange={(e) => setNewInst((p) => ({ ...p, valuePerPoint: e.target.value }))}
                    className={inputCls}
                  />
                  <input
                    placeholder="Currency (e.g. USD)"
                    value={newInst.currency}
                    onChange={(e) => setNewInst((p) => ({ ...p, currency: e.target.value.toUpperCase() }))}
                    maxLength={3}
                    className={inputCls}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={addInstPending}
                    onClick={async () => {
                      if (!newInst.symbol || !newInst.name || !newInst.valuePerPoint) return;
                      setAddInstPending(true);
                      const fd = new FormData();
                      fd.append("symbol", newInst.symbol);
                      fd.append("name", newInst.name);
                      fd.append("valuePerPoint", newInst.valuePerPoint);
                      fd.append("currency", newInst.currency || "USD");
                      const result = await createInstrumentInline(fd);
                      setAddInstPending(false);
                      if (result && "instrument" in result && result.instrument) {
                        const created = result.instrument;
                        setLocalInstruments((prev) => [...prev, created]);
                        setValue("instrumentId", String(created.id));
                        setShowAddInstrument(false);
                        setNewInst({ symbol: "", name: "", valuePerPoint: "", currency: "USD" });
                      }
                    }}
                    className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded transition-colors"
                  >
                    {addInstPending ? "Adding..." : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddInstrument(false);
                      setNewInst({ symbol: "", name: "", valuePerPoint: "", currency: "USD" });
                    }}
                    className="text-xs text-[#555] hover:text-[#aaa] border border-[#333] hover:border-[#555] px-3 py-1.5 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
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

          <div>
            <label className={labelCls}>Trading Model</label>
            <Controller
              control={control}
              name="modelId"
              render={({ field }) => (
                <select
                  value={field.value}
                  onChange={(e) => {
                    if (e.target.value === "__add_new__") {
                      setShowAddModel(true);
                      field.onChange("");
                    } else {
                      setShowAddModel(false);
                      field.onChange(e.target.value);
                    }
                  }}
                  className={inputCls}
                >
                  <option value="">None</option>
                  {localModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                  <option value="__add_new__">+ Add new model...</option>
                </select>
              )}
            />

            {showAddModel && (
              <div className="mt-2 p-3 border border-[#333] rounded bg-[#0d0d0d] space-y-2">
                <p className="text-xs text-[#666] uppercase tracking-wider font-semibold">New Model</p>
                <input
                  placeholder="Model name (e.g. Silver Bullet)"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  className={inputCls}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={addModelPending}
                    onClick={async () => {
                      if (!newModelName.trim()) return;
                      setAddModelPending(true);
                      const fd = new FormData();
                      fd.append("name", newModelName.trim());
                      const result = await createTradingModelInline(fd);
                      setAddModelPending(false);
                      if (result && "model" in result && result.model) {
                        const created = result.model;
                        setLocalModels((prev) => [...prev, created]);
                        setValue("modelId", String(created.id));
                        setShowAddModel(false);
                        setNewModelName("");
                      }
                    }}
                    className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded transition-colors"
                  >
                    {addModelPending ? "Adding..." : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModel(false);
                      setNewModelName("");
                    }}
                    className="text-xs text-[#555] hover:text-[#aaa] border border-[#333] hover:border-[#555] px-3 py-1.5 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
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
        <div className="space-y-2">
          <label className={labelCls}>Chart Screenshot</label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) applyFile(file);
              }}
              className="text-sm text-[#888] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-[#333] file:bg-[#111] file:text-[#aaa] file:text-xs hover:file:border-[#555] cursor-pointer"
            />
            <button
              type="button"
              onClick={async () => {
                try {
                  const items = await navigator.clipboard.read();
                  for (const item of items) {
                    const imageType = item.types.find((t) => t.startsWith("image/"));
                    if (imageType) {
                      const blob = await item.getType(imageType);
                      applyFile(new File([blob], "clipboard.png", { type: imageType }));
                      break;
                    }
                  }
                } catch {
                  // clipboard API not available or denied — user can still Ctrl+V
                }
              }}
              className="text-xs text-[#666] hover:text-[#aaa] border border-[#333] hover:border-[#555] px-3 py-1.5 rounded transition-colors"
            >
              Paste from clipboard
            </button>
            <span className="text-[10px] text-[#444]">or Ctrl+V anywhere on this page</span>
          </div>

          {screenshotPreview && (
            <div className="relative inline-block mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshotPreview}
                alt="Screenshot preview"
                className="max-h-48 rounded border border-[#333] object-contain bg-[#111]"
              />
              <button
                type="button"
                onClick={clearScreenshot}
                className="absolute top-1 right-1 bg-[#111]/80 hover:bg-red-900/80 text-[#aaa] hover:text-white rounded px-1.5 py-0.5 text-xs transition-colors"
              >
                ✕
              </button>
            </div>
          )}
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
