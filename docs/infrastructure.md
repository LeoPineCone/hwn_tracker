# Infrastructure Guide

AWS CDK app in `infrastructure/`. See [ARCHITECTURE.md](../ARCHITECTURE.md) for stack details and the decision log. Follows [TypeScript Conventions](typescript.md).

## Working on stacks
- Stack definitions live in `infrastructure/lib/`. Wire new stacks into `infrastructure/bin/infrastructure.ts`.
- Add a `test/*.test.ts` using `aws-cdk-lib/assertions` for any new stack or significant resource.
- Run `npx cdk synth --context APP_ENV=dev` to validate before considering a task done.
- Never run `cdk deploy` — see root `AGENTS.md`.

## Testing
`npm test -w infrastructure` (from repo root) — Vitest + `aws-cdk-lib/assertions`.
