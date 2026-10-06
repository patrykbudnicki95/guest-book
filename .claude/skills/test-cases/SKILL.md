---
name: test-cases
description: Write precise manual QA test cases in English for the changes on the current branch - exact URLs in both locales, real UI labels, the user role and plan each case needs, and the regression surface shared changes put at risk. Use whenever asked for test cases, a test plan, QA steps, testing instructions, what to check before merging, or /test-cases.
allowed-tools: Read, Glob, Grep, Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Bash(git show:*)
---

# Test cases

Write cases a person can run **blind**, without reading the code or asking a question. Output them in English, in chat. Precision matters, volume doesn't: only cover what the branch touches or puts at risk.

## 1. Read what the branch changed

```bash
git branch --show-current && git status --short
git log --oneline main..HEAD
git diff main...HEAD --stat
```

Read the real diff, including uncommitted work (and say so if you included it). `changelog/<branch>.md` gives the intent and the manual steps.

## 2. Map each change to a reachable URL

| Changed path | What the tester opens |
| --- | --- |
| `app/[locale]/e/[eventId]/**` | guest page `/e/<eventId>` on a phone-width viewport |
| `app/[locale]/(admin)/dashboard/**` | `/dashboard/...` logged in as the couple, **and** the same tab under `/demo/dashboard/...` |
| `app/[locale]/demo/**`, `lib/demo/**` | `/demo` and `/demo/dashboard/*`, logged out; state lives in IndexedDB, so clear site data to reset |
| marketing pages, `lib/seo/**` | the page in both locales, plus view-source checks from the `seo-requirements` skill |
| `lib/permissions/**`, `lib/pricing.ts`, `lib/plan-features.ts` | every gated UI per plan, the pricing/package pages, guest upload limits |
| `lib/schemas/database.ts`, `app/actions/**` | every page that calls the changed action. A Zod mismatch shows up as an **empty list or a fallback**, not as an error |
| `proxy.ts`, `i18n/**` | locale switching, localized slugs and the Basic Auth prompt on every route type |

**URLs:** take them from `i18n/routing.ts`. `pl` has no prefix and `en` is under `/en`. Marketing slugs differ: `/cennik` vs `/en/pricing`, `/poradnik/<slug>` vs `/en/guides/<slug>`. Don't infer a URL from the folder name.

**Labels:** take them from `messages/pl.json` / `messages/en.json`. If you can't find one, describe the element by position and role and mark it unverified.

## 3. Name the regression surface

Use `grep` to find what else uses the code you changed, rather than guessing. These deserve their own cases:

- **A dashboard tab component.** The demo renders the same component, so test both `/dashboard/<tab>` and `/demo/dashboard/<tab>`.
- **Plan gating.** Test the lowest plan that lacks the feature and one that has it. Locked UI shows the `PlanLock` badge. Server-side rejection only shows if you bypass the UI, so say when a case needs a dev to check it.
- **Upload path.** Test a photo, a video (Gold only), an oversize file, and an upload after the guest upload window has closed.
- **Shared Zod schema or action.** Test the other pages that read it.

If the branch is self-contained, say that in one line rather than inventing regression cases.

## 4. Preconditions the tester can't discover alone

- **Basic Auth.** The preview is behind a login prompt (`proxy.ts`). Tell the tester to get the credentials from the team, and never paste them into the cases.
- **Roles.** State whether the tester is a *guest* (logged out, has an event URL), a *couple* (logged in, owns an event), or a *visitor* (logged out, `/demo`).
- **Plan.** Switching tiers needs `NEXT_PUBLIC_ENABLE_PLAN_SWITCHER=true`, then using the selector in Dashboard → Settings. Name the plan each case needs.
- **SQL migration or env vars** from the changelog's `Manual steps` must be applied first, or the feature looks broken.
- **Locale.** If the change renders text, test both `pl` and `en`.
- **Mobile.** Guest flows run at phone width, and overlays there are drawers, not dialogs.

## 5. Write steps a stranger can follow

- One imperative action per step: *Open …*, *Tap …*, *Select …*.
- Give the full URL with locale, using a placeholder like `<eventId>` where needed.
- Make the expected result observable: visible text, a toast, a photo appearing in the grid.
- Use the console or DevTools only when the UI can't show the result, for example the `noindex` meta tag, JSON-LD, or a PUT to the R2 domain returning 200. Give a snippet the tester can paste and say what a pass looks like.

## 6. Output template

```markdown
## <branch> — <short title>

**What changed:** one or two sentences in tester language.
**Prerequisites:** <migration, env var, plan, test event — or "none">

### TC1 — <what this proves>
**As:** guest | couple (plan: silver) | visitor · **Locale:** pl
1. <step>
2. <step>
**Expected:** <observable result>

## Regression

### TC4 — <the other surface sharing this code>
...

## Not covered
- <what only a dev can verify, and why>
```

Before answering, reread every case as the tester would: is each URL and label real, and is each expected result something they can see? Mark anything you assumed.
