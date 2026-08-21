# Build the app shell with a bottom tab bar (Karte / Erfolge / Profil)

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.

## Purpose / Big Picture

Today the HWN Tracker app opens onto a single scaffold screen — a card with a "Check backend"
button — and there is no way to get anywhere else, because there is no navigation of any kind in
`app/`. Nothing in `app/package.json` provides it, and `app/App.tsx` renders exactly one component.

After this change, launching the app shows the product's real shell: a persistent bottom bar with
three tabs — **Karte**, **Erfolge**, **Profil** — matching the approved mockup
`app/design/screenshots/screen_map_v1.png`. Karte is active on launch, sitting on a pale-sage pill;
the other two are plain muted icon-and-label. Tapping Erfolge moves the pill, recolors the icon and
label, and swaps the body to an Erfolge placeholder screen. Tapping back to Karte returns to a
Karte screen that is exactly as the hiker left it — its Karte/Stempel segment selection has not
been reset, because the screen was never unmounted.

You can see it working by running the app on a simulator or emulator and tapping through the three
tabs (`cd app && npm run ios`, or `npm run android`). Two things should be visually obvious and are
the point of the whole change: the warm cream-and-sage palette from `app/DESIGN.md` is finally
rendering instead of Tailwind's stock theme, and the tab icons are the exact vendored Lucide-style
paths from the design prototype rather than emoji or redrawn approximations.

This change also lands two prerequisites that every later screen story depends on: the design
tokens from `app/DESIGN.md` are wired into `app/tailwind.config.js`, and `react-native-svg` is
installed so any component can render the prototype's icons.

