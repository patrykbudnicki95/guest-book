# Docs index

Context for humans and AI agents. **Rules** (`.cursor/rules/`) are short MUST/MUST NOT. **Docs** explain why and how.

## When to read what

| Task | Start here |
|------|------------|
| New to the product | [product/vision.md](./product/vision.md) |
| Priorities / backlog | [product/roadmap.md](./product/roadmap.md) |
| System map | [architecture/overview.md](./architecture/overview.md) |
| Tables & RLS | [architecture/data-model.md](./architecture/data-model.md) |
| Plans / features / limits | [architecture/permissions.md](./architecture/permissions.md) |
| R2 uploads | [architecture/storage.md](./architecture/storage.md) |
| Code layout & UI habits | [engineering/conventions.md](./engineering/conventions.md) |
| How agents should work | [engineering/agent-workflow.md](./engineering/agent-workflow.md) |
| Next Cache Components (this repo) | [reference/next-cache-cheatsheet.md](./reference/next-cache-cheatsheet.md) |
| Next Cache Components (official links) | [reference/next-cache-components.md](./reference/next-cache-components.md) |

## Cursor rules map

| Rule | Apply |
|------|--------|
| `00-project`, `coding-standards`, `zod-validation` | Always |
| `file-organization`, `storage-r2`, `permissions`, `next-cache-components` | Globs when editing matching files |
| `rules-maintenance` | Globs: `.cursor/rules/**` — after rule edits, re-validate coverage vs the repo |
