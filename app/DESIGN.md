# HWN Tracker — App Design

Design tokens and UI conventions for the React Native app (`app/`). Styling is done via NativeWind (`className` props, Tailwind config in `app/tailwind.config.js`) — see [docs/app.md](../docs/app.md) for the code conventions and [ARCHITECTURE.md](../ARCHITECTURE.md#product-overview) for the product this UI serves.

**Status:** the app is still at scaffold stage (one screen, one `Card` component). This document defines the tokens new screens and components should use so the four MVP views (Map, Stamps, Badges, Settings) come out visually consistent — it is not describing an already-built design system.

---

## North Star: "Trail-Ready Clarity"

Hikers check this app outdoors, often in bright sunlight or low signal, while moving. The UI has to stay legible and calm rather than decorative:

- High-contrast text, generous tap targets, minimal visual noise.
- One clear accent for "you did the thing" (stamped a station, earned a badge) — collecting stamps is the core loop, the UI should make progress feel rewarding without turning busy.
- Borders over shadows: flat, precise, and renders consistently across iOS/Android (the existing `Card` component already does this — `border border-black/10`).
- Respect system light/dark mode (`App.tsx` already reads `useColorScheme`) — every color token below has a light and dark value; don't hardcode a color that only works in one mode.

---

## Color Tokens

| Token | Light | Dark | Usage |
|---|---|---|---|
| `background` | `#FAF9F6` | `#14181A` | Screen background |
| `surface` | `#FFFFFF` | `#1E2422` | Cards, list rows |
| `surface-alt` | `#F0EEE8` | `#262E2B` | Secondary surfaces, filter bars, inputs |
| `border` | `black/10` | `white/12` | Card and list-item separators |
| `text-primary` | `#1B1F1D` | `#F4F6F4` | Headlines, primary content |
| `text-secondary` | `#5B655F` | `#9AA69E` | Meta text, timestamps, hints |
| `primary` (forest green) | `#2F6B4F` | `#4ADE80` | Primary buttons, active filter chip, "stamped/visited" state, focus rings |
| `error` | `#C1443A` | `#F87171` | Error states only (e.g. failed backend check) |
| `badge-bronze` | `#B08D57` | `#C9A16D` | Bronze Wandernadel badge |
| `badge-gold` | `#D4AF37` | `#E8C866` | Gold Wandernadel badge |

Rules:

- **`primary` means "done"** — a visited station, an earned badge, a successful action. Don't reuse it for purely decorative accents; that dilutes the one signal users scan for while collecting stamps.
- **`error` is error-only.** Never use it for warnings or neutral emphasis.
- **Open/not-yet-visited stations use `text-secondary` / `border`, not a color of their own.** The MVP filter is binary (all / open / visited) — a dedicated "open" color would compete with `primary` for attention instead of receding.
- Border opacity values (`black/10`, `white/12`) follow NativeWind's `/opacity` suffix syntax, matching what `Card.tsx` already does.

### Tailwind implementation (target — not yet applied to `tailwind.config.js`)

```js
// app/tailwind.config.js — theme.extend.colors
colors: {
  background: { DEFAULT: '#FAF9F6', dark: '#14181A' },
  surface: { DEFAULT: '#FFFFFF', dark: '#1E2422' },
  'surface-alt': { DEFAULT: '#F0EEE8', dark: '#262E2B' },
  primary: { DEFAULT: '#2F6B4F', dark: '#4ADE80' },
  error: { DEFAULT: '#C1443A', dark: '#F87171' },
  'badge-bronze': { DEFAULT: '#B08D57', dark: '#C9A16D' },
  'badge-gold': { DEFAULT: '#D4AF37', dark: '#E8C866' },
}
```

Apply per-mode with NativeWind's `dark:` variant, e.g. `className="bg-background dark:bg-background-dark"` — NativeWind does not auto-switch a single token by itself, both classes must be present. Add this to `tailwind.config.js` when the first screen beyond `HomeScreen` needs real tokens instead of default Tailwind grays.

---

## Typography

No custom font is installed — use the React Native system font (San Francisco / Roboto) via Tailwind's default text classes, matching what `HomeScreen.tsx` already does:

- `text-2xl font-semibold` — screen titles
- `text-base` — body text
- `text-xs` — meta/secondary text (pair with `text-secondary` color and/or `opacity-60`)

Don't introduce a custom font without a product reason — it adds a load/flash-of-unstyled-text concern for no benefit at this stage.

---

## Spacing & Radius

Use Tailwind's default spacing scale — no custom scale needed. Match the existing `Card` component:

- Card padding: `p-4`, card margin: `m-4`
- Corner radius: `rounded-xl` (12px) — use consistently for cards, buttons, and chips so the app doesn't mix radii
- Gaps between stacked elements: `gap-3` / `mb-2` / `mb-3`, as already used in `HomeScreen.tsx`

## Elevation

Borders, not shadows — `1px` border at `border/10` (light) or `border/12` (dark) opacity, as `Card.tsx` already implements. Shadows render inconsistently between iOS and Android and aren't needed for a flat, precise interface.

## Component Patterns

**Card** (existing, `src/components/Card.tsx`) — the base container for station/stamp/badge entries. Reuse it rather than creating a second card variant.

**Primary button** (not yet built): `bg-primary dark:bg-primary-dark` fill, `text-white` (light) / `text-background-dark` (dark) for contrast, `rounded-xl px-4 py-2`.

**Status/filter chip** (needed for the all/open/visited filter on Map and Stamps): selected state = `bg-primary` fill; unselected = `bg-surface-alt border border-border`.

**Badge tile** (Badges screen): `bg-badge-gold` / `bg-badge-bronze` as a small icon/ring accent, not a full-tile fill — keep the tile itself on `surface` so earned vs. in-progress badges stay easy to scan at a glance.

## Open Questions — Not Yet Decided

- **Icon set:** no icon library is installed yet (`app/package.json` has no `react-native-vector-icons` or equivalent). Needed before Map/Stamps/Badges ship real status icons. Flag to the developer before adding one — new dependency.
- **Map rendering library:** not chosen yet (no `react-native-maps` or similar installed). Affects how the bundled map tiles from the [offline-first invariant](../ARCHITECTURE.md#architecture-invariant-offline-first) actually get rendered — needs a decision before the Map view is built, not a styling concern alone.
