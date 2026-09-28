# Handoff — Coach Adrian Ding demo

> Audience: Iridel dev team (build) and PM (scope/planning). For code-level detail
> (architecture, animation system, gotchas, setup), see `README.md` — this file does not
> repeat it. For copy/asset/content status, see `PRD.md`. For the client's own open items,
> see `MEETING-NOTES.md`.

## Summary (for the PM)

This is a **frontend-only pitch demo**, built to get Adrian Ding's sign-off on direction and
content before the real build starts. Every page, form, and login screen you can click
through is real UI — nothing behind it is wired to a backend. No CMS, no CRM, no auth, no
email sending, no payments. All catalogue data (workshops, gallery, companies, testimonials)
lives in static TypeScript files under `src/lib/`, written to be the shape a future CMS
schema should match.

Two things still need a client decision before Phase 2 can be scoped precisely: the font
licensing question (pay to license The Seasons/Abramo, or ship on the free Prata
alternative), and final content (real testimonials, prices, photos — see PRD's approval
table). Everything else — CMS choice, CRM data model, email provider, auth, hosting — is
open and listed in section 6 below for the team to answer.

Two temporary UI tools are wired into the live demo for review purposes only (a font
comparison toggle and a "fill sample data" button on both forms) and must be removed before
this goes live — see section 3.

## 1. What this is / what's done

| Route                                  | Status        | Real vs. mocked                                                                                                                                                                               |
| -------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                    | Built         | Real copy/layout; stats, testimonials, some company logos are placeholder (see §2)                                                                                                            |
| `/about`                               | Built         | Real copy/layout; timeline milestones and industry-count stat pending client confirm                                                                                                          |
| `/workshops`                           | Built         | Real UI (filter, calendar); catalogue is static mock data                                                                                                                                     |
| `/workshops/[slug]`                    | Built         | Real UI incl. registration form, FAQ, sticky register bar; prices, curriculum framing, testimonials are placeholders pending sign-off                                                         |
| `/workshops/[slug]/registered`         | Built         | Confirmation UI only — form doesn't submit; payment details (bank/GCash) are placeholders                                                                                                     |
| `/corporate-training`                  | Built         | Real UI incl. programme carousel (10 programmes, 4 are placeholders to judge a longer list) and inquiry form                                                                                  |
| `/corporate-training/inquiry-received` | Built         | Confirmation UI only — form doesn't submit                                                                                                                                                    |
| `/gallery` + `/gallery/[slug]`         | Built         | Real UI; events, photos, and Adrian's "reflections" copy are all representative placeholders. Client asked to defer further gallery work to a later phase — page stays live in the demo as-is |
| `/staff-login`                         | UI shell only | "Sign in with Google" button is inert, no auth provider                                                                                                                                       |
| `/email-templates`                     | UI shell only | Static preview of 3 email templates (copy + layout), `noindex`                                                                                                                                |

`npm run validate` (typecheck + lint + format check) is the pre-delivery gate; see README →
Scripts.

## 2. What's mocked and how it maps to Phase 2

