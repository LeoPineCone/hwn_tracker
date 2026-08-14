# HWN Tracker — System Architecture

> **Purpose:** Authoritative architectural reference for developers and AI agents. Describes the technical setup and how the pieces fit together. This repo currently contains a scaffold (dummy screens, a health-check endpoint, a minimal CDK stack) — extend this document as real features land.

---

## Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| App | React Native (TypeScript, iOS + Android) | Single codebase for both mobile platforms |
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
| `app/` | Jest + `@testing-library/react-native`-style rendering | Component/screen rendering |
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

These were out of scope for the initial scaffold and should be revisited once real product requirements exist:

- Data storage (DynamoDB? RDS? none yet)
- Authentication/authorization
- CI/CD deploy automation (CI currently only runs tests + `cdk synth`, it never deploys)
- Observability (logging format, error tracking, alarms)
