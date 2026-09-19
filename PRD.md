# Coach Adrian Ding (adrianding.com) — Demo PRD

> Frontend-only demo. Represents the full quote scope (QUO-2026-0002-v5) visually — CMS, CRM, auth, and payment tracking are shown as UI/forms, not wired to a real backend. Full build happens after demo approval. Organized by page, section-by-section, in build order: Landing → About → Gallery → Workshops → Corporate Training → global (Navbar/Footer) → Email Templates.

---

## Client

| Field    | Value                                                     |
| -------- | --------------------------------------------------------- |
| Name     | Coach Adrian Ding                                         |
| Slug     | adrian-ding                                               |
| Industry | Corporate Training, Leadership Coaching, Keynote Speaking |
| Website  | adrianding.com (existing, live — this is a remodel)       |

---

## Brand

| Field       | Value                                                                               |
| ----------- | ----------------------------------------------------------------------------------- |
| Primary     | `#980F09` — deep maroon/wine red                                                    |
| Secondary   | `#222222` — near-black                                                              |
| Neutral     | `#FFFFFF` — white                                                                   |
| Tone        | Classy, sophisticated, "GQ meets Architectural Digest" — relatable Boomers to Gen Z |
| Serif font  | The Seasons (logo, key words/pull quotes)                                           |
| Body font   | Red Hat Display                                                                     |
| Accent font | Abramo (special callouts only)                                                      |

### Competitive Differentiation

**Rivals — what to notice and avoid**
| Name | Site | What their site leans on |
|---|---|---|
| Francis Kong | franciskong.com | Authority via decades of columns/books — content-library feel, less personality-forward |
| Anthony Pangilinan | anthonypangilinan.com | Media/TV personality branding, storytelling bio |
| Jayson Lo | jaysonlo.com | Book/framework-driven funnel (his "YOUnique" system), free worksheet as lead magnet |
| Boris Joaquin | borisjoaquin.com | Multi-channel hub (podcast + articles), "top ranked speaker" credential stacking |
| The Josh | _unclear — pending FB page link from Chan_ | — |
| John Maxwell Team (Maxwell Leadership PH) | maxwellleadership.com.ph | Franchise/certification funnel, event-countdown urgency, borrowed global authority |

**Build note:** these mostly read as static, credential-heavy, template-driven. That's the gap to exploit — none of them move like a modern funnel site.

**Heroes — what to borrow (positioning/UX, not visuals)**
| Name | Site | What makes it work |
|---|---|---|
| Tony Robbins | tonyrobbins.com | High production value, bold single-CTA sections, event-ticket funnel energy |
| Robin Sharma | robinsharma.com | Minimalist, premium editorial feel — restraint reads as authority |
| Brendon Burchard | brendon.com | Video-first, masterclass/course funnel, high energy momentum |
| Ryan Leak | ryanleak.com | Personality-forward, keynote booking CTA always visible, story-led bio |

**Synthesis for Adrian's site:** personality-led like the heroes (not institution-led like the rivals), with momentum-driven UX — single CTA per section, smooth scroll, forms that pull you forward (Iman Gadzhi funnel-style, see UX Direction below).

---

## Context

**What they do:** Adrian Ding, CEO of Maximum Impact PH, is a leadership development coach and corporate trainer with 20+ years experience. Runs two revenue lines: corporate training/consulting for companies (80% of revenue) and public workshops for individuals (20%, growing focus).

**Why this demo:** Client-facing pitch demo per signed quote QUO-2026-0002-v5, to be approved before handoff to build team for full CMS/CRM implementation.

**Audience:** (1) HR heads / L&D decision-makers at PH corporations for the Corporate Training form. (2) Individual professionals (insurance, real estate, medical, retail, service industries) for Workshop registrations.

---

## Story

**The one thing this demo must communicate:** Adrian Ding's 20+ years training 20,000+ leaders across HSBC, Wipro, Petron, and more, now has a digital front door built to convert both corporate inquiries and public workshop signups.

