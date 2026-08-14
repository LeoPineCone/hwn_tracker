# Scripts & Anti-Patterns

## Script Authoring

### Solve, Don't Punt

Scripts should handle errors explicitly rather than failing and leaving the agent to guess:

```python
# Good: handles errors
def process_file(path):
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:
        print(f"File {path} not found, creating default")
        with open(path, "w") as f:
            f.write("")
        return ""

# Bad: punts to agent
def process_file(path):
    return open(path).read()
```

### No Voodoo Constants

Document why every constant has its value:

```python
# Good: self-documenting
REQUEST_TIMEOUT = 30  # HTTP requests typically complete within 30s
MAX_RETRIES = 3       # Most intermittent failures resolve by retry 2

# Bad: magic numbers
TIMEOUT = 47  # Why 47?
RETRIES = 5   # Why 5?
```

### Execute vs Read

Make clear in SKILL.md whether the agent should execute a script or read it as reference:

- **Execute** (most common): "Run `analyze_form.py` to extract fields"
- **Read as reference** (for understanding logic): "See `analyze_form.py` for the extraction algorithm"

Execution is preferred -- more reliable, saves tokens.

## Anti-Patterns

### No Windows-Style Paths

Always use forward slashes: `scripts/helper.py`, not `scripts\helper.py`. Unix-style paths work cross-platform.

### Don't Offer Too Many Options

Provide a default tool/approach with an escape hatch, not a buffet:

```markdown
# Bad: too many choices
"You can use pypdf, or pdfplumber, or PyMuPDF, or pdf2image..."

# Good: default + escape hatch
"Use pdfplumber for text extraction.
For scanned PDFs requiring OCR, use pdf2image with pytesseract instead."
```

### No Time-Sensitive Information

Don't include dates that will become stale:

```markdown
# Bad
"If you're doing this before August 2025, use the old API."

# Good
"Use the v2 API endpoint. Legacy v1 API is deprecated."
```

### Consistent Terminology

Pick one term and use it throughout. Don't mix "API endpoint" / "URL" / "API route" / "path" for the same concept.
