# Backend Guide

Express app in `backend/`, packaged for Lambda via `serverless-http`. See [ARCHITECTURE.md](../ARCHITECTURE.md#backend) for the full setup. Follows [TypeScript Conventions](typescript.md).

## Adding a route
- Add it under `backend/src/routes/`, mounted in `backend/src/app.ts`.
- Add a Supertest test in `backend/tests/` that exercises the route in-process (no real AWS calls).
- Do not add AWS SDK calls or persistence without checking `ARCHITECTURE.md` first — the app is offline-first by design (see its Architecture Invariant section), so most functionality shouldn't need a backend round-trip at all.

## Entrypoint boundary
The Express app (`backend/src/app.ts`) is framework-agnostic of its entrypoint. Route/middleware logic goes there, not in `handler.ts` (Lambda) or `local/server.ts` (local dev) — those two files stay thin wrappers.

## Testing
`npm test -w backend` (from repo root) — Vitest + Supertest.
