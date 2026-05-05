# Trading Journal — v1 Plan

## Context

Building a minimal day-trading journal as a webapp. Single user (no auth), local-first. Core differentiator: log emotions per trade so the user can filter and see win rate / expectancy broken down by emotion. v1 supports Indices / CFDs only (US100, US30, GER40, etc.) with generic points-based P&L math. Manual trade entry with optional chart screenshot per trade.

## Decisions (confirmed with user)

- Stack: **Next.js (App Router) + SQLite**
- Single user, no login
- Asset class v1: **Indices / CFDs** (points-based P&L)
- Manual trade entry only (no CSV import in v1)
- Screenshot upload: **one chart image per trade**
- Keep v1 minimal — no pre-trade checklist, daily session log, or cooling-off nudges yet

## Tech stack

- Next.js 15 (App Router, TypeScript, Server Actions for mutations)
- SQLite via `better-sqlite3`
- Drizzle ORM (light type-safe wrapper, easy migrations)
- Tailwind CSS for styling (minimal, dark-mode default)
- `recharts` for charts (equity curve, bar charts)
- `react-hook-form` + `zod` for the trade form
- `date-fns` for date formatting
- Screenshots stored on disk under `./uploads/` (path persisted in DB)

## Data model

### `instruments` (presets so the user enters value-per-point once)
- `id` (pk)
- `symbol` (e.g., `US100`, `US30`, `GER40`) — unique
- `name` (display label)
- `value_per_point` (decimal — currency value per 1 point per 1 lot, e.g., 1.00)
- `currency` (USD/EUR/GBP — for display only, not converted)

### `trades`
- `id` (pk)
- `instrument_id` (fk → instruments)
- `direction` (`long` | `short`)
- `trade_date` (date)
- `entry_time`, `entry_price`
- `exit_time`, `exit_price`
- `lot_size` (decimal)
- `stop_loss` (price level, nullable)
- `take_profit` (price level, nullable)
- `fees` (decimal, default 0)
- `setup` (free-text or chosen from common tags)
- `followed_plan` (boolean)
- `pre_emotion` (one of: calm, confident, anxious, fomo, revenge, greedy, fearful, bored, tilted)
- `confidence` (1-5)
- `reflection` (short text, post-trade)
- `notes` (longer free text)
- `screenshot_path` (nullable)
- `created_at`

Computed (not stored, derived in queries / view):
- `points_pnl` = `(exit - entry) * sign(direction)`
- `gross_pnl` = `points_pnl * lot_size * value_per_point`
- `net_pnl` = `gross_pnl - fees`
- `risk_points` = `|entry - stop_loss|` (when stop set)
- `r_multiple` = `points_pnl / risk_points`
- `outcome` = `win` | `loss` | `breakeven`

### `mistake_tags` + `trade_mistakes` (many-to-many)
Tags like: `chased entry`, `moved stop`, `oversized`, `no stop`, `early exit`, `late entry`, `news ignored`. Seeded list, user can add more.

## Pages / routes

1. `/` — **Dashboard**
   - Top KPI strip: total P&L, # trades, win rate, profit factor, avg R, best day, worst day
   - Equity curve (cumulative net P&L over time)
   - **Win rate & expectancy by pre-emotion** (bar chart — the headline view)
   - Win rate by setup
   - Win rate by time-of-day bucket (pre-market / morning / lunch / afternoon)
   - R-multiple distribution histogram
   - Date range filter (this week / month / YTD / custom)

2. `/trades` — **Trades list**
   - Table: date, symbol, direction, entry, exit, lots, net P&L, R, emotion, setup, outcome
   - Filter sidebar: emotion (multi), setup, symbol, outcome, date range, followed-plan
   - Sort by any column
   - Row click → detail/edit page

3. `/trades/new` — **Add trade form**
   - One screen, grouped sections: Trade / Risk / Psychology / Notes & screenshot
   - Inline P&L preview as user types (auto-calc points, gross, net, R)
   - Submit via Server Action → redirects to dashboard

4. `/trades/[id]` — **Trade detail / edit**
   - Same form pre-filled, plus screenshot preview, plus Delete button (with confirm)

5. `/instruments` — **Instruments admin** (small page)
   - List + add/edit symbol presets (symbol, name, value-per-point, currency)
   - Seed with: US100, US30, GER40, UK100, JPN225, US500

## File / folder structure

