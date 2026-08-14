---
name: git-commit
description: Reviews staged and unstaged git changes, checks commit readiness, and creates conventional commits with required issue references. Use for requests like "commit these changes", "create a commit", "write a commit message", or "git commit".
---

# Git Commit Skill

## Checklist

- [ ] Inspect `git status`, staged/unstaged diff, and recent commit subjects
- [ ] Verify no secrets or credentials are being committed
- [ ] Review code quality for non-trivial changes; fix MUST FIX and SHOULD FIX issues
- [ ] Determine the issue reference from context, branch name, or user input
- [ ] Draft the commit message in the required format
- [ ] Commit, then validate hooks/status; if hooks fail or rewrite files, prefer amend when safe, otherwise create a new commit

## Workflow

### 1. Inspect the commit candidate
Review `git status`, the staged and unstaged diff, and recent commit messages before drafting anything. Base the commit message on the actual staged content, not only the latest edited file.

### 2. Verify no sensitive information is present
Check staged changes for secrets, credentials, tokens, `.env` files, or generated auth material. If found, stop and ask the user to remove or explicitly handle them.

### 3. Review code quality for non-trivial changes
Review all modified files when the change is more than trivial. Resolve findings before proceeding.

### 4. Determine the issue reference
- Prefer an issue number already established in session context
- Otherwise inspect the branch name or user-provided task context for an issue number
- If no issue number can be inferred with confidence, ask the user once
- If the user says no issue number is needed for this commit, omit it
- When included, use `Related to #<number>`; never use `Closes`

### 5. Format the commit message

```
type(scope): Subject line in imperative mood

Optional body (only when necessary).

Related to #123

[GitHub Copilot]
```

**Types:**
- `feat` – observable behavior change (logging, errors, API, UI); includes adding, removing, or silencing any output that operators or users can observe (e.g. removing progress bars, suppressing console noise)
- `fix` – bug fix
- `refactor` – refactoring only, no behavior change
- `test` – test additions/changes only
- `build` – dependencies, build config
- `ci` – GitHub Actions, pipeline changes
- `style` – formatting, linting only (whitespace, semicolons, import order — never output changes)
- `docs` – documentation

**Scope (optional):** Derived from affected file paths (e.g. `backend`, `frontend`, `infra`). Omit if changes span multiple areas.

**Subject:** max 50 chars, imperative mood, specific about what and where, no counts or metrics (e.g. not "fix 4 files" or "resolve 15 errors")

**Body** (rare – only when the *why* is non-obvious and cannot be inferred from the code):
- One single statement explaining why, not what or how
- No bullet points, no lists
- No summary of changes
- Wrap at 72 characters

**Footer:**
- `Related to #<number>` when an issue number is known and wanted; never use `Closes`
- Omit the issue footer only when the user explicitly says no issue number is needed
- MUST end with `[GitHub Copilot]`

### 6. Execute the commit
Use a multi-line message so the body and footer are preserved exactly.

**Amend policy:** Amend only when updating the agent's own most recent unpushed commit. If the commit was authored by someone else, predates this conversation, or has already been pushed, do not amend unless the user explicitly requests it.

```bash
git commit -F- <<'EOF'
type(scope): Subject line in imperative mood

Optional body when needed.

Related to #123

[GitHub Copilot]
EOF
```

If the user explicitly says no issue number is needed, omit the
`Related to #<number>` line entirely.

### 7. Validate and recover
- If `git commit` succeeds and hooks do not modify files, stop
- If hooks fail before creating a commit, fix the reported problem, stage any hook-updated files, re-check the diff, and retry `git commit` with the same message
- If hooks modify files after a successful commit, stage those changes, re-check the diff, and prefer `git commit --amend` when safe
- If amend is not allowed by the amend policy, create a new commit instead of amending
- Run `git status` after committing to confirm the working tree is clean or to identify remaining work

## Example messages

Simple (most commits):
```
feat(backend): remove tqdm progress bars from processing loops

Related to #123

[GitHub Copilot]
```

Style-only (formatting/linting changes that do not affect output):
```
style(backend): remove unused imports in document analyzer

Related to #123

[GitHub Copilot]
```

With body (rare):
```
feat(backend): add retry logic to external API calls

Chose exponential backoff over circuit breaker due to
upstream service SLA requirements.

Related to #456

[GitHub Copilot]
```

## Principles
- **Review before commit** – review code and resolve findings before committing
- **Keep commits atomic** – one logical purpose per commit
- **Stay concise** – subject says what, body (if needed) says why
- **Prefer safe amend** – when hooks rewrite files after a successful local commit, amend if safe; otherwise create a new commit
- **Ask when unknown** – if no issue number can be determined, ask once; omit it only when the user explicitly says no issue is needed
