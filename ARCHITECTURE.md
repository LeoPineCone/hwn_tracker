# HWN Tracker — System Architecture

> **Purpose:** Authoritative architectural reference for developers and AI agents. Describes the technical setup and how the pieces fit together. This repo currently contains a scaffold (a demo screen exercising the backend health check, a health-check endpoint, a minimal CDK stack) — extend this document as real features land.

---

## Product Overview

HWN Tracker helps hikers collect stamps ("Stempel") for the **Harzer Wandernadel** (HWN), a long-running hiking-badge program in the Harz region of Germany. Hikers visit stamp stations spread across the region (currently ~222 official stations, plus special stations and retired/inactive ones), collect a stamp at each, and earn badges ("Wandernadeln" in bronze/gold, plus badges tied to specific collections) once they've visited enough stations. A station can belong to a **collection** (e.g. the "Grenzweg" route).

**Target users:** hikers, nature lovers, and HWN collectors active in the Harz. Initially free; an eventual paid app-store release is the intended distribution model.

**MVP scope** — three screens (tab bar: Karte / Erfolge / Profil):
- **Karte (Map)** — all stations on a map, filterable by status (all / open / visited) and by collection; an in-screen "Stempel" toggle switches the same filtered stations into a grid/list view with a "mark as stamped" action. Map and Stamps are one screen with two view modes, not two separate tabs.
- **Erfolge (Badges)** — progress per Wandernadel tier (bronze/silver/gold/Wanderkönig/Wanderkaiser) and per themed collection, plus already-earned badges.
- **Profil (Settings)** — profile info, GPS/offline-map/dark-mode toggles, feedback & support, emergency info, legal.

**Later ideas (not committed, listed for context only):** alternate map layers (elevation), parking search, tour planning, weather forecast, a live Harz status ticker (closures, broken stamp stations), emergency info (current coordinates, phone numbers), selfie-at-station capture, cross-device data transfer.

---

## Architecture Invariant: Offline-First

Large parts of the Harz have no reliable cell coverage, so the app must work fully offline in the field — this is a hard product requirement, not an optimization, and it constrains implementation choices across the app:

- **Region-bound assets are bundled into the app, not fetched at runtime.** The Harz is a fixed, bounded coordinate area, so map tiles and the station/collection/badge dataset ship inside the app build rather than being downloaded on demand. The only currently-envisioned exception is the v2 status ticker.
- **Backend communication is minimized by design.** The current backend (health-check only) is a leftover of the initial scaffold, not a preview of the target shape — expect MVP functionality (map, stamps, badges) to run entirely against local, on-device data. Network calls are reserved for things that genuinely need a server, e.g. the later cross-device data transfer feature.

