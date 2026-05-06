"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { bucket: string; winRate: number; avgPnl: number; count: number }[];
}

const ORDER = ["Pre-market", "Morning", "Lunch", "Afternoon", "Unknown"];

export default function WinRateByTimeOfDay({ data }: Props) {
  if (data.length === 0) {
    return <div className="h-[200px] flex items-center justify-center text-ink-4 text-sm">No data</div>;
  }

  const sorted = [...data].sort(
    (a, b) => ORDER.indexOf(a.bucket) - ORDER.indexOf(b.bucket)
  );

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={sorted} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
        <XAxis
          dataKey="bucket"
          tick={{ fill: "var(--ink-3)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--ink-3)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
          domain={[0, 1]}
        />
        <Tooltip
          contentStyle={{ background: "var(--card)", border: "1px solid var(--line-strong)", borderRadius: 6 }}
          labelStyle={{ color: "var(--ink-2)", fontSize: 11 }}
          formatter={(v) => [`${(Number(v) * 100).toFixed(1)}%`, "Win Rate"]}
        />
        <Bar dataKey="winRate" radius={[3, 3, 0, 0]}>
          {sorted.map((entry) => (
            <Cell
              key={entry.bucket}
              fill={entry.winRate >= 0.5 ? "#10b981" : "#ef4444"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
