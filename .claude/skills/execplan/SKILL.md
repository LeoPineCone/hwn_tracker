---
name: execplan
description: >
  Creates, implements, discusses, and maintains Execution Plans (ExecPlans) — self-contained
  design documents that guide a coding agent or novice through delivering a working feature or
  system change. Use when creating a new ExecPlan for a complex feature or significant refactor,
  implementing an existing ExecPlan, revising an active ExecPlan, or researching a design with
  significant unknowns that needs prototyping milestones, including requests that mention
  "ExecPlan", "execution plan", "active exec plan", "completed exec plan", or
  "self-contained implementation plan" in the context of feature delivery.
---

# ExecPlans

An ExecPlan is a living, self-contained design document that enables a stateless agent or human
novice to deliver a working, observable result by reading it top to bottom. It contains all
knowledge and instructions needed to succeed — no prior context, no external references.

The executing agent can list files, read files, search, run the project, and run tests. It does
not know any prior context. Repeat any assumption you rely on. Do not point to external docs;
embed required knowledge in the plan itself.

## Mode Router

Determine which mode applies, then read the referenced files as needed.

### Authoring a New ExecPlan

Read [references/WRITING_GUIDELINES.md](references/WRITING_GUIDELINES.md), then
[references/SKELETON.md](references/SKELETON.md), then
[references/FORMATTING.md](references/FORMATTING.md). Research the codebase thoroughly before
writing. Start from the skeleton and flesh it out during research.

### Implementing an ExecPlan

Exactly one agent owns the ExecPlan — it reads, updates, and commits the plan file. Subagents
receive only the context necessary for their specific task, not this skill.

Before doing any work, re-read the active ExecPlan's Progress section. The ExecPlan file on
disk is the single source of truth — not conversation history. If completed work is missing
from Progress (e.g., after context compaction), update it before proceeding.

Invariants during implementation:

- Every Progress entry must include a UTC timestamp: `- [x] (2025-10-01 13:00Z) ...`
- **Update the ExecPlan before committing.** Stage the updated plan file together with the
  code changes it describes — never after.
- Proceed to the next milestone autonomously. Do not prompt the user for "next steps."
- If you change course, document why in the Decision Log and update Progress.

When delegating tasks to subagents, extract architectural context from the ExecPlan into the
task prompt rather than loading this skill into the subagent.

After completing the final milestone, write Outcomes & Retrospective and move the plan from
`docs/exec-plans/active/` to `docs/exec-plans/completed/`.

### Discussing / Revising an ExecPlan

Record every decision in the Decision Log with rationale. Ensure changes are reflected across
all living-document sections.

### Researching / Prototyping

Use milestones to implement proof-of-concepts that validate feasibility. Label scope as
"prototyping"; state criteria for promoting or discarding the prototype.

## Non-Negotiable Requirements

1. **Self-contained.** All knowledge needed is in the plan. Do not say "as defined previously"
   — include the explanation.
2. **Living document.** Revise as progress is made. Each revision must remain self-contained.
3. **Novice-enabling.** A complete novice can implement end-to-end without prior repo knowledge.
4. **Outcome-focused.** Produce demonstrably working behavior, not merely code changes.
5. **Prior plans.** If building on a checked-in prior ExecPlan, restate any needed context in the
   current plan. Prior plans may be cited for provenance, but the reader must not need to open
   them to execute successfully.

## Required Living-Document Sections

Every ExecPlan must contain and maintain:

- **Progress** — Checklist with UTC timestamps. Every stopping point documented.
- **Surprises & Discoveries** — Unexpected behaviors, bugs, or insights with evidence.
- **Decision Log** — Every decision with rationale and date.
- **Outcomes & Retrospective** — Summarize outcomes, gaps, and lessons at completion.

## File Conventions

Name files `<github-issue>_<short_title>.md` (omit issue prefix when none exists). Active
plans go in `docs/exec-plans/active/`, completed plans in `docs/exec-plans/completed/`.

## Reference Files

- **[references/WRITING_GUIDELINES.md](references/WRITING_GUIDELINES.md)** — Prose style,
  pattern-over-enumeration, context scoping, milestone structure. Read when authoring or revising.
- **[references/SKELETON.md](references/SKELETON.md)** — Starting template for new ExecPlans.
  Read when authoring.
- **[references/FORMATTING.md](references/FORMATTING.md)** — Markdown formatting rules and
  milestone conventions. Read when authoring.

The bar: a single, stateless agent — or a human novice — can read the ExecPlan from top to
bottom and produce a working, observable result.
