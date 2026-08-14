# AGENTS.md — HWN Tracker

Instructions for AI agents working on this codebase.

---

## Project Context

This repository currently holds a technical scaffold, not a finished product: a dummy React Native app, a health-check-only Express backend, and a minimal CDK stack. There is no real feature/business logic yet. **Always read `ARCHITECTURE.md` before working on backend or infrastructure tasks** — it is the source of truth for the technical setup. If a change would contradict it, flag the conflict explicitly instead of silently working around it.

---

## Repository Structure

```
/
├── AGENTS.md                    ← this file
├── ARCHITECTURE.md              ← read before any backend/infrastructure task
├── app/                         ← React Native app (iOS + Android), own toolchain
│   ├── src/
│   │   ├── screens/             ← one file per screen
│   │   ├── components/          ← reusable UI components
│   │   ├── services/            ← backend API calls
│   │   └── models/               ← TypeScript interfaces for backend payloads
│   ├── package.json
│   └── tsconfig.json
├── backend/                     ← Express app, packaged for Lambda
│   ├── src/
│   │   ├── app.ts               ← Express app factory
│   │   ├── handler.ts           ← Lambda entrypoint (serverless-http)
│   │   └── routes/
│   ├── local/server.ts          ← local dev entrypoint
│   ├── tests/
│   └── package.json
├── infrastructure/              ← AWS CDK (TypeScript)
│   ├── bin/                     ← CDK app entrypoint
│   ├── lib/                     ← CDK stack definitions
│   ├── test/
│   └── package.json
└── package.json                 ← npm workspaces root (backend + infrastructure only, not app)
```

---

## Key Rules

1. **`app/` is not an npm workspace.** It has its own `package.json`/`node_modules` because Metro and native tooling don't mix well with workspace hoisting. Run `npm install` separately inside `app/`.
2. **No secrets in code.** Once real config/credentials exist, they belong in AWS SSM Parameter Store or Lambda environment variables — never hardcoded.
3. **The Express app (`backend/src/app.ts`) is framework-agnostic of its entrypoint.** Route/middleware logic goes there, not in `handler.ts` (Lambda) or `local/server.ts` (local dev) — those two files should stay thin wrappers.
4. **All infrastructure is defined in CDK TypeScript** — never create or modify AWS resources via the Console.
5. **Never run `cdk deploy`.** Validate infrastructure changes with `npx cdk synth` only. Deployment is a manual, deliberate action by the developer.

---

## How to Work on This Project

### Before starting a task
- Read `ARCHITECTURE.md` if the task touches backend, infrastructure, or app↔backend data flow.
- Check whether the change affects both the Express route and the app's `models/`/`services/` layer — keep both in sync.

### When adding a backend route
- Add it under `backend/src/routes/`, mounted in `backend/src/app.ts`.
- Add a Supertest test in `backend/tests/` that exercises the route in-process (no real AWS calls).
- Do not add AWS SDK calls or persistence without checking `ARCHITECTURE.md` first — no data layer exists yet.

### When working on the React Native app
- Functional components only, TypeScript throughout — no `.js` files.
- All backend calls go through `app/src/services/` — don't fetch directly from screens/components.
- `app/src/config.ts` handles the Android-emulator-vs-iOS-simulator localhost difference for local dev. Don't hardcode a host elsewhere.

### When working on infrastructure
- Stack definitions live in `infrastructure/lib/`. Wire new stacks into `infrastructure/bin/infrastructure.ts`.
- Add a `test/*.test.ts` using `aws-cdk-lib/assertions` for any new stack or significant resource.
- Run `npx cdk synth --context APP_ENV=dev` to validate before considering a task done.

---

## Code Style

### TypeScript (backend & infrastructure)
- Strict mode (`"strict": true`) — do not weaken it.
- Explicit return types on exported functions.
- Prefer plain/arrow functions over classes unless there's a clear reason (e.g. a CDK `Stack` subclass).

### React Native (`app/`)
- Functional components, hooks — no class components.
- No business logic in components — put it in `services/` or a hook.

### General
- No TODO comments in committed code — flag it to the developer instead.
- Keep functions short and single-purpose.
- Don't add abstractions, config layers, or dependencies the current task doesn't need.

---

## Testing

| Package | Command | Framework |
|---|---|---|
| `app/` | `npm test` (inside `app/`) | Jest |
| `backend/` | `npm test -w backend` (from repo root) | Vitest + Supertest |
| `infrastructure/` | `npm test -w infrastructure` (from repo root) | Vitest + `aws-cdk-lib/assertions` |
| everything except `app/` | `npm test` (from repo root) | runs all workspaces |

Before proposing a change as complete:
- Confirm tests exist for the changed code path.
- Confirm `npx cdk synth` still succeeds if `infrastructure/` changed.
- Confirm no secrets were added to code.

---

## What to Always Ask the Developer

Do not proceed autonomously on these — flag and wait for input:

- Introducing a data store (DynamoDB, RDS, etc.) or any persistence layer.
- Adding authentication/authorization.
- Switching backend exposure from Function URL to API Gateway (or vice versa).
- Adding a new external service dependency (cost/operational impact).
- Anything touching a deployed (non-`dev`) AWS environment.
- Running `cdk deploy` under any circumstances.

---

## Useful References

- `ARCHITECTURE.md` — technical setup, stack layout, decision log.
- `infrastructure/lib/` — CDK stack definitions.
- `backend/src/app.ts` — Express route registration.
