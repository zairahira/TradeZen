import { getInstruments, getTradingModels } from "@/lib/queries";
import { createInstrument, deleteInstrument } from "@/app/actions/instruments";
import { createTradingModel, deleteTradingModel } from "@/app/actions/trading-models";
import Link from "next/link";

const inputCls = "w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#555]";
const labelCls = "block text-[10px] text-[#555] uppercase tracking-wider mb-1";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab = sp.tab === "models" ? "models" : "instruments";

  const [instruments, models] = await Promise.all([getInstruments(), getTradingModels()]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-white">Settings</h1>
        <p className="text-xs text-[#555] mt-1">Manage your instruments and trading models.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-[#1a1a1a]">
        {(["instruments", "models"] as const).map((t) => (
          <Link
            key={t}
            href={`/settings?tab=${t}`}
            className={`px-4 py-2 text-sm capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-blue-500 text-white"
                : "border-transparent text-[#555] hover:text-[#aaa]"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      {tab === "instruments" && (
        <div className="space-y-6">
          <div className="bg-[#111] border border-[#1a1a1a] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#555] text-xs uppercase tracking-wider border-b border-[#1a1a1a]">
                  <th className="text-left px-4 py-3">Symbol</th>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-right px-4 py-3">Value/Point</th>
                  <th className="text-left px-4 py-3">Currency</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {instruments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[#444]">No instruments yet</td>
                  </tr>
                ) : (
                  instruments.map((inst) => (
                    <tr key={inst.id} className="border-b border-[#0f0f0f] hover:bg-[#0f0f0f]">
                      <td className="px-4 py-3 font-medium text-white">{inst.symbol}</td>
                      <td className="px-4 py-3 text-[#aaa]">{inst.name}</td>
                      <td className="px-4 py-3 text-right text-[#aaa]">{inst.valuePerPoint}</td>
                      <td className="px-4 py-3 text-[#666]">{inst.currency}</td>
                      <td className="px-4 py-3 text-right">
                        <form
                          action={async () => {
                            "use server";
                            await deleteInstrument(inst.id);
                          }}
                        >
                          <button type="submit" className="text-xs text-red-700 hover:text-red-500 transition-colors cursor-pointer">
                            Remove
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-5 space-y-4">
            <p className="text-sm font-medium text-white">Add Instrument</p>
            <form action={async (fd) => { "use server"; await createInstrument(fd); }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className={labelCls}>Symbol</label>
                <input name="symbol" required placeholder="US100" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Name</label>
                <input name="name" required placeholder="Nasdaq 100" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Value/Point</label>
                <input name="valuePerPoint" type="number" step="any" required defaultValue="1" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Currency</label>
                <input name="currency" defaultValue="USD" maxLength={3} className={inputCls} />
              </div>
              <div className="col-span-2 sm:col-span-4">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors cursor-pointer">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tab === "models" && (
        <div className="space-y-6">
          <div className="bg-[#111] border border-[#1a1a1a] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#555] text-xs uppercase tracking-wider border-b border-[#1a1a1a]">
                  <th className="text-left px-4 py-3">Model</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {models.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-[#444]">No models yet</td>
                  </tr>
                ) : (
                  models.map((m) => (
                    <tr key={m.id} className="border-b border-[#0f0f0f] hover:bg-[#0f0f0f]">
                      <td className="px-4 py-3 text-[#e5e5e5]">{m.name}</td>
                      <td className="px-4 py-3 text-right">
                        <form
                          action={async () => {
                            "use server";
                            await deleteTradingModel(m.id);
                          }}
                        >
                          <button type="submit" className="text-xs text-red-700 hover:text-red-500 transition-colors cursor-pointer">
                            Remove
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-5 space-y-4">
            <p className="text-sm font-medium text-white">Add Model</p>
            <p className="text-xs text-[#555]">Tag trades with a model to track win rate per strategy.</p>
            <form action={async (fd) => { "use server"; await createTradingModel(fd); }} className="flex gap-3">
              <input
                name="name"
                required
                placeholder="e.g. Silver Bullet"
                className="flex-1 bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#555]"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors shrink-0 cursor-pointer">
                Add
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