What this change deliberately does **not** do: no map, no station data, no badge data, no real
Erfolge or Profil content, no status filter chips (those belong to issue #5), no Stempel grid
(issue #6), no deep linking, no persistence of the selected tab across app restarts, and no dark
mode. Those exclusions are deliberate; see the Decision Log.

## Progress

- [x] Milestone 1 (2026-08-21, executor): design tokens in `app/tailwind.config.js`,
      `react-native-svg` installed, and `app/src/components/Icon.tsx` rendering the vendored
      prototype paths. `app/__tests__/Icon.test.tsx` passes (3 tests); full app suite
      `Test Suites: 2 passed, 2 total` / `Tests: 4 passed, 4 total`; lint 0 errors + 1 pre-existing
      warning; `tsc --noEmit` 1 pre-existing error, unchanged.
- [x] Milestone 2 (2026-08-21, executor): `TabBar`, `TabNavigator`, and the three tab screens;
      `app/App.tsx` rewired to `SafeAreaProvider` → `StatusBar` → `TabNavigator`;
      `app/src/screens/HomeScreen.tsx` deleted (no remaining references). Full suite
      `Test Suites: 3 passed, 3 total` / `Tests: 8 passed, 8 total`; lint 0 errors + 1
      pre-existing warning; `tsc --noEmit` 1 pre-existing error, unchanged. Manual iOS/Android
      simulator run could not be performed in this execution environment (no simulator/CocoaPods
      available — see Surprises & Discoveries); code-level acceptance is fully verified but the
      visual/manual acceptance step of Milestone 2 is deferred to the developer.
- [ ] Milestone 3: the Karte screen's Karte/Stempel segmented control, and proof that its selection
      survives a tab round trip.
- [ ] Milestone 4: documentation reconciled (`app/DESIGN.md`, `ARCHITECTURE.md`, `docs/app.md`) and
      the full acceptance sweep run.
- [ ] ExecPlan finalized: Outcomes & Retrospective written, plan moved from
      `docs/exec-plans/active/` to `docs/exec-plans/completed/`.

## Baseline confirmation (2026-08-21, executor)

Re-ran the baseline commands at the start of execution, before any change. All numbers match the
plan's recorded baseline exactly: root `npm test` 2 passed (backend + infrastructure); `app/npm
test` 1 suite / 1 test passed; `app/npm run lint` 0 errors, 1 pre-existing warning
(`__ds_scope` in `_ds_bundle.js`); `app/npx tsc --noEmit` exactly 1 pre-existing error
(`App.tsx:13:8` `./global.css`). No deviation to record.

## Surprises & Discoveries

These were found while researching this plan. Each one changes what the executor must build, so
none of them is optional colour. Add to this section as you go — anything you discover that this
plan did not anticipate belongs here with its evidence.

- Observation: `app/DESIGN.md` line 198 says the active tab sits on a **`rounded-full`** pill. The
  prototype does not do that — it uses `border-radius: var(--radius-md)`, i.e. a 16px rounded
  rectangle, and the mockup agrees.
  Evidence: `app/design/Harzer Wandernadel.dc.html` line 398 sets
  `border-radius:var(--radius-md)` on the tab item; `app/design/_ds/organic/styles.css` line 56
  defines `--radius-md: 16px`. Cropping `app/design/screenshots/screen_map_v1.png` around the tab
  bar shows a rounded rectangle roughly 123×50 px with a corner radius near 15 px — clearly not a
  50%-of-height pill.
  Consequence: build the pill as `rounded-md`, not `rounded-full`, and correct `app/DESIGN.md` in
  Milestone 4. `app/DESIGN.md` line 5 states its own precedence rule — "If a value here and one of
  those source files ever disagree, the source file wins — update this doc to match" — so this is
  a documentation bug, not a design change.

- Observation: the active pill covers the icon **and** the label, not just the icon, and it spans
  the full width of the tab's flex cell.
  Evidence: `app/design/Harzer Wandernadel.dc.html` line 398 — the background is set on the tab
  item `<div>` that contains both the icon `<span>` and the label `<span>`, and that div carries
  `flex:1`. `app/DESIGN.md` line 198's phrasing "icon on a … tint pill" understates this.
  Cross-checked against both `screen_map_v1.png` (Karte active) and `screen_rewards_v1.png`
  (Erfolge active).

- Observation: the prototype's `ICONS` constant contains **four** entries, not three. The fourth,
  `stempeln`, is defined but never rendered by the tab bar — the Stempel view is reached through
  the in-screen segmented control, not through a tab.
  Evidence: `app/design/Harzer Wandernadel.dc.html` lines 687–692 define `karte`, `stempeln`,
  `erfolge`, `profil`; nothing in the file references `ICONS.stempeln`.

- Observation: the `karte` icon is the only one whose path data is **two** paths, separated by a
  `|` delimiter that the prototype's own renderer splits on. Treating it as a single path string
  would silently drop the pin's centre dot.
  Evidence: line 688 is
  `'M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z|M12 10h.01'`, and line 767 does
  `ICONS[kind].split('|').map(p => '<path d="' + p + '"></path>').join('')`. The second path,
  `M12 10h.01`, is a zero-length stroke that only renders as a dot because `stroke-linecap` is
  `round` — get the linecap wrong and the dot disappears entirely.

- Observation: the tab bar has **no CSS class** anywhere. All of its styling is inline, so there is
  no stylesheet to port.
  Evidence: the prototype's only `<style>` block is lines 27–32 and contains nothing tab-related;
  the tab bar's appearance comes entirely from the inline `style` attributes at lines 396–400 plus
  the `t.bg` / `t.fg` bindings at lines 874–875.

- Observation: `npx tsc --noEmit` inside `app/` already fails on `main`, before any change in this
  plan.
  Evidence: on commit `15326a3` with a clean tree,
  `cd app && npx tsc --noEmit` reports exactly one error:
  `App.tsx:13:8 - error TS2882: Cannot find module or type declarations for side-effect import of
  './global.css'.` This is pre-existing and out of scope. Do not "fix" it as part of this work, and
  do not mistake it for breakage you introduced. If the error count ever rises above one, that
  *is* yours.

- Observation: `app/package.json` has no `typecheck` script, so `tsc` is not run by `npm test` or
  by CI (`.github/workflows/ci.yml` runs only `npm ci` and `npm test` for the `app` job).

- Milestone 1 (2026-08-21): `bundle exec pod install` in `app/ios` failed —
  `Bundler::GemNotFound: Could not find gem 'cocoapods (>= 1.13, != 1.15.0, != 1.15.1)' in locally
  installed gems`. CocoaPods is not installed in this execution environment. `app/ios/Podfile.lock`
  was therefore not updated and is not part of this milestone's commit. This does not block `npm
  test`, but means the milestone's manual iOS-simulator acceptance cannot be run/claimed from this
  environment — flagging for the developer to run `pod install` locally before an iOS build.
  `react-native-svg` installed cleanly at 15.15.5 with no peer-dependency conflicts and no
  `--legacy-peer-deps` needed, confirming the plan's expectation.
- Milestone 1 (2026-08-21): `app/jest.config.js`'s existing `transformIgnorePatterns` allowlist
  already handled `react-native-svg` without modification — no edit to that file was needed, and
  the Step 5 contingency (adding `react-native-svg` to the regex) did not apply.
- Milestone 2 (2026-08-21): `react-native-safe-area-context`'s `SafeAreaProvider` does not render
  its children under plain `react-test-renderer` without a manual mock — without layout-derived
  insets it renders `children: null`, so every `testID` lookup inside the tree returned nothing and
  all four new tests failed with "Cannot read properties of undefined". Fixed with a new file,
  `app/__mocks__/react-native-safe-area-context.js`, which re-exports the package's own official
  jest mock (`react-native-safe-area-context/jest/mock`) flattened onto `module.exports` for CJS/ESM
  interop. This file was not anticipated by the plan's file list in Interfaces and Dependencies;
  it is a test-only shim, added because the plan's manual-mock convention (Jest's node_modules
  mock directory) picks it up automatically with no `jest.config.js` change required.
- Milestone 2 (2026-08-21): the `style={{ display: ... }}` toggle on `TabNavigator`'s tab-slot
  wrapper (mandated by the Decision Log to keep screens mounted) trips
  `react-native/no-inline-styles` and would have raised lint from 1 to 2 warnings. Suppressed with
  a targeted `eslint-disable-next-line` plus an inline comment explaining it is an intentional,
  documented exception (a layout toggle, not a design token) — not anticipated by the plan text but
  consistent with its own reasoning in the Decision Log.
- Milestone 2 (2026-08-21): manual simulator/emulator acceptance (`npm run ios` / `npm run android`)
  could not be run in this execution environment — no iOS simulator and no working CocoaPods
  install (consistent with Milestone 1's `pod install` failure). All automated acceptance (tests,
  lint, tsc) passed; the visual walkthrough against `screen_map_v1.png` / `screen_rewards_v1.png`
  described in the plan's Milestone 2 acceptance section has not been performed and is left for the
  developer to confirm on a real device/simulator before merging or releasing.

## Decision Log

- Decision: **No navigation library.** The three-tab shell is a ~60-line custom component
  (`app/src/navigation/TabNavigator.tsx`) holding a single `useState` for the active tab, not
  `@react-navigation/native` + `@react-navigation/bottom-tabs`.
  Rationale: five reasons, in descending weight. (1) React Navigation's bottom tabs require
  `react-native-screens`, a native module, and this project has already been bitten once by a
  native-compatibility problem on React Native 0.87 — `app/react-native.config.js` explicitly
  excludes `react-native-reanimated` from autolinking on both platforms because "its native side
  isn't compatible with the react-native-worklets version RN 0.87 needs", a carve-out
  `ARCHITECTURE.md` elevates to an architecture invariant. Adding a second native navigation
  dependency for a three-way enum is a poor risk trade. (2) The design mandates a fully custom tab
  bar — pill background spanning icon and label, vendored SVG icons, specific token colours — so
  React Navigation's own tab bar would be discarded via its `tabBar` prop anyway, leaving the
  library responsible only for holding one string of state and keeping three components mounted.
  (3) Deep linking and tab-state persistence are explicitly out of scope for issue #3, and those
  are React Navigation's main non-visual advantages. (4) There is no stack, drawer, or modal
  navigation anywhere in the MVP scope defined in `ARCHITECTURE.md` — the three screens are
  siblings and the bottom sheets described in `app/DESIGN.md` are in-screen overlays, not routes.
  (5) The decision is cheap to reverse, because this plan deliberately shapes `TabBar` as a pure
  presentational component whose props (`activeTab`, `onSelect`) contain no navigation types; it
  can be handed to React Navigation's `tabBar={props => <TabBar … />}` later without being
  rewritten. Record the reversal trigger explicitly: adopt React Navigation the first time a screen
  needs a pushed detail route with hardware-back handling, or the first time deep links are
  required.
  Date/Author: 2026-08-21, planner.

- Decision: All three tab screens are **mounted at all times**; switching tabs toggles
  `style={{ display: 'flex' | 'none' }}` on each screen's wrapper rather than conditionally
  rendering.
  Rationale: acceptance criterion three of issue #3 requires that returning to Karte preserves its
  previous state. Conditional rendering unmounts the screen and destroys its `useState`, so it
  would fail that criterion outright. Keeping the screens mounted is also exactly what React
  Navigation's bottom tabs do by default, so this is not a shortcut with different semantics — it
  is the same semantics, implemented directly. Cost is negligible today (two of the three screens
  are static placeholders) and can be revisited with lazy-mount-on-first-visit if the Karte map
  ever makes eager mounting expensive.
  Date/Author: 2026-08-21, planner.

- Decision: The screen-visibility toggle uses the **`style` prop**, not NativeWind's `hidden`
  class.
  Rationale: two reasons. It removes a dependency on NativeWind 4.2.6 correctly mapping Tailwind's
  `display` utilities to React Native, which this plan has not verified. And it gives the tests a
  stable, readable assertion target (`props.style.display === 'flex'`) instead of inspecting
  NativeWind's generated style output. `app/DESIGN.md`'s "no hardcoded colors or radii in component
  code" No-Go is about design tokens; a layout toggle is not a token.
  Date/Author: 2026-08-21, planner.

- Decision: The colour palette lives in **`app/src/theme/colors.json`**, and both
  `app/tailwind.config.js` and TypeScript components read from that one file.
  Rationale: SVG stroke colours must be passed to `react-native-svg` as plain strings — they cannot
  come from a `className` without NativeWind `cssInterop` glue whose behaviour on this version is
  unverified. So component code needs programmatic access to the palette. `app/DESIGN.md`'s No-Gos
  forbid hardcoding hex values in components, and duplicating the ramp between the Tailwind config
  and a TypeScript module guarantees drift. JSON is the one format both consumers can read:
  `tailwind.config.js` is plain CommonJS and can `require` it, and TypeScript can `import` it
  because `@react-native/typescript-config` — which `app/tsconfig.json` extends — sets
  `"resolveJsonModule": true`. A `.js` module would also work but `docs/app.md` states the app has
  "no `.js` files".
  Date/Author: 2026-08-21, planner.

- Decision: Only the **light** palette goes into `app/tailwind.config.js`. Dark mode is not wired.
  Rationale: `app/DESIGN.md` lists "Dark-mode theming mechanism" as an open question — the values
  are settled but *how* to switch them at runtime in NativeWind (its `vars()` API versus per-key
  `dark:` duplication) "still needs a spike". It also states dark mode must be driven by the Profil
  screen's "Dunkler Modus" toggle, which does not exist yet, and explicitly warns against wiring it
  "as a pure `dark:` media-query mirror without a Profil control". Shipping half of that here would
  create exactly the structure the design doc warns against.
  Date/Author: 2026-08-21, planner.

- Decision: `app/App.tsx` stops calling `useColorScheme()` and hardcodes
  `<StatusBar barStyle="dark-content" />`.
  Rationale: `app/DESIGN.md` line 51 calls the current code out by name — "`App.tsx` currently
  derives its `StatusBar` style from `useColorScheme()` alone — that needs to become app-level
  state (e.g. a settings store) that Profil's toggle writes to". Since only the light palette ships
  here (previous decision), the app renders on a cream background in every OS appearance mode, and
  an OS-driven `light-content` status bar would produce invisible white status text on cream. Dark
  glyphs are correct unconditionally until the Profil toggle exists. Removing the branch is
  therefore both a bug fix and a smaller surface for the future settings store to replace.
  Date/Author: 2026-08-21, planner.

- Decision: The **status filter chips (Alle / Besucht / Offen) are not built here.** The Karte
  screen gets only the Karte/Stempel segmented control.
  Rationale: GitHub issue #5, "Filter stations by status (Alle/Besucht/Offen)", claims the chip row
  as in-scope work, down to "Selected chip shows a filled/active pill style; unselected chips are
  outlined" and "Only one chip can be active at a time". Building it here would duplicate that
  issue. The segmented control, by contrast, is claimed by no issue but assumed by issue #6
  ("Browse stations in the Stempel grid"), whose acceptance criteria say "Given I tap 'Karte' in
  the segmented control…" — so the control must exist before #6 can start, and #3 is the natural
  place for it. Consequence for issue #3's third acceptance criterion, which names "filter/segment
  state": the *segment* half is demonstrated concretely; the *filter* half is satisfied vacuously
  today because no filter control exists, and inherits the same guarantee for free when issue #5
  adds one, since `KarteScreen` is never unmounted. Say this out loud when reporting the milestone
  rather than quietly claiming the criterion in full.
  Date/Author: 2026-08-21, planner.

- Decision: `app/src/screens/HomeScreen.tsx` is **deleted**. `app/src/components/Card.tsx`,
  `app/src/services/apiService.ts`, `app/src/config.ts`, and `app/src/models/HealthStatus.ts` are
  kept, untouched.
  Rationale: `HomeScreen` is the scaffold's backend-health demo. Once `App.tsx` renders the tab
  shell, it is unreachable, and an unreachable screen is dead code that the next contributor has to
  reason about. The other four modules are not screens: `apiService`/`config`/`HealthStatus` are the
  documented app-to-backend plumbing (`ARCHITECTURE.md`'s "App ↔ Backend connectivity" section
  names `app/src/config.ts` specifically) and will be the foundation of the Mapbox token flow, and
  `Card.tsx` is named in `app/DESIGN.md`'s Component Patterns as the base container that the first
  real card-bearing screen will restyle. Deleting those would be scope creep in the other
  direction.
  Date/Author: 2026-08-21, planner.

- Decision: Screen and component files carrying tab names are spelled in **German** —
  `KarteScreen.tsx`, `ErfolgeScreen.tsx`, `ProfilScreen.tsx`, and a `TabId` union of
  `'karte' | 'erfolge' | 'profil'`.
  Rationale: `AGENTS.md` Key Rule 2 requires English for docs, issues, PRs, and commit messages and
  German only for in-app UI copy — it says nothing about identifiers. These three words are domain
  proper nouns: `ARCHITECTURE.md`'s MVP scope, `app/DESIGN.md`'s Layout Patterns, every GitHub
  issue title, and the prototype's own state field (`tab: 'karte'`, line 738) all use them
  untranslated. Inventing `MapScreen`/`AchievementsScreen` would create a translation layer between
  the docs and the code for no benefit.
  Date/Author: 2026-08-21, planner.

- Decision: Milestone 1's code-quality review flagged (a) `Icon.tsx`'s `color` prop accepting any
  string rather than a palette-constrained type as MUST FIX, and (b) `Icon.test.tsx`'s use of
  literal hex strings instead of importing them from `colors.json` as SHOULD FIX. Both were
  overridden without a fix round. (a) contradicts this plan's own Interfaces and Dependencies
  contract (`color: string`) and its stated rationale (SVG `stroke` needs a plain hex string;
  constraining it to a palette-key union would require callers to thread key names through instead
  of the hex values `colors.json` already exports, adding a translation layer for no behavioural
  gain). (b) The three test colors are arbitrary examples chosen to prove generic prop pass-through,
  not palette correctness — importing them from `colors.json` would add coupling without adding
  signal to what the test verifies.
  Date/Author: 2026-08-21, executor.

- Decision: Active state is expressed through **accessibility props** —
  `accessibilityRole="tab"` plus `accessibilityState={{ selected }}` on each tab, and
  `accessibilityRole="tablist"` on the bar — and the tests assert on those rather than on styles.
  Rationale: it is the correct React Native semantics for a tab bar and makes the shell usable with
  VoiceOver and TalkBack from day one, which is cheaper to do now than to retrofit. It also
  sidesteps a real testing problem: with NativeWind, `className` is resolved to styles at runtime,
  so asserting "the active tab is green" through the rendered style tree is brittle and couples the
  tests to NativeWind internals. `accessibilityState.selected` is a stable, semantic contract.
  Date/Author: 2026-08-21, planner.

## Outcomes & Retrospective

Not yet written — fill this in when the final milestone lands, comparing the result against the
Purpose section above, and note anything that deviated from this plan and why.

## Context and Orientation

Assume you know nothing about this repository. Everything in this section applies across the whole
plan; details that matter to only one milestone appear in that milestone.

**The product.** HWN Tracker is a React Native mobile app for hikers collecting stamps ("Stempel")
for the **Harzer Wandernadel** (HWN), a hiking-badge programme in the Harz region of Germany.
Roughly 222 official stamp stations ("Stempelstellen") are spread across the region; a hiker walks
to one, finds a physical stamp box, and stamps their book. `ARCHITECTURE.md` defines the MVP as
exactly three screens behind a tab bar: **Karte** (a map of all stations, with an in-screen toggle
to a "Stempel" grid of the same stations — one screen, two view modes, *not* two tabs), **Erfolge**
(badge and collection progress), and **Profil** (settings). All in-app copy is German; all
documentation, commit messages, issues, and PRs are English (`AGENTS.md`, Key Rule 2).

**The repository.** The root holds `ARCHITECTURE.md` (the authoritative technical reference),
`AGENTS.md` (rules for AI agents), `README.md`, and four source directories: `app/` (the React
Native app), `backend/` (Express on AWS Lambda), `infrastructure/` (AWS CDK), and `docs/`
(contributor guides — `app.md`, `backend.md`, `infrastructure.md`, `typescript.md`, plus
`docs/exec-plans/`). `backend/` and `infrastructure/` are npm workspaces sharing one root
`npm install`. **`app/` is deliberately not a workspace** and has its own `package.json`,
`node_modules`, ESLint config, and test command — run `npm install` inside `app/` separately
(`AGENTS.md`, Key Rule 1). Nothing in this plan touches `backend/` or `infrastructure/`.

**The app as it stands.** It is bare React Native 0.87.0 with React 19.2.3 — **not Expo**, which
matters because native modules need CocoaPods/Gradle rather than an Expo config plugin. Styling is
NativeWind 4.2.6 (Tailwind classes via a `className` prop; `docs/app.md` forbids
`StyleSheet.create`). `app/src/` contains only scaffold: `config.ts`, `screens/HomeScreen.tsx`,
`components/Card.tsx`, `services/apiService.ts`, and `models/HealthStatus.ts` (a backend
health-check payload, unrelated to hiking). `app/App.tsx` renders `SafeAreaProvider` → `StatusBar`
→ `SafeAreaView` → `HomeScreen`, and nothing else. `app/tailwind.config.js` has an **empty**
`theme.extend`, so the app currently renders Tailwind's stock palette, not the design system's.
There is no navigation library and no SVG renderer in `app/package.json`.

**One standing native-compatibility hazard.** `app/react-native.config.js` excludes
`react-native-reanimated` from autolinking on both iOS and Android, because it is pulled in
transitively by NativeWind but its native side is incompatible with the `react-native-worklets`
version RN 0.87 requires. `ARCHITECTURE.md` calls this an architecture invariant. Do not remove or
alter that file. It is also the reason this plan is conservative about adding native modules.

**The design sources, and which wins.** `app/DESIGN.md` is the single design document: colour
ramps, radii, typography, and per-pattern specs including the tab bar (its "Layout Patterns"
section). It derives from three sources that live in `app/design/`: the Organic design system
(`app/design/_ds/organic/styles.css`), the interactive HTML prototype
`app/design/Harzer Wandernadel.dc.html` (991 lines; its JavaScript sits at the bottom of the file),
and the static mockups in `app/design/screenshots/`. `app/DESIGN.md` line 5 states the precedence
rule this plan follows: *if the doc and a source file disagree, the source file wins and the doc
gets corrected.* This plan invokes that rule once — see Surprises & Discoveries on the pill radius.
`app/DATA.md` is the companion document covering *what* the data is; this plan needs none of it,
because no station or badge data is rendered here.

**Terms used throughout.** *Tab* — one of the three bottom-bar entries. *Tab bar* — the persistent
bar itself. *Segmented control* — the in-screen Karte/Stempel toggle at the top of the Karte
screen; it is not a tab. *Pill* — the `accent-2-200` rounded-rectangle background behind the active
tab. *Token* — a named design value (colour, radius, shadow) from `app/DESIGN.md`. *Vendored icon
paths* — SVG `d` strings copied verbatim from the prototype's `ICONS` constant rather than
redrawn.

**Tests.** `cd app && npm test` runs Jest with `@react-native/jest-preset` and
`react-test-renderer` (there is no `@testing-library/react-native`, and this plan does not add
one — plain `react-test-renderer` is sufficient and avoids a dependency). Note
`app/jest.config.js`'s `transformIgnorePatterns`: node modules are *not* transformed unless
explicitly allowlisted there, which becomes relevant when `react-native-svg` is added.

**Commits.** Use this repository's `git-commit` skill. Commit messages follow Conventional Commits
and are written in English. **Stage the updated ExecPlan in the same commit as the code it
describes**, never in a follow-up commit, so the plan and the work never disagree in history.

## Plan of Work

Four milestones, each independently committable and verifiable. Milestone 1 is the **reference
milestone**: it establishes the working rhythm — baseline, change, verify with an exact command,
commit with the plan — that Milestones 2 through 4 reuse without restating.

Before starting, read `app/DESIGN.md` in full (especially "Color Tokens", its "Tailwind
implementation" block, and the "Tab bar" paragraph under Layout Patterns), then open
`app/design/screenshots/screen_map_v1.png` and `app/design/screenshots/screen_rewards_v1.png` and
look at the bottom of each. The Artifacts and Notes section at the end of this plan reproduces
every prototype snippet you need, so you can work from this plan alone — but reading
`app/design/Harzer Wandernadel.dc.html` lines 687–693, 761–769, 395–403, and 872–877 yourself is
how you will catch anything this plan missed. Anything you catch belongs in Surprises &
Discoveries.

### Milestone 1 (reference): design tokens and the icon primitive

**Scope.** Wire `app/DESIGN.md`'s light palette, radii, and shadows into `app/tailwind.config.js`
via a shared JSON palette file, install `react-native-svg`, and add an `Icon` component that
renders the prototype's vendored paths. At the end of this milestone the design tokens resolve to
real hex values and an `Icon` renders correct SVG, proven by a new test file. Nothing is visible
in the running app yet — the tab bar arrives in Milestone 2 — so this milestone's proof is a
command transcript plus a passing test, not a screenshot.

**Establish the baseline first**, so that if something later looks broken you know it was not this
work. Run every suite, not a subset. From the repository root
(`/Users/ilja/Documents/Workspaces/hwn_tracker`):

    npm test
    cd app && npm test && npm run lint && npx tsc --noEmit

Expected, abbreviated: the root command runs the `backend` and `infrastructure` workspaces in turn,
each reporting `Test Files 1 passed (1) / Tests 1 passed (1)`. The `app` command reports
`Test Suites: 1 passed, 1 total / Tests: 1 passed, 1 total`. `npm run lint` reports
`✖ 1 problem (0 errors, 1 warning)` — the warning is `'__ds_scope' is assigned a value but never
used` in `app/design/_ds/organic/_ds_bundle.js`, a vendored design-tool bundle, and is
pre-existing. `npx tsc --noEmit` reports exactly **one** error, the pre-existing
`App.tsx:13:8 - error TS2882` about `./global.css`. Record any deviation from these numbers in
Surprises & Discoveries before continuing.

**Step 1 — create `app/src/theme/colors.json`.** New directory, new file. Reproduce
`app/DESIGN.md`'s light palette exactly: the three base roles (`bg`, `surface`, `text`), the full
100–900 `accent` (terracotta) and `accent-2` (sage) ramps each with a `DEFAULT`, the 100–900
`neutral` ramp, and the five-key `error` palette. The full literal content is in Artifacts and
Notes — copy it from there. Do not add dark-mode values; see the Decision Log. Do not add a
`divider` key: `app/DESIGN.md` defines the divider as `text` at 16% opacity and instructs using
Tailwind's opacity suffix (`border-text/16`), which needs no key of its own.

**Step 2 — extend `app/tailwind.config.js`.** It currently has `theme: { extend: {} }`. Require
the palette at the top and fill in `colors`, `borderRadius`, and `boxShadow` exactly as
`app/DESIGN.md`'s "Tailwind implementation" block prescribes. The final file:

    const colors = require('./src/theme/colors.json');

    /** @type {import('tailwindcss').Config} */
    module.exports = {
      content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
      presets: [require('nativewind/preset')],
      theme: {
        extend: {
          colors,
          borderRadius: {
            sm: '8px',
            md: '16px',
            lg: '28px',
          },
          boxShadow: {
            sm: '0 1px 2px rgba(46,43,37,0.14)',
            md: '0 3px 10px rgba(46,43,37,0.16)',
            lg: '0 12px 32px rgba(46,43,37,0.22)',
          },
        },
      },
      plugins: [],
    };

Two things worth knowing before you do this. First, overriding `borderRadius.sm/md/lg` changes what
`rounded-sm`, `rounded-md`, and `rounded-lg` mean globally — Tailwind's defaults are 2px, 6px, and
8px, and after this change they are 8px, 16px, and 28px. That is intended and is what
`app/DESIGN.md` specifies. `rounded-full` is untouched. Second, leave `content` alone: the existing
glob `./src/**/*.{js,jsx,ts,tsx}` already covers every file this plan creates.

Verify the config resolves, from `/Users/ilja/Documents/Workspaces/hwn_tracker/app`:

    node -e "const c=require('./tailwind.config.js').theme.extend.colors; console.log(c.bg, c['accent-2']['200'], c['accent-2']['800'], c.neutral['600'])"

Expected output, exactly:

    #f5ead8 #e1eecc #3d472b #82796a

Those four values are, in order, the screen background, the active-tab pill fill, the active-tab
icon and label colour, and the inactive-tab icon and label colour. If any of them is `undefined`,
the JSON keys do not match what the components will ask for — fix that now, not in Milestone 2.

**Step 3 — install `react-native-svg`.** From
`/Users/ilja/Documents/Workspaces/hwn_tracker/app`:

    npm install react-native-svg

Expect version 15.15.5 or later. Its peer dependencies are `react: "*"` and `react-native: "*"`, so
there is no version conflict with React 19.2.3 / React Native 0.87.0 and no `--legacy-peer-deps` is
needed. Both `app/package.json` and `app/package-lock.json` change and both are committed.

Then link the iOS native side, from `/Users/ilja/Documents/Workspaces/hwn_tracker/app/ios`:

    bundle exec pod install

This takes a minute or two and updates `app/ios/Podfile.lock`, which is committed. Android needs no
manual step — Gradle autolinking picks the module up at build time. `react-native-svg` is
unaffected by the `react-native-reanimated` exclusion in `app/react-native.config.js`; do not touch
that file. If `bundle exec pod install` is unavailable in your environment, say so explicitly in
Surprises & Discoveries and continue — `npm test` does not need it, but running on an iOS simulator
does, so the milestone's manual acceptance cannot be claimed until it has run.

**Step 4 — create `app/src/components/Icon.tsx`.** A single presentational component wrapping
`react-native-svg`, with the four vendored path sets as a module-level constant. The SVG attributes
are not free choices — they are copied from the prototype's renderer at
`app/design/Harzer Wandernadel.dc.html` lines 765–767 and are what make the icons match the
mockups: `viewBox="0 0 24 24"`, `fill="none"`, `strokeWidth={2.75}`, `strokeLinecap="round"`,
`strokeLinejoin="round"`, and a 21×21 default size. Implement it against the `Icon` contract in
Interfaces and Dependencies (`IconName`, `{ name, color, size?, testID? }`), keyed by a module-level
`ICON_PATHS: Record<IconName, readonly string[]>` map holding the vendored `d` strings reproduced in
Artifacts and Notes — copy them verbatim, do not redraw or "tidy" them, and keep `stempeln` even
though nothing renders it yet (the Stempel grid story, issue #6, will want it).

`color` is a required prop taking a hex string, not a `className`. That is deliberate: rendering
NativeWind classes onto `react-native-svg` primitives needs `cssInterop` glue whose behaviour on
NativeWind 4.2.6 this plan has not verified, and callers get their hex from
`app/src/theme/colors.json` so no colour is hardcoded in component code.

**Step 5 — add `app/__tests__/Icon.test.tsx`.** Three black-box tests against the rendered tree
(use `react-test-renderer`, wrapping renders in `ReactTestRenderer.act`): (1) `<Icon name="karte" />`
renders exactly the two vendored `karte` `d` strings as separate `<Path>` elements, in order — this
is the one that matters most, since it is what stops someone "simplifying" the two-path map pin
into one string and silently losing the centre dot; (2) the rendered `<Svg>` carries the prototype's
stroke spec (`viewBox="0 0 24 24"`, `fill="none"`, `strokeWidth={2.75}`, `strokeLinecap="round"`,
`strokeLinejoin="round"`, `width`/`height` 21); (3) the `<Svg>`'s `stroke` prop equals whatever
`color` was passed in.

**Expect one adjustment here.** `react-native-svg` ships ES modules, and `app/jest.config.js`'s
`transformIgnorePatterns` currently allowlists only `react-native`, `@react-native`,
`@react-native-community`, `nativewind`, `react-native-css-interop`, and `react-native-worklets`.
If the new test fails with a syntax error originating inside `node_modules/react-native-svg`, add
`react-native-svg` to that allowlist so the line reads:

    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|nativewind|react-native-css-interop|react-native-worklets|react-native-svg)/)',

Record in Surprises & Discoveries whether this was needed. If instead the failure is about a
missing native module or TurboModule rather than syntax, do **not** reach for a mock — record the
exact error in Surprises & Discoveries and fall back to exporting `ICON_PATHS` from `Icon.tsx` and
asserting the path data directly, keeping the SVG-attribute assertions as a second, skipped test
with a comment naming the blocker.

**Acceptance for Milestone 1.** From `/Users/ilja/Documents/Workspaces/hwn_tracker/app`:

    npm test

Expect `Test Suites: 2 passed, 2 total` and `Tests: 4 passed, 4 total` — the pre-existing
`App.test.tsx` plus the three new icon tests. Then `npm run lint` still reports 0 errors and the
same single pre-existing warning, and `npx tsc --noEmit` still reports exactly one error (the
pre-existing `global.css` one). Finally, the `node -e` transcript in Step 2 prints the four
expected hex values.

**Commit gate.** Stage together and commit with the `git-commit` skill:

    git add app/package.json app/package-lock.json app/ios/Podfile.lock \
            app/tailwind.config.js app/src/theme/colors.json \
            app/src/components/Icon.tsx app/__tests__/Icon.test.tsx \
            app/jest.config.js docs/exec-plans/active/3_app_shell_tab_navigation.md
    git status --short

`app/jest.config.js` appears only if Step 5's adjustment was needed. Before committing, update this
plan's Progress checklist with a UTC timestamp and add anything you discovered to Surprises &
Discoveries.

### Milestone 2: the tab bar, the shell, and three screens

**Scope.** Everything visible. At the end of this milestone the app launches into the three-tab
shell: Karte active on a pale-sage pill, Erfolge and Profil muted, all three tappable, each showing
its own placeholder screen. This is the milestone a human can actually look at, so its acceptance
is a device or simulator run, backed by tests.

Follow the same rhythm as Milestone 1 — change, verify with exact commands, update the plan, commit
the plan with the code. Only the instance-specific content is described here.

**What gets created.** Five new files and one shared screen shell, plus two edits and one deletion:

`app/src/components/ScreenShell.tsx` — the chrome every tab screen shares: a cream-background
container with the uppercase kicker "HARZER WANDERNADEL" above a large screen title, matching the
top of every mockup. Having it makes acceptance criterion two checkable, because "a placeholder
screen appears" is only observable if the screen announces which one it is. Props: `{ title:
string; testID: string; children?: React.ReactNode }`; it renders a `flex-1 bg-bg px-4 pt-2`
container with the `testID` on the outermost view, an uppercase "Harzer Wandernadel" kicker
(`text-[11px] font-semibold uppercase tracking-[1.3px] text-neutral-600`), the screen `title` below
it (`text-[26px] font-bold text-text`), then `children`.

The kicker's `tracking-[1.3px]` is `app/DESIGN.md`'s `.12em` at 11px, converted because React
Native's `letterSpacing` is measured in points, not ems. The title uses `font-bold` rather than the
Caprasimo display serif because no fonts are installed yet — `app/DESIGN.md` explicitly says
headings "should still visually read as the heading role (bold, larger) using the system font as a
placeholder" and that font loading must not block other work.

`app/src/components/TabBar.tsx` — the presentational bar. It receives `activeTab` and `onSelect`
and knows nothing about navigation, which is what makes the "no navigation library" decision
reversible. Implement it against the `TabBar` contract in Interfaces and Dependencies (`TabId`,
`TAB_ORDER`, `{ activeTab, onSelect }`); the values that are not free choices are:
container `border-t border-text/16 bg-bg` with `px-3 pt-2 pb-2` and `gap-1`; each tab `flex-1`,
centred, `rounded-md`, `py-[7px]`; active background `bg-accent-2-200`, active text
`text-accent-2-800`, inactive text `text-neutral-600`; label at `text-[10.5px] font-semibold
tracking-[0.2px]`; icon colours `#3d472b` when active and `#82796a` when inactive, read from
`app/src/theme/colors.json` rather than typed as literals. Labels are the German `Karte`,
`Erfolge`, `Profil`. The container carries `accessibilityRole="tablist"`; each tab is a `Pressable`
with `accessibilityRole="tab"`, `accessibilityState={{ selected: isActive }}`, and
`accessibilityLabel` equal to its German label — the Milestone 2 tests assert on
`accessibilityState.selected`, so this is not optional polish. `TabId` is deliberately a subset of
`Icon.tsx`'s `IconName`, so passing `id` straight into `<Icon name={id} />` type-checks without a
cast.

One NativeWind constraint to respect throughout this plan: **never assemble a class name from
fragments**. Tailwind's content scanner reads the raw source text, so `` `bg-${tone}-200` `` yields
no CSS at all. Conditionals that embed whole class names — `` `… ${isActive ? 'bg-accent-2-200' :
''}` `` — are fine, because `bg-accent-2-200` appears literally in the file.

`app/src/navigation/TabNavigator.tsx` — a new directory. It owns the single piece of state in this
milestone (`useState<TabId>('karte')`), renders every screen in `TAB_ORDER` inside a `View` wrapper
keyed by tab id with `testID={`tabslot-${id}`}` and `style={{ display: isActive ? 'flex' : 'none'
}}` — never a conditional `{isActive && <Screen />}`, since that would unmount the hidden screens
and defeat Milestone 3's whole point — and puts `TabBar` underneath, wiring `onSelect` straight to
`setActiveTab`. Give each hidden wrapper `accessibilityElementsHidden` /
`importantForAccessibility="no-hide-descendants"` so VoiceOver/TalkBack don't reach screens that
aren't visible. Wrap the whole thing in a `SafeAreaView` taking all four edges (not just
`useSafeAreaInsets` on the bar), so the bar's bottom padding clears the home indicator without extra
plumbing and the tests stay free of safe-area metrics setup.

`app/src/screens/KarteScreen.tsx`, `app/src/screens/ErfolgeScreen.tsx`,
`app/src/screens/ProfilScreen.tsx` — one file per screen (`docs/app.md`: "one file per screen").
In this milestone all three are the same shape: a `ScreenShell` with the tab's title and a single
line of German placeholder copy, "Diese Ansicht kommt bald." Their `testID`s are `screen-karte`,
`screen-erfolge`, and `screen-profil`. Karte grows real content in Milestone 3; the other two stay
placeholders, which is exactly what issue #3 puts in scope.

**What gets edited.** `app/App.tsx` shrinks to `SafeAreaProvider` → `StatusBar` → `TabNavigator`,
dropping `useColorScheme` and the `SafeAreaView` (which moves into `TabNavigator`) — see the
Decision Log for why the status bar is now unconditionally `dark-content`. Keep the
`import './global.css';` side-effect import; NativeWind needs it and removing it would break
styling everywhere.

**What gets deleted.** `app/src/screens/HomeScreen.tsx`, and nothing else — see the Decision Log.
Confirm nothing else imports it:

    cd /Users/ilja/Documents/Workspaces/hwn_tracker && grep -rn "HomeScreen" app --include=*.tsx --include=*.ts

After the deletion and the `App.tsx` edit this must return no results.

**Tests.** Add `app/__tests__/TabNavigation.test.tsx`, black-boxing the whole app through `<App />`
rather than unit-testing `TabBar` in isolation — the behaviour under test is "tapping a tab changes
which screen is showing", which spans three components. Four tests:

1. *Karte is the default tab.* `tab-karte`'s `accessibilityState.selected` is `true`, the other two
   are `false`, and `tabslot-karte`'s `style.display` is `'flex'` while the other two are `'none'`.
2. *Tapping Erfolge activates it.* After pressing `tab-erfolge`, its `accessibilityState.selected`
   is `true`, `tab-karte`'s is `false`, `tabslot-erfolge` is `'flex'` and `tabslot-karte` is
   `'none'`.
3. *Tapping Profil activates it* — same shape, guarding against a two-tab-only implementation.
4. *Tapping back to Karte restores it.*

Add a small `node(tree, testID)` helper that looks up an element via `findAllByProps({ testID })`
and takes the **first** match, rather than `findByProps`, which throws when a `testID` matches both
a composite component and its host element; the first match is the outermost node and carries both
`onPress` and `style`. Wrap a `press(tree, testID)` helper around it that calls
`node(tree, testID).props.onPress()` inside `ReactTestRenderer.act`.

**Acceptance for Milestone 2.** Automated, from `/Users/ilja/Documents/Workspaces/hwn_tracker/app`:

    npm test

Expect `Test Suites: 3 passed, 3 total` and `Tests: 8 passed, 8 total`. Then `npm run lint` with 0
errors and the one pre-existing warning, and `npx tsc --noEmit` with the one pre-existing error.

Manual, and this is the real acceptance — run the app:

    cd /Users/ilja/Documents/Workspaces/hwn_tracker/app && npm run ios

(or `npm run android`). Check against
`app/design/screenshots/screen_map_v1.png` and `screen_rewards_v1.png`, in this order. The app
opens on the Karte screen. A three-tab bar is pinned to the bottom, above the home indicator,
separated from the body by a hairline rule. The Karte tab sits on a pale-sage rounded rectangle,
its map-pin icon and "Karte" label a deep sage-green; Erfolge and Profil have no fill and are a
warm grey. The Erfolge icon is a medal — a circle with two ribbon tails — and the Profil icon is a
head-and-shoulders outline; both are line-drawn, not filled, with visibly round stroke ends. The
whole screen is cream, not white. Tap Erfolge: the pill moves under it, its icon and label turn
deep sage, Karte's go grey, and the body shows "Erfolge" under the "HARZER WANDERNADEL" kicker with
"Diese Ansicht kommt bald." beneath. Tap Profil, then Karte, and confirm the same. Nothing crashes
and no red box appears.

If the pill or the label colours look like Tailwind's stock palette rather than the mockup's, the
Milestone 1 token wiring did not take effect — clear Metro's cache (`npm start -- --reset-cache`)
before assuming the config is wrong.

**Commit gate.** Stage the six new files, the two edits, the deletion, and this plan together.

### Milestone 3: the Karte segmented control and state preservation

**Scope.** Give the Karte screen a real piece of state and prove it survives a tab round trip. At
the end of this milestone the Karte screen shows the Karte/Stempel segmented control from the
mockups; selecting "Stempel", going to Erfolge, and coming back leaves "Stempel" still selected.
This is acceptance criterion three of issue #3 — see the Decision Log for why the *segment* and not
the status filter chips.

**What gets created.** `app/src/components/SegmentedControl.tsx`, a generic, reusable control.
`app/DESIGN.md`'s Layout Patterns specifies it as a "pill track (`surface`, `rounded-full`), active
segment `bg-bg` (or `surface`) fill, inactive transparent", which the mockup confirms: a tan track
with a cream pill under "Karte" and plain muted text for "Stempel". Implement it against the
`SegmentedControl` contract in Interfaces and Dependencies (`SegmentOption<T>`, `{ options, value,
onChange, testIDPrefix }`), generic over the option id type so the Karte screen's
`'karte' | 'stempel'` union stays type-safe; give each option `accessibilityRole="tab"` with
`accessibilityState={{ selected }}` for the same reasons as the tab bar, and derive each option's
`testID` from `testIDPrefix` so the Karte screen can name them `karte-segment-karte` and
`karte-segment-stempel`. The values that are not free choices: track `flex-row rounded-full
bg-surface p-1`, each segment `flex-1 items-center rounded-full py-3`, active fill `bg-bg`, label
`text-[15px] font-semibold`, `text-text` when active / `text-neutral-600` when inactive.

**What gets edited.** `app/src/screens/KarteScreen.tsx` gains
`const [view, setView] = useState<KarteView>('karte')` where
`export type KarteView = 'karte' | 'stempel'`, renders the segmented control below the shell's
title, and replaces the single placeholder line with a `surface` panel containing a readout that
changes with the selection — "Kartenansicht kommt bald." or "Stempelansicht kommt bald." — carrying
`testID="karte-view-readout"`. The readout is what makes state preservation observable to a human
tapping through the app rather than only to a test.

Export `KarteView` from the screen module: issue #6 (the Stempel grid) and issue #5 (status
filters) will both need it, and exporting it now records where the Karte screen's view state lives.

