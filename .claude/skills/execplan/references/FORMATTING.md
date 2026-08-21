# Formatting and Milestone Conventions

## Markdown Formatting

Each ExecPlan is a single Markdown file. When the file content is only the ExecPlan, omit
wrapping triple backticks. If embedding an ExecPlan inside another document, use a single
fenced code block labeled `md`. Do not nest additional triple-backtick code fences inside; use
indented blocks for commands, transcripts, diffs, or short illustrative code fragments. Use two
newlines after every heading.

Indented code blocks are for commands, expected output, diffs, and verbatim data (see "Specify
Contracts, Not Implementations" in WRITING_GUIDELINES.md) — not for full component or test file
bodies. If an indented block is reproducing a whole file's implementation rather than a
signature, a config value, or vendored data, it belongs in the executor's work, not the plan.

## Milestones

When work contains two or more independent changes that can each be validated separately, use
milestones. Each milestone should be committable and verifiable on its own. If in doubt, prefer
milestones over a flat plan.

Introduce each milestone with a brief paragraph describing: scope, what will exist at the end
that did not exist before, commands to run, and expected acceptance. Keep it readable as a
story: goal, work, result, proof. Never abbreviate a milestone — do not leave out details
crucial to future implementation.

Progress and milestones are distinct: milestones tell the story, progress tracks granular work.

### Reference Milestones

When multiple milestones follow the same pattern, write the first one as a complete "reference
milestone" with all steps, rationale, and examples. Subsequent milestones reference it and
document only their instance-specific details and deviations. Keep the first milestone as the
single authoritative description of the shared pattern so later milestones do not repeat the same
steps and rationale.

### Prototyping Milestones

It is acceptable to include explicit prototyping milestones that de-risk a larger change. Label
scope as "prototyping"; describe how to run and observe results; state criteria for promoting or
discarding the prototype. Prefer additive code changes followed by subtractions that keep tests
passing.
