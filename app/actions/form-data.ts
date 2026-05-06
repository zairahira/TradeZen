"use server";

import { getInstruments, getTradingModels } from "@/lib/queries";

export async function getTradeFormData() {
  const [instruments, models] = await Promise.all([getInstruments(), getTradingModels()]);
  return { instruments, models };
}