```
trading-journal/
  app/
    layout.tsx
    page.tsx                       # dashboard
    trades/
      page.tsx                     # list
      new/page.tsx                 # add form
      [id]/page.tsx                # detail/edit
    instruments/page.tsx
    api/
      uploads/[file]/route.ts      # serve screenshots
  components/
    TradeForm.tsx
    TradesTable.tsx
    Filters.tsx
    KpiStrip.tsx
    charts/
      EquityCurve.tsx
      WinRateByEmotion.tsx
      WinRateBySetup.tsx
      WinRateByTimeOfDay.tsx
      RDistribution.tsx
  lib/
    db/
      client.ts                    # better-sqlite3 + drizzle init
      schema.ts                    # drizzle table defs
      migrations/                  # generated
    trade-math.ts                  # pnl, R, outcome helpers (pure fns)
    queries.ts                     # dashboard aggregations
    constants.ts                   # emotion list, setup suggestions, mistake tags
  uploads/                         # screenshot files (gitignored)
  data/journal.db                  # sqlite file (gitignored)
  drizzle.config.ts
  package.json
  tailwind.config.ts
```

## UX principles

- **One-page add-trade flow** — no wizard, no multi-step. A day trader logging 5+ trades a day will not tolerate friction.
- **Keyboard-first form** — tab order top to bottom, sensible defaults (today's date, last-used symbol).
- **Live P&L preview** in the form so the user sees their result while logging.
- **Emotion picker** = chip buttons (one click), not a dropdown.
- **Dark theme default** (matches what traders stare at all day).
- Minimal chrome: top nav with `Dashboard | Trades | Add Trade | Instruments`.

## Differentiation vs existing journals

Existing tools (Tradervue, TraderSync, Edgewonk, Chartlog, Notion templates) treat emotions as a free-text comment field, are bloated for swing traders / tax reporting, and are SaaS with subscriptions. This v1 differs by:

1. Emotion is a structured, required dimension with a fixed taxonomy; "win rate by emotion" is the dashboard headline.
2. One-screen form with live P&L preview, keyboard-first, built for day-trader cadence.
3. Local-first SQLite, no login, you own the file.
4. Mistake tags are structured and filterable, not free-text.
5. Day-trader / indices only; no swing, options, or tax bloat.

## Build steps

1. Scaffold Next.js + Tailwind + TypeScript project.
2. Install deps: `better-sqlite3`, `drizzle-orm`, `drizzle-kit`, `recharts`, `react-hook-form`, `zod`, `date-fns`.
3. Define Drizzle schema (`lib/db/schema.ts`); generate + apply migration; seed instruments and mistake tags.
4. Build `lib/trade-math.ts` (pure functions) with unit tests for P&L, R, outcome.
5. Build `TradeForm` with live P&L preview; wire `/trades/new` Server Action.
6. Build `/trades` list + filter sidebar.
7. Build `/trades/[id]` edit + delete.
8. Build dashboard queries in `lib/queries.ts` (aggregations grouped by emotion, setup, time-of-day).
9. Build dashboard page with KPI strip + 4 charts.
10. Add screenshot upload (multipart Server Action → save to `./uploads/`, persist path).
11. Build `/instruments` admin page.
12. Polish: empty states, validation messages, dark theme pass.

## Verification

- **Unit tests** on `lib/trade-math.ts` covering long/short, win/loss/breakeven, fees, R calc with and without stop.
- **Manual end-to-end**:
  1. `npm run dev`, open `localhost:3000`.
  2. Add an instrument (US100, value/point = 1.0).
  3. Log a long winning trade with emotion `confident` and a short losing trade with emotion `fomo`.
  4. Confirm dashboard shows: 50% win rate, correct P&L, equity curve drawn, **emotion bar chart shows confident=100% wins, fomo=0%**.
  5. Filter trades list by emotion=`fomo` and confirm only the losing trade shows.
  6. Edit the losing trade, change exit price to a winner, confirm dashboard updates.
  7. Upload a screenshot to a trade, reload detail page, confirm image renders.
  8. Delete a trade, confirm it disappears from list and dashboard recomputes.

## Out of scope for v1 (parking lot)

- Auth / multi-user
- CSV broker import
- Stocks / Futures / Forex / Crypto asset types
- Pre-trade checklist, daily session log, cooling-off nudges, discipline scorecard
- Tags taxonomy editor (mistake/setup tags are seeded constants for now)
- Mobile-optimized layout (desktop-first)
- Backups / export
- Currency conversion across instruments
