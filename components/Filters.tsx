"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { EMOTIONS, EMOTION_LABELS } from "@/lib/constants";
import type { Instrument } from "@/lib/db/schema";

interface Props {
  instruments: Instrument[];
}

export default function Filters({ instruments }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

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

  const activeEmotions = sp.getAll("emotion");
  const activeOutcomes = sp.getAll("outcome");
  const activeSymbols = sp.getAll("symbol");
  const activePlan = sp.get("followedPlan");

  return (
    <aside className="space-y-5 min-w-[180px]">
      <div>
        <p className="text-[10px] text-[#555] uppercase tracking-wider mb-2">Date From</p>
        <input
          type="date"
          value={sp.get("dateFrom") ?? ""}
          onChange={(e) => update("dateFrom", e.target.value)}
          className="w-full bg-[#0a0a0a] border border-[#333] rounded px-2 py-1.5 text-xs text-[#aaa] focus:outline-none focus:border-[#555]"
        />
      </div>
      <div>
        <p className="text-[10px] text-[#555] uppercase tracking-wider mb-2">Date To</p>
        <input
          type="date"
          value={sp.get("dateTo") ?? ""}
          onChange={(e) => update("dateTo", e.target.value)}
          className="w-full bg-[#0a0a0a] border border-[#333] rounded px-2 py-1.5 text-xs text-[#aaa] focus:outline-none focus:border-[#555]"
        />
      </div>

      <div>
        <p className="text-[10px] text-[#555] uppercase tracking-wider mb-2">Emotion</p>
        <div className="flex flex-col gap-1">
          {EMOTIONS.map((e) => (
            <button
              key={e}
              onClick={() => toggle("emotion", e)}
              className={`text-left text-xs px-2 py-1 rounded transition-colors ${
                activeEmotions.includes(e)
                  ? "bg-blue-900/40 text-blue-300 border border-blue-700"
                  : "text-[#666] hover:text-[#aaa]"
              }`}
            >
              {EMOTION_LABELS[e]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] text-[#555] uppercase tracking-wider mb-2">Outcome</p>
        <div className="flex flex-col gap-1">
          {(["win", "loss", "breakeven"] as const).map((o) => (
            <button
              key={o}
              onClick={() => toggle("outcome", o)}
              className={`text-left text-xs px-2 py-1 rounded capitalize transition-colors ${
                activeOutcomes.includes(o)
                  ? "bg-blue-900/40 text-blue-300 border border-blue-700"
                  : "text-[#666] hover:text-[#aaa]"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] text-[#555] uppercase tracking-wider mb-2">Symbol</p>
        <div className="flex flex-col gap-1">
          {instruments.map((i) => (
            <button
              key={i.id}
              onClick={() => toggle("symbol", i.symbol)}
              className={`text-left text-xs px-2 py-1 rounded transition-colors ${
                activeSymbols.includes(i.symbol)
                  ? "bg-blue-900/40 text-blue-300 border border-blue-700"
                  : "text-[#666] hover:text-[#aaa]"
              }`}
            >
              {i.symbol}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] text-[#555] uppercase tracking-wider mb-2">Plan</p>
        <div className="flex flex-col gap-1">
          {[
            { label: "Followed", value: "true" },
            { label: "Deviated", value: "false" },
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => update("followedPlan", activePlan === value ? "" : value)}
              className={`text-left text-xs px-2 py-1 rounded transition-colors ${
                activePlan === value
                  ? "bg-blue-900/40 text-blue-300 border border-blue-700"
                  : "text-[#666] hover:text-[#aaa]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {sp.toString() && (
        <button
          onClick={() => router.push(pathname)}
          className="text-xs text-[#555] hover:text-[#aaa] transition-colors"
        >
          Clear filters
        </button>
      )}
    </aside>
  );
}