**Tests.** Extend `app/__tests__/TabNavigation.test.tsx` with two tests:

1. *The segmented control defaults to Karte.* `karte-segment-karte`'s
   `accessibilityState.selected` is `true`, `karte-segment-stempel`'s is `false`, and the readout
   reads "Kartenansicht kommt bald."
2. *The Karte segment selection survives a tab round trip.* Press `karte-segment-stempel`, assert
   it is selected and the readout says "Stempelansicht kommt bald."; press `tab-erfolge`, then
   `tab-karte`; assert `karte-segment-stempel` is **still** selected and the readout is unchanged.

The second test is the entire point of the milestone. Write it so that it would fail against a
conditional-rendering implementation — that is, do not assert on internal state, assert on what a
user sees after the round trip.

**Acceptance for Milestone 3.** `npm test` inside `app/` reports `Test Suites: 3 passed, 3 total`
and `Tests: 10 passed, 10 total`; lint and `tsc` unchanged from baseline. Manually, in the running
app: on Karte, tap "Stempel" — the cream pill slides to it and the body reads "Stempelansicht kommt
bald."; tap Profil, then Karte — "Stempel" is still the selected segment and the body still reads
"Stempelansicht kommt bald.". If it has snapped back to "Karte", the screens are being unmounted
and `TabNavigator` is conditionally rendering rather than toggling `display`.

