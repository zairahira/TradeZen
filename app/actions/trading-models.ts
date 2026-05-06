"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { tradingModels, trades } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const modelSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function createTradingModel(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = modelSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten() };

  await db.insert(tradingModels).values({ name: parsed.data.name }).onConflictDoNothing();
  revalidatePath("/models");
  redirect("/models");
}

export async function createTradingModelInline(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = modelSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const [created] = await db
    .insert(tradingModels)
    .values({ name: parsed.data.name })
    .onConflictDoNothing()
    .returning();

  revalidatePath("/models");
  revalidatePath("/trades/new");
  return { model: created ?? null };
}

export async function deleteTradingModel(id: number) {
  await db.update(trades).set({ modelId: null }).where(eq(trades.modelId, id));
  await db.delete(tradingModels).where(eq(tradingModels.id, id));
  revalidatePath("/");
  revalidatePath("/trades");
  revalidatePath("/models");
  redirect("/models");
}
