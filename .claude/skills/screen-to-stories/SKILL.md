---
name: screen-to-stories
description: Analyze one or more UX/UI screens and slice them into small, vertically valuable, implementation-ready GitHub user stories. Use when a user provides a screenshot, Figma screen, design export, or screen description and wants epics, stories, acceptance criteria, dependencies, or GitHub issues. Inspect open and closed GitHub issues and, when available, the repository code to detect existing global features and shared components such as navigation, authentication, design-system controls, layouts, and API clients, so duplicate work is avoided.
compatibility: Requires the GitHub CLI (`gh`) on PATH, an authenticated GitHub session with repository read access, and access to the UX screen or its description. Repository code access is recommended. Creating or modifying issues requires explicit user instruction and appropriate GitHub permissions.
metadata:
  author: agentic-development
  version: "1.0.0"
---

# Screen to Stories

Turn a UX screen into a reviewed story set that is small enough for an implementation agent and aware of work already present in GitHub.

## Core principles

1. Slice vertically by user-visible outcome, not by technical layer.
2. Treat the screen as evidence, not as a complete specification.
3. Search before proposing. Open and closed issues can reveal planned, active, completed, rejected, or superseded work.
4. Do not assume that a closed issue means the capability exists. Check its closing reason, linked pull requests, discussion, and code when possible.
5. Reuse existing global components and capabilities. Do not recreate navigation, layouts, authentication, design-system controls, analytics, API clients, or state infrastructure without evidence that extension is required.
6. Keep each implementation story independently testable and preferably deliverable in one focused agent run.
7. Separate product behavior from implementation decisions. Add technical notes only when repository evidence supports them.
8. Never create, edit, close, or reopen GitHub issues unless the user explicitly asks for that action.

## Inputs

Collect or infer the following:

- UX screen image, Figma context, design export, or detailed screen description
- Target GitHub owner and repository
- Product goal or user journey, if available
- Target milestone, release, or MVP boundary, if available
- Platform and relevant constraints, if available

If the screen or repository is missing, ask only for the missing input that blocks useful analysis. If the user requests a draft without repository access, proceed and clearly mark repository validation as pending.

## Workflow

### 1. Establish screen scope

Identify:

- screen name and likely route or entry point
- primary user goal
- primary action
- secondary actions
- visible states, controls, content, navigation, feedback, and error affordances
- implied states not shown in the static design: loading, empty, error, offline, permission denied, disabled, success, and responsive behavior
- transitions to or from other screens

Do not invent behavior silently. Record uncertain behavior under `Open questions`.

### 2. Build a capability inventory from the screen

Group observations into:

- global shell: app frame, top bar, bottom navigation, side navigation, route layout
- shared UI: buttons, chips, cards, dialogs, sheets, forms, map markers, list items
- domain behavior: actions that create user value on this screen
- data and integration: data displayed, commands triggered, permissions, API dependencies
- quality behavior: accessibility, responsiveness, telemetry, localization, security, performance

This inventory is an intermediate artifact, not the final backlog.

### 3. Inspect GitHub with `gh` before slicing

Use only the GitHub CLI (`gh`) for GitHub access. Do not use an MCP server, browser automation, direct REST client, GraphQL client, or another GitHub integration.

Before querying repository data:

1. Verify that `gh` is available with `gh --version`.
2. Verify authentication with `gh auth status`.
3. Resolve the repository from an explicit `OWNER/REPO`, a GitHub URL, or the current checkout using `gh repo view`.
4. If `gh` is missing, authentication fails, or the repository cannot be resolved, stop the GitHub inspection. Report the exact blocker and continue only with a clearly marked unvalidated draft when useful.
5. Never print authentication tokens or sensitive environment variables.

Inspect GitHub in this order:

1. repository metadata and default branch
2. open issues
3. closed issues
4. issue labels, milestones, linked pull requests, and closing reasons
5. repository code, when accessible

Use JSON output and `--jq` where practical so results are deterministic and machine-readable. Consult `references/github-search-guide.md` for command patterns.

Search issues using multiple focused variants:

- exact visible labels from the screen
- user-facing capability terms
- component synonyms, for example `bottom navigation`, `tab bar`, `navbar`, `app shell`
- route or screen names
- domain terms and likely implementation component names

Do not rely only on titles. Read issue bodies and relevant discussion. For possible matches, capture:

- issue number and URL
- open or closed state
- labels and milestone
- relationship: implements, overlaps, prerequisite, supersedes, rejected, or unrelated
- confidence: high, medium, or low
- evidence supporting the assessment

When code access exists, verify reusable capabilities with `gh search code` and, if a local checkout is present, read-only local search commands. Inspect likely areas such as routing, layouts, shared components, design system, feature modules, tests, and API clients. Prefer search over guessing paths. Do not clone a repository unless necessary; if cloning is required, use `gh repo clone` into a temporary directory and do not modify the checkout.

### 4. Classify each required capability

Assign exactly one status:

