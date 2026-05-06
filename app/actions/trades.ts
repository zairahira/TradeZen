"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { trades } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { writeFile } from "fs/promises";
import path from "path";
import { z } from "zod";

const tradeSchema = z.object({
  instrumentId: z.coerce.number().int().positive(),
  direction: z.enum(["long", "short"]),
  tradeDate: z.string().min(1),
  entryTime: z.string().optional(),
  entryPrice: z.coerce.number(),
  exitTime: z.string().optional(),
  exitPrice: z.coerce.number(),
  lotSize: z.coerce.number().positive(),
  stopLoss: z.coerce.number().optional().nullable(),
  takeProfit: z.coerce.number().optional().nullable(),
  fees: z.coerce.number().min(0).default(0),
  setup: z.string().optional(),
  modelId: z.coerce.number().int().positive().optional().nullable(),
  followedPlan: z.coerce.boolean().default(false),
  preEmotion: z.enum(["calm", "confident", "anxious", "fomo", "revenge", "greedy", "fearful", "bored", "tilted"]),
  confidence: z.coerce.number().int().min(1).max(5).default(3),
  reflection: z.string().optional(),
  notes: z.string().optional(),
});

export async function createTrade(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  // handle checkbox
  raw.followedPlan = formData.get("followedPlan") === "on" ? "true" : "false";

  const parsed = tradeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  const data = parsed.data;

  let screenshotPath: string | null = null;
  const file = formData.get("screenshot") as File | null;
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buf = Buffer.from(bytes);
    const ext = path.extname(file.name) || ".png";
    const filename = `${Date.now()}${ext}`;
    const dest = path.join(process.cwd(), "uploads", filename);
    await writeFile(dest, buf);
    screenshotPath = filename;
  }

  await db.insert(trades).values({
    instrumentId: data.instrumentId,
    direction: data.direction,
    tradeDate: data.tradeDate,
    entryTime: data.entryTime || null,
    entryPrice: data.entryPrice,
    exitTime: data.exitTime || null,
    exitPrice: data.exitPrice,
    lotSize: data.lotSize,
    stopLoss: data.stopLoss ?? null,
    takeProfit: data.takeProfit ?? null,
    fees: data.fees,
    setup: data.setup || null,
    modelId: data.modelId ?? null,
    followedPlan: data.followedPlan,
    preEmotion: data.preEmotion,
    confidence: data.confidence,
    reflection: data.reflection || null,
    notes: data.notes || null,
    screenshotPath,
  });

  revalidatePath("/");
  revalidatePath("/trades");
  return { redirect: "/trades" };
}

export async function updateTrade(id: number, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  raw.followedPlan = formData.get("followedPlan") === "on" ? "true" : "false";

  const parsed = tradeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  const data = parsed.data;

  let screenshotPath: string | undefined = undefined;
  const file = formData.get("screenshot") as File | null;
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buf = Buffer.from(bytes);
    const ext = path.extname(file.name) || ".png";
    const filename = `${Date.now()}${ext}`;
    const dest = path.join(process.cwd(), "uploads", filename);
    await writeFile(dest, buf);
    screenshotPath = filename;
  }

  const updateData: Record<string, unknown> = {
    instrumentId: data.instrumentId,
    direction: data.direction,
    tradeDate: data.tradeDate,
    entryTime: data.entryTime || null,
    entryPrice: data.entryPrice,
    exitTime: data.exitTime || null,
    exitPrice: data.exitPrice,
    lotSize: data.lotSize,
    stopLoss: data.stopLoss ?? null,
    takeProfit: data.takeProfit ?? null,
    fees: data.fees,
    setup: data.setup || null,
    modelId: data.modelId ?? null,
    followedPlan: data.followedPlan,
    preEmotion: data.preEmotion,
    confidence: data.confidence,
    reflection: data.reflection || null,
    notes: data.notes || null,
  };

  if (screenshotPath !== undefined) {
    updateData.screenshotPath = screenshotPath;
  }

  await db.update(trades).set(updateData).where(eq(trades.id, id));

  revalidatePath("/");
  revalidatePath("/trades");
  revalidatePath(`/trades/${id}`);
  return { redirect: `/trades/${id}` };
}

export async function deleteTrade(id: number) {
  await db.delete(trades).where(eq(trades.id, id));
  revalidatePath("/");
  revalidatePath("/trades");
  redirect("/trades");
}

export async function bulkDeleteTrades(ids: number[]) {
  if (ids.length === 0) return;
  for (const id of ids) {
    await db.delete(trades).where(eq(trades.id, id));
  }
  revalidatePath("/");
  revalidatePath("/trades");
}
