import { getInstruments } from "@/lib/queries";
import { createInstrument, deleteInstrument } from "@/app/actions/instruments";

export default async function InstrumentsPage() {
  const instruments = await getInstruments();

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-lg font-semibold text-white">Instruments</h1>

      <div className="bg-[#111] border border-[#1a1a1a] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#555] text-xs uppercase tracking-wider border-b border-[#1a1a1a]">
              <th className="text-left px-4 py-3">Symbol</th>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-right px-4 py-3">Value/Point</th>
              <th className="text-left px-4 py-3">Currency</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {instruments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#444]">
                  No instruments yet
                </td>
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
                      <button
                        type="submit"
                        className="text-xs text-red-700 hover:text-red-500 transition-colors"
                      >
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
            <label className="block text-[10px] text-[#555] uppercase tracking-wider mb-1">Symbol</label>
            <input
              name="symbol"
              required
              placeholder="US100"
              className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#555]"
            />
          </div>
          <div>
            <label className="block text-[10px] text-[#555] uppercase tracking-wider mb-1">Name</label>
            <input
              name="name"
              required
              placeholder="Nasdaq 100"
              className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#555]"
            />
          </div>
          <div>
            <label className="block text-[10px] text-[#555] uppercase tracking-wider mb-1">Value/Point</label>
            <input
              name="valuePerPoint"
              type="number"
              step="any"
              required
              defaultValue="1"
              className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#555]"
            />
          </div>
          <div>
            <label className="block text-[10px] text-[#555] uppercase tracking-wider mb-1">Currency</label>
            <input
              name="currency"
              defaultValue="USD"
              maxLength={3}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#555]"
            />
          </div>
          <div className="col-span-2 sm:col-span-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
