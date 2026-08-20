# AGENTS.md — HWN Tracker

Instructions for AI agents working on this codebase.

---

## Project Context

HWN Tracker helps hikers collect stamps for the Harzer Wandernadel — see [ARCHITECTURE.md's Product Overview](./ARCHITECTURE.md#product-overview) for the full use case. The app is **offline-first by design** ([Architecture Invariant](./ARCHITECTURE.md#architecture-invariant-offline-first)); keep that constraint in mind for any app or backend work. **Always read `ARCHITECTURE.md` before backend, infrastructure, or app↔backend tasks** — it is the source of truth for the technical setup. If a change would contradict it, flag the conflict explicitly instead of silently working around it.

---

## Key Rules

1. `app/` is not an npm workspace — run `npm install` separately inside `app/`.
2. GitHub issues, PRs, and commit messages are written in English — matches all project docs (ARCHITECTURE.md, AGENTS.md, DESIGN.md). Only the in-app UI copy is German (see `app/DESIGN.md`'s Language & Tone section).
3. No secrets in code. Once real config/credentials exist, they belong in AWS SSM Parameter Store or Lambda environment variables — never hardcoded.
4. All infrastructure is defined in CDK TypeScript — never create or modify AWS resources via the Console.
5. Never run `cdk deploy`. Validate infrastructure changes with `npx cdk synth` only — deployment is a manual, deliberate action by the developer.
6. No TODO comments in committed code — flag it to the developer instead.
7. Before calling a task done: tests exist for the changed code path, `npx cdk synth --context APP_ENV=dev` still succeeds if `infrastructure/` changed, and no secrets were added.

---

## Domain Guides

- [Backend](./docs/backend.md) — adding routes, testing, entrypoint conventions
- [App](./docs/app.md) — React Native structure, conventions, testing
- [App Data Model](./app/DATA.md) — stations, collections, badge tiers
- [Infrastructure](./docs/infrastructure.md) — CDK stack conventions, validation
- [TypeScript Conventions](./docs/typescript.md) — shared by backend & infrastructure

---

## What to Always Ask the Developer

Do not proceed autonomously on these — flag and wait for input:

- Introducing a data store (on-device or backend) or any persistence layer.
- Adding authentication/authorization.
- Switching backend exposure from Function URL to API Gateway (or vice versa).
- Adding a new external service dependency (cost/operational impact).
- Anything touching a deployed (non-`dev`) AWS environment.
- Running `cdk deploy` under any circumstances.