**Section flow (landing page)** — reordered 2026-09-06 on client feedback ("what matters
most is driving traffic and funneling them in"); `page.tsx` is the source of truth.
A problem-framing line was tried in the hero on 2026-09-06 and removed on 2026-09-07 —
it competed with the wordmark for the same band, and the framing belongs on the course
pages, where the ad traffic that needs it actually lands.
Hero (one CTA, scrolls to the fork) → Quote →
Companies Served (marquee) + Statistics (one credibility block, shared `bg-background`
ground, no divider) → **Which path is yours?** (`#which-path` — workshops vs corporate
training, the page's only CTA, both pills carry a one-shot attention beat on scroll-in) →
Workshops open for registration → Areas of Specialization → Testimonials →
Gallery preview → Footer

Specializations moved below the fork: it previously sat between the roster and the
decision point, pushing the page's only CTA down past three full sections. Proof now runs
straight into the fork.

---

## UX Direction (applies globally, every page)

**Principle:** Seamless, momentum-driven flow — similar to Iman Gadzhi's funnel sites (Educate.io, GrowYourAgency), not a static brochure site.

- Single clear next-step CTA per section — never present the visitor with more than one decision at a time
- Smooth scroll with section-anchored navbar; scrolling should feel like progressing, not scanning
- Forms are multi-step, not a wall of fields upfront (Corporate Training + Workshop registration both apply). Reveal fields progressively, use large touch-friendly inputs
- Micro-interactions/transitions on scroll and hover to reinforce forward motion, not just static reveal
- Copy should pull the visitor forward ("what happens next") rather than dump information and wait for them to act
- Build note for Claude Code: treat this as a UX priority equal to visual design — the goal is that filling out a workshop form or corporate inquiry feels like the natural next step, not a chore

---

## Auth

Google login/signup is **staff-only**, for CRM/CMS access (managing form submissions, marking workshops as paid, publishing new workshops/gallery events). No public-facing user accounts in this phase. Represented in the demo as a static staff login screen — not functional.

---

## Build Order

1. Landing Page
2. About Page
3. Gallery Page (parent + child)
4. Workshops Page (parent + child)
5. Corporate Training Page
6. Global components (Navbar, Footer) — build alongside Landing, reused everywhere
7. Email Templates

---

## Page 1: Landing Page

**Navbar** (global, not a numbered beat) — Logo (AD/Adrian Ding), links: About, Gallery, Workshops, Corporate Training, Contact. The editorial hero renders its own split nav (minimal top row that scrolls away + main link bar that pins to top for the rest of the page); no separate `<SiteNavbar>` on this page.

Build top to bottom (matches `page.tsx` as of the 2026-09-01 funnel rework):

1. **Hero** — Editorial GQ-cover (`_sections/hero-editorial.tsx`). One full-screen `bg-[#141414]` frame: mono background plate + light scrim/vignette, cut-out portrait right-of-centre, giant serif "Adrian Ding" wordmark parked across the vertical middle with a quiet static role line under it (Leadership Development Coach · Corporate Trainer · Keynote Speaker · Inspirational Writer) and social icons below. GSAP intro timeline (plate scale-in, portrait rise, wordmark rise, chrome stagger), then static; cursor parallax on bg/portrait (pointer-fine only). No scroll pin. The hero renders its **own** pinned link bar (About · Workshops · Corporate Training · Gallery + one "Train with Me" CTA that scrolls to `#which-path`); mobile collapses the links into a right-side Sheet. Reduced motion → composition painted immediately. Mobile still owed a dedicated pass (wordmark can kiss the right edge at ≤402px).
2. **Quote** — video-transition beat (`_sections/quote-reveal.tsx`). An opaque cream sheet rides UP over the held (sticky) hero, pins for ~35vh of scroll, and writes the belief line word by word — accent words blooming into brand red — then releases. Line: "Better people, lead to better companies. And better companies contribute to a better country." Pure CSS sticky + scroll-linked per-word opacity, no JS pin. Reduced motion → static centred quote.
3. **About teaser** — the face-forward beat: portrait (`ad-photo-1.png`), the deck line "Two things I love: coffee, and developing people.", two lines on who he is (CEO Maximum Impact PH, 20+ years), link → `/about`. The belief ladder itself is **not** repeated here — the Quote section immediately above just wrote it.
4. **Companies Served** ("You're in great company") — filterable moving marquee (`_components/companies-marquee.tsx`). Category pills filter the wall; "All industries" resets. Row count adapts (3 / 2 / 1). Logos render as full-colour marks; clients without artwork render as a name chip with a footnote count. One Pause/Play control stops every row (WCAG 2.2.2); no per-logo tooltips. Full roster in **Companies Served — Roster** below.
5. **Statistics** — 20+ Years in the Training Circuit | 20,000+ Professionals Trained | Top 500 PH Companies Trained | 9+\* Industries Served (`*` placeholder pending confirmation). Sits on the **same ground as Companies Served with no divider**, so the roster and the figures read as one credibility block.
6. **Areas of Specialization** — plain editorial list (`_sections/specializations.tsx`), 6 items, serif title + one line of copy each, hairline between, no photos / no hover slider / no section numbers, fully readable without a pointer: Leadership Training & Development, Inspirational Keynotes, Building Winning Cultures & High-Performing Teams, Effective & Compelling Communications, Train the Trainer + Coach the Coaches, Corporate Imaging & Personal Branding.
7. **Which path is yours?** (`_sections/paths.tsx`, `id="which-path"`) — the fork and the page's **only** CTA target. Two full-bleed photo cards: workshops (individuals) / corporate training (companies), with a hover take-over on desktop. The hero's "Train with Me" button scrolls here.
8. **Workshops open for registration** — the concrete next step for the individual lane, straight after the fork. Cards for each open workshop → detail page.
9. **Testimonials** — carousel/slider, all 8 (Wipro, Global Payments, Rose Pharmacy, Knowles, Global Pacific, HSBC, PETDA, Rotary International). Full quotes in Coach_Adrian_Ding_Website_2025.pdf — copy verbatim from source, don't paraphrase. Carousel has a visible Pause/Play control.
10. **Gallery preview** — three recent events, link → `/gallery`.
11. **Footer** (global) — see Global Components below.

> **Section grounds** alternate `bg-background` / `bg-muted/40` (no `border-t` dividers between sections) except Companies + Stats, which deliberately share one `bg-background` ground.
>
> **History:** an earlier reorder had moved the About teaser, Gallery preview and Workshops-open list off the landing page; the 2026-09-01 funnel rework brought them back in the order above, with the fork (`#which-path`) as the single decision point and the hero reduced to one CTA.

---

## Companies Served — Roster

Client-supplied roster, used by the filterable marquee on the Landing page and reused on Corporate Training. Data lives in `src/lib/companies.ts`. **91 companies across 7 categories; 44 have logo artwork, 47 are shown as name chips pending artwork** (the marquee footnotes the count).

| Category                         | Companies                                                                                                                                                                                                                                                                                                                                                                   | Missing logo artwork                             |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Multi-nationals** (30)         | HSBC, Global Payments, Worldpay, Alstom, Bombardier, Wipro, Optum, Mercedes-Benz Global Services PH, The Linde Group, Nestlé, Knowles Electronics, Teradyne, GlaxoSmithKline, bioMérieux, Lear, Yara, NTT, Unilever, KMC Solutions, Kohler, Timex, adidas, Mactan-Cebu International Airport, Tsuneishi, NKC, SDNI, 5ELK, BSA Solutions, Autoliv, Rise                      | The Linde Group, Knowles Electronics, SDNI, 5ELK |
| **Mega-corporations** (22)       | Petron, PLDT, Petron Dealers Association (PETDA), Aboitiz Power, Vivant, Energy Development Corp (EDC), Jollibee Foods Corporation, Unilab, Rose Pharmacy, IPI, South Star Drug, Global Pacific, Toyota, The Generics Pharmacy, Chong Hua Hospital, Cebu Orthopedic Institute, T1 Project Services, Run Time, Athena, Metro Retail Group, Hi-Precision Diagnostics, Apptech | PETDA, T1 Project Services, Run Time, Apptech    |
| **Finance** (10)                 | Sun Life Philippines, AXA Philippines, Manulife Philippines, Pru Life UK, AIA, FWD, Maxicare · MaxiLife · MaxiHealth+, Insular Life, Pacific Prime, IMG                                                                                                                                                                                                                     | all 10                                           |
| **Real Estate Development** (11) | HT Land, Mont Property Ventures, Cebu Landmasters Inc, Apple One, Ayala Land, Quirante Construction Corp., Primary Structures Corporation, Primary Homes, Primary Group of Builders, Concrete Solutions Inc., Sky Rise Realty                                                                                                                                               | all 11                                           |
| **Hotels & Resorts** (4)         | Shangri-La's Mactan Island Resort & Spa, Sheraton, Plantation Bay, Marco Polo Plaza Hotel                                                                                                                                                                                                                                                                                   | all 4                                            |
| **Food & Retail** (8)            | Pages Holdings, House of Lechon, My Joy, Ayame, Belcris Foods, Leylam, Thinking Tools Inc., Tom & Tom's Coffee                                                                                                                                                                                                                                                              | all 8                                            |
| **SMEs & Family Businesses** (6) | Altomed Pharmaceuticals, Medirich Pharma, Evercare Pharmacy, Joyland Industrial Corporation, Charlton Trade, Diagold                                                                                                                                                                                                                                                        | all 6                                            |

> Category assignment is the client's own. Some brand names kept close to the client's spelling; obvious brand casing normalised (Wipro, adidas, bioMérieux). Chase the 47 missing marks before handoff — priority is the all-missing categories (Finance, Real Estate, Hotels, Food & Retail, SMEs).

---

## Page 2: About Page

1. **Story/Bio** — narrative pulled from deck ("2 things I love: coffee and developing people..." belief statement on better people → better companies → better country). Reference source deck for exact copy.
2. **The work, in numbers** (`_sections/numbers.tsx`) — the long-form statistics beat, sitting between the story and the journey rail. One headline figure (20,000+ professionals trained) set at display size, then six supporting figures: years, Top 500 PH companies, roster size, industries, core program tracks, accreditations. Roster / track / accreditation counts are **derived from `lib/companies.ts`, `lib/specializations.ts` and `lib/certifications.ts`**, so adding a logo or a certification moves the figure instead of leaving a stale claim. Industries (9+) is still the placeholder the landing grid flags.
3. **Background & Certifications** — timeline: 2004 T. Harv Eker Peak Potentials (Train the Trainer Cert), 2017 Genos Emotional Intelligence Coaching Practice, 2021 INSEAD Bachelor of Arts in Mass Communication (Execution Education Programme)
4. **MVC (Mission/Vision/Values)** — not present in current resources. Omit section unless Chan supplies this content.
5. **Areas of Specialization** (detailed version, expands on landing page teaser)
6. **CTA** — same dual-path pattern as landing (Corporate Training / Workshops)
7. **Footer** (global)

---

## Page 3: Gallery Page

### Parent (`/gallery`)

- Grid of all past events/workshops, each card: thumbnail, event name, date, short description
- Optional filter by year
- Each card links to its child page
- CTA at bottom → Workshops page (upcoming)

### Child (`/gallery/[event-slug]`)

- Event hero image + title + date
- Full description
- Photo gallery (grid/lightbox)
- CTA → related upcoming workshop if applicable, else → Workshops page

> Assets pending — Chan to source as demo progresses. Lowest build priority per earlier confirmation, but included in Phase 1.

---

## Page 4: Workshops Page

### Parent (`/workshops`)

- List of all workshops, distinguishing "Open for Registration" vs "Past"
- Each card: name, date, venue, price, short description, CTA button
- Currently known workshops:
  - **Exceptional Salesmanship** — Oct 9, 2026, 9:00–5:00 PM, SEDA Ayala E-bloc. ₱6,500\*
  - **Exceptional Leadership** — Oct 16, 2026, 9:00–5:00 PM, SEDA Ayala E-bloc. ₱6,500\*
  - **Train the Trainers Certification Program** — Nov 11–13, 2026, 9:00–5:00 PM daily, SEDA Ayala E-bloc. ₱18,500\*

> **Client course material supplied 2026-09-17.** The three courses above now carry
> Adrian's own descriptions, curriculum, inclusions and highlights, and head
> `src/lib/workshops.ts` so they head the list page. The four courses after them
> (Presenting with Impact, Negotiation Essentials, Coaching for Managers, Customer
> Experience Excellence) are representative copy written for the demo — replace or
> drop before handoff. Every price is an arbitrary demo figure pending his real
> numbers; see `MEETING-NOTES.md`.

### Child (`/workshops/[workshop-slug]`)

- Full workshop details: date, time, venue, price, curriculum outline (from source deck), inclusions (training manual, certificate, AM/PM snacks + lunch, 30-day post-training mechanism, online reunion), highlights (targeted audience, format)
- Primer/teaser video slot (placeholder)
- **Workshop Registration Form** — multi-step per UX Direction. Fields: Name, Number, Email, Occupation, Salary range, City (optional), consent checkbox. Frontend only — no backend in this phase.
- Payment details section (bank/QR placeholder), reflecting the intended flow: user submits form → receives confirmation email with payment details → replies in-thread with proof of payment → staff manually reviews and marks as PAID in CRM → user receives payment confirmation email. Represented as static UI in this phase, not functional.

### Trust layer (added 2026-09-06, client feedback)

The client's traffic model is AIM / Oxford: an ad per course links **directly** to that
course page, never the homepage. So the detail page must convert a cold visitor on its own.
It opens on a full-bleed photo hero carrying the `problem` line as the tag and the course
title as the headline, with date / venue / seats-left chips under them. Then: intro,
outcomes, the register rail (countdown + scarcity + CTA), primer slot, client-logo strip,
credential band (`src/lib/certifications.ts`), curriculum + inclusions, testimonials,
registration FAQ (`src/lib/workshop-faq.ts`), CTA, and a "talk to a human" support band.
A sticky register bar follows the visitor down the page with the seats-left count.

### Credibility exit + corporate off-ramp (added 2026-09-17, client feedback)

Client asked for (1) a pop-up inviting the reader to "know more about Coach
Adrian", maroon with white text, firing "as they near the thought of wondering
who I am", (2) ad traffic landing on the course first and his profile second,
and (3) "train your team" following after that.

(2) was already the architecture — the instructor-credibility band sits third on
the page. What was missing was any way _out_ of it: the course pages linked to
`/about` only through the global navbar, and to `/corporate-training` not at all.

- **`_components/about-prompt.tsx`** — one `/about` link per page, at the end of
  the section that already carries his portrait and story (`proof.tsx` on a
  course page, the new `corporate-training/_sections/trainer.tsx` on the
  corporate page). Secondary weight, never `variant="brand"`, so it cannot
  compete with Register / Send inquiry. Three presentations are built —
  `inline`, `card` (dismissible maroon card, bottom-left, desktop only) and
  `modal` (the client's literal request) — switchable live from
  `<AboutPromptSwitcher />` for the client meeting. **Recommendation: `card`.**
  A modal on a conversion page costs registrations, and on a phone it lands on
  top of the sticky register bar, the only always-reachable CTA there.
  The switcher and the variant plumbing come out once he picks one.
- **`workshops/[slug]/_sections/team-cta.tsx`** — the corporate off-ramp, placed
  strictly **after** the register CTA. Above it, a private-workshop pitch would
  cannibalise the seat the ad paid for.
- **`corporate-training/_sections/trainer.tsx`** — the corporate page proved the
  company (logos, testimonials, accreditations) and never showed the man. Shares
  `bg-background` with the accreditation band below it and carries no divider, so
  the person and the paperwork read as one credibility block.
- **`workshops/[slug]/_sections/share-button.tsx`** — copies the course URL to
  the clipboard from the hero chip row. His traffic spreads by forwarded link,
  so forwarding has to be one tap rather than a trip to the address bar. The
  copied URL is rebuilt from `origin + pathname`, so tracking params and the
  demo switcher's state never ride along into a group chat.
- **`workshops/[slug]/opengraph-image.tsx`** — per-course social card (photo,
  title, date, venue, brand rule). Ad and forwarded course links previewed with
  the site-wide card before this, so every course looked like the same link.

#### Phase 2 handoff — the social cards belong in the CMS

Generated at build time, one JPEG per course (PNG is over WhatsApp's ~300KB
preview ceiling — see `lib/og-jpeg.ts`), straight off the `Workshop` record:
`image` → the photo, `title`, `schedule` (weekday and time range stripped) and
`venue` → the type. Nothing about a card is authored by hand, so **when the
catalogue becomes CMS-managed the cards follow for free** — publishing a new
workshop mints its own preview card with no design step and no upload.

What the build team needs to carry over:

- The card is a **derived asset, never a CMS field.** Do not add an "OG image"
  upload next to the course record; it would drift from the course the moment a
  date or venue is edited. If a client ever needs to override the photo alone,
  override `image`, not the card.
- **Satori's format constraints are not the site's.** Fonts must be TTF (the
  `.woff2` the site serves throws "Unsupported OpenType signature"), and course
  photos must be JPEG or PNG — `.webp` fails to decode. `src/app/og-assets/`
  holds the TTF cuts for exactly this reason. Any image pipeline that converts
  course photos to `.webp` wholesale will silently break every card.
- **`params` is a Promise in Next 15 metadata routes.** Typing it as a plain
  object compiles clean and renders the same fallback card for every slug —
  which is how it shipped the first time here, caught only because all eight
  output files were byte-identical. Worth a test that asserts two cards differ.
- **Regenerate on republish.** Cards are static build output, so a CMS edit must
  trigger a rebuild (or revalidation) of that course's `opengraph-image` route,
  or the preview keeps showing the old date.
- **Photo choice is editorial, not automatic.** The card crops the course's
  `image` full-bleed, so a photo that reads fine as a small card on the list page
  can put a third-party banner or a stray logo into Adrian's ad preview. Whoever
  publishes a course should see the card before it goes out — a preview of the
  generated card in the CMS editor is worth building.

The FAQ opens on **hover** on desktop (controlled accordion, `onMouseEnter` sets the open
item and Radix's `onValueChange` still handles click/keyboard, so both drive one piece of
state). Hover never closes an item — moving to another replaces it. On touch no hover
handler is attached at all, since a tap synthesises `mouseenter` and would race the
trigger's own toggle.

### Child (`/workshops/[workshop-slug]/registered`)

The post-submission destination — one per course, templated the same way the course pages
are. Confirmation header with the registrant's first name, a four-step progress tracker of
the real process, the payment-urgency block (48-hour hold, bank/QR placeholder,
reply-with-proof instruction), the per-course primer video, what to expect, a summary of the
booking, and the support band. `noindex`.

> `*` Pricing not yet provided — asterisked placeholder, no functioning CMS in this phase.

---

## Page 5: Corporate Training Page

_(Not explicitly listed by Chan but required — this is 80% of Adrian's revenue per quote and needs its own funnel, distinct from Workshops.)_

1. **Intro/hero-lite** — positions corporate training as the primary offering
2. **Why Corporate Training** — value prop tied to stats (20,000+ trained, Top 500 companies)
3. **Areas of Specialization** (capabilities grid, reused component)
4. **Companies Served** (reused marquee component)
5. **Testimonials** (corporate-specific selection — Wipro, HSBC, Global Payments, Global Pacific)
6. **Accreditation band** — the AET / CPD / INSEAD / Genos / Peak Potentials marks, shared with the About page via `src/lib/certifications.ts`. Added 2026-09-06: an L&D head has to justify the spend internally, and the accrediting bodies are what survives that conversation.
7. **Corporate Training Inquiry Form** — multi-step, four steps. Fields: Name, Number, Email, Company, Role, then **Preferred topic or programme**, **Number of attendees** (banded), **Possible date**, **Possible venue** (all four added 2026-09-06 at the client's request — a name and a free-text message was not enough to quote against), optional context, consent. Frontend only.
   - **Possible date** has two modes (2026-09-07): "Pick dates" — a from/to pair of native date pickers, one date for a single session or both for a range — and "Not fixed yet", a free-text fallback for "Q1 2027" or "after the audit", which a date input cannot express. Either mode composes into the same single string, so nothing downstream branches.
8. **Support band** — call / text / email, for anyone not ready to fill a form.
9. **Footer** (global)

### Child (`/corporate-training/inquiry-received`)

Post-submission destination: acknowledgment naming the company, a three-step
what-happens-next timeline, then the **reply-commitment block on full brand ground** —
the corporate mirror of the workshop confirmation's payment block, carrying the "within 2
business days" promise, the discovery-call shape and the call-us-sooner number. Then a
corporate primer video slot, a read-back of the submitted programme / attendees / date /
venue, a credibility block, and the support band. `noindex`.

> The full-brand-ground block is the treatment to reach for whenever a page has **one
> commitment that must not be scrolled past** — a held seat, a reply window. It earns its
> loudness by carrying an obligation, so use it once per page at most; spending it on
> ordinary marketing copy is what would make it stop working.

---

## Global Components

### Navbar

Logo, links to About / Gallery / Workshops / Corporate Training / Contact. Sticky, smooth-scroll anchors where applicable.

### Footer

Contact info (coachadrianding@maximumimpact.online, 0920.900.7709), social links (Instagram, LinkedIn, Facebook, TikTok), quick nav links, copyright.

### Contact

No standalone contact page needed at this phase — contact info lives in footer + is reinforced at each form's confirmation step. Revisit if Chan wants a dedicated page later.

### Data Privacy

Consent checkbox (PH Data Privacy Act) on both Workshop Registration and Corporate Training Inquiry forms. No separate TOS page needed for this phase.

---

## Email Templates (client-facing — build ahead, for Chan's review before handoff)

### 1. Workshop Registration Confirmation

**Trigger:** Immediately after Workshop Registration Form submission
**Contents:** Confirmation of registration, event summary (name/date/time/venue), payment instructions + bank/QR placeholder, reminder to reply to the same email thread with proof of payment, optional primer/teaser video embed, contact info for questions

### 2. Payment Confirmation

**Trigger:** Staff manually marks registrant as PAID in CRM
**Contents:** Payment confirmed, event reminder (date/time/venue), event-specific primer/teaser video, what to bring/expect, contact info

### 3. Corporate Training Inquiry Acknowledgment

**Trigger:** Immediately after Corporate Training Inquiry Form submission
**Contents:** Acknowledgment of inquiry received, expected turnaround for staff follow-up, brief reinforcement of credibility (stat or two), contact info

> All three are frontend/copy deliverables for this phase — actual send-trigger wiring (Resend integration) is Phase 2. Build the copy and layout now since these are client-facing and Chan needs them ready ahead of time.

---

## Assets

Images live flat in `public/images/` (no subfolders — per Iridel template convention).

| Filename                                                                                              | Used in                                                                                                                                                                                                                                                                                                                                                                                                                     | Status                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ad-hero-portrait.webp` (1080×1720, transparent, `cwebp`-recompressed from the `.png`, 2.3MB → 158KB) | Landing Hero — stage-1 colour cut; grayscale-filtered for the stage-2 mono                                                                                                                                                                                                                                                                                                                                                  | ✅ real                                                                                                                                                                                |
| `quotebg-cutout.webp` (1080×1475, transparent, recompressed from the `.png`, 775KB → 60KB)            | Landing quote-reveal — the seated mascot cutout                                                                                                                                                                                                                                                                                                                                                                             | ✅ real                                                                                                                                                                                |
| `ad-hero-portrait-mono.png` (1080×1720)                                                               | Delivered mono cut — **unused**: it's a flat white-backed photo, so the hero grayscales the transparent cut instead. Re-export with transparency to use it.                                                                                                                                                                                                                                                                 | ⚠️ on file, not wired                                                                                                                                                                  |
| `ad-hero-bg.png` (1920×1080)                                                                          | Landing Hero — B&W background plate behind the two-stage narrative                                                                                                                                                                                                                                                                                                                                                          | ✅ real                                                                                                                                                                                |
| `ad-logo-black.svg` / `ad-logo-white.svg`                                                             | Navbar, footer, staff-login, editorial-hero link bar (black on light / white on the dark hero), email-template header. Vector "AD" monogram; transparent, single-colour glyph (`#1e1e1e` / `#fff`), derived from the supplied `AD Logo - Black.svg` with its opaque white background stripped. Superseded PNGs still on disk, unreferenced.                                                                                 | ✅ real                                                                                                                                                                                |
| `src/app/icon.png` (512) / `src/app/apple-icon.png` (180) / `src/app/favicon.ico` (32+48)             | Browser tab, iOS home screen. The AD monogram alone on a transparent ground, filled to 86% of the canvas width (the mark is wider than it is tall). Generated from `ad-logo-black.svg` by `scripts/gen-icons.mjs`; re-run it if the mark changes rather than hand-editing the binaries. **Known trade-off:** near-black on transparent is faint against a dark browser tab strip — a coloured plate was tried and rejected. | ✅ real                                                                                                                                                                                |
| `ad-photo-1.png` / `ad-photo-2.png` / `ad-photo-3.png`                                                | About / secondary                                                                                                                                                                                                                                                                                                                                                                                                           | ✅ real (unplaced); `ad-photo-2` recompressed to `ad-photo-2.webp` (3.1MB → 94KB, `story.tsx` now points at the `.webp`) — original PNG kept on disk, unreferenced                     |
| `about-hero.jpg` / `workshops-hero.png` / `corporate-training-hero.png`                               | Inner-page hero banners (About / Workshops / Corporate Training) — all three loaded `priority`                                                                                                                                                                                                                                                                                                                              | ✅ real; each recompressed to a matching `.webp` (1.5–2MB → ~110–195KB), sections now point at the `.webp`, originals kept on disk unreferenced — 2026-09-04 perf pass, see lessons.md |
| `maximum-impact-logo.png` / `aet-logo.png` / `cpd-logo.png`                                           | Hero stage 2 — org credential badges (CEO / Founder). Renamed from spaced filenames; backgrounds knocked out to transparent, rendered white-silhouette on the dark plate. `maximum-impact` is a clean mark; `aet` reads; `cpd` is an embossed wordmark that silhouettes patchily.                                                                                                                                           | ⚠️ transparent, mixed quality                                                                                                                                                          |
| `insead-logo.png` / `genos-logo.png` / `trainer-logo.png`                                             | Hero stage 2 — dated timeline badges. Transparent now. `insead` silhouettes clean; **`genos` is a certification badge graphic and `trainer` is a full certificate scan — they silhouette to white blobs.** Need real vector logos.                                                                                                                                                                                          | ⚠️ transparent; genos/trainer unusable as marks                                                                                                                                        |
| `images/co-*.{svg,png,jpg}`                                                                           | Companies Served marquee                                                                                                                                                                                                                                                                                                                                                                                                    | ⚠️ 44 cleaned marks wired (`co-` prefix); **47 roster companies still have no artwork** and render as name chips — see Companies Served — Roster                                       |
| bio-coffee-shot                                                                                       | About                                                                                                                                                                                                                                                                                                                                                                                                                       | [ ] pending                                                                                                                                                                            |
| event-gallery-\*                                                                                      | Gallery                                                                                                                                                                                                                                                                                                                                                                                                                     | [ ] pending                                                                                                                                                                            |

### Fonts (installed — `src/app/fonts/`, wired in `src/app/layout.tsx`)

| Role                                       | Font                             | Source             | Var                                 |
| ------------------------------------------ | -------------------------------- | ------------------ | ----------------------------------- |
| Serif / display (logo, headings, wordmark) | **The Seasons** (Regular + Bold) | web-sourced woff2  | `--font-the-seasons` → `font-serif` |
| Body                                       | **Red Hat Display** (300–900)    | `next/font/google` | `--font-red-hat` → `font-sans`      |
| Accent (callouts only)                     | **Abramo** Serif                 | web-sourced woff2  | `--font-abramo` → `font-accent`     |

> The Seasons + Abramo are commercial faces; the installed woff2 are web-download copies for the
> demo. Swap in licensed files (same filenames) before client handoff.

---

## Delivery

| Field  | Value                                                                                                                                                                                  |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Format | Vercel preview URL                                                                                                                                                                     |
| Notes  | Demo represents full quote scope visually (CMS/CRM/auth/payment tracking as static UI). No real backend, database, or integrations in this phase. Approval unlocks Phase 2 full build. |
