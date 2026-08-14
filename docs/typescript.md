# TypeScript Conventions

Applies to `backend/` and `infrastructure/` (not `app/`, which has its own conventions — see [app.md](app.md)).

- Strict mode (`"strict": true`) — do not weaken it.
- Explicit return types on exported functions.
- Prefer plain/arrow functions over classes, unless there's a clear reason (e.g. a CDK `Stack` subclass).
- Keep functions short and single-purpose.
- Don't add abstractions, config layers, or dependencies the current task doesn't need.
