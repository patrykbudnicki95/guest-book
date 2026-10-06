---
name: pull-request
description: Write a short GitHub pull request title and description for the current branch, ready to paste or pass to gh. Use when asked for a PR description, what to write in the PR, or when opening a PR for the work on this branch.
allowed-tools: Read, Glob, Grep, Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*)
---

# Pull request description

Reviewers skim. Aim for something that **fits on one screen**: a short paragraph, then bullets. Drop any section that has nothing to say.

PRs target `main` on GitHub (`patrykbudnicki95/guest-book`).

## Read the branch first

```bash
git branch --show-current
git status --short
git log --oneline main..HEAD
git diff main...HEAD --stat
```

Then read the diff itself and `changelog/<branch-name>.md`. The changelog already summarizes the behaviour and lists the manual steps, so reuse it rather than writing from scratch.

## Template

```markdown
<What changed and why, in 1–3 sentences, for a reviewer who hasn't seen the task.>

### Changes
- <one line per meaningful change, grouped by area, not by file>

### Manual steps
- <SQL migration to run, env vars to add, Supabase/R2/Vercel settings — from the changelog; omit if none>

### Testing
- <lint/build result, and what was checked by hand — or "UI not yet checked">

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

The title is one line in the existing history's style, either a conventional prefix (`docs: …`, `chore(deps): …`, `feat: …`) or a plain imperative sentence, under 70 characters.

## Leave out

- A walk through each file. The diff is right there.
- Restating the code. Explain non-obvious *decisions*.
- Checklists that nobody ticks honestly.

## Finish

Output the description in chat. Don't push or run `gh pr create` unless the user asks, because `.claude/settings.json` denies push. End with one sentence on whether anything is uncommitted or unpushed.
