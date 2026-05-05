import { getTradesWithComputed, getInstruments } from "@/lib/queries";
import TradesTable from "@/components/TradesTable";
import Filters from "@/components/Filters";
import { Suspense } from "react";
import Link from "next/link";

interface SearchParams {
  emotion?: string | string[];
  outcome?: string | string[];
  symbol?: string | string[];
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
  const [trades, instruments] = await Promise.all([
    getTradesWithComputed({
      emotions: toArray(sp.emotion),
      outcomes: toArray(sp.outcome),
      symbols: toArray(sp.symbol),
      followedPlan: sp.followedPlan === "true" ? true : sp.followedPlan === "false" ? false : undefined,
      dateFrom: sp.dateFrom,
      dateTo: sp.dateTo,
    }),
    getInstruments(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">
          Trades{" "}
          <span className="text-[#555] font-normal text-sm">({trades.length})</span>
        </h1>
        <Link
          href="/trades/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          + Add Trade
        </Link>
      </div>

      <div className="flex gap-6">
        <Suspense>
          <Filters instruments={instruments} />
        </Suspense>
        <div className="flex-1 min-w-0">
          <TradesTable trades={trades} />
        </div>
      </div>
    </div>
  );
}
