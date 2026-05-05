import { getTradingModels } from "@/lib/queries";
import { createTradingModel, deleteTradingModel } from "@/app/actions/trading-models";

export default async function ModelsPage() {
  const models = await getTradingModels();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-white">Trading Models</h1>
        <p className="text-xs text-[#555] mt-1">Tag trades with a model to track win rate per strategy.</p>
      </div>

      <div className="bg-[#111] border border-[#1a1a1a] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#555] text-xs uppercase tracking-wider border-b border-[#1a1a1a]">
              <th className="text-left px-4 py-3">Model</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {models.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-[#444]">
                  No models yet
                </td>
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
        <p className="text-sm font-medium text-white">Add Model</p>
        <form
          action={async (fd) => {
            "use server";
            await createTradingModel(fd);
          }}
          className="flex gap-3"
        >
          <input
            name="name"
            required
            placeholder="e.g. My Custom Model"
            className="flex-1 bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#555]"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors shrink-0"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
