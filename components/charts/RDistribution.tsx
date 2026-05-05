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
  data: { bucket: string; count: number }[];
}

export default function RDistribution({ data }: Props) {
  const hasData = data.some((d) => d.count > 0);
  if (!hasData) {
    return <div className="h-[200px] flex items-center justify-center text-[#444] text-sm">No R data (set stop loss on trades)</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
        <XAxis
          dataKey="bucket"
          tick={{ fill: "#666", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#666", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 6 }}
          labelStyle={{ color: "#aaa", fontSize: 11 }}
          formatter={(v) => [Number(v), "Trades"]}
        />
        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {data.map((entry) => {
            const isPositive = entry.bucket.startsWith("0R") || entry.bucket.startsWith("1R") || entry.bucket.startsWith("> 2R");
            return <Cell key={entry.bucket} fill={isPositive ? "#10b981" : "#ef4444"} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
