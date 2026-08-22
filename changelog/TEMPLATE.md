# <branch-name>

One sentence describing what this branch delivers and why.

## Added

- New feature, route or module.

## Changed

- Existing behaviour that now works differently.

## Removed

- Anything deleted or no longer supported.

---

Rules for filling this in:

- One file per branch: `changelog/<branch-name>.md`.
- Keep it short — at most 8 bullets in total across all sections.
- Omit sections that have nothing in them. A branch with only additions has only `Added`.
- Describe the change, not the files. "Guest galleries are no longer indexable"
  beats "edited `app/[locale]/e/[eventId]/page.tsx`".
- Mention anything the reader has to do manually (new env vars, SQL to run,
  dashboard settings) under a final `Manual steps` heading.
