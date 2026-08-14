# Skill Review Checklist

Use this checklist when reviewing a skill. Report findings grouped by category with severity (blocker / warning / suggestion).

## Frontmatter

- [ ] `name` present, hyphen-case, lowercase+digits+hyphens only, no leading/trailing/double hyphens, max 64 chars
- [ ] `name` matches the directory name exactly
- [ ] `name` avoids reserved words (`anthropic`, `claude`) and vague names (`helper`, `utils`, `tools`)
- [ ] `description` present, max 1024 chars, no angle brackets
- [ ] `description` explains **what** the skill does AND **when** to use it (trigger scenarios)
- [ ] `description` written in **third person** ("Processes files..." not "I can help you..." or "You can use this to...")
- [ ] `description` includes specific key terms users would mention
- [ ] `description` covers all intended trigger phrases -- test by imagining user queries that should activate the skill
- [ ] No "when to use" sections in the body (body loads only after triggering; such sections waste tokens)
- [ ] No unexpected frontmatter keys (allowed: `name`, `description`, `license`, `allowed-tools`, `metadata`)

## Conciseness

- [ ] SKILL.md body is under 500 lines
- [ ] Each paragraph justifies its token cost -- would Claude struggle without it?
- [ ] No verbose explanations where a concise example would suffice
- [ ] No information Claude already knows (general programming, common tools)
- [ ] No duplication between SKILL.md body and reference files

## Progressive Disclosure

- [ ] Three-level loading respected: metadata (~100 words) / body (<5k words) / resources (as needed)
- [ ] Reference files linked from SKILL.md with clear "when to read" guidance
- [ ] References are one level deep (no nested chains of references)
- [ ] Reference files over 100 lines have a table of contents
- [ ] Variant-specific details live in separate reference files, not in SKILL.md body

## Structure & Writing

- [ ] Imperative/infinitive form used throughout
- [ ] Clear workflow structure: sequential steps, conditional branches, or task-based sections
- [ ] No extraneous files (README.md, CHANGELOG.md, INSTALLATION_GUIDE.md, etc.)
- [ ] Only files that directly support the skill's functionality are present
- [ ] Consistent terminology throughout (no mixing synonyms for the same concept)
- [ ] No time-sensitive information (or isolated in a clearly marked "legacy/deprecated" section)

## Scripts

- [ ] Scripts are tested and produce expected output
- [ ] Scripts are executable (`chmod +x`)
- [ ] Scripts have usage documentation (docstring or `--help`)
- [ ] Scripts handle errors explicitly (solve, don't punt to the agent)
- [ ] No "voodoo constants" -- all magic numbers are documented with rationale
- [ ] SKILL.md clearly distinguishes execute vs read-as-reference for each script
- [ ] File paths use forward slashes only (no Windows-style backslashes)

## References

- [ ] Content in references is not duplicated in SKILL.md body
- [ ] Large references (>10k words) have grep search patterns noted in SKILL.md
- [ ] References contain only information Claude needs during execution

## Assets

- [ ] Assets are files used in output, not documentation for Claude
- [ ] No assets that should be references (and vice versa)

## Degrees of Freedom

- [ ] Freedom level matches task fragility:
  - High freedom for context-dependent decisions
  - Medium freedom for preferred patterns with variation
  - Low freedom for fragile/error-prone operations
- [ ] Fragile operations have specific scripts or exact instructions
- [ ] Flexible operations avoid over-constraining Claude
- [ ] Default tool/approach provided rather than offering many equivalent options

## Content Quality

- [ ] Feedback loops included for quality-critical operations (validate → fix → repeat)
- [ ] Complex workflows (4+ steps) include a checklist pattern for progress tracking
- [ ] Examples are concrete input/output pairs, not abstract descriptions