**Commit gate.** As before, plan staged with the code.

### Milestone 4: reconcile the documentation and sweep the acceptance criteria

**Scope.** The code is done; this milestone makes the written record match it and runs the issue's
acceptance criteria end to end. Four documentation edits, each small and surgical — do not
restructure any of these files.

**`app/DESIGN.md`, three edits.** First, its "Tab bar" paragraph (Layout Patterns) says the active
tab is a `rounded-full` pill; correct it to `rounded-md` (16px) and note that the value is
confirmed against `app/design/Harzer Wandernadel.dc.html` line 398's
`border-radius:var(--radius-md)`. While there, adjust "icon on a … tint pill" to say the pill spans
the icon *and* the label across the tab's full width, since that is what both the prototype and the
mockups do. Second, the heading "### Tailwind implementation (target — not yet applied to
`tailwind.config.js`)" is now false — drop the parenthetical, and add one sentence saying the light
ramp is applied and that the values live in `app/src/theme/colors.json`, which
`app/tailwind.config.js` requires so components can read the same hex values where a `className`
will not do (SVG strokes). Third, in "Open Questions — Not Yet Decided", the **Icon rendering**
bullet is resolved: `react-native-svg` is installed and `app/src/components/Icon.tsx` renders the
vendored paths — move that fact into the settled sentence at the top of that section and delete the
bullet. Leave the font loading, map library, dark-mode mechanism, and error-palette bullets exactly
as they are; none of them was decided here.

