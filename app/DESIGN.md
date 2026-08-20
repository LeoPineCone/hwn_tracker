# HWN Tracker — App Design

Design tokens and UI conventions for the React Native app (`app/`). Styling is done via NativeWind (`className` props, Tailwind config in `app/tailwind.config.js`) — see [docs/app.md](../docs/app.md) for the code conventions and [ARCHITECTURE.md](../ARCHITECTURE.md#product-overview) for the product this UI serves.

**Status:** the app is still at scaffold stage (one screen, one `Card` component, default Tailwind theme). This document defines the tokens new screens and components should use to match the approved mockups — it is not describing an already-built design system. This is the **only** design doc for the project, so design guidance has one home. Design source material lives alongside it in [`app/design/`](design/): the **Organic** design system (`design/_ds/organic/styles.css` + `theme.json`), the interactive prototype `design/Harzer Wandernadel.dc.html` and its self-contained build `design/stand_alone_app.html` (their inline styles and JS data objects — `NEEDLES`, `ICONS`, `themeVars` — are where several values below, including the full dark-mode ramp, come from), and the static mockups in `design/screenshots/`. If a value here and one of those source files ever disagree, the source file wins — update this doc to match.

---

## North Star: "Organic — Trail-Ready Warmth"

The mockups replace the earlier flat/cool scaffold direction with a warm, rounded, slightly playful system: cream-and-sand ground, terracotta + sage accents, a display serif for headings over a humanist sans for body text, soft pill shapes, and real (if restrained) shadows instead of borders-only. Hikers still check this outdoors, on the move, so warmth can't cost legibility:

- Generous tap targets, high-contrast text on the cream ground, minimal clutter — the destination, not the decoration.
- One clear accent for "you did the thing": **sage** (`accent-2`) marks visited stations, earned badges, and reached goals. **Terracotta** (`accent`) marks "open"/actionable — open stations, primary CTAs, the active/default filter.
- Round, not sharp: `radius-lg` (28px) for sheets and big containers, `radius-md` (16px) for cards and rows, full pill (`999px`) for buttons, chips, and stamp markers. No sharp corners anywhere.
- Soft elevation instead of pure borders: `shadow-sm/md/lg`, tuned to the warm ground. Borders still appear (dividers, unselected chips) but are not the only depth cue.

---

## Color Tokens

Base roles (from `design/_ds/organic/styles.css`):

| Token | Value | Usage |
|---|---|---|
| `bg` | `#f5ead8` | Screen background |
| `surface` | `#ebddc5` | Cards, list rows, sheets |
| `text` | `#201e1d` | Primary text |
| `accent` (terracotta) | `#c67139` | "Open"/actionable: open stations, primary buttons, active default filter |
| `accent-2` (sage) | `#7a8a5e` | "Visited/reached": stamped stations, completed badge collections, trail references |
| `divider` | `text` at 16% opacity | Card/list separators — NativeWind's `/opacity` suffix, e.g. `border-text/16` |

Each role also carries a full **100–900 tonal ramp**, generated in OKLCH so the same step number carries the same visual weight across ramps. Use light steps (100–300) for tint fills/badges/hovers, ~500 as the role's base, and dark steps (700–900) for text-on-tint and pressed states:

```
neutral-100 #f9f4ed   neutral-200 #eee7db   neutral-300 #dcd3c4
neutral-400 #c0b6a5   neutral-500 #a19786   neutral-600 #82796a
neutral-700 #645c50   neutral-800 #474238   neutral-900 #2e2b25

accent-100 #fff2eb   accent-200 #ffe1d0   accent-300 #ffc6a5
accent-400 #f6a06b   accent-500 #d67f48   accent-600 #b2622d
accent-700 #8c491a   accent-800 #643312   accent-900 #402310

accent-2-100 #f0fae1   accent-2-200 #e1eecc   accent-2-300 #ccdbb2
accent-2-400 #aebf92   accent-2-500 #8fa073   accent-2-600 #728157
accent-2-700 #56633f   accent-2-800 #3d472b   accent-2-900 #272e1b
```

### Dark Mode

Dark mode **is** specified — it's a full second ramp, originally shipped in the prototype (`design/Harzer Wandernadel.dc.html`) and now also authored as `:root[data-theme='dark']` in `design/_ds/organic/styles.css`, not something to invent. Important behavioral detail: in the prototype it's a **manual in-app toggle** ("Dunkler Modus" on the Profil screen, persisted, default off), not an automatic OS-`prefers-color-scheme` switch. `App.tsx` currently derives its `StatusBar` style from `useColorScheme()` alone — that needs to become app-level state (e.g. a settings store) that Profil's toggle writes to and every screen reads, with OS scheme only as the initial default if desired. Don't wire this as a pure `dark:` media-query mirror without a Profil control.

```
bg #221d18            surface #2b2420          text #f2e8d8
accent #e2884f         accent-2 #a3b783
divider: text at 14% opacity (slightly lower than light mode's 16%)

neutral-100 #2f2822   neutral-200 #3a3229   neutral-300 #4d443a
neutral-400 #675c4e   neutral-500 #8a7d6a   neutral-600 #ab9f8a
neutral-700 #c9beac   neutral-800 #e2d9c8   neutral-900 #f5efe2

accent-100 #4a2c18    accent-200 #5c3820    accent-300 #7a4b28
accent-400 #a5652f    accent-500 #c67139    accent-600 #d98a52
accent-700 #e8a476    accent-800 #f3c39d    accent-900 #fbe0c8

accent-2-100 #2c331f   accent-2-200 #3a4429   accent-2-300 #4e5a37
accent-2-400 #687547   accent-2-500 #7a8a5e   accent-2-600 #96a578
accent-2-700 #b3c093   accent-2-800 #cddab0   accent-2-900 #e6efd2

shadow-sm 0 1px 2px rgba(0,0,0,.5)   shadow-md 0 3px 10px rgba(0,0,0,.55)   shadow-lg 0 12px 32px rgba(0,0,0,.6)
```

Note the ramps don't just invert — e.g. dark mode's `accent-500` (`#c67139`) equals light mode's base `accent`, and neutral/accent/accent-2 ramps each reverse their light-to-dark direction independently. Implement both as named NativeWind color scales (e.g. `accent-DEFAULT`/`50`.../`900` per mode) selected by app theme state, not a single token flipped via `dark:` on each class — the values genuinely differ per step, not just in lightness.

### Status/Error Colors

Not part of the Organic ramps (this is a one-off palette used only for the emergency-info block on Profil) — light values only, confirmed from the prototype:

| Token | Value | Usage |
|---|---|---|
| `error-tint` | `#fbe6df` | Emergency card background |
| `error-border` | `#c95030` | Emergency card border, secondary button outline |
| `error` | `#b3401f` | Primary emergency button fill, urgent dot/marker |
| `error-text` | `#8e2f14` | Text on `error-tint`/`bg` (coordinates, headings in the emergency sheet) |
| `error-on` | `#fdf1ec` | Text/icon on `error` fill |

The prototype hardcodes these regardless of the dark-mode toggle — no dark variant exists yet for this palette. Flag to the designer before dark mode ships if the emergency screen needs one; don't invent dark values here. Keep this palette **error-only** — never reuse for warnings or neutral emphasis.

Rules:

- **`accent` (terracotta) means "open/act on this."** Primary buttons, the default "Alle" filter state, open-station markers.
- **`accent-2` (sage) means "done."** A visited station, an earned/reached badge collection, the "besucht" filter and marker fill. In the mockups this shows up as a *dark* sage (`accent-2-800`/`900`, e.g. the map's filled station pins, the active tab-bar pill, the "Erfolge" hero card background) — don't default to the lighter mid-tone; dark steps are load-bearing here, not just text-on-tint.
- **Error/destructive states** (e.g. the emergency-info block on Profil) use the dedicated `error*` palette above — never `accent` (terracotta is "open," not "urgent") and never for warnings or neutral emphasis.
- **Open/not-yet-visited stations** use `neutral` + dashed borders, not a color of their own — matches the existing "don't invent a third status color" principle.
- The `divider` token is opacity-based (`text` at 16%), same convention `Card.tsx` already uses (`border-black/10`) — keep using the `/opacity` suffix rather than a separate hex.

### Tailwind implementation (target — not yet applied to `tailwind.config.js`)

```js
// app/tailwind.config.js — theme.extend
colors: {
  bg: '#f5ead8',
  surface: '#ebddc5',
  text: '#201e1d',
  accent: {
    DEFAULT: '#c67139',
    100: '#fff2eb', 200: '#ffe1d0', 300: '#ffc6a5', 400: '#f6a06b',
    500: '#d67f48', 600: '#b2622d', 700: '#8c491a', 800: '#643312', 900: '#402310',
  },
  'accent-2': {
    DEFAULT: '#7a8a5e',
    100: '#f0fae1', 200: '#e1eecc', 300: '#ccdbb2', 400: '#aebf92',
    500: '#8fa073', 600: '#728157', 700: '#56633f', 800: '#3d472b', 900: '#272e1b',
  },
  neutral: {
    100: '#f9f4ed', 200: '#eee7db', 300: '#dcd3c4', 400: '#c0b6a5',
    500: '#a19786', 600: '#82796a', 700: '#645c50', 800: '#474238', 900: '#2e2b25',
  },
  error: {
    tint: '#fbe6df', border: '#c95030', DEFAULT: '#b3401f',
    text: '#8e2f14', on: '#fdf1ec',
  },
  // Dark-mode values are a genuinely separate ramp (not a lightness-flip of the
  // light one) — see the Dark Mode section above for the full set per role.
},
borderRadius: {
  sm: '8px',
  md: '16px',
  lg: '28px',
  // `rounded-full` (Tailwind default, 9999px) already covers the "pill" shape — no extra key needed.
},
boxShadow: {
  sm: '0 1px 2px rgba(46,43,37,0.14)',
  md: '0 3px 10px rgba(46,43,37,0.16)',
  lg: '0 12px 32px rgba(46,43,37,0.22)',
},
```

Applying `p-4`/`gap-3`/etc. as-is is fine — Organic's spacing scale (see below) is close enough to Tailwind's default that we don't need to override the numeric spacing keys; only colors, radius and shadow need extending.

**Implementation note on dark mode:** each dark-mode ramp step is an independent value (not a computed lightness-flip of the light one — see Dark Mode above), so a plain per-utility `dark:bg-accent-500` doubling won't scale cleanly across every ramp step the app uses. The prototype implements this by swapping a block of CSS custom properties (`--color-accent`, `--color-accent-500`, …) on a wrapping element when the Profil toggle flips. NativeWind's runtime theme-variable support (`vars()`, if available in the installed NativeWind version) is the natural RN equivalent — confirm the exact API against the installed NativeWind version before committing to an approach, rather than hand-rolling `dark:`-prefixed duplicates of every color key. Either way, dark mode is driven by app theme state (the Profil toggle), not `useColorScheme()` alone — see Dark Mode above.

---

## Typography

Two typefaces, both Google Fonts, neither installed yet (`app/package.json` has no font packages; the project is bare React Native, not Expo, so fonts need manual asset linking, not `expo-font` — see Open Questions):

- **`font-heading` — [Caprasimo](https://fonts.google.com/specimen/Caprasimo?preview.script=Latn), weight 400 only.** Display serif. Used for more than plain titles — the prototype's `.btn`/`.card-title` CSS and every primary/secondary button, the nav brand, badge/collection names, profile display name, avatar initials, section headers, *and* large stat/numeral call-outs (progress-ring numbers, stat-row figures like "312 km") all use it. Still never for body copy, descriptions, form labels, or chip/tag text.
- **`font-body` — [Figtree](https://fonts.google.com/specimen/Figtree?preview.script=Latn), weights 400/600/700.** Everything else: labels, descriptions, chips/tags, meta text, form fields, section kickers.

Sizes observed in the mockups:

| Size | Font | Usage |
|---|---|---|
| 24px | heading | Bottom-sheet / dialog titles |
| 20px | heading | Profile display name, avatar-circle initials (smaller, ~22px) |
| 18px | heading | Card titles (collection name, station name) |
| 14–15.5px | heading (400) | Button/CTA labels (pill buttons use the heading font, not body — see Component Patterns) |
| 14–15.5px | body | Body copy, descriptions (never below 15px for a description block — legibility) |
| 11–13px | body | Labels, meta text, tags/chips |
| 11px | body, 600 weight, `.12em` tracking, uppercase | Section kickers (e.g. "HARZER WANDERNADEL", "NÄCHSTE NADEL") — pair with `neutral-600` |

Until the fonts are linked, headings/buttons should still visually read as the heading role (bold, larger) using the system font as a placeholder — don't block other work on the font decision.

---

## Spacing & Radius

Organic's spacing scale is a 1.10× density multiplier over a standard 4px base — close enough to Tailwind's default `space`/`p`/`gap` scale (4/8/12/16/24/32) that we use Tailwind's scale as-is rather than overriding it:

- Card padding: `p-4`, card margin: `m-4` (matches existing `Card.tsx`)
- Gaps between stacked elements: `gap-3` / `mb-2` / `mb-3`

Radius — three sizes plus pill, no sharp corners anywhere:

- `rounded-lg` (28px, custom key above) — bottom sheets, big containers, hero cards
- `rounded-md` (16px, custom key above) — cards, list rows, buttons-in-lists
- `rounded-sm` (8px, custom key above) — small inline elements
- `rounded-full` (Tailwind default pill) — primary/secondary buttons, filter chips, tab badges, stamp markers, avatar circles

## Elevation

Soft shadows tuned to the warm ground, not borders-only:

- `shadow-sm` — list/content cards
- `shadow-md` — icon circles, coin-style badges, floating controls (e.g. the map's recenter button)
- `shadow-lg` — bottom sheets, dialogs (top of the elevation stack)

Borders remain for dividers and unselected/outline states (`border-text/16`, i.e. `text` at 16% opacity), but are no longer the sole depth cue. Because RN shadows are two different native primitives (iOS `shadow*` props vs. Android `elevation`), verify NativeWind's `shadow-*` utilities render acceptably on both platforms once implemented — flag any gap to the developer rather than silently approximating with only one platform's primitive.

---

## Layout Patterns

These come directly from the mockups (`design/screenshots/`) and the interactive prototype (`design/Harzer Wandernadel.dc.html`) — see Language & Tone below for the German domain vocabulary and copy rules.

**Tab bar** — 3 tabs, matching [ARCHITECTURE.md](../ARCHITECTURE.md#product-overview)'s MVP scope: **Karte** (map, includes a "Stempel" grid toggle in-screen), **Erfolge** (badge/collection progress), **Profil** (account + settings). Active tab: icon on a `rounded-full` `accent-2-200`-ish tint pill; inactive: plain `neutral-600` icon + label, no fill. Icons are Lucide-style, stroke-width **2.75**, `stroke-linecap: round`, and the exact path data is already vendored in the prototype's `ICONS` constant (`design/Harzer Wandernadel.dc.html`) — copy those paths rather than re-drawing icons from scratch. Rendering them needs `react-native-svg`, not yet installed — see Open Questions.

**Segmented control** (Karte/Stempel toggle) — pill track (`surface`, `rounded-full`), active segment `bg-bg` (or `surface`) fill, inactive transparent.

**Toggle switch** (GPS, Offline-Karte, Dunkler Modus on Profil) — pill track, 50×29px: `accent-2-700` fill when on / `neutral-400` when off, knob slides `flex-start`→`flex-end`. The dark-mode row is the app's manual theme switch — see Dark Mode above.

**Filter chips** (all/open/visited, and the collection filter list in the filter sheet) — pill shape; selected = `accent-2-800` fill with light text; unselected = `neutral-100` fill + `border-text/16`. Radio-style single-select rows (in the filter sheet) use a `accent-2-100` tint background + `accent-2` border + green dot when selected, `surface`/`border-text/16` when not.

**Bottom sheet** — `position: absolute; inset: 0`, backdrop `rgba(32,30,29,.42–.5)`, panel `rounded-t-lg` (28px top corners only), 44×4px `neutral-400` pill drag-handle centered at the top, pop-in animation (~220ms ease-out).

**Stamp markers** — two distinct treatments depending on context, don't conflate them:
- *On the map*: a pin shape (circle with one corner squared and the whole thing rotated -45°) — filled `accent-2-800`/ink when visited, dashed-outline circle when open.
- *In the Stempel grid*: a plain circle badge — solid border + station number/name when visited, dashed border + "OFFEN" label (muted `neutral`) when open. Don't reuse the pin shape here; the grid is a different density/context than the map.

**Collection/badge card** — 36px icon circle with a metal-tone ring, title + meta stacked left, status at right. Metal tones aren't a separate palette — they're existing ramp steps, confirmed from the prototype's `NEEDLES` data (`fill`/`ring`):

| Tier | Fill | Ring |
|---|---|---|
| Bronze | `accent-600` | `accent-300` |
| Silber | `neutral-500` | `neutral-300` |
| Gold | `accent-500` | `accent-200` |
| Wanderkönig | `accent-2-600` | `accent-2-200` |
| Wanderkaiser | `accent-2-800` | `accent-2-300` |

Status label is `"{reqLeft} offen"` while in progress; once earned, always **"Ziel erreicht am {date}"** — confirmed as the actual value in the prototype's data (`status: 'ziel erreicht'`) and its detail-sheet UI. There is no "verliehen" anywhere in the underlying data — treat any UI text that still says "verliehen" as stale and correct it to "Ziel erreicht am …".

**Description panels** (e.g. collection detail body text) always get their own `surface` + `rounded-md` + `p-[18px]` container — never bare paragraph text directly on the sheet background. Minimum 15px font.

---

## Component Patterns

**Card** (existing, `src/components/Card.tsx`) — still the base container, but its current implementation (`border border-black/10`, no fill, no shadow) predates this system and needs updating to `bg-surface rounded-md shadow-sm` (dropping the border-only look) once the token extension above lands.

**Primary button**: `bg-accent` fill, `rounded-full`, `bg`-colored text (cream on the terracotta fill) set in **`font-heading`** at ~15px, weight 400 — confirmed from the prototype's `.btn` CSS (`font-family: var(--font-heading)`) and every CTA in the mockups ("Route", "36 Stempelstellen zeigen", "Speichern", …). The prototype is unambiguous that buttons use the heading font, not the body font.

**Secondary/ghost button**: outline (`border-text/16`) or tinted variant from the accent ramp, same pill shape and `font-heading` label, `text` or `accent-2-900` colored text on the outline variant.

**Status/filter chip**: see Layout Patterns above.

**Badge/collection tile**: see Layout Patterns above — icon circle stays on `surface`, ring color signals bronze/silver/gold, not a full-tile fill, so earned vs. in-progress scan easily in a list.

---

## Language & Tone (Copy)

The app's UI copy is German — hiking-warm and direct, not corporate:

- German, direct, wanderfreundlich-warm. Avoid anglicisms where a German word fits.
- Decimal numbers use a comma, not a period: `2,4 km`, not `2.4 km`.
- Status labels are short and active: "Noch 4 Stempel", "Ziel erreicht am …", "X von Y" — not passive/bureaucratic phrasing.
- Domain terms: a station is `visited` (gestempelt) or `isOpen` (offen) — never "erledigt/fehlt". A collection's earned state reads "Ziel erreicht am {date}" — see Layout Patterns above.

## No-Gos

- No sharp corners, no desaturating the palette toward gray — warmth is the point (see North Star).
- No second display typeface next to Caprasimo — it's the only heading/display voice in the system.
- No browser/OS-default focus rings — every focusable element gets an `accent`-colored outline instead.
- No hardcoded colors or radii in component code — always the tokens above, never a raw hex or px value that a token already covers.

---

## Open Questions — Not Yet Decided

Dark mode (see Dark Mode above), the collection-earned copy (`"Ziel erreicht am …"`, see Layout Patterns above), the screen/tab structure (3 tabs, matches [ARCHITECTURE.md](../ARCHITECTURE.md#product-overview)), and badge metal colors (existing ramp steps, see Layout Patterns) are all settled. What's left:

- **Font loading.** Caprasimo (400) + Figtree (400/600/700) are picked — [Caprasimo](https://fonts.google.com/specimen/Caprasimo?preview.script=Latn), [Figtree](https://fonts.google.com/specimen/Figtree?preview.script=Latn) — but not installed. The app is bare React Native (no Expo), so this means downloading the `.ttf` files and linking them (iOS `Info.plist` + Android `assets/fonts`, e.g. via `react-native.config.js` `assets` + `npx react-native-asset`), not `expo-font`. New build step — flag to the developer before adding.
- **Icon rendering.** The icon *paths* are settled (vendored in the prototype's `ICONS` constant, stroke-width 2.75, Lucide-style — see Layout Patterns), but nothing renders SVG yet: `react-native-svg` isn't installed. New dependency — flag to the developer before adding, even though it's the obvious/only reasonable choice here.
- **Map rendering library.** Still not chosen (no `react-native-maps` or similar). Independent of these tokens but blocks the Karte screen — see the existing note in [ARCHITECTURE.md](../ARCHITECTURE.md#architecture-invariant-offline-first).
- **Dark-mode theming mechanism.** *Which* dark values to use is settled (see Dark Mode above); *how* to wire runtime theme switching in NativeWind (`vars()` vs. per-key `dark:` duplication vs. something else) still needs a spike — see the implementation note under Tailwind implementation.
- **Error palette has no dark-mode variant.** The prototype hardcodes the emergency-info colors regardless of the dark-mode toggle — flag to the designer if that screen needs one before dark mode ships.