| Feature                            | Current mock (file)                                                                                   | Phase 2 system                                                 | Notes & traps                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workshops catalogue                | `src/lib/workshops.ts` (static array, incl. `NEXT_WORKSHOP` derived export, `WORKSHOP_TAGS` taxonomy) | CMS                                                            | Field shape (`problem`, `outcomes`, `whatToExpect`, `primerBlurb`, `seatsLeft`, `tags`) is the contract to replicate. `tags` becomes a fixed multi-select taxonomy (1–3/course), not free text — the `/workshops` filter chips derive from it.                                                                                                                                                                                                                                                                                                                                                                                                           |
| Workshop registration form         | `workshops/[slug]/_sections/registration-form.tsx`                                                    | CRM (lead capture)                                             | React Hook Form + Zod, client-side only. Must: (1) create CRM record with status `NEW` first, (2) then email owners. Record write failing must block the visitor from reaching the confirmation page; email failing must not (retry the email, keep the record). Full contract in `PRD.md` → "Phase 2 handoff — lead capture".                                                                                                                                                                                                                                                                                                                           |
| Corporate inquiry form             | `corporate-training/_sections/inquiry-form.tsx`                                                       | CRM (lead capture)                                             | Same contract as above. Captures primary programme + "Also interested in" multi-select (`?program=<key>#inquiry` prefill).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Staff login                        | `src/app/staff-login/page.tsx`                                                                        | Auth (Google, staff-only)                                      | No provider, no session, no protected routes yet. Confirm with Adrian what staff actually need to do here before building real auth — the "why" isn't settled, only the login screen is.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Email templates page               | `src/app/email-templates/_sections/templates.tsx`                                                     | Resend (or equivalent) transactional email                     | 3 templates previewed: workshop registration confirmation, payment confirmation (triggered by staff marking a registrant PAID in the CRM), corporate inquiry acknowledgment. This page is copy/layout only — no send-trigger wiring. It is separate from the owner "new inquiry" notification email required by the lead-capture contract above.                                                                                                                                                                                                                                                                                                         |
| Testimonials                       | `src/lib/testimonials.ts`                                                                             | CMS content, sourced from `Coach_Adrian_Ding_Website_2025.pdf` | Every quote is a placeholder; no headshots supplied. Don't paraphrase when swapping in real ones — use them verbatim.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Gallery                            | `src/lib/gallery.ts`                                                                                  | CMS                                                            | Static array is the schema to match, incl. `relatedWorkshop` relation. All events/photos/reflections copy are representative stand-ins. Deferred by the client — not a blocker, just not final content.                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Companies logos                    | `src/lib/companies.ts`                                                                                | CMS or static asset list                                       | 44/91 roster companies have logo artwork (`co-*` files in `public/images/logos/`); the other 47 render as name chips by design, so gaps stay visible. Priority categories with zero artwork: Finance, Real Estate, Hotels, Food & Retail, SMEs.                                                                                                                                                                                                                                                                                                                                                                                                          |
| Timeline                           | `src/lib/timeline.ts`                                                                                 | CMS                                                            | Founding year and milestone wording need client confirmation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Specializations                    | `src/lib/specializations.ts`                                                                          | CMS                                                            | Programme copy and `usefulFor` bullets need Adrian's sign-off; several photos are `placeholderImg()` Unsplash stand-ins pending real photography.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Social cards (per-course OG image) | `src/app/workshops/[slug]/opengraph-image.tsx`, `src/app/opengraph-image.tsx`                         | Derived from CMS record — **not a CMS field**                  | Generated at build time from the `Workshop` record (`image`, `title`, `schedule`, `venue`) — never add an "upload OG image" field, it would drift the moment a date changes. Satori needs TTF fonts + JPEG/PNG (`.webp`/`.woff2` fail to decode) — see `src/app/og-assets/`. A CMS edit must trigger a rebuild/revalidation of that course's route or the card goes stale. `params` is a `Promise` in metadata routes (Next 15+) — typing it as a plain object compiles but silently renders the same fallback card for every slug (this shipped broken once already). Full contract: `PRD.md` → "Phase 2 handoff — the social cards belong in the CMS". |
| Analytics / SEO metadata           | `src/app/layout.tsx` (`metadataBase`, OG/Twitter tags)                                                | Analytics provider (GA4/Plausible/etc. — TBD)                  | `NEXT_PUBLIC_SITE_URL` must be set to the real serving host before delivery — it resolves every canonical/`og:url`/`og:image` URL. Never hard-code `adrianding.com`: that's the client's live site, and pointing `og:image` there 404s silently. No analytics package is installed yet.                                                                                                                                                                                                                                                                                                                                                                  |

## 3. Temporary review tools in the UI

These exist only so Adrian and Chan can evaluate options live in the demo. Both must be
removed before launch.

| Tool                               | File(s)                                                                                                                                                     | Purpose                                                                                                                                        | Decision owner                                                     | Status                                                                                                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Font comparison toggle             | `src/app/_components/font-switch.tsx`, wired into `src/app/layout.tsx` (inline script + `Prata` font load) and `src/app/globals.css` (`[data-fonts="alt"]`) | Lets Adrian compare the paid "The Seasons" display serif against free alternative Prata, live on the hero, before a licensing decision is made | Adrian (legal exposure is his)                                     | **Open** — added 2026-09-28, no decision recorded yet                                                                                                                         |
| About-prompt presentation switcher | _(removed)_ — was `about-prompt.tsx`                                                                                                                        | Compared inline / slide-in card / pop-up treatments for "Know more about Coach Adrian"                                                         | Adrian                                                             | **Resolved 2026-09-24** — client chose inline on 2026-09-19; the other two variants and the switcher were deleted. Only `AboutPromptAnchor` (inline) remains in the codebase. |
| "Fill sample data" button          | `src/app/_components/demo-fill.tsx`, used on both `registration-form.tsx` and `inquiry-form.tsx`                                                            | One-tap form fill so the funnel can be reviewed on a phone without typing every field                                                          | Iridel (not a client-facing decision — just remove before go-live) | Still present, correctly labelled as demo-only in its own comment                                                                                                             |

