# App Guide

React Native app in `app/` — own toolchain, not an npm workspace (run `npm install` inside `app/` separately). See [ARCHITECTURE.md](../ARCHITECTURE.md#app) for styling/tooling details and the [Product Overview](../ARCHITECTURE.md#product-overview) for what the app actually does.

## Structure
- `src/screens/` — one file per screen
- `src/components/` — reusable UI
- `src/services/` — backend API calls; screens/components must go through here, never fetch directly
- `src/models/` — TypeScript interfaces for backend payloads; domain entities (stations, collections, badge tiers) are specified in `../app/DATA.md`
- `src/config.ts` — handles the Android-emulator-vs-iOS-simulator localhost difference; don't hardcode a host elsewhere

## Conventions
- Functional components, hooks — no class components, no `.js` files.
- No business logic in components — put it in `services/` or a hook.
- Styling via NativeWind (`className` props), not `StyleSheet.create`.
- The app is offline-first by design (see ARCHITECTURE.md) — don't add features that assume network availability without checking that constraint first.

## Testing
`npm test` (inside `app/`) — Jest + `react-test-renderer`.
