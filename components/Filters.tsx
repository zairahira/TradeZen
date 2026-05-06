"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { EMOTIONS, EMOTION_LABELS } from "@/lib/constants";
import type { Instrument, TradingModel } from "@/lib/db/schema";

interface Props {
  instruments: Instrument[];
  models: TradingModel[];
}

type GroupKey = "date" | "emotion" | "outcome" | "symbol" | "model" | "plan";

export default function Filters({ instruments, models }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [openGroup, setOpenGroup] = useState<GroupKey | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function update(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggle(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    const current = params.getAll(key);
    if (current.includes(value)) {
      params.delete(key);
      current.filter((v) => v !== value).forEach((v) => params.append(key, v));
    } else {
      params.append(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function removeFilter(key: string, value?: string) {
    const params = new URLSearchParams(sp.toString());
    if (value !== undefined) {
      const current = params.getAll(key).filter((v) => v !== value);
      params.delete(key);
      current.forEach((v) => params.append(key, v));
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeEmotions = sp.getAll("emotion");
  const activeOutcomes = sp.getAll("outcome");
  const activeSymbols = sp.getAll("symbol");
  const activeModels = sp.getAll("model");
  const activePlan = sp.get("followedPlan");
  const dateFrom = sp.get("dateFrom") ?? "";
  const dateTo = sp.get("dateTo") ?? "";

  // Build chip list for active filters
  const chips: { label: string; onRemove: () => void }[] = [
    ...activeEmotions.map((e) => ({
      label: `Emotion: ${EMOTION_LABELS[e as keyof typeof EMOTION_LABELS] ?? e}`,
      onRemove: () => removeFilter("emotion", e),
    })),
    ...activeOutcomes.map((o) => ({
      label: `Outcome: ${o}`,
      onRemove: () => removeFilter("outcome", o),
    })),
    ...activeSymbols.map((s) => ({
      label: `Symbol: ${s}`,
      onRemove: () => removeFilter("symbol", s),
    })),
    ...activeModels.map((m) => ({
      label: `Model: ${m}`,
      onRemove: () => removeFilter("model", m),
    })),
    ...(activePlan
      ? [{ label: `Plan: ${activePlan === "true" ? "Followed" : "Deviated"}`, onRemove: () => update("followedPlan", "") }]
      : []),
    ...(dateFrom ? [{ label: `From: ${dateFrom}`, onRemove: () => update("dateFrom", "") }] : []),
    ...(dateTo ? [{ label: `To: ${dateTo}`, onRemove: () => update("dateTo", "") }] : []),
  ];

  const totalCount = chips.length;

  function groupBtn(key: GroupKey, label: string, count: number) {
    const active = count > 0;
    const isOpen = openGroup === key;
    return (
      <button
        onClick={() => setOpenGroup(isOpen ? null : key)}
        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-colors cursor-pointer whitespace-nowrap ${
          active
            ? "bg-blue-900/30 text-blue-300 border-blue-700"
            : isOpen
            ? "text-white border-[#555] bg-[#1a1a1a]"
            : "text-[#666] border-[#333] hover:text-[#aaa] hover:border-[#555]"
        }`}
      >
        {label}
        {active && (
          <span className="bg-blue-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none">
            {count}
          </span>
        )}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    );
  }

  const optionCls = (active: boolean) =>
    `flex items-center gap-2 w-full text-left text-xs px-3 py-1.5 rounded transition-colors cursor-pointer ${
      active
        ? "bg-blue-900/40 text-blue-300"
        : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
    }`;

  const dropdownCls =
    "absolute top-full left-0 mt-1 z-30 bg-[#111] border border-[#222] rounded-lg shadow-xl overflow-y-auto max-h-64 min-w-[180px] py-1";

  const dateCount = (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  return (
    <div className="space-y-2" ref={containerRef}>
      {/* Filter group buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Date */}
        <div className="relative">
          {groupBtn("date", "Date", dateCount)}
          {openGroup === "date" && (
            <div className={dropdownCls + " w-56 p-3 space-y-2"}>
              <div>
                <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">From</p>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => update("dateFrom", e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded px-2 py-1.5 text-xs text-[#aaa] focus:outline-none focus:border-[#555]"
                />
              </div>
              <div>
                <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">To</p>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => update("dateTo", e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded px-2 py-1.5 text-xs text-[#aaa] focus:outline-none focus:border-[#555]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Emotion */}
        <div className="relative">
          {groupBtn("emotion", "Emotion", activeEmotions.length)}
          {openGroup === "emotion" && (
            <div className={dropdownCls}>
              {EMOTIONS.map((e) => (
                <button key={e} onClick={() => toggle("emotion", e)} className={optionCls(activeEmotions.includes(e))}>
                  {activeEmotions.includes(e) && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  )}
                  <span className={activeEmotions.includes(e) ? "" : "pl-[18px]"}>
                    {EMOTION_LABELS[e]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Outcome */}
        <div className="relative">
          {groupBtn("outcome", "Outcome", activeOutcomes.length)}
          {openGroup === "outcome" && (
            <div className={dropdownCls}>
              {(["win", "loss", "breakeven"] as const).map((o) => (
                <button key={o} onClick={() => toggle("outcome", o)} className={optionCls(activeOutcomes.includes(o))}>
                  {activeOutcomes.includes(o) && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  )}
                  <span className={`capitalize ${activeOutcomes.includes(o) ? "" : "pl-[18px]"}`}>{o}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Symbol */}
        {instruments.length > 0 && (
          <div className="relative">
            {groupBtn("symbol", "Symbol", activeSymbols.length)}
            {openGroup === "symbol" && (
              <div className={dropdownCls}>
                {instruments.map((i) => (
                  <button key={i.id} onClick={() => toggle("symbol", i.symbol)} className={optionCls(activeSymbols.includes(i.symbol))}>
                    {activeSymbols.includes(i.symbol) && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    )}
                    <span className={activeSymbols.includes(i.symbol) ? "" : "pl-[18px]"}>{i.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Model */}
        {models.length > 0 && (
          <div className="relative">
            {groupBtn("model", "Model", activeModels.length)}
            {openGroup === "model" && (
              <div className={dropdownCls}>
                {models.map((m) => (
                  <button key={m.id} onClick={() => toggle("model", m.name)} className={optionCls(activeModels.includes(m.name))}>
                    {activeModels.includes(m.name) && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    )}
                    <span className={activeModels.includes(m.name) ? "" : "pl-[18px]"}>{m.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Plan */}
        <div className="relative">
          {groupBtn("plan", "Plan", activePlan ? 1 : 0)}
          {openGroup === "plan" && (
            <div className={dropdownCls}>
              {[{ label: "Followed", value: "true" }, { label: "Deviated", value: "false" }].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => update("followedPlan", activePlan === value ? "" : value)}
                  className={optionCls(activePlan === value)}
                >
                  {activePlan === value && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  )}
                  <span className={activePlan === value ? "" : "pl-[18px]"}>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {totalCount > 0 && (
          <button
            onClick={() => router.push(pathname)}
            className="text-xs text-[#555] hover:text-[#aaa] transition-colors cursor-pointer ml-1"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Active chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip, i) => (
            <span
              key={i}
              className="flex items-center gap-1 text-xs bg-blue-900/20 text-blue-300 border border-blue-900/50 px-2 py-0.5 rounded"
            >
              {chip.label}
              <button
                onClick={chip.onRemove}
                className="text-blue-500 hover:text-white ml-0.5 cursor-pointer leading-none"
                aria-label={`Remove ${chip.label}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
