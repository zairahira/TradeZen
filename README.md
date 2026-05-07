# Trading Journal

A personal trading journal to track trades, analyze performance, and identify patterns in your trading behavior.

## Stack

- **Next.js 16** - App Router, server actions
- **SQLite + Drizzle ORM** - local database at `data/journal.db`
- **Tailwind CSS 4** - semantic token theming (light/dark)
- **Recharts** - performance analytics charts
- **React Hook Form + Zod** - form validation

## Getting Started

Install dependencies and set up the database:

```bash
npm install
npm run db:migrate
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate migrations after schema changes |
| `npm run db:migrate` | Apply migrations to the database |

## Features

- Log trades with entry/exit, lot size, emotion, setup, and ICT model
- Dashboard with equity curve, win rate breakdowns, and R-multiple distribution
- Customizable dashboard - reorder and hide/show charts
- Trades table with toggleable columns
- Filter trades by date, emotion, outcome, symbol, and model
- Light/dark theme
