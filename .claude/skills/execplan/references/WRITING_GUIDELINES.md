# Writing Guidelines for ExecPlans

## Purpose and Intent First

Begin by explaining why the work matters: what someone can do after this change that they could
not do before, and how to see it working.

## Plain Prose

Prefer sentences over lists. Checklists are permitted only in the Progress section. Narrative
sections must remain prose-first — if you find yourself writing a list with more than five items
outside Progress, rewrite it as prose with representative examples.

## Define Jargon Immediately

If you introduce a non-obvious term, define it and name the files or commands where it appears
in this repository.

## Repetitive Patterns: Describe Once, Specialize Per Instance

When a change follows a mechanical pattern applied to many locations, describe the pattern and
its detection method (e.g., a grep command) rather than enumerating every instance. Include 2–3
representative before/after examples.

The same principle applies to milestones. When multiple milestones repeat the same sequence of
steps (e.g., extract → create → move → fixup → test → delete), describe the full pattern once
as a "reference milestone" with all details. Subsequent milestones then state only what is
specific to their instance and any deviations from the reference pattern. Do not repeat the
shared steps or rationale across milestones — one authoritative description is more maintainable
than five redundant copies.

## Context and Orientation Scope

The Context and Orientation section provides knowledge that applies across the entire plan:
architecture overview, dependency rules, conventions, relevant prior work. It answers "where am
I and what are the rules?"

Instance-specific details — which callers to update, which tests to relocate, which function
signatures to extract — belong in the milestone that acts on them. If a detail is only relevant
to one milestone, it must not appear in Context and Orientation. Decision rule: "Does an agent
working on milestone N need this to understand milestone N+1?" If no, it belongs in milestone N
only.

## Observable Outcomes

Phrase acceptance as behavior a human can verify ("navigating to `/health` returns HTTP 200")
rather than internal attributes ("added a HealthCheck struct"). If a change is internal, explain
how to demonstrate its impact (e.g., tests that fail before and pass after).

## Explicit Repository Context

Name files with full repository-relative paths. Show the working directory and exact command
line for every command. When outcomes depend on environment, state assumptions.

## Explain the Why, Not Just the What

Every non-trivial choice — file placement, library selection, API shape, migration order — must
include its rationale. Without rationale, the next contributor cannot tell whether a choice was
deliberate or accidental.

## Baseline With the Full Test Suite

Before writing any validation criteria, run the project's complete test suite — all test types,
not a subset — and record the exact command and result in the Validation and Acceptance section.
A partial baseline (e.g., only unit tests) masks regressions in integration or API tests and
defeats the purpose of establishing a known-good starting point. If the full suite has
pre-existing failures, document them explicitly so they are not confused with breakage
introduced by the plan.

## Avoid Common Failure Modes

Do not outsource key decisions to the reader. When ambiguity exists, resolve it in the plan and
explain why. Err on the side of over-explaining user-visible effects and under-specifying
incidental implementation details.