- `REUSE`: capability exists and can be consumed without meaningful change
- `EXTEND`: capability exists but needs a focused enhancement
- `PLANNED`: an open issue already covers it
- `IMPLEMENTED`: a closed issue plus PR/code evidence indicates it exists
- `UNCERTAIN`: evidence is incomplete or conflicting
- `NEW`: no relevant issue or implementation was found
- `OUT_OF_SCOPE`: visible or implied, but intentionally excluded from this slice

A closed issue without implementation evidence must be `UNCERTAIN`, not `IMPLEMENTED`.

### 5. Define the smallest coherent user journey

Describe the usable path through the screen in one sentence:

> A user can [trigger] and receives [visible outcome].

Use this journey as the boundary for the first vertical slice. Do not split mandatory UI, domain behavior, persistence, and feedback into separate layer-only stories if none delivers value alone.

### 6. Slice stories

Create stories in this order when applicable:

1. happy-path vertical slice
2. essential alternate states
3. optional enhancements
4. hardening only where it adds independently verifiable value

A story should usually:

- deliver one observable user outcome
- have 3-7 acceptance criteria
- affect a coherent, limited area of the codebase
- be independently testable
- avoid speculative abstractions
- reference existing issues/components instead of duplicating their work

Split a candidate story when it contains multiple independent actions, multiple unrelated roles, several integrations, or more than one meaningful user outcome.

Do not create standalone stories named only `Build frontend`, `Create API`, `Add database`, `Write tests`, or `Set up state management`. These are implementation tasks unless they independently deliver product value.

### 7. Write testable acceptance criteria

Use Given/When/Then where it improves clarity. Cover only behavior required for the story.

Include, where relevant:

- entry conditions and permissions
- interaction and resulting state
- persistence or refresh behavior
- loading, empty, error, and disabled states
- keyboard and screen-reader behavior
- responsive behavior visible in the supplied design
- analytics only if the product or repository already uses it or explicitly requires it

Do not add generic non-functional requirements to every story. Link to repository-wide standards instead.

### 8. Map dependencies and duplicates

For every proposed story, state:

- `Depends on`: hard prerequisites only
- `Reuses`: verified components/capabilities
- `Related GitHub issues`: existing coverage or overlap
- `Duplicate risk`: none, low, medium, or high

If an open issue already fully covers the story, recommend updating or reusing that issue rather than creating a duplicate.

If an existing issue partially overlaps, recommend one of:

- extend the existing issue
- narrow the new story and cross-link both
- split shared prerequisite work into a separate story only when independently reusable and testable

### 9. Perform a consistency review

Before returning the result, verify:

- every visible primary interaction is covered or explicitly out of scope
- global components are reused where evidence exists
- no issue is declared implemented based only on closed state
- stories do not duplicate each other or known issues
- acceptance criteria are observable and not implementation tasks
- dependencies form no cycle
- story order produces usable increments
- uncertainties are surfaced as open questions

## Output format

Return the following sections.

### 1. Screen understanding

- Screen
- Primary user goal
- Entry point
- Main outcome
- Assumptions

### 2. Existing capability assessment

Use a compact table with:

| Capability | Status | Evidence | Consequence |
|---|---|---|---|

Evidence should link GitHub issues or code locations when available.

### 3. Recommended story map

Group stories under `MVP`, `Next`, and `Later`, or use the supplied milestone structure.

For each story use the template in `assets/github-story-template.md`.

### 4. Coverage and dependency summary

Include:

- story order
- hard dependencies
- reused global components
- existing issues to reuse or update
- intentionally excluded behavior

### 5. Open questions

Ask only questions whose answers may materially change scope, behavior, or acceptance criteria. Provide a recommended default for each question when possible.

### 6. Suggested GitHub actions

List proposed actions without executing them unless explicitly requested:

- create new issue
- update existing issue
- link dependency
- close as duplicate
- add label or milestone

## GitHub issue creation rules

All GitHub write operations must use `gh`. Before any write, inspect the exact command payload and ensure the target repository is correct. Do not use interactive prompts; provide explicit flags or `--body-file`.

When the user explicitly asks to create issues:

1. Show or prepare the final issue set first if the user has not previously reviewed it.
2. Preserve links to the source screen and relevant existing issues.
3. Apply only labels and milestones that already exist unless creation was explicitly requested.
4. Do not close or alter existing issues simply because overlap was detected.
5. Create issues with `gh issue create`; edit them with `gh issue edit` only when explicitly requested.
6. For multiline bodies, write the reviewed content to a temporary Markdown file and pass it with `--body-file` to avoid quoting errors.
7. After creation, verify each result using `gh issue view NUMBER --json number,title,url,state` and return issue numbers, URLs, and the dependency order.

## Story quality gate

A story is ready only if all answers are `yes`:

- Does it describe one user-visible or operationally observable outcome?
- Is the boundary clear?
- Are acceptance criteria testable?
- Are dependencies explicit?
- Has existing GitHub work been checked?
- Is reuse versus extension clearly stated?
- Can an implementation agent produce an execution plan without inventing product behavior?

If not, mark the story `Needs refinement` and explain the missing evidence.
