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
  data: { setup: string; winRate: number; avgPnl: number; count: number }[];
}

export default function WinRateBySetup({ data }: Props) {
  if (data.length === 0) {
    return <div className="h-[200px] flex items-center justify-center text-[#444] text-sm">No data</div>;
  }

  const sorted = [...data].sort((a, b) => b.winRate - a.winRate);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 20, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: "#666", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
          domain={[0, 1]}
        />
        <YAxis
          type="category"
          dataKey="setup"
          tick={{ fill: "#999", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={100}
        />
        <Tooltip
          contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 6 }}
          labelStyle={{ color: "#aaa", fontSize: 11 }}
          formatter={(v) => [`${(Number(v) * 100).toFixed(1)}%`, "Win Rate"]}
        />
        <Bar dataKey="winRate" radius={[0, 3, 3, 0]}>
          {sorted.map((entry) => (
            <Cell
              key={entry.setup}
              fill={entry.winRate >= 0.5 ? "#10b981" : "#ef4444"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
