# Trading Journal - Visual Redesign Plan

## Context
The app has a hardcoded dark theme using Geist font and a flat palette of raw hex values (#111, #222, #aaa, etc.) scattered across every component. The goal is a Clean & Modern aesthetic (Linear/Vercel-style), Inter font at 16px, a charcoal dark theme, a warm-cream light theme with a toggle, smooth transitions, and better readability - without touching layouts.

## Decisions
- **Font**: Inter (replace Geist/Geist Mono from `next/font/google`)
- **Dark bg**: charcoal ~#18181b
- **Light bg**: warm cream ~#fdf8f2
- **Accents**: keep emerald-400 (gains) and red-400 (losses) unchanged
- **Base font size**: 16px
- **Theme toggle**: `next-themes` package (SSR-safe, no flash)

---

## Step 1 - Install next-themes
```bash
npm install next-themes
```

---

## Step 2 - Redesign `app/globals.css`

Replace with a full semantic token system:

```css
@import "tailwindcss";

/* Light theme (default :root) */
:root {
  --canvas:          #fdf8f2;   /* page background */
  --card:            #ffffff;   /* card / nav */
  --card-2:          #f7f1ea;   /* slightly elevated surface */
  --card-3:          #ede8e0;   /* deeper surface / hover bg */
  --line:            #e4ddd4;   /* default border */
  --line-strong:     #d4cec6;   /* strong border */
  --ink:             #18181b;   /* primary text */
  --ink-2:           #3f3f46;   /* secondary text */
  --ink-3:           #71717a;   /* muted text */
  --ink-4:           #a1a1aa;   /* subtle / placeholder */
  color-scheme: light;
}

/* Dark theme */
.dark {
  --canvas:          #18181b;
  --card:            #232327;
  --card-2:          #2a2a2e;
  --card-3:          #303034;
  --line:            #2d2d32;
  --line-strong:     #3d3d42;
  --ink:             #f4f4f5;
  --ink-2:           #a1a1aa;
  --ink-3:           #71717a;
  --ink-4:           #52525b;
  color-scheme: dark;
}

@theme inline {
  --color-canvas:     var(--canvas);
  --color-card:       var(--card);
  --color-card-2:     var(--card-2);
  --color-card-3:     var(--card-3);
  --color-line:       var(--line);
  --color-line-strong: var(--line-strong);
  --color-ink:        var(--ink);
  --color-ink-2:      var(--ink-2);
  --color-ink-3:      var(--ink-3);
  --color-ink-4:      var(--ink-4);
  --font-sans:        var(--font-inter);
}

html {
  font-size: 16px;
}

body {
  background: var(--canvas);
  color: var(--ink);
  font-family: var(--font-sans), system-ui, sans-serif;
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* Smooth transitions on all themed elements */
*, *::before, *::after {
  transition-property: background-color, border-color, color;
  transition-duration: 0.15s;
  transition-timing-function: ease;
}

input, select, textarea {
  color-scheme: light dark;
}
```

---

## Step 3 - Update `app/layout.tsx`

- Replace `Geist`/`Geist_Mono` imports with `Inter` from `next/font/google`
- Add `suppressHydrationWarning` to `<html>` (required by next-themes)
- Wrap `<body>` with `<ThemeProvider>`
- Add `<ThemeToggle />` to nav (right side, `ml-auto`)
- Replace all hardcoded hex classes with semantic tokens:
  - `bg-[#0a0a0a]` → `bg-canvas`
  - `bg-[#111]` → `bg-card`
  - `border-[#222]` → `border-line`
  - `text-[#e5e5e5]` → `text-ink`
  - `text-[#aaa]` → `text-ink-2`

---

## Step 4 - Create `components/Providers.tsx`
Client component that wraps `ThemeProvider` from next-themes:
```tsx
'use client';
import { ThemeProvider } from 'next-themes';
export default function Providers({ children }) {
  return <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>{children}</ThemeProvider>;
}
```

---

## Step 5 - Create `components/ThemeToggle.tsx`
Client component with sun/moon SVG icons and `useTheme()` from next-themes.
Styled as a small ghost icon button, placed at `ml-auto` in the nav.

---

## Step 6 - Replace hardcoded colors across all files

### Color mapping
| Old hex(es)         | New Tailwind class |
|---------------------|--------------------|
| `#0a0a0a`, `#0d0d0d`, `#0f0f0f` | `bg-canvas` |
| `#111`, `#1e1e1e`   | `bg-card` / inline `var(--card)` |
| `#1a1a1a`           | `bg-card-2` / inline `var(--card-2)` |
| `#222` (bg)         | `bg-card-3` |
| `#222`, `#1a1a1a` (border) | `border-line` |
| `#333` (border)     | `border-line-strong` |
| `#e5e5e5`           | `text-ink` |
| `#aaa`, `#bbb`      | `text-ink-2` |
| `#666`, `#888`, `#999` | `text-ink-3` |
| `#444`, `#555`      | `text-ink-4` |
| `#0d1a0d` (green bg) | keep as-is (it's a semantic accent bg) |
| `#1a3a1a` (green border) | keep as-is |
| `#2563eb` (primary btn) | keep as-is |

### Files to update
- `app/layout.tsx`
- `app/page.tsx`
- `app/trades/page.tsx`
- `app/trades/[id]/page.tsx`
- `app/trades/new/page.tsx`
- `app/settings/page.tsx`
- `components/KpiStrip.tsx`
- `components/Filters.tsx`
- `components/TradeForm.tsx`
- `components/DateFilterBar.tsx`
- `components/AddTradeButton.tsx`
- `components/TradesTable.tsx`
- `components/TradeDrawer.tsx`
- `components/charts/EquityCurve.tsx`
- `components/charts/WinRateByEmotion.tsx`
- `components/charts/WinRateBySetup.tsx`
- `components/charts/WinRateByModel.tsx`
- `components/charts/WinRateByTimeOfDay.tsx`
- `components/charts/RDistribution.tsx`

For chart components: inline `style` objects use `var(--card)`, `var(--line)`, `var(--ink-2)` etc. instead of raw hex.

---

## Verification
1. `npm run dev` - confirm app loads with no TS errors
2. Check dark theme renders with charcoal bg + warm text
3. Click theme toggle - verify smooth 0.15s transition to warm cream light theme
4. Check gain/loss accents still show emerald/red
5. Check mobile viewport - font size and spacing should feel more spacious
6. Check charts re-render correctly with theme-aware colors
