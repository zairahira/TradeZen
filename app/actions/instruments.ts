"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { instruments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const instrumentSchema = z.object({
  symbol: z.string().min(1).max(20).toUpperCase(),
  name: z.string().min(1).max(100),
  valuePerPoint: z.coerce.number().positive(),
  currency: z.string().min(3).max(3).toUpperCase().default("USD"),
});

export async function createInstrument(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = instrumentSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten() };

  await db.insert(instruments).values(parsed.data).onConflictDoNothing();
  revalidatePath("/settings");
  redirect("/settings");
}

export async function createInstrumentInline(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = instrumentSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const [created] = await db
    .insert(instruments)
    .values(parsed.data)
    .onConflictDoNothing()
    .returning();

  revalidatePath("/instruments");
  revalidatePath("/trades/new");
  return { instrument: created ?? null };
}

export async function updateInstrument(id: number, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = instrumentSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten() };

  await db.update(instruments).set(parsed.data).where(eq(instruments.id, id));
  revalidatePath("/settings");
  redirect("/settings");
}

export async function deleteInstrument(id: number) {
  await db.delete(instruments).where(eq(instruments.id, id));
  revalidatePath("/settings");
  redirect("/settings");
}
