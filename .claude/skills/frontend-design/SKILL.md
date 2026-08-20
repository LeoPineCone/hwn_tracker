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
- Ensuring visual consistency across the Karte / Erfolge / Profil screens

## Design System

The app follows the **Organic** design system (warm cream/terracotta/sage palette, Caprasimo headings over Figtree body text, pill shapes, soft shadows). The full token reference — colors (light + specified dark ramp), typography, spacing, radius, elevation, and component patterns — lives in [`app/DESIGN.md`](../../../app/DESIGN.md). Read it before styling anything; this file only summarizes the rules that are easy to violate by accident.

## Quick Reference

- **Styling is NativeWind only** — `className` props, never `StyleSheet.create` (see `docs/app.md`).
- **`accent-2` (sage) means "done"** — a visited station, an earned/reached badge collection. **`accent` (terracotta) means "open/act on this"** — open stations, primary buttons, the default filter. Don't swap these or use either decoratively.
- **`error*` is error-only** — never for warnings or neutral emphasis.
- **Soft shadows, not borders-only** — `shadow-sm/md/lg` plus `rounded-full`/`rounded-md`/`rounded-lg` pill-and-round shapes are the system now; borders remain only for dividers and unselected/outline states. This reverses the old "borders over shadows, no sharp radius" rule from the pre-Organic scaffold — don't follow outdated muscle memory here.
- **Buttons use the heading font** (`font-heading`/Caprasimo), not the body font — confirmed from the prototype's `.btn` CSS. Easy to get backwards.
- **Dark mode is specified but is a manual in-app toggle** (Profil → "Dunkler Modus"), not a pure `useColorScheme()` mirror, and its ramp values are independent per step — don't assume a simple `dark:` lightness flip. See `app/DESIGN.md`'s Dark Mode section.
- **Reuse `Card`** (`src/components/Card.tsx`) as the base container instead of building a second card variant — but note its current implementation predates this system and needs updating (see `app/DESIGN.md`).
- **Fonts (Caprasimo, Figtree) are chosen but not installed; icons are chosen (exact SVG paths vendored in the prototype) but nothing renders SVG yet (`react-native-svg` missing); no map library is installed** — check `app/package.json` before assuming one exists. Adding any of these is a new dependency; per `AGENTS.md`, flag it to the developer first rather than adding it silently.

## Resources

- `app/DESIGN.md` — full token table, Tailwind implementation snippet, component patterns, open questions
- `docs/app.md` — code conventions (structure, testing) for `app/`
