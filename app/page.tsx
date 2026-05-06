import { getDashboardStats } from "@/lib/queries";
import KpiStrip from "@/components/KpiStrip";
import EquityCurve from "@/components/charts/EquityCurve";
import WinRateByEmotion from "@/components/charts/WinRateByEmotion";
import WinRateBySetup from "@/components/charts/WinRateBySetup";
import WinRateByModel from "@/components/charts/WinRateByModel";
import WinRateByTimeOfDay from "@/components/charts/WinRateByTimeOfDay";
import RDistribution from "@/components/charts/RDistribution";
import DateFilterBar from "@/components/DateFilterBar";
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
    <div className="space-y-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Equity Curve">
          <EquityCurve data={stats.equityCurve} />
        </ChartCard>

        <ChartCard title="Win Rate by Emotion" subtitle="The headline view">
          <WinRateByEmotion data={stats.byEmotion} />
        </ChartCard>

        <ChartCard title="Win Rate by Setup">
          <WinRateBySetup data={stats.bySetup} />
        </ChartCard>

        <ChartCard title="Win Rate by Model" subtitle="Performance per ICT/trading model">
          <WinRateByModel data={stats.byModel} />
        </ChartCard>

        <ChartCard title="Win Rate by Time of Day">
          <WinRateByTimeOfDay data={stats.byTimeOfDay} />
        </ChartCard>

        <ChartCard title="R Multiple Distribution" className="lg:col-span-2">
          <RDistribution data={stats.rDistribution} />
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-card border border-line rounded-lg p-5 ${className}`}>
      <div className="mb-4">
        <p className="text-sm font-medium text-ink">{title}</p>
        {subtitle && <p className="text-xs text-ink-4 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
