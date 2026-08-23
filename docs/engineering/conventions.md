# Engineering conventions

## App structure

```
app/[locale]/
  (auth)/          login, signup
  (admin)/dashboard/   couple dashboard tabs
  e/[eventId]/     guest event page
  demo/            local-only demo
  pricing, packages, guides, …  marketing
app/actions/       shared server actions
components/ui/     shadcn
lib/               permissions, schemas, storage, supabase, seo, …
```

## Colocation

If a component/schema/action is used in **one** route, keep it under that route (`components/`, `schemas/`, `api/`). If used in two or more, move to shared `components/` or `lib/`.

## UI

- shadcn only for primitives
- Mobile overlays: `Drawer` (vaul) over `Dialog`
- Toasts: `sonner`
- Named exported functional components

## Data

- Fetch in Server Components when possible
- Mutate via Server Actions
- Zod-validate every Supabase result (`lib/schemas/database.ts`)

## Permissions

Never hardcode plan checks. Use `lib/permissions` — see [permissions.md](../architecture/permissions.md).

## Cache Components

Next **16.3.2**, `cacheComponents: true`. See [cheatsheet](../reference/next-cache-cheatsheet.md) and [official links](../reference/next-cache-components.md).
