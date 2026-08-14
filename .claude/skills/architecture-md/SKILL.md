---
name: architecture-md
description: Create or review ARCHITECTURE.md documentation for codebases. Use when asked to document the architecture, create ARCHITECTURE.md, review or audit an existing ARCHITECTURE.md, explain codebase structure to contributors, or map out high-level system design. Also triggers on "is ARCHITECTURE.md up to date". NOT for inline code docs or API reference docs. Based on matklad's ARCHITECTURE.md pattern.
---

# ARCHITECTURE.md

## Create Workflow

Copy this checklist and check off items as you complete them:

- [ ] Step 1: Analyze codebase structure
- [ ] Step 2: Identify architecture invariants
- [ ] Step 3: Draft and write
- [ ] Step 4: Self-review

### 1. Analyze Codebase Structure

Use the Task tool (explore agent, "very thorough") to understand major directories, entry points, module boundaries, and
core types.

### 2. Identify Architecture Invariants

Look for absences, boundaries, and constraints. Absences are critical but hard to discover from code alone — look for
what's deliberately NOT there.

### 3. Draft and Write

Use `references/template.md` as structure. Follow `references/guidelines.md` for content rules, DO/DON'T lists,
calibration, and length targets.

### 4. Self-Review

Before finalizing:

1. **Accuracy check**: Spot-check that named types, modules, and paths actually exist in the codebase (use grep/glob).
   Fix or remove any references that don't resolve.
2. **Guideline check**: Check against `references/guidelines.md` for over-detail: file listings, method signatures,
   internal orchestration, poor calibration (utility modules getting as much space as core boundaries), and duplication
   between codemap and cross-cutting concerns.

## Review Workflow

When asked to review, audit, or check an existing ARCHITECTURE.md:

Copy this checklist and check off items as you complete them:

- [ ] Step 1: Accuracy audit
- [ ] Step 2: Staleness detection
- [ ] Step 3: Guideline compliance
- [ ] Step 4: Report

### 1. Accuracy Audit

Use the Task tool (explore agent, "very thorough") to validate claims against the codebase:

- **Structure**: Do described directories, modules, and types actually exist?
- **Gaps**: Are there modules that exist but aren't documented?
- **Removals**: Are there documented things that no longer exist?
- **Names**: Are type names, class names, file names still correct?
- **Invariants**: Spot-check dependency rules (e.g., grep for imports that would violate documented invariants)

### 2. Staleness Detection

Flag concrete claims that tend to drift: numeric counts, lists of specific files/types, technology versions, feature
descriptions that may have evolved.

### 3. Guideline Compliance

Check against `references/guidelines.md` for abstraction level, calibration, heading format, length, and staleness
magnets.

### 4. Report

Present findings as:

- **Inaccuracies**: documented but wrong
- **Gaps**: exists in codebase but not documented
- **Stale content**: likely outdated (numeric claims, removed items)
- **Guideline violations**: documented but at wrong abstraction level
- **Recommended edits**: specific changes to make

## References

- `references/guidelines.md` — content rules, DO/DON'T lists, calibration, examples. Read during drafting (step 3) and self-review (step 4).
- `references/template.md` — structural skeleton. Use as starting point when drafting (step 3).
- **Original article**: https://matklad.github.io/2021/02/06/ARCHITECTURE.md.html
- **Gold-standard example**: [rust-analyzer architecture.md](https://github.com/rust-analyzer/rust-analyzer/blob/d7c99931d05e3723d878bea5dc26766791fa4e69/docs/dev/architecture.md)
