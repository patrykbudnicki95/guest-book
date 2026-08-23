# docs-cursor-rules-restructure

Split the monolithic Cursor rule and docs into agent-friendly rules plus human-readable documentation that mirrors the current repo.

## Added

- Focused Cursor rules (project, coding, Zod, file org, R2, permissions, Cache Components)
- `rules-maintenance` rule: after editing `.cursor/rules/`, re-validate that all rules still cover the project
- Docs tree: product, architecture, engineering, and Next cache reference/cheatsheet
- Root README oriented to this SaaS (setup, env, links)

## Changed

- Roadmap moved from root `TODO.md` to `docs/product/roadmap.md`
- Next Cache Components dump moved under `docs/reference/`

## Removed

- Monolithic `.cursor/rules/base.mdc` and outdated `docs/ProjectContext.md`