**`ARCHITECTURE.md`, two edits.** In the "App" section, add a short paragraph after the existing
reanimated invariant: the app's three MVP screens sit behind a hand-rolled tab shell in
`app/src/navigation/TabNavigator.tsx` with a presentational `app/src/components/TabBar.tsx`, no
navigation library is installed, all three screens stay mounted so per-screen state survives tab
switches, and `TabBar` is intentionally shaped to drop into React Navigation's `tabBar` prop if a
library is adopted later. Then add a row to the Decision Log table: Decision "App navigation";
Chosen "Custom tab shell (no navigation library)"; Rejected "React Navigation
(`@react-navigation/bottom-tabs` + `react-native-screens`)"; Reason — a fully custom tab bar is
required by the design anyway, deep linking and tab persistence are out of MVP scope, there is no
stack or modal routing in the MVP, and RN 0.87 has already forced one native-module carve-out
(reanimated), so a second native dependency for a three-way enum is a poor trade; revisit when a
pushed detail route with hardware-back handling or deep linking is needed.

**`docs/app.md`, one edit.** Its "Structure" list needs two new entries: `src/navigation/` — the
tab shell that decides which screen is visible; and `src/theme/` — design tokens as JSON, the
single source shared by `tailwind.config.js` and by component code that needs raw hex values. Add
one line to "Conventions" as well: colours, radii, and shadows come from the tokens, never as
literals in component code, and Tailwind class names must appear as complete literal strings
because the content scanner reads raw source text.

