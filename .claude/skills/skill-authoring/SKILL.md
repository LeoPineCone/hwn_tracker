---
name: skill-authoring
description: "Creates, reviews, or edits skills. USE WHEN: (1) creating a new skill from scratch, (2) reviewing or auditing an existing skill for quality, structure, and trigger coverage, (3) editing an existing skill (updating triggers, restructuring content, adding/removing resources, trimming for conciseness), or (4) the user mentions 'skill', 'SKILL.md', or asks about skill best practices. Only skills, not other file types (inline code docs, API references, AGENTS.md, general documentation)."
---

# Skill Authoring

Creates, reviews, or edits skills. Determine the operation type first:

- **Creating a new skill?** --> [Creation Workflow](#creation-workflow)
- **Reviewing an existing skill?** --> [Review Workflow](#review-workflow)
- **Editing an existing skill?** --> [Edit Workflow](#edit-workflow)

---

## About Skills

Skills are modular, self-contained packages that extend an agent's capabilities with specialized knowledge, workflows, and tools. They transform a general-purpose agent into a specialized one equipped with procedural knowledge no model fully possesses.

### Anatomy

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name + description, required)
│   └── Markdown body (instructions, required)
└── Bundled Resources (optional)
    ├── scripts/      - Executable code (deterministic, token-efficient)
    ├── references/   - Documentation loaded into context as needed
    └── assets/       - Files used in output (templates, images, fonts)
```

**Frontmatter** is the primary triggering mechanism. Include both what the skill does and specific triggers/contexts for when to use it. The body loads only after triggering.

**No extraneous files** -- no README.md, CHANGELOG.md, etc. Only files the agent needs to do the job.

### Core Principles

- **Conciseness**: Context window is a public good. Only add what the agent doesn't already know. Prefer examples over explanations. Challenge each paragraph: "Does this justify its token cost?"
- **Degrees of Freedom**: Match specificity to task fragility -- high freedom (text) for context-dependent decisions, medium (pseudocode/scripts) for preferred patterns, low (specific scripts) for fragile operations.
- **Progressive Disclosure**: Three levels -- metadata (~100 words, always loaded) / body (<5k words, on trigger) / resources (on demand). Keep body lean; move details to reference files with clear "when to read" guidance. One level deep.

### Reference Guides

Read when the situation applies:

- **Skill has multi-step processes**: [references/workflows.md](references/workflows.md) -- sequential or conditional steps
- **Skill needs consistent output format**: [references/output-patterns.md](references/output-patterns.md) -- templates and examples
- **Skill includes scripts or you're unsure about common mistakes**: [references/scripts-and-anti-patterns.md](references/scripts-and-anti-patterns.md) -- executable scripts and authoring pitfalls

---

## Creation Workflow

Follow these steps in order, skipping only when clearly not applicable.

Copy this checklist and check off items as you complete them:

- [ ] Step 1: Understand with concrete examples
- [ ] Step 2: Plan reusable resources
- [ ] Step 3: Create the skill directory
- [ ] Step 4: Implement (resources first, then SKILL.md)
- [ ] Step 5: Iterate (evaluation-driven development)

### Step 1: Understand with Concrete Examples

Skip only when usage patterns are already clearly understood.

Clarify concrete examples of how the skill will be used. Ask:
- "What functionality should the skill support?"
- "Can you give examples of how it would be used?"
- "What would a user say that should trigger this skill?"

Avoid overwhelming the user -- start with the most important questions.

### Step 2: Plan Reusable Resources

Analyze each example:
1. Consider how to execute from scratch
2. Identify what scripts, references, and assets would help when executing repeatedly

Examples:
- Rotating PDFs repeatedly --> `scripts/rotate_pdf.py`
- Building frontend webapps --> `assets/hello-world/` boilerplate template
- Querying BigQuery --> `references/schema.md` documenting table schemas

### Step 3: Create the Skill Directory

Create the skill directory and SKILL.md directly. Structure:

```
<skill-name>/
├── SKILL.md
├── references/   (if needed)
├── scripts/      (if needed)
└── assets/       (if needed)
```

Only create resource directories that the skill actually needs.

### Step 4: Implement

1. **Start with reusable resources** -- implement scripts, write references, add assets. This may require user input (brand assets, documentation, etc.). Test scripts by running them.
2. **Write SKILL.md** using imperative/infinitive form. Follow the naming and description rules in the [review checklist](references/review-checklist.md) (Frontmatter section). Body: instructions for using the skill and its resources -- avoid information the agent already knows.

### Step 5: Iterate

Evaluation-driven development -- build evaluations before writing extensive documentation:

1. Run the agent on representative tasks **without** the skill. Document specific failures
2. Write minimal skill content to address those failures
3. Test on real tasks, observe behavior (missed references, ignored content, unexpected paths)
4. Refine based on observation, not assumptions
5. Repeat

---

## Review Workflow

Copy this checklist and check off items as you complete them:

- [ ] Step 1: Read the skill
- [ ] Step 2: Quality review (evaluate against all checklist categories)
- [ ] Step 3: Report findings

### Step 1: Read the Skill

Read the skill's SKILL.md and list all files in the skill directory to understand its structure.

### Step 2: Quality Review

Read [references/review-checklist.md](references/review-checklist.md) and evaluate the skill against all criteria.

### Step 3: Report Findings

Produce actionable findings grouped by checklist category (Frontmatter, Conciseness, Progressive Disclosure, etc.) with severity:

- **Blocker**: Must fix -- skill will malfunction or trigger incorrectly
- **Warning**: Should fix -- skill works but wastes tokens, misses triggers, or confuses the agent
- **Suggestion**: Could improve -- minor quality enhancements

Include specific line references and concrete fix suggestions. Use the checklist category names for traceability (e.g., "Frontmatter: description missing trigger scenarios").

---

## Edit Workflow

Determine the edit type:

### Update Triggers / Description

Revise frontmatter `description` to match actual usage patterns:
1. Analyze real user queries that should (and should not) trigger the skill
2. Ensure all intended scenarios are covered in the description
3. Remove trigger information from the body (it's wasted there)
4. Keep description under 1024 chars, no angle brackets

### Restructure Content

Split or consolidate SKILL.md content:
- **Body too long (>500 lines)?** Extract detailed content into `references/` files, link from SKILL.md
- **Too many small references?** Consolidate related ones, or inline trivial content back into SKILL.md
- **Multiple variants/frameworks?** Move variant-specific details to separate reference files, keep selection guidance in SKILL.md

### Add / Remove Resources

- **Adding scripts**: implement, test, document usage in SKILL.md
- **Adding references**: write content, link from SKILL.md with "when to read" guidance
- **Adding assets**: place files, document purpose in SKILL.md
- **Removing**: delete files, remove references from SKILL.md

### Trim for Conciseness

Reduce token cost while preserving value:
1. Remove information the agent already knows
2. Replace verbose explanations with concise examples
3. Deduplicate content between SKILL.md and references
4. Challenge each paragraph: "Would the agent struggle without this?"
5. Verify line count stays under 500
