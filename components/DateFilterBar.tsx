"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format, startOfWeek, startOfMonth, startOfYear, endOfDay } from "date-fns";

const SHORTCUTS = [
  {
    label: "Today",
    range: () => {
      const d = format(new Date(), "yyyy-MM-dd");
      return { dateFrom: d, dateTo: d };
    },
  },
  {
    label: "This Week",
    range: () => ({
      dateFrom: format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
      dateTo: format(new Date(), "yyyy-MM-dd"),
    }),
  },
  {
    label: "This Month",
    range: () => ({
      dateFrom: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      dateTo: format(new Date(), "yyyy-MM-dd"),
    }),
  },
  {
    label: "This Year",
    range: () => ({
      dateFrom: format(startOfYear(new Date()), "yyyy-MM-dd"),
      dateTo: format(new Date(), "yyyy-MM-dd"),
    }),
  },
];

export default function DateFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const dateFrom = sp.get("dateFrom") ?? "";
  const dateTo = sp.get("dateTo") ?? "";

  function applyRange(from: string, to: string) {
    const params = new URLSearchParams(sp.toString());
    if (from) params.set("dateFrom", from);
    else params.delete("dateFrom");
    if (to) params.set("dateTo", to);
    else params.delete("dateTo");
    router.push(`${pathname}?${params.toString()}`);
  }

  function isActive(from: string, to: string) {
    return dateFrom === from && dateTo === to;
  }

  const hasFilter = dateFrom || dateTo;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Shortcut buttons */}
      {SHORTCUTS.map((s) => {
        const { dateFrom: f, dateTo: t } = s.range();
        return (
          <button
            key={s.label}
            onClick={() => applyRange(f, t)}
            className={`text-xs px-2.5 py-1 rounded border transition-colors cursor-pointer ${
              isActive(f, t)
                ? "bg-blue-900/40 text-blue-300 border-blue-700"
                : "text-[#666] border-[#333] hover:text-[#aaa] hover:border-[#555]"
            }`}
          >
            {s.label}
          </button>
        );
      })}

      {/* Custom date inputs */}
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => applyRange(e.target.value, dateTo)}
        className="bg-[#0a0a0a] border border-[#333] rounded px-2 py-1 text-xs text-[#aaa] focus:outline-none focus:border-[#555]"
        placeholder="From"
      />
      <span className="text-[#444] text-xs">-</span>
      <input
        type="date"
        value={dateTo}
        onChange={(e) => applyRange(dateFrom, e.target.value)}
        className="bg-[#0a0a0a] border border-[#333] rounded px-2 py-1 text-xs text-[#aaa] focus:outline-none focus:border-[#555]"
        placeholder="To"
      />

      {hasFilter && (
        <button
          onClick={() => applyRange("", "")}
          className="text-xs text-[#555] hover:text-[#aaa] transition-colors cursor-pointer"
        >
          Clear
        </button>
      )}
    </div>
  );
}
