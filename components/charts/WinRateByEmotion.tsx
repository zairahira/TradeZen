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
import { EMOTION_LABELS } from "@/lib/constants";

interface Props {
  data: { emotion: string; winRate: number; avgPnl: number; count: number }[];
}

export default function WinRateByEmotion({ data }: Props) {
  if (data.length === 0) {
    return <div className="h-[220px] flex items-center justify-center text-ink-4 text-sm">No data</div>;
  }

  const sorted = [...data].sort((a, b) => b.winRate - a.winRate);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={sorted} margin={{ top: 4, right: 4, left: 4, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
        <XAxis
          dataKey="emotion"
          tick={{ fill: "var(--ink-3)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          angle={-40}
          textAnchor="end"
          interval={0}
          tickFormatter={(e) => EMOTION_LABELS[e as keyof typeof EMOTION_LABELS] ?? e}
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
          formatter={(v, name) => {
            const n = Number(v);
            if (name === "winRate") return [`${(n * 100).toFixed(1)}%`, "Win Rate"];
            return [n.toFixed(2), String(name)];
          }}
        />
        <Bar dataKey="winRate" radius={[3, 3, 0, 0]}>
          {sorted.map((entry) => (
            <Cell
              key={entry.emotion}
              fill={entry.winRate >= 0.5 ? "#10b981" : "#ef4444"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
