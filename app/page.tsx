import { getDashboardStats } from "@/lib/queries";
import KpiStrip from "@/components/KpiStrip";
import EquityCurve from "@/components/charts/EquityCurve";
import WinRateByEmotion from "@/components/charts/WinRateByEmotion";
import WinRateBySetup from "@/components/charts/WinRateBySetup";
import WinRateByModel from "@/components/charts/WinRateByModel";
import WinRateByTimeOfDay from "@/components/charts/WinRateByTimeOfDay";
import RDistribution from "@/components/charts/RDistribution";
import DateFilterBar from "@/components/DateFilterBar";
import DashboardLayout from "@/components/DashboardLayout";
import { Suspense } from "react";

interface SearchParams {
  dateFrom?: string;
  dateTo?: string;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const stats = await getDashboardStats({
    dateFrom: sp.dateFrom,
    dateTo: sp.dateTo,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <h1 className="text-lg font-semibold text-ink">Dashboard</h1>
        <Suspense>
          <DateFilterBar />
        </Suspense>
      </div>

      <KpiStrip
        totalPnl={stats.totalPnl}
        totalTrades={stats.totalTrades}
        winRate={stats.winRate}
        profitFactor={stats.profitFactor}
        avgR={stats.avgR}
        bestDay={stats.bestDay}
        worstDay={stats.worstDay}
      />

      <DashboardLayout
        charts={[
          {
            id: "equity",
            title: "Equity Curve",
            tooltip:
              "Cumulative P&L over time, showing how your account balance grows or shrinks trade by trade.",
            node: <EquityCurve data={stats.equityCurve} />,
          },
          {
            id: "emotion",
            title: "Win Rate by Emotion",
            subtitle: "The headline view",
            node: <WinRateByEmotion data={stats.byEmotion} />,
          },
          {
            id: "setup",
            title: "Win Rate by Setup",
            node: <WinRateBySetup data={stats.bySetup} />,
          },
          {
            id: "model",
            title: "Win Rate by Model",
            subtitle: "Performance per ICT/trading model",
            node: <WinRateByModel data={stats.byModel} />,
          },
          {
            id: "timeofday",
            title: "Win Rate by Time of Day",
            node: <WinRateByTimeOfDay data={stats.byTimeOfDay} />,
          },
          {
            id: "rdist",
            title: "R Multiple Distribution",
            tooltip:
              "R-multiple measures each trade's gain or loss relative to your initial risk (1R). A +2R trade made twice your risk; a -1R trade lost exactly your risk amount.",
            node: <RDistribution data={stats.rDistribution} />,
          },
        ]}
      />
    </div>
  );
}
