"use client";

import { useTransition } from "react";
import { deleteTrade } from "@/app/actions/trades";

export default function DeleteTradeButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this trade? This cannot be undone.")) return;
    startTransition(() => deleteTrade(id));
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs text-red-500 hover:text-red-400 border border-red-900/50 hover:border-red-700 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
