# Agent workflow

## Allowed verification

- `npm run lint`
- `npm run build`

Do **not** start `npm run dev` (or equivalent). Manual UI testing is done by the human.

## Before coding

1. Skim matching Cursor rules (always-on + globs for the files you touch).
2. Open the relevant doc from [docs/README.md](../README.md) — do not paste large reference docs into every turn unless needed.
3. For plan/limit behaviour, read entitlements code or `docs/architecture/permissions.md`, not marketing copy alone.

## After feature work

1. Update `changelog/<branch-name>.md` (see `changelog/TEMPLATE.md`).
2. If the work closes a roadmap item, update `docs/product/roadmap.md`.
3. Prefer build/lint over ad-hoc runtime smoke tests in this environment.

## Citing project docs

When the user `@`-mentions a doc, treat it as source of truth for that topic. Prefer repo docs over inventing architecture.
