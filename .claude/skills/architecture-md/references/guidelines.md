# ARCHITECTURE.md Guidelines

Based on matklad's article: https://matklad.github.io/2021/02/06/ARCHITECTURE.md.html

## Core Principles

**Target audience**: Recurring contributors who need to understand where code lives and how modules relate.

**Key value**: Bridge the gap between reading code sequentially (new contributors) and having a mental map (core developers). The ARCHITECTURE.md creates that mental map.

**Main questions to answer:**
- "Where's the thing that does X?" (codemap)
- "What does the thing I'm looking at do?" (module purpose)

## What to Include

### 1. Bird's Eye Overview
Start with the problem domain. What does this project solve? What's the high-level approach? Name the major components (e.g., "a backend, a frontend, and infrastructure") but don't describe how they're deployed, hosted, or wired together — that belongs in the codemap sections for each component.

**Diagrams:** If you include a diagram, keep it at the same abstraction level as the prose — component roles and dataflow direction only. No ports, hostnames, DNS names, container runtimes, service-discovery mechanisms, or infrastructure labels. A reader should see *what talks to what*, not *how it's deployed*.

Good: `User → Frontend → Backend → Database`
Bad:  `User → ALB (OIDC) → nginx (ECS, port 80) → backend.local:8000 (Cloud Map) → RDS`

Example from rust-analyzer:
> On the highest level, rust-analyzer is a thing which accepts input source code from the client and produces a structured semantic model of the code.

### 2. Codemap
Describe coarse-grained modules and their relationships. This is a map of the country, not an atlas of individual states.

**DO:**
- Use human-readable names as headings with shortest unique path in parentheses (e.g., `### Ports (\`ports/\`)`)
- Drop path prefixes already established by parent sections. If a parent section says the source root is `src/`, subsections use `ports/`, `domain/`, not `src/ports/`, `src/domain/`. Apply this to diagrams and inline references too, not just headings.
- Name 2-5 key types per module for symbol search. Types are the primary navigation aid — readers use "go to symbol" to find them. File names are almost never needed; mention a file only when there is no type to name (e.g., a config file or a module that exports only functions).
- Explain module boundaries and relationships
- Group related directories/crates together
- Reflect on whether directory structure matches conceptual structure

**DON'T:**
- Use raw directory paths as section headings (use human-readable names instead)
- Link directly to files (links go stale)
- Explain *how* each module works internally (use inline docs for that)
- List individual files within a directory. A section for `api/` should not enumerate every router or schema file — name the key types instead and let readers discover files via symbol search.
- Document method signatures, parameter lists, or return types
- Describe internal orchestration flow ("A calls B which calls C")

**Calibration principle:** Entry length should correlate with architectural significance — API boundaries, complex invariants, non-obvious design choices — not with module size or file count. Study the [rust-analyzer architecture doc](https://github.com/rust-analyzer/rust-analyzer/blob/d7c99931d05e3723d878bea5dc26766791fa4e69/docs/dev/architecture.md): `crates/cfg` gets one sentence; `crates/ide` gets 15+ lines with multiple invariants. Both are correct.

**Technique:** Encourage readers to use symbol search to find named entities. This:
- Doesn't require maintenance
- Helps discover similarly-named related things
- Works even as code evolves

### 3. Architecture Invariants
Explicitly call out invariants, especially:
- **Absences**: "Module X does NOT depend on Y"
- **Boundaries**: "The `syntax` crate is completely independent"
- **Constraints**: "Parsing never fails, produces `(T, Vec<Error>)`"
- **API boundaries**: Which crates/modules are public-facing

Example invariants from rust-analyzer:
- "syntax tree is a value type" (no global context needed)
- "syntax tree is built for a single file" (enables parallel parsing)
- "base_db knows nothing about cargo" (abstraction boundary)
- "typing inside a function body never invalidates global derived data" (incremental compilation)

### 4. Cross-Cutting Concerns
Separate section for things that span multiple modules:
- Testing strategy
- Error handling approach
- Logging/observability
- Code generation
- Cancellation/interruption handling
- Configuration management

## What to Exclude

**Don't include:**
- Low-level implementation details (use inline documentation)
- How-to guides for specific tasks (use CONTRIBUTING.md or docs/)
- Frequently changing information (will go stale)
- Complete API documentation (use rustdoc/javadoc/etc.)

## Maintenance Strategy

**Keep it short**: Every recurring contributor reads it. Shorter = less likely to become stale.

**Main rule**: Only specify things unlikely to change frequently.

**Staleness magnets** — avoid these, they require constant maintenance:
- Exact test counts, coverage percentages, or method counts
- Exhaustive file listings within a directory
- Method signatures, parameter lists, or return types
- Specific route counts or endpoint counts

**Don't try to keep synchronized with code.** Instead, revisit a couple times per year.

**When to update:**
- Major architectural refactoring
- New major modules/boundaries
- Significant invariant changes
- Annual/quarterly reviews

## Example — Too Detailed (Wrong)

```
- `document_extractor.py` — `DocumentExtractor` orchestrator. Reads PDFs via
  `DocumentReader`, splits into chunks, sends each chunk to `DocumentAnalyzer`
  (LLM-backed), stores results in DB, runs post-extraction deduplication.
- `document_reader.py` — PDF text extraction and page-level chunking.
- `document_analyzer.py` — LLM-based analysis of text chunks.
```

## Example — Right Level (Correct)

```
### Extraction (`extraction/`)

Structured requirement extraction from PDF documents.
Orchestrated by `DocumentExtractor` (LAH specs) and `DrawingExtractor`
(engineering drawings). Key types: `DocumentExtractor`, `DrawingExtractor`.

**Architecture Invariant:** extraction never calls the database directly;
all persistence goes through `DatabasePort`.
```

## Length Guidance

- **Ideal**: 200-500 lines
- **Maximum**: 1000 lines before considering splitting into multiple docs

## Tips

1. **Be specific about names**: "The `Parser` type in `syntax/parser.rs`" not "the parser"
2. **Explain the 'why'**: Why this boundary? Why this invariant?
3. **Highlight API boundaries**: Mark which modules are meant for external consumption