Step-by-step removal for both tools is in [README.md → Temporary review tools](README.md#temporary-review-tools).

## 4. Decisions pending (client / Chan)

Pulled from `MEETING-NOTES.md` (2026-09-20 meeting) — items not yet marked resolved:

1. **Fonts.** License The Seasons + Abramo from the foundries (Iridel's recommendation), or
   substitute for free: Prata (already wired as the toggle option) for The Seasons, Italiana
   or Parisienne for Abramo. Legal exposure is Adrian's — decision has to be his.
2. **Pricing.** Every course price shown (₱6,500 / ₱18,500) is invented, asterisked as
   "indicative." Need his real numbers; if he wants early-bird/group pricing that's a
   structure change to flag now, not a number swap later.
3. **Copy sign-off.** The "equip further top producers" line (kept verbatim from his own
   wording, reads like a typo), the shortened Train-the-Trainers title, the per-course
   "problem" opening lines (written by us, first thing cold ad traffic reads), and the
   headline stats (20+ years, 20,000+ trained, Top 500 companies, sourced from the PRD not a
   verified source).
4. **Assets.** 47/91 company logos still missing (priority: Finance, Real Estate, Hotels,
   Food & Retail, SMEs); Genos/trainer-cert accreditation marks silhouette as unusable white
   blobs and need real vector logos (noted as a paid follow-on, not a blocker); primer/teaser
   videos are placeholder slots on every course page — worth asking Adrian directly if he has
   any event footage.
5. **Ad → course-page flow.** Confirm each ad links to its own course URL (not the homepage)
   — each course now has its own social preview card, so this is now safe to do.
6. **Corporate off-ramp placement.** "Train your team" sits after the register CTA on each
   course page (deliberate, so it doesn't cannibalize the seat). Confirm he's happy with the
   order.
7. **Registration/payment policy details.** The 48-hour seat hold window, the transfer
   window, and whether an official receipt is issued by default (`src/lib/workshop-faq.ts`,
   `registered/_sections/payment.tsx`) are proposed policy, not confirmed.
8. **Content confirmations.** Timeline founding year/milestones, AET/CPD accrediting-body
   names and years, industry-count stat, testimonials (pending
   `Coach_Adrian_Ding_Website_2025.pdf`), and the 4 placeholder corporate programmes added
   2026-09-24 (Sales Leadership & Coaching, Customer Service Excellence, Change Management &
   Resilience, Emotional Intelligence at Work) — confirm or delete each.

## 5. Known issues / tech debt

- **Dead CSS.** `.pull-quote`, `.pull-quote--dark`, and `.font-accent` are defined in
  `src/app/globals.css` (lines ~226–240) but have zero usages anywhere in `src/app` or
  `src/components` — confirmed by grep. Either wire them into the Abramo accent-font use case
  they were built for, or remove them.
- **Two motion libraries.** GSAP drives scroll and interaction motion; framer-motion is also
  used in about a dozen components (e.g. `quote-reveal.tsx`, `paths.tsx`,
  `spec-reveal-cards.tsx`, `timeline.tsx`, `site-navbar.tsx`). Not a problem by itself, but
  worth a deliberate decision before Phase 2 if the team wants to standardise on one.
- **Abramo is loaded but unused.** `Abramo-Regular.woff2` is loaded in `src/app/layout.tsx`
  as `--font-abramo`, but its only consumer, `.font-accent`, has no call sites, so no rendered
  text uses it. It doesn't need a license unless a callout starts using it; otherwise remove
  the load along with the dead CSS above.
- **37 `TODO` comments** across `src/`, all content/copy pending client sign-off — every one
  maps to a row in the PRD's asset/approval table. Run `grep -rn "TODO" src/` to enumerate.
- **`placeholderImg()`** is used in 6 files (`src/lib/images.ts`'s helper, its consumers
  `src/components/common/{image-card,testimonial-section,hero-section,feature-row}.tsx`, and
  `src/lib/specializations.ts` where the actual Unsplash stand-ins are). Must be empty before
  delivery per README's checklist.
- **Two unlicensed commercial fonts** still installed as demo-only web copies: The Seasons
  (`src/app/fonts/TheSeasons-{Regular,Bold}.woff2` + TTF cuts in `src/app/og-assets/` for the
  social cards) and Abramo (`Abramo-Regular.woff2` — see note above on it being unused).
- **No `NEXT_PUBLIC_SITE_URL` set** — falls back to Vercel env vars or `localhost:3000`,
  which is correct for preview deploys but must be set explicitly at handoff, then verified
  with `curl -s <host>/ | grep 'og:image'`.
- **Mobile QA is headless-only.** Responsiveness has been verified in headless touch
  emulation, not on real hardware — flagged as pending in README/PRD, still open.

## 6. Open questions for the team

Genuinely unscoped decisions Phase 2 needs before implementation starts. Grouped by area,
specific to this codebase — not a generic backend checklist.

**CMS**

- Which CMS? The data contract to match is already written: `src/lib/workshops.ts`,
  `gallery.ts`, `companies.ts`, `testimonials.ts`, `timeline.ts`, `specializations.ts`,
  `certifications.ts` — each is the shape a schema should replicate, including relations like
  `GalleryEvent.relatedWorkshop`.
- Who edits it — just Adrian, or does staff (via `/staff-login`) get a role too? The staff
  login screen currently has no defined purpose beyond "CRM/CMS access" — what do staff
  actually do there day to day?
- How does a CMS publish/edit trigger the OG-image rebuild described in §2? (Vercel
  on-demand revalidation, a webhook, a full rebuild — the team needs to pick one before the
  "regenerate on republish" requirement is real.)

**CRM**

- Where does lead data live — a CMS-adjacent table, a dedicated CRM (HubSpot/Pipedrive/
  custom), a spreadsheet? The contract (record-first, `NEW` status, then email) is written
  but the destination isn't chosen.
- What's the full lifecycle after `NEW`? The site only ever sets that one status; who defines
  and owns the rest (contacted, paid, attended, etc.)?
- The 4-step tracker on `/workshops/[slug]/registered` (registered → payment sent → staff
  confirms → primer email) represents a manual process today (a human marks a row paid).
  Does Phase 2 automate step 3, or stay manual with just the CRM digitized?

**Payments**

- No payment processing exists anywhere in the demo — pricing displays, nothing charges.
  Does Phase 2 add real payment collection (card/GCash/bank) for workshop seats, or does the
  manual bank-transfer + staff-verifies flow stay as-is with just the CRM behind it?

**Email**

- Resend is named in README/PRD as the intended provider but nothing is wired. Who owns the
  sending domain and DNS (SPF/DKIM/DMARC) — Adrian's domain or Iridel's?
- Owner notification recipients (who gets the "new inquiry" email) are explicitly TBD per
  README — config, not code, but needs an answer before go-live.
- Confirm the two email surfaces stay separate: the owner "new lead" notification (internal,
  from the CRM contract) vs. the three visitor-facing templates in `/email-templates`
  (external, Resend-triggered) — they're easy to conflate when building.

**Auth**

- Staff login is Google-only in the mock. Is that the final choice, or does the CMS/CRM
  vendor dictate its own auth? What roles exist beyond "staff" — is there a distinction
  between someone who marks payments and someone who publishes a workshop?

**Image pipeline**

- Course/gallery photos ship as `.webp` on the site but the OG-card route needs JPEG/PNG
  copies of the same images (`src/app/og-assets/`, `src/lib/og-jpeg.ts`). If a CMS media
  library becomes the source of truth, does image upload auto-generate both formats, or does
  someone maintain a manual JPEG mirror?

**Hosting / analytics**

- Confirmed only that Vercel env vars (`VERCEL_URL`, `VERCEL_PROJECT_PRODUCTION_URL`) are
  already leaned on for `NEXT_PUBLIC_SITE_URL` resolution — is Vercel the actual target host,
  or was that just convenient for preview deploys?
- No analytics is installed. What's tracked, and does it need cookie consent given the
  Philippine Data Privacy Act 2012 question below?

**Data privacy (PH Data Privacy Act 2012)**

- Both forms collect personal data (name, email, mobile, occupation, company) with no
  visible consent notice or privacy policy link anywhere in the current UI. Before Phase 2
  goes live with a real CRM write, does the form need an NPC-compliant consent checkbox,
  and does the site need a published privacy policy page? Neither exists today.
- Testimonial headshots and gallery event photos involve identifiable individuals — has
  consent for their use been obtained from the people photographed, separate from Adrian's
  own approval of the copy?

## 7. Next steps (suggested order)

1. Get Adrian's font decision (license vs. Prata) and About-prompt is already resolved — one
   less thing to chase.
2. Collect real testimonials from `Coach_Adrian_Ding_Website_2025.pdf`, real prices, and the
   outstanding company logos — these block the most visible placeholder content.
3. Team picks the CMS and CRM destination (§6) — everything else in Phase 2 sequences off
   these two choices.
4. Resolve the Resend/email-domain ownership question so the lead-capture contract in §2 can
   actually be implemented end to end.
5. Decide the Data Privacy Act consent/policy requirement before any real form write goes
   live — this affects the form UI itself, not just the backend.
6. Remove the two temporary review tools (§3) once their decisions land.
7. Run mobile QA on real hardware (currently headless-only) before final delivery.
