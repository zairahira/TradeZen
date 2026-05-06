import { getTradesWithComputed, getInstruments, getTradingModels } from "@/lib/queries";
import TradesTable from "@/components/TradesTable";
import Filters from "@/components/Filters";
import { Suspense } from "react";

interface SearchParams {
  emotion?: string | string[];
  outcome?: string | string[];
  symbol?: string | string[];
  model?: string | string[];
  followedPlan?: string;
  dateFrom?: string;
  dateTo?: string;
}

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export default async function TradesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const [trades, instruments, models] = await Promise.all([
    getTradesWithComputed({
      emotions: toArray(sp.emotion),
      outcomes: toArray(sp.outcome),
      symbols: toArray(sp.symbol),
      models: toArray(sp.model),
      followedPlan: sp.followedPlan === "true" ? true : sp.followedPlan === "false" ? false : undefined,
      dateFrom: sp.dateFrom,
      dateTo: sp.dateTo,
    }),
    getInstruments(),
    getTradingModels(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-white">
        Trades{" "}
        <span className="text-[#555] font-normal text-sm">({trades.length})</span>
      </h1>

      <Suspense>
        <Filters instruments={instruments} models={models} />
      </Suspense>

      <TradesTable trades={trades} instruments={instruments} models={models} />
    </div>
  );
}