Treat this as a standing constraint on data-storage, sync, and backend-scope decisions — see [Open Questions](#open-questions--not-yet-decided).

---

## Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| App | React Native (TypeScript, iOS + Android) | Single codebase for both mobile platforms |
| App styling | NativeWind (Tailwind CSS classes via `className`) | Utility-class styling instead of `StyleSheet.create`, familiar to web-leaning contributors |
| Backend | Node.js + Express (TypeScript), packaged with `serverless-http` | Familiar Express routing/middleware model, runs unmodified on AWS Lambda |
| Compute | AWS Lambda (Node.js 24.x) | Serverless billing, no idle cost |
| Backend exposure | Lambda Function URL | Simplest/cheapest way to expose an HTTP endpoint for a single-service backend; no API Gateway needed at this scale |
| Infrastructure | AWS CDK (TypeScript) | Infrastructure as code, type-checked, same language as the rest of the stack |
| Monorepo tooling | npm workspaces | See [Decision Log](#decision-log) |

---

## Repository Layout

```
/
├── app/              ← React Native app (own toolchain, not an npm workspace — see below)
├── backend/           ← Express app, bundled for Lambda via serverless-http
│   ├── src/
│   │   ├── app.ts          ← Express app factory (routes, middleware)
│   │   ├── handler.ts      ← Lambda entrypoint (serverless-http wrapper)
│   │   └── routes/         ← one file per route group
│   ├── local/server.ts     ← local dev entrypoint (plain app.listen)
│   └── tests/
├── infrastructure/    ← AWS CDK app (TypeScript)
│   ├── bin/infrastructure.ts   ← CDK app entrypoint
│   ├── lib/backend-stack.ts    ← Lambda + Function URL
│   └── test/                   ← CDK assertions tests
└── .github/workflows/ci.yml
```

### Why `app/` is not an npm workspace

React Native has its own module resolution (Metro) and native build tooling (Gradle, CocoaPods) that don't mix well with npm workspace hoisting. `app/` is a self-contained project with its own `package.json` and `node_modules`. `backend/` and `infrastructure/` are npm workspaces at the repo root and share a single `npm install`.

Linting follows the same split: the root `eslint.config.mjs` (flat config) covers `backend/` and `infrastructure/` and explicitly excludes `app/`, which keeps its own separate `.eslintrc.js` (React Native's default legacy-format config).

---

## App

Screens live in `app/src/screens/`, reusable UI in `app/src/components/`. Styling uses NativeWind (`className` props, Tailwind config in `app/tailwind.config.js`) instead of `StyleSheet.create`.

**Architecture invariant:** `react-native-reanimated` is excluded from native autolinking on both platforms (see `app/react-native.config.js`). It's pulled in transitively as a static require target for NativeWind's own animation code paths, not used directly by the app, and its native side isn't yet compatible with the `react-native-worklets` version RN 0.87 requires — so it stays JS-resolvable only. Revisit once a compatible reanimated release ships or the app actually needs animation utilities.

---

## Backend

A single Express app (`backend/src/app.ts`) is the source of truth for routes and middleware. Two entrypoints wrap it:

- **`backend/src/handler.ts`** — wraps the Express app with [`serverless-http`](https://github.com/dougmoscrop/serverless-http) and is the Lambda handler used by CDK.
- **`backend/local/server.ts`** — calls `app.listen()` directly for local development (`npm run dev`), no AWS involved.

This means the exact same routing/middleware code runs locally and in Lambda — nothing backend-specific is duplicated between the two entrypoints.

The Lambda is exposed via a **Function URL** (not API Gateway). For a single-service backend this avoids API Gateway's extra resources, stages, and cost for no real benefit. If the backend grows into multiple services, custom domains, or needs request throttling/API keys, revisit this in favor of API Gateway (HTTP API).

---

## App ↔ Backend connectivity (local development)

The Android emulator cannot reach the host machine via `localhost` — it uses the documented alias `10.0.2.2`. The iOS Simulator shares the host network directly, so `localhost` works there. This is handled in `app/src/config.ts` via `Platform.select`. When the backend is deployed, point `API_BASE_URL` at the Lambda Function URL instead (see [Environments](#environments)).

---

## Environments

| Env | Purpose |
|---|---|
| `dev` | Integration testing against real AWS resources |
| `prod` | Live app |

The active environment is selected via the CDK context variable `APP_ENV` (`cdk deploy --context APP_ENV=dev`, defaults to `dev`). Each environment gets its own CloudFormation stack (`HwnTracker-Backend-{env}`), so `dev` and `prod` never share resources.

---

## Testing Strategy

| Package | Framework | What's covered |
|---|---|---|
| `app/` | Jest + `react-test-renderer` | Component/screen rendering |
| `backend/` | Vitest + Supertest | Express routes, in-process (no real Lambda/AWS needed) |
| `infrastructure/` | Vitest + `aws-cdk-lib/assertions` | Stack shape (resources, properties) — not a real deploy |

`infrastructure`'s vitest config pins `pool: 'forks'` (see `infrastructure/vitest.config.ts`) — CDK's `NodejsFunction` bundling spawns esbuild as a child process, which is unreliable under vitest's default `worker_threads` pool.

---

## Decision Log

| Decision | Chosen | Rejected | Reason |
|---|---|---|---|
| Monorepo tooling | npm workspaces | Nx | Three packages, no cross-package build graph or caching need yet. Nx earns its keep once there are many packages (e.g. multiple Lambdas/services) that benefit from affected-based builds and remote caching — revisit if the backend splits into several services. |
| Backend architecture | Single Express app via `serverless-http` | Per-route Lambda functions | Requested pattern; also simplest to run identically local vs. deployed, and avoids N separate bundles/cold starts for a small API surface. |
| Backend exposure | Lambda Function URL | API Gateway (HTTP API) | Minimal infra for a single-service backend. No stages/custom-domain/throttling requirement yet. |
| Lambda runtime | Node.js 24.x | Node.js 20.x | 20.x is already in its CloudFormation deprecation window; 24.x is current LTS at time of writing. |

---

## Open Questions / Not Yet Decided

These were out of scope for the initial scaffold and should be revisited as the real feature set (see [Product Overview](#product-overview)) gets built:

- **On-device data storage** for the bundled station/collection/badge dataset and local stamp-collection state (SQLite? a bundled JSON/asset store? something else) — must fit the [offline-first invariant](#architecture-invariant-offline-first).
- **How official station/collection/badge data is authored, versioned, and shipped** inside app releases without a backend round-trip.
- **Cross-device data transfer** (e.g. phone upgrade) — later feature, mechanism not yet decided; likely the first real reason the backend grows beyond a health check.
- **Authentication/authorization** — likely app-store purchase/entitlement rather than traditional accounts, given the offline-first, mostly-backend-less design; not yet decided.
- CI/CD deploy automation (CI currently only runs tests + `cdk synth`, it never deploys).
- Observability (logging format, error tracking, alarms) — low priority while the backend surface stays minimal.
