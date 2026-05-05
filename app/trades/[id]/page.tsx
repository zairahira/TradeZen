import { getTradeById, getInstruments, getTradingModels } from "@/lib/queries";
import TradeForm from "@/components/TradeForm";
import DeleteTradeButton from "./DeleteTradeButton";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function TradeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tradeId = parseInt(id, 10);
  if (isNaN(tradeId)) notFound();

  const [trade, instruments, models] = await Promise.all([
    getTradeById(tradeId),
    getInstruments(),
    getTradingModels(),
  ]);

  if (!trade) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">
          {trade.symbol} - {trade.tradeDate}
        </h1>
        <DeleteTradeButton id={trade.id} />
      </div>

      {trade.screenshotPath && (
        <div className="rounded-lg overflow-hidden border border-[#222]">
          <Image
            src={`/api/uploads/${trade.screenshotPath}`}
            alt="Trade screenshot"
            width={900}
            height={500}
            className="w-full object-contain bg-[#111]"
          />
        </div>
      )}

      <TradeForm instruments={instruments} models={models} trade={trade} />
    </div>
  );
}
