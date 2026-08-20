# GitHub CLI search guide

Use only the GitHub CLI (`gh`) for GitHub access. Do not use MCP tools or browser automation.

## Preconditions

```bash
gh --version
gh auth status
gh repo view OWNER/REPO --json nameWithOwner,defaultBranchRef,url
```

If the process runs inside a local checkout, `--repo OWNER/REPO` may be omitted after verifying the resolved repository with `gh repo view`.

## Read issues

```bash
gh issue list --repo OWNER/REPO --state open --limit 200 \
  --json number,title,body,state,stateReason,labels,milestone,url,createdAt,updatedAt

gh issue list --repo OWNER/REPO --state closed --limit 200 \
  --json number,title,body,state,stateReason,labels,milestone,url,closedAt,closedByPullRequestsReferences

gh issue view 123 --repo OWNER/REPO \
  --json number,title,body,state,stateReason,labels,milestone,url,comments,closedByPullRequestsReferences
```

Do not assume that `--limit 200` covers a larger repository. If the result count reaches the limit, increase it or use `gh api --paginate`.

## Search issues

Search several concise synonyms. Quote terms containing spaces.

```bash
gh search issues "bottom navigation" --repo OWNER/REPO --match title,body \
  --limit 100 --json number,title,state,url,body,labels,updatedAt

gh search issues "tab bar" --repo OWNER/REPO --match title,body \
  --limit 100 --json number,title,state,url,body,labels,updatedAt

gh search issues "app shell" --repo OWNER/REPO --match title,body \
  --limit 100 --json number,title,state,url,body,labels,updatedAt
```

## Inspect pull requests linked to an issue

```bash
gh issue view 123 --repo OWNER/REPO \
  --json closedByPullRequestsReferences --jq '.closedByPullRequestsReferences[]? | {number,title,url}'

gh pr view 456 --repo OWNER/REPO \
  --json number,title,state,mergedAt,url,files,closingIssuesReferences
```

A closed issue without merged-PR or code evidence remains `UNCERTAIN`.

## Search repository code

```bash
gh search code "BottomNavigation" --repo OWNER/REPO --limit 100 \
  --json path,repository,sha,textMatches,url

gh search code "AppShell" --repo OWNER/REPO --limit 100 \
  --json path,repository,sha,textMatches,url
```

If a local checkout exists, read-only searches such as `rg`, `find`, and `git grep` may supplement `gh`, but GitHub data must still be retrieved through `gh`.

## Labels and milestones

```bash
gh label list --repo OWNER/REPO --limit 200 --json name,description,color

gh api "repos/OWNER/REPO/milestones?state=all&per_page=100" --paginate
```

## Write operations

Perform writes only after explicit user instruction.

```bash
gh issue create --repo OWNER/REPO \
  --title "Story title" \
  --body-file /tmp/story.md \
  --label "story" \
  --milestone "MVP"

gh issue edit 123 --repo OWNER/REPO --body-file /tmp/story.md

gh issue view 123 --repo OWNER/REPO --json number,title,url,state
```

Do not create missing labels or milestones unless explicitly requested. Do not close, reopen, or mark an issue as duplicate merely because overlap was detected.

## Safety and robustness

- Never output tokens, signed URLs, or credential-bearing environment variables.
- Prefer JSON output over parsing human-readable terminal text.
- Check command exit codes and treat partial or truncated result sets as incomplete.
- Use `--repo OWNER/REPO` explicitly for write operations.
- Keep analysis read-only unless the user explicitly requests a GitHub mutation.