**Full acceptance sweep.** Run everything, from the repository root:

    npm test
    cd app && npm test && npm run lint && npx tsc --noEmit

Expect the root suites unchanged from baseline (2 passed), the app at 3 suites / 10 tests, 0 lint
errors with the one pre-existing warning, and exactly the one pre-existing `tsc` error. Then walk
the four acceptance criteria from issue #3 against a running app, in order, and record the result
in Outcomes & Retrospective: (1) on launch, Karte is active and the Karte screen is showing; (2)
tapping Erfolge colours its icon and label and shows the Erfolge placeholder; (3) returning to
Karte preserves the segment selection — noting honestly that the status-filter half of that
criterion is deferred to issue #5, per the Decision Log; (4) the tab icons carry stroke-width 2.75
with round caps and the exact vendored path data, which
`cd app && npm test -- Icon` asserts directly.

Finally verify the documentation edits landed:

    cd /Users/ilja/Documents/Workspaces/hwn_tracker
    grep -n "rounded-full" app/DESIGN.md
    grep -rn "TabNavigator\|navigation" ARCHITECTURE.md docs/app.md

The first must no longer show a hit inside the Tab bar paragraph (hits elsewhere — buttons, chips,
stamp markers — are correct and must stay). The second must show hits in both files.

**Commit gate.** Then write Outcomes & Retrospective in this plan, mark every Progress item, and
move the file:

    git mv docs/exec-plans/active/3_app_shell_tab_navigation.md docs/exec-plans/completed/

