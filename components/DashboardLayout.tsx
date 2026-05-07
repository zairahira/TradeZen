"use client";

import { useState, useEffect } from "react";

export type ChartDef = {
  id: string;
  title: string;
  subtitle?: string;
  tooltip?: string;
  node: React.ReactNode;
};

const LS_ORDER = "dashboard-chart-order";
const LS_HIDDEN = "dashboard-chart-hidden";

export default function DashboardLayout({ charts }: { charts: ChartDef[] }) {
  const defaultIds = charts.map((c) => c.id);

  const [order, setOrder] = useState<string[]>(defaultIds);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [panelOpen, setPanelOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_ORDER);
      if (saved) {
        const arr = JSON.parse(saved) as string[];
        const valid = arr.filter((id) => defaultIds.includes(id));
        const missing = defaultIds.filter((id) => !valid.includes(id));
        setOrder([...valid, ...missing]);
      }
    } catch {}
    try {
      const saved = localStorage.getItem(LS_HIDDEN);
      if (saved) setHidden(new Set(JSON.parse(saved) as string[]));
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function saveOrder(next: string[]) {
    setOrder(next);
    localStorage.setItem(LS_ORDER, JSON.stringify(next));
  }

  function saveHidden(next: Set<string>) {
    setHidden(new Set(next));
    localStorage.setItem(LS_HIDDEN, JSON.stringify([...next]));
  }

  function toggleHidden(id: string) {
    const next = new Set(hidden);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    saveHidden(next);
  }

  function resetView() {
    saveOrder(defaultIds);
    saveHidden(new Set());
  }

  function handleDragStart(id: string) {
    setDragId(id);
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    setDragOverId(id);
  }

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const next = [...order];
    const from = next.indexOf(dragId);
    const to = next.indexOf(targetId);
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    saveOrder(next);
    setDragId(null);
    setDragOverId(null);
  }

  function handleDragEnd() {
    setDragId(null);
    setDragOverId(null);
  }

  const chartMap = Object.fromEntries(charts.map((c) => [c.id, c]));
  const orderedCharts = order.map((id) => chartMap[id]).filter(Boolean) as ChartDef[];
  const visibleCharts = orderedCharts.filter((c) => !hidden.has(c.id));
  const isCustomized =
    JSON.stringify(order) !== JSON.stringify(defaultIds) || hidden.size > 0;

  return (
    <>
      <div className="flex items-center justify-end gap-3">
        {isCustomized && (
          <button
            onClick={resetView}
            className="text-xs text-ink-4 hover:text-ink-2 transition-colors cursor-pointer"
          >
            Reset view
          </button>
        )}
        <button
          onClick={() => setPanelOpen(true)}
          className="text-xs text-ink-3 hover:text-ink border border-line rounded px-3 py-1.5 transition-colors cursor-pointer"
        >
          Customize
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleCharts.map((chart) => (
          <ChartCard
            key={chart.id}
            title={chart.title}
            subtitle={chart.subtitle}
            tooltip={chart.tooltip}
          >
            {chart.node}
          </ChartCard>
        ))}
      </div>

      {panelOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setPanelOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-card border-l border-line flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line">
              <span className="text-sm font-medium text-ink">Customize Dashboard</span>
              <button
                onClick={() => setPanelOpen(false)}
                className="text-ink-4 hover:text-ink-2 text-xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>
            <p className="px-4 pt-3 pb-1 text-xs text-ink-4">Drag to reorder. Toggle to show or hide.</p>
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
              {orderedCharts.map((chart) => {
                const isHidden = hidden.has(chart.id);
                const isDragging = dragId === chart.id;
                const isOver = dragOverId === chart.id && dragId !== chart.id;
                return (
                  <div
                    key={chart.id}
                    draggable
                    onDragStart={() => handleDragStart(chart.id)}
                    onDragOver={(e) => handleDragOver(e, chart.id)}
                    onDrop={() => handleDrop(chart.id)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-2 px-2 py-2 rounded border cursor-grab active:cursor-grabbing transition-colors select-none ${
                      isOver
                        ? "border-blue-500/50 bg-blue-950/20"
                        : "border-transparent hover:bg-card-2"
                    } ${isDragging ? "opacity-30" : ""}`}
                  >
                    <svg
                      className="w-3 h-4 text-ink-4 flex-shrink-0"
                      viewBox="0 0 8 14"
                      fill="currentColor"
                    >
                      <circle cx="2" cy="2" r="1.1" />
                      <circle cx="6" cy="2" r="1.1" />
                      <circle cx="2" cy="7" r="1.1" />
                      <circle cx="6" cy="7" r="1.1" />
                      <circle cx="2" cy="12" r="1.1" />
                      <circle cx="6" cy="12" r="1.1" />
                    </svg>
                    <span
                      className={`flex-1 text-sm truncate ${
                        isHidden ? "text-ink-4 line-through" : "text-ink-2"
                      }`}
                    >
                      {chart.title}
                    </span>
                    <button
                      onClick={() => toggleHidden(chart.id)}
                      className={`text-xs px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        isHidden
                          ? "border-line text-ink-4 hover:text-ink-2 hover:border-ink-4"
                          : "border-line text-ink-3 hover:text-red-400 hover:border-red-900/50"
                      }`}
                    >
                      {isHidden ? "Show" : "Hide"}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-3 border-t border-line">
              <button
                onClick={resetView}
                className="w-full text-xs text-ink-4 hover:text-ink-2 border border-line rounded px-3 py-2 transition-colors cursor-pointer"
              >
                Reset to default
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function ChartCard({
  title,
  subtitle,
  tooltip,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  tooltip?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-card border border-line rounded-lg p-5 ${className}`}>
      <div className="mb-4">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-ink">{title}</p>
          {tooltip && (
            <div className="relative group">
              <span className="flex items-center justify-center w-4 h-4 rounded-full border border-line text-ink-4 text-[10px] font-medium cursor-default select-none leading-none">
                ?
              </span>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 rounded-md bg-card border border-line text-xs text-ink-2 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-line" />
              </div>
            </div>
          )}
        </div>
        {subtitle && <p className="text-xs text-ink-4 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
