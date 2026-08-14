---
name: frontend-design
description: Use when creating React Native components/screens, styling UI with NativeWind, or making design decisions (colors, typography, spacing, layout) in the app/ directory. Triggers on "design system", "styling", "NativeWind", "UI", or "component" in the context of the app.
---

# Frontend Design Skill

## When to Use

- Creating new screens or components in `app/src/`
- Styling UI elements with NativeWind `className` props
- Making design decisions about colors, typography, spacing, or layout
- Implementing interactive elements (buttons, chips, cards, badges)
- Ensuring visual consistency across the Map / Stamps / Badges / Settings views

## Design System

The full token reference — colors (light/dark), typography, spacing, radius, elevation, and component patterns — lives in [`app/DESIGN.md`](../../../app/DESIGN.md). Read it before styling anything; this file only summarizes the rules that are easy to violate by accident.

## Quick Reference

- **Styling is NativeWind only** — `className` props, never `StyleSheet.create` (see `docs/app.md`).
- **`primary` (forest green) means "done"** — a visited station, an earned badge, a successful action. Don't reuse it decoratively.
- **`error` is error-only** — never for warnings or neutral emphasis.
- **Borders over shadows** — `border border-black/10` (light) / `border-white/12` (dark), matching the existing `Card` component. Shadows render inconsistently across iOS/Android.
- **Respect light/dark mode** — `App.tsx` already reads `useColorScheme()`. Every color needs both a light and a `dark:` class; NativeWind does not switch a single token automatically.
- **Reuse `Card`** (`src/components/Card.tsx`) as the base container instead of building a second card variant.
- **No custom font, no icon library, no map library are installed yet** — check `app/package.json` before assuming one exists. Adding one is a new dependency; per `AGENTS.md`, flag it to the developer first rather than adding it silently.

## Resources

- `app/DESIGN.md` — full token table, Tailwind implementation snippet, component patterns, open questions
- `docs/app.md` — code conventions (structure, testing) for `app/`