## Concrete Steps

All commands assume the repository root is `/Users/ilja/Documents/Workspaces/hwn_tracker`. The
`app/` directory is not an npm workspace, so its commands run from `app/` and its dependencies
install separately.

Baseline, before any change:

    npm test
    cd app && npm test && npm run lint && npx tsc --noEmit

The per-milestone command sequences are given inline in each milestone above and are not repeated
here. The two commands you will run most often, both from `app/`:

    npm test
    npm run ios          # or: npm run android

If styling changes do not appear after a token edit, Metro is serving a stale cache:

    cd app && npm start -- --reset-cache

To run a single test file:

    cd app && npm test -- Icon
    cd app && npm test -- TabNavigation

## Validation and Acceptance

**Baseline.** Captured on 2026-08-21 on branch `main` at commit `15326a3` with a clean working
tree. Every suite was run in full — no subset.

`npm test` at the repository root runs the `backend` and `infrastructure` workspaces in sequence.
Result: backend, 1 test file, 1 test, passed; infrastructure, 1 test file
(`test/backend-stack.test.ts`), 1 test, passed. Total 2 passed, 0 failed, 0 skipped. Two non-fatal
warnings appear and are expected: "The CJS build of Vite's Node API is deprecated" and an esbuild
bundle-size warning while CDK bundles the Lambda asset.

`npm test` inside `app/` runs Jest. Result: 1 test suite (`__tests__/App.test.tsx`), 1 test
("renders correctly"), passed.

`npm run lint` inside `app/` reports `✖ 1 problem (0 errors, 1 warning)`. The warning is
`'__ds_scope' is assigned a value but never used` in
`app/design/_ds/organic/_ds_bundle.js`, a vendored design-tool artifact. **Pre-existing.**

`npx tsc --noEmit` inside `app/` reports exactly one error:
`App.tsx:13:8 - error TS2882: Cannot find module or type declarations for side-effect import of
'./global.css'.` **Pre-existing**, unrelated to this plan, and explicitly out of scope. There is no
`typecheck` npm script and CI does not run `tsc`, which is why this error has survived.

So: no pre-existing *test* failures; one pre-existing lint warning and one pre-existing type error,
both documented above so they are never confused with breakage introduced here.

**Acceptance.** Automated first. After Milestone 3, `npm test` inside `app/` must report
`Test Suites: 3 passed, 3 total` and `Tests: 10 passed, 10 total` — the original "renders
correctly", three icon tests, four tab-navigation tests, and two segment tests. Each new test fails
before its milestone's change and passes after; the state-preservation test in particular must fail
against an implementation that conditionally renders screens instead of toggling `display`. Root
`npm test` must still report 2 passed, `npm run lint` must still report 0 errors and the one known
warning, and `npx tsc --noEmit` must still report exactly one error. Any change to those numbers
means something outside this plan's scope was touched.

The real acceptance is behavioural, checked by running the app on a simulator or emulator
(`cd app && npm run ios`) with `app/design/screenshots/screen_map_v1.png` open beside it. Each of
these must be true:

The app opens on Karte, with a three-tab bar pinned to the bottom, above the home indicator, and a
hairline rule separating it from the body. The Karte tab sits on a pale-sage `#e1eecc` rounded
rectangle that spans both its icon and its label; that icon and label are deep sage `#3d472b`.
Erfolge and Profil have no fill and are warm grey `#82796a`. All three icons are line drawings with
visibly rounded stroke ends and no fill: a map pin with a centre dot, a medal with two ribbon
tails, a head-and-shoulders outline. The screen background is cream `#f5ead8`, not white — if it is
white, the tokens are not reaching the app.

Tapping Erfolge moves the pill, recolours both tabs, and replaces the body with a screen reading
"HARZER WANDERNADEL" above "Erfolge" and "Diese Ansicht kommt bald." Tapping Profil does the
equivalent. Nothing crashes and no red box appears at any point.

On Karte, a tan pill track holds two segments, "Karte" and "Stempel", with a cream pill under the
active one. Selecting "Stempel" changes the body text to "Stempelansicht kommt bald." Navigating to
Erfolge and back to Karte leaves "Stempel" selected and that text unchanged — this is issue #3's
third acceptance criterion, and it is the one that fails loudly if the shell unmounts screens.

Finally, `cd app && npm test -- Icon` passes, which is the mechanical proof of the fourth
acceptance criterion: the icons carry `stroke-width` 2.75 and round linecaps, and the map pin's
path data is the exact two-path vendored form rather than a redraw.

## Idempotence and Recovery

Every step is safe to repeat. Re-running a milestone means rewriting files it already wrote.
`npm install react-native-svg` is idempotent, as is `bundle exec pod install`. Re-running the
`node -e` token check has no side effects.

Nothing here touches `backend/`, `infrastructure/`, or any AWS resource, so there is no deploy or
migration to roll back. `AGENTS.md` forbids running `cdk deploy` under any circumstances and this
plan never needs it.

The only destructive step in the whole plan is deleting `app/src/screens/HomeScreen.tsx` in
Milestone 2. It is recoverable from git history at any time
(`git show 15326a3:app/src/screens/HomeScreen.tsx`), and the grep in that milestone confirms
nothing imports it before you remove it.

If the app builds but renders Tailwind's stock colours, suspect Metro's cache first
(`cd app && npm start -- --reset-cache`) and the `content` globs in `app/tailwind.config.js` second.
If it renders correct colours but blank icons, the SVG native module is not linked — re-run
`bundle exec pod install` in `app/ios` for iOS, or rebuild from scratch for Android
(`npm run android`); a Metro reload alone does not link native code. If the build fails outright
after adding `react-native-svg`, check that `app/react-native.config.js` was not modified: its
`react-native-reanimated` exclusion must stay exactly as it was.

To abandon the work entirely at any point:

    git checkout -- app ARCHITECTURE.md docs/app.md
    git clean -fd app/src/theme app/src/navigation
    cd app && npm install

## Artifacts and Notes

Everything below is reproduced so this plan is usable without opening the prototype or the design
document.

### The prototype's icon data and renderer

