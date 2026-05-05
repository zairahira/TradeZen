"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface Props {
  data: { date: string; cumPnl: number }[];
}

export default function EquityCurve({ data }: Props) {
  if (data.length === 0) {
    return <EmptyChart label="No trades yet" />;
  }

  const color = (data[data.length - 1]?.cumPnl ?? 0) >= 0 ? "#10b981" : "#ef4444";

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="ec" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#666", fontSize: 11 }}
          tickFormatter={(d) => format(new Date(d + "T00:00:00"), "MMM d")}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#666", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v.toFixed(0)}
        />
        <Tooltip
          contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 6 }}
          labelStyle={{ color: "#aaa", fontSize: 11 }}
          itemStyle={{ color: color }}
          formatter={(v) => [Number(v).toFixed(2), "Cum P&L"]}
        />
        <Area type="monotone" dataKey="cumPnl" stroke={color} fill="url(#ec)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-[220px] flex items-center justify-center text-[#444] text-sm">{label}</div>
  );
}
