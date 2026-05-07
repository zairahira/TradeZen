# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # start dev server
npm run build        # production build
npm run lint         # ESLint (flat config)
npm run db:generate  # generate Drizzle migrations after schema changes
npm run db:migrate   # apply migrations to data/journal.db
```

## Architecture

**Stack:** Next.js 16, React 19, Drizzle ORM + SQLite (`data/journal.db`), Tailwind CSS 4, next-themes, React Hook Form + Zod, Recharts.

**App router layout:**
- `/` - dashboard with KPI strip and analytics charts
- `/trades`, `/trades/new`, `/trades/[id]` - trade CRUD
- `/instruments`, `/models` - reference data management
- `/settings` - app settings

**Data flow:** Server actions in `app/actions/` handle all mutations. Read queries live in `lib/queries.ts`. Schema is defined in `lib/db/schema.ts` (tables: `instruments`, `trades`, `tradingModels`, `mistakeTags`, `tradeMistakes`). `better-sqlite3` runs server-side only (listed in `serverExternalPackages`).

**Theming:** `globals.css` defines a semantic CSS token system via `@theme inline`. Use token-based classes (`bg-canvas`, `bg-card`, `text-ink`, `text-ink-muted`, `border-line`) rather than raw Tailwind colors. `Providers.tsx` wraps the app with `ThemeProvider` (default: dark). Light/dark values are mapped to the same token names via CSS `[data-theme]` selectors.

**Components:** `components/charts/` holds all Recharts wrappers. `components/ui/` holds shared primitives. `TradeForm.tsx` is the main complex form - it handles both create and edit via the same component, gated by whether an `id` is passed.