From `app/design/Harzer Wandernadel.dc.html`, lines 687–693 — note the `|` delimiter in `karte`,
which the renderer splits on:

    const ICONS = {
      karte: 'M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z|M12 10h.01',
      stempeln: 'M6 21h12M8 21v-3a4 4 0 0 1-4-4v-1h16v1a4 4 0 0 1-4 4v3M9 10V6.5a3 3 0 0 1 6 0V10',
      erfolge: 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM9 14l-2 7 5-3 5 3-2-7',
      profil: 'M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
    };
    const LABELS = { karte:'Karte', erfolge:'Erfolge', profil:'Profil' };

The renderer, lines 761–769, is where every SVG attribute in `Icon.tsx` comes from. `this.ink()`
(line 757) returns `#3d472b`, i.e. `accent-2-800`; the inactive literal `#82796a` is `neutral-600`:

    iconRef(kind, active) {
      return (el) => {
        if (!el) return;
        const c = active ? this.ink() : '#82796a';
        el.innerHTML = '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="' + c +
          '" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round">' +
          ICONS[kind].split('|').map(p => '<path d="' + p + '"></path>').join('') + '</svg>';
      };
    }

### The prototype's tab bar

Markup, lines 396–403. All styling is inline — there is no CSS class to port:

    <div style="position:absolute;left:0;right:0;bottom:0;z-index:20;padding:8px 12px 30px;
                background:var(--color-bg);display:flex;gap:4px;
                border-top:1px solid var(--color-divider)">
      <sc-for list="{{ tabs }}" as="t">
        <div onClick="{{ t.go }}" style="flex:1;display:flex;flex-direction:column;
             align-items:center;gap:4px;padding:7px 0;border-radius:var(--radius-md);
             cursor:pointer;background:{{ t.bg }};color:{{ t.fg }}">
          <span ref="{{ t.iconRef }}" style="display:flex"></span>
          <span style="font:600 10.5px var(--font-body);letter-spacing:.02em">{{ t.label }}</span>
        </div>
      </sc-for>
    </div>

Bindings, lines 872–877 — the source of every colour decision in `TabBar.tsx`:

    tabs: ['karte','erfolge','profil'].map(k => ({
      label: LABELS[k], go: () => this.setState({ tab:k, sel:null }),
      bg: tab === k ? 'var(--color-accent-2-200)' : 'transparent',
      fg: tab === k ? 'var(--color-accent-2-800)' : 'var(--color-neutral-600)',
      iconRef: this.iconRef(k, tab === k),
    })),

The 30px bottom padding on the container is the prototype standing in for an iPhone home-indicator
inset; in React Native that job belongs to `SafeAreaView`, which is why `TabBar.tsx` uses a plain
`pb-2`. The `--radius-md` on the item resolves to 16px
(`app/design/_ds/organic/styles.css` line 56) — the discrepancy with `app/DESIGN.md` noted in
Surprises & Discoveries. `--color-divider` is `color-mix(in srgb, #201e1d 16%, transparent)`
(line 10), i.e. `text` at 16%, which is Tailwind's `border-text/16`.

The prototype's tab handler resets `sel` (its station-detail modal selection) and nothing else, so
every other piece of Karte state persists by construction — the same guarantee this plan delivers
by keeping screens mounted.

### `app/src/theme/colors.json` — full content

    {
      "bg": "#f5ead8",
      "surface": "#ebddc5",
      "text": "#201e1d",
      "accent": {
        "DEFAULT": "#c67139",
        "100": "#fff2eb",
        "200": "#ffe1d0",
        "300": "#ffc6a5",
        "400": "#f6a06b",
        "500": "#d67f48",
        "600": "#b2622d",
        "700": "#8c491a",
        "800": "#643312",
        "900": "#402310"
      },
      "accent-2": {
        "DEFAULT": "#7a8a5e",
        "100": "#f0fae1",
        "200": "#e1eecc",
        "300": "#ccdbb2",
        "400": "#aebf92",
        "500": "#8fa073",
        "600": "#728157",
        "700": "#56633f",
        "800": "#3d472b",
        "900": "#272e1b"
      },
      "neutral": {
        "100": "#f9f4ed",
        "200": "#eee7db",
        "300": "#dcd3c4",
        "400": "#c0b6a5",
        "500": "#a19786",
        "600": "#82796a",
        "700": "#645c50",
        "800": "#474238",
        "900": "#2e2b25"
      },
      "error": {
        "DEFAULT": "#b3401f",
        "tint": "#fbe6df",
        "border": "#c95030",
        "text": "#8e2f14",
        "on": "#fdf1ec"
      }
    }

## Interfaces and Dependencies

**One new runtime dependency: `react-native-svg`**, installed into `app/package.json` (expect
15.15.5 or later). It is the only reasonable way to render the prototype's vendored Lucide-style
paths, and `app/DESIGN.md` already names it as the intended choice while flagging that it was not
yet installed. Its peer dependencies are unconstrained (`react: "*"`, `react-native: "*"`), so
there is no conflict with React 19.2.3 or React Native 0.87.0. It is a native module, so
`app/ios/Podfile.lock` changes and is committed; Android autolinks it at build time.

**No other dependency is added.** Specifically, no navigation library (see the Decision Log), no
`@testing-library/react-native` (plain `react-test-renderer` is sufficient for every test in this
plan), and no font packages (font loading stays an open question in `app/DESIGN.md`). The root
`package.json` and root `package-lock.json` must be untouched at the end of this work — if
`git status` shows either of them modified, something went wrong.

**Files this plan is allowed to touch, and nothing else.** New:
`app/src/theme/colors.json`, `app/src/components/Icon.tsx`,
`app/src/components/ScreenShell.tsx`, `app/src/components/TabBar.tsx`,
`app/src/components/SegmentedControl.tsx`, `app/src/navigation/TabNavigator.tsx`,
`app/src/screens/KarteScreen.tsx`, `app/src/screens/ErfolgeScreen.tsx`,
`app/src/screens/ProfilScreen.tsx`, `app/__tests__/Icon.test.tsx`,
`app/__tests__/TabNavigation.test.tsx`. Edited: `app/App.tsx`, `app/tailwind.config.js`,
`app/package.json`, `app/package-lock.json`, `app/ios/Podfile.lock`, `app/jest.config.js` (only if
the transform allowlist needs `react-native-svg`), `app/DESIGN.md`, `ARCHITECTURE.md`,
`docs/app.md`, and this plan file. Deleted: `app/src/screens/HomeScreen.tsx`.

Explicitly **not** to be touched: `app/react-native.config.js` (its reanimated exclusion is an
architecture invariant), `app/global.css`, `app/metro.config.js`, `app/babel.config.js`,
`app/design/**` (read-only design source — a snapshot of an external tool's output; if it and a doc
disagree, the source wins and the doc gets corrected), `backend/**`, and `infrastructure/**`.

**Public contracts that must exist when this plan is done**, because later stories will import
them. In `app/src/components/TabBar.tsx`:

    export type TabId = 'karte' | 'erfolge' | 'profil';
    export const TAB_ORDER: readonly TabId[];
    export function TabBar(props: { activeTab: TabId; onSelect: (tab: TabId) => void }): React.JSX.Element;

In `app/src/components/Icon.tsx`:

    export type IconName = 'karte' | 'stempeln' | 'erfolge' | 'profil';
    export function Icon(props: { name: IconName; color: string; size?: number; testID?: string }): React.JSX.Element;

In `app/src/components/SegmentedControl.tsx`:

    export type SegmentOption<T extends string> = { id: T; label: string };
    export function SegmentedControl<T extends string>(props: {
      options: readonly SegmentOption<T>[];
      value: T;
      onChange: (value: T) => void;
      testIDPrefix: string;
    }): React.JSX.Element;

In `app/src/screens/KarteScreen.tsx`:

    export type KarteView = 'karte' | 'stempel';

`TabBar`'s props deliberately mention no navigation types. That is the escape hatch recorded in the
Decision Log: if React Navigation is adopted later, `TabBar` becomes the body of its `tabBar` prop
unchanged, and only `TabNavigator.tsx` is rewritten.

The stable `testID` values other stories and tests will depend on: `tab-karte`, `tab-erfolge`,
`tab-profil`, `tabslot-karte`, `tabslot-erfolge`, `tabslot-profil`, `screen-karte`,
`screen-erfolge`, `screen-profil`, `karte-segment-karte`, `karte-segment-stempel`, and
`karte-view-readout`. Renaming one later breaks tests in this plan and, likely, in issues #4, #5,
and #6.
