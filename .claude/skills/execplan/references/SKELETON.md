# ExecPlan Skeleton

Use this skeleton when creating a new ExecPlan. Replace bracketed placeholders with real
content. Do not remove any required section.

    # <Short, action-oriented description>

    This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
    Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.

    ## Purpose / Big Picture

    Explain in a few sentences what someone gains after this change and how they can see it
    working. State the user-visible behavior you will enable.

    ## Progress

    - [x] (2025-10-01 13:00Z) Example completed step.
    - [ ] Example incomplete step.
    - [ ] Example partially completed step (completed: X; remaining: Y).
    - [ ] ExecPlan finalized: outcomes written, plan moved to completed location per AGENTS.md.

    ## Surprises & Discoveries

    - Observation: ...
      Evidence: ...

    ## Decision Log

    - Decision: ...
      Rationale: ...
      Date/Author: ...

    ## Outcomes & Retrospective

    Summarize outcomes, gaps, and lessons learned at major milestones or at completion.
    Compare the result against the original purpose.

    ## Context and Orientation

    Describe the current state relevant to this task as if the reader knows nothing. Name the
    key files and modules by full path. Define any non-obvious term. Do not refer to prior
    plans. Include only knowledge that applies across the entire plan (architecture, dependency
    rules, conventions). Instance-specific details belong in their milestone.

    ## Plan of Work

    Describe, in prose, the sequence of edits and additions. For each edit, name the file and
    location (function, module) and what to insert or change.

    ## Concrete Steps

    State exact commands to run and where (working directory). When a command generates output,
    show a short expected transcript for comparison. Update this section as work proceeds.

    ## Validation and Acceptance

    **Baseline.** Before any code changes, run the full project test suite (all test types —
    unit, integration, API, etc.) and record the command, pass count, and any pre-existing
    failures. This baseline proves the suite was green (or documents known failures) before
    work began. Never baseline with a subset of tests — partial baselines hide breakage
    introduced by the plan.

    **Acceptance.** Describe how to start or exercise the system and what to observe. Phrase
    acceptance as behavior with specific inputs and outputs. For test-verified changes: "run
    <full test command> and expect <N + new> passed; the new test(s) fail before the change
    and pass after."

    ## Idempotence and Recovery

    If steps can be repeated safely, say so. If a step is risky, provide a safe retry or
    rollback path.

    ## Artifacts and Notes

    Include the most important transcripts, diffs, or snippets as indented examples.

    ## Interfaces and Dependencies

    Name the libraries, modules, and services to use and why. Specify types, traits/interfaces,
    and function signatures that must exist at the end of the milestone. E.g.:

    In crates/foo/planner.rs, define:

        pub trait Planner {
            fn plan(&self, observed: &Observed) -> Vec<Action>;
        }
