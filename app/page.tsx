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
        <ChartCard title="Equity Curve" tooltip="Cumulative P&L over time, showing how your account balance grows or shrinks trade by trade.">
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

        <ChartCard title="R Multiple Distribution" tooltip="R-multiple measures each trade's gain or loss relative to your initial risk (1R). A +2R trade made twice your risk; a -1R trade lost exactly your risk amount.">
          <RDistribution data={stats.rDistribution} />
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  tooltip,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  tooltip?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-card border border-line rounded-lg p-5 ${className}`}>
      <div className="mb-4">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-ink">{title}</p>
          {tooltip && (
            <div className="relative group">
              <span className="flex items-center justify-center w-4 h-4 rounded-full border border-line text-ink-4 text-[10px] font-medium cursor-default select-none leading-none">
                ?
              </span>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 rounded-md bg-card border border-line text-xs text-ink-2 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-line" />
              </div>
            </div>
          )}
        </div>
        {subtitle && <p className="text-xs text-ink-4 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
