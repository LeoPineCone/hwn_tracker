---
name: aws-cdk-development
description: AWS CDK (TypeScript) guidance for this project's infrastructure/ stack. Use when creating or modifying CDK constructs, or when the user mentions CDK, CloudFormation, IaC, or cdk synth.
---

# AWS CDK Development

Guidance for `infrastructure/` — the CDK TypeScript stack behind the backend Lambda. See [ARCHITECTURE.md](../../../ARCHITECTURE.md) for the current shape (single Lambda behind a Function URL, no API Gateway, no VPC) before assuming a pattern from general CDK knowledge applies here.

## Hard Rules (from `AGENTS.md` — non-negotiable)

- **Never run `cdk deploy`.** Validate with `npx cdk synth --context APP_ENV=dev` only. Deployment is a manual, deliberate action by the developer.
- **All infrastructure is CDK TypeScript** — never create or modify AWS resources via the Console.
- **No secrets in code.** Real config/credentials belong in SSM Parameter Store or Lambda environment variables.
- Anything touching a deployed (non-`dev`) environment, or adding a new external service dependency, needs the developer's explicit sign-off first.

## Core CDK Principles

Read `references/cdk-patterns.md` for detailed patterns and anti-patterns (naming, construct choice, IAM, Lambda bundling, testing).

### Validation workflow

1. **Implement**: write CDK constructs, prefer L2/L3 constructs and `grant*` methods over hand-written IAM policies.
2. **Synthesize**: `npx cdk synth --context APP_ENV=dev` — must succeed before a task is considered done (see `AGENTS.md`).
3. **Test**: `npm run test` in `infrastructure/` — stack-shape assertions via `aws-cdk-lib/assertions`, not a real deploy. Note the vitest config pins `pool: 'forks'` (see `infrastructure/vitest.config.ts`) because `NodejsFunction` bundling spawns esbuild as a child process.
4. **Optional**: `./scripts/validate-stack.sh` for template-size/resource-count sanity checks after synth.

`cdk-nag` or similar linting tools are not currently installed — adding one is a new dependency and needs the developer's sign-off first, not a default step.

## Stack Organization

- Separate concerns into logical construct boundaries; export values other stacks may need via CDK context or SSM, not hardcoded ARNs.
- Environment selection goes through the `APP_ENV` CDK context variable (see [Environments](../../../ARCHITECTURE.md#environments)) — `dev` and `prod` get separate CloudFormation stacks and never share resources.

## Additional Resources

- `references/cdk-patterns.md` — naming, construct, security, Lambda, and testing patterns
- `scripts/validate-stack.sh` — post-synth template sanity checks (size, resource count)
