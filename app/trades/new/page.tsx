import { getInstruments, getTradingModels } from "@/lib/queries";
import TradeForm from "@/components/TradeForm";

export default async function NewTradePage() {
  const [instruments, models] = await Promise.all([
    getInstruments(),
    getTradingModels(),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-lg font-semibold text-white">Add Trade</h1>
      {instruments.length === 0 ? (
        <p className="text-[#666] text-sm">
          No instruments configured.{" "}
          <a href="/instruments" className="text-blue-500 hover:underline">
            Add one first.
          </a>
        </p>
      ) : (
        <TradeForm instruments={instruments} models={models} />
      )}
    </div>
  );
}
