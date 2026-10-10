# Roadmap

Living backlog and product direction. Not a Cursor rule — product priorities for humans. Items marked **(proposal)** are recommendations waiting for a decision in [Decisions needed](#decisions-needed).

## Direction (October 2026): from guestbook to wedding platform

We are no longer only a QR guestbook. The product becomes a **wedding helper made of apps**: each app solves one job (guestbook, save the date, seating, wedding website + RSVP, …). A couple can:

- **buy one app** and see only that app, with no clutter from the rest, or
- **buy Gold**, which is every app with the highest limits, for less than the apps cost separately.

Principles that every new app must follow:

1. **Sellable alone.** It has its own price, its own landing page, its own demo and works without the other apps.
2. **Better together.** When a couple owns several apps they share data: the guest list feeds RSVP, RSVP feeds seating, the website links the guestbook.
3. **Nothing locked is in the way.** The dashboard shows owned apps first. Apps the couple doesn't own appear once, in a "Discover" section, never as a wall of locks in the navigation.
4. **Guest-facing first, mobile first.** Guests never create an account.
5. **Original design and copy.** We study competitors for features, not for text or visuals.

### Why this order makes money

A couple's year looks like this, and each step is a natural moment to sell the next app:

| Months before the wedding | What the couple needs         | App                                       |
| ------------------------- | ----------------------------- | ----------------------------------------- |
| 12–9                      | Guest list, budget, checklist | Free planning tools (acquisition)         |
| 9–6                       | Announce the date             | **Save the date** (first paid touchpoint) |
| 6–2                       | Website, invitations, RSVP    | **Wedding website + RSVP**                |
| 1–0                       | Who sits where                | **Find your table**                       |
| Wedding day and after     | Photos and wishes             | **Guestbook + gallery**                   |

The earlier we meet a couple, the more apps we can sell them. A guestbook-only business meets them a few weeks before the wedding, after competitors already have them.

## App catalogue

| App                 | What it does                                                                      | Status                   | Landing page                       |
| ------------------- | --------------------------------------------------------------------------------- | ------------------------ | ---------------------------------- |
| Guestbook + gallery | Guests upload photos, videos and wishes via QR; couple downloads everything       | Live                     | `/wirtualna-ksiega-gosci` (exists) |
| QR cards            | Printable QR cards for tables (PDF), later printed and shipped                    | Live (PDF)               | part of guestbook                  |
| Save the date       | Animated announcement page with photo, music, countdown and calendar              | Live, no checkout yet    | `/save-the-date-online` (exists)   |
| Find your table     | Seating plan editor; guests search their table                                    | Live (Gold only)         | to do: `/plan-stolow`              |
| Wedding website     | Schedule, map, FAQ, menu, story, gallery. Today's event page grows into it        | Partly live (event page) | to do: `/strona-slubna`            |
| RSVP                | Guests confirm attendance, diet, plus-ones, accommodation, custom questions       | Planned                  | to do: `/rsvp-online`              |
| Guest list          | Statuses, plus-ones, diets, accommodation, CSV/Excel export                       | Planned                  | to do: `/lista-gosci`              |
| Planner (checklist) | Tasks scheduled back from the wedding date                                        | Planned (free)           | to do                              |
| Budget              | Planned vs actual spend by category                                               | Planned (free)           | to do                              |
| Gift list           | Registry with "I'll buy this" reservations                                        | Planned                  | to do                              |
| Wedding games       | QR field game with questions about the couple (`weddingGames` feature key exists) | Idea                     | to do                              |

## Pricing model (decided 2026-10-09, prices still open, implemented with placeholder prices)

Today plans are guestbook tiers (Basic / Silver / Gold differ in storage, days and features) plus one add-on. With several apps, three tiers of one app _and_ per-app purchases _and_ a bundle would confuse buyers, so Basic and Silver go away:

- **Free:** account, guest list, planner and budget. These bring couples in 12 months early and make them stay.
- **One price per paid app**, each with generous limits. Storage on R2 is cheap, so we stop selling gigabytes and sell outcomes.
- **Gold = every paid app**, priced at roughly what two apps cost, so it's the obvious choice the moment a couple wants a second app.
- **Upgrade credit (proposal, undecided):** whatever a couple already paid for single apps counts toward Gold. Nobody waits "in case they need more later" to buy their first app.
- **One-time payment per wedding**, no subscription (the market expects this).
- Prices stay only in `lib/pricing.ts`. The numbers below are placeholders until [research](#research-needed) is back:

| Product                | Placeholder price       |
| ---------------------- | ----------------------- |
| Guestbook + gallery    | 199–249 zł              |
| Save the date          | 100 zł (current add-on) |
| Wedding website + RSVP | 149–199 zł              |
| Find your table        | 79–99 zł                |
| **Gold (everything)**  | 399–499 zł              |

Technically this replaces `events.plan_id` + `events.addons` with one list of owned products per event, with Gold as a bundle that grants all of them (see Phase 0).

## Marketing site structure (proposal)

The site isn't public yet (Basic Auth + noindex), so **we have no search rankings to lose** and this is the cheapest moment to restructure.

- **Homepage becomes the platform hub:** "everything for your wedding in one place". Hero, a grid of apps (each card: one sentence, price, "see more"), the Gold bundle, the timeline from [Why this order makes money](#why-this-order-makes-money), testimonials, FAQ.
- **One landing page per app**, each targeting its own search phrase ("księga gości weselna", "save the date online", "strona ślubna", "rsvp wesele", "plan stołów wesele"). One page per search intent ranks better than one page about everything, and paid ads convert better when they land on the exact app.
- **Every app landing page** has the same blocks: live demo, "buy this app for X zł", "or get everything in Gold for Y zł", FAQ, and "see also" links to the apps next to it in the timeline.
- **Guestbook keeps its landing page** (today's homepage content moves to `/wirtualna-ksiega-gosci`, which already exists). It stays our flagship, but it's no longer the whole site.
- **Pricing page** shows apps à la carte next to Gold, with the "two apps ≈ Gold" comparison visible.
- **Navigation:** a "Funkcje" (apps) menu listing every app, plus Pricing, Guides, Demo.
- **Brand:** "Wirtualna Księga Gości" describes one app. A platform needs a broader name and domain (see [Decisions needed](#decisions-needed)).

## Demos (proposal, partly built)

- `/demo` becomes a picker: "try one app" or "try Gold".
- `/demo/<app>` runs the real dashboard and guest pages with **only that app owned**, so it shows exactly what a single-app buyer gets.
- `/demo/gold` runs everything. Today's `/demo` is effectively this.
- Every app landing page links to its own demo; the homepage links to the Gold demo.
- Technically: the demo workspace gets a list of owned products instead of a hardcoded Gold plan (`lib/demo/seed.ts`).

## Phases

### Phase 0 — Platform foundations (before adding apps)

- [ ] Decide upgrade credit (see [Decisions needed](#decisions-needed))
- [ ] New brand name and domain; replace "Wirtualna Księga Gości" in the header, footer, `siteConfig`, metadata and messages
- [x] Products model: `events.products` replaces `plan_id` + `addons`; Gold grants every app; limits per app (`lib/permissions`)
- [x] Lock entitlement columns so owners can't grant themselves products (column-level grants; changes go through the service role)
- [x] Placeholder prices per app + Gold in `lib/pricing.ts`; pricing page shows apps à la carte next to Gold
- [ ] Payments (Stripe): checkout per app and for Gold, upgrade credit, invoices
- [x] Dashboard: only owned apps in the navigation, "Discover" section on the overview for the rest
- [ ] Dashboard navigation that scales past ~8 tabs (app switcher or sidebar) once Phase 2 apps arrive
- [ ] Onboarding: at signup, ask what the couple needs ("just photos from guests" / "everything") and land them in the matching app
- [x] Demos per app + Gold demo (`?apps=` on demo links, switcher in the demo banner, "Add in demo" in Discover)
- [ ] `/demo` picker page ("try one app" / "try Gold") and demo links on every app landing page
- [ ] Homepage hub + guestbook moves to its own landing page + "Funkcje" menu
- [ ] Custom slugs, e.g. `ewa-i-patryk-2026` (every guest-facing app link gets nicer)

### Phase 1 — Launch with what we have (guestbook, save the date, seating, Gold)

- [ ] Security: password min/max length
- [ ] Login with Google
- [ ] Landing page for Find your table
- [ ] Save the date: PNG/PDF export (stories, messaging apps, A6 print), QR to the page
- [ ] Event page content polish
- [ ] PDF download with event information; PDF download styles
- [ ] Cookies / privacy policy, terms
- [ ] Analytics: track the user journey (landing → demo → signup → purchase) and send conversions to Google Ads, so pages, prices and ads can be tuned for profit
- [ ] Remove the Basic Auth gate (see `launch-checklist` skill)
- [ ] Clearing events some time after the wedding (careful: a couple can move their date into the future)

### Phase 2 — Guest list, RSVP and wedding website (the biggest gap vs competitors)

- [ ] Guest list (free): statuses, plus-ones, children, diets, accommodation, transport, CSV/Excel export
- [ ] RSVP app: guests confirm from the website or a link, answers land in the guest list; custom questions, also per guest group
- [ ] "I'll be there" button on save the date that adds the guest to the list
- [ ] Wedding website app: today's event page becomes a themed website (schedule with map, FAQ, menu, story, countdown, gallery); several themes, like save the date
- [ ] Seating fed from the guest list instead of pasted names

### Phase 3 — Free planning tools (acquisition)

- [ ] Planner: checklist with tasks scheduled back from the wedding date
- [ ] Budget: categories, planned vs actual, payments
- [ ] Emails (Resend): reminders tied to the timeline, each one also a natural moment to suggest the next app

### Phase 4 — Extras

- [ ] Gift list with reservations
- [ ] QR + fancy printable card (print and ship)
- [ ] Wedding games: QR field game with questions about the couple
- [ ] Vendor directory (large SEO opportunity, but a separate business; only after the apps are solid)

## Research needed

To be done by Patryk; results go into this file or `docs/product/`. Each item decides something above.

1. **Search volume per app** (Google Keyword Planner is free with an Ads account; Senuto or Ahrefs give better Polish data). Check monthly searches in Poland for: księga gości weselna, wirtualna księga gości, księga gości online, save the date, save the date online, strona ślubna, strona internetowa ślubu, rsvp wesele, potwierdzenie obecności wesele, plan stołów wesele, rozmieszczenie gości wesele, lista gości wesele, galeria zdjęć z wesela, zdjęcia od gości wesele, kod qr na wesele, zaproszenia ślubne online, planer ślubny, budżet wesela, lista prezentów ślubnych. → **Decides the order of Phase 2–4 and which landing pages to write first.**
2. **Competitor table**: search those phrases and list every Polish product on the first page. For each: price, free tier yes/no, what's in it, one-time or subscription, how many days of access, and whether they sell apps separately. → **Sets our prices.**
3. **Market size**: number of weddings per year in Poland (GUS publishes marriages per year) and the share in the April–October season. → **Revenue ceiling and seasonality for cash planning.**
4. **5–10 short interviews** with couples planning a wedding (friends, Facebook wedding groups): when did they start planning, which tools do they use, what did they pay for, what would they pay for the guestbook, save the date and a website, and would they buy a bundle? → **Validates the bundle and placeholder prices.**
5. **Google Ads cost per click** for the top 5 phrases from point 1 (Keyword Planner shows bid ranges). → **Tells us how much a customer may cost, so the cheapest app can still be profitable.**
6. **Brand and domain**: 3–5 candidate names; check .pl domain availability and that nobody in the wedding space uses them. → **Needed before the homepage hub.**

## Decisions needed

1. **Upgrade credit**: count single-app purchases toward Gold?

Decided on 2026-10-09:

- **Pricing model**: one price per app + Gold bundle; the Basic / Silver guestbook tiers go away.
- **Free tier**: guest list, planner and budget are free.
- **Brand**: rename before launch (the current name describes one app).

## Done

- Login
- File upload
- Base dashboard (split into routes)
- Event page link on dashboard
- QR code generation
- PDF download of generated QR only
- Translations (next-intl)
- Main page styles
- Login from the homepage
- Plan limitations / plan info
- Demo / test mode (update when main app gains features)
- Guest photo visibility: public / private when uploading
- Download all (ZIP): photos per guest + offline wishes album, built in the browser
- Find your table (Gold): seating plan editor + guest search with table diagram
- Save the date: four animated templates, in Gold + as a separate add-on (checkout still needs Stripe)
- Basic auth gate until production (avoid early SEO indexing of unfinished site)

## Notes for agents

Do not treat this file as implementation spec. Prefer `docs/architecture/*` and `.claude/rules/` when coding. Items marked (proposal) are not decided; ask before building on them. Tick items and move them to Done when shipping.

## google categories ? I heard something about that, verify later.
