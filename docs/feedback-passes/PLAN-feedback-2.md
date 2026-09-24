# PLAN — Client feedback pass 2 (Sept 19 meeting)

> Source: `MEETING-NOTES.md` "Sept 19 Meeting Notes". Chan's decisions were taken on
> 2026-09-24; this plan contains **no open questions**. Coders do not make design calls —
> every tag, string, size, duration and easing below is decided. If something here is
> genuinely impossible, stop and report `ESCALATE: <why>`; do not improvise.
>
> Binding reading for every coder before starting: `CLAUDE.md` (repo),
> `~/Programming/Iridel/tasks/RULES.md`, and the topic files named in your task.
> **`DESIGN.md` does not exist in this repo** — the binding visual language is the existing
> components this plan tells you to copy from. Do not invent new tokens.
>
> Hard constraints (from memory / Chan):
>
> - **Never edit `src/app/_sections/companies-marquee.tsx` or `src/app/_components/companies-marquee.tsx`.**
> - A button whose fill changes on hover must change its glow/border colour too (the pills
>   below reuse existing class strings that already satisfy this — copy them literally).
> - Gallery hover only scales; never dims siblings (not touched by this plan, don't regress it).
> - The **landing** specializations section (`src/app/_sections/specializations.tsx` +
>   `src/app/_components/spec-reveal-cards.tsx`) must not change at all, visually or in code.
> - `MEETING-NOTES.md` has uncommitted edits by Chan. **Nobody touches it.**

---

## How the three tasks run in parallel

The three tasks touch **disjoint file sets** (table at the end). They still cannot share one
working tree: `npm run validate` type-checks the whole project, so one agent's half-finished
edit fails another agent's check; `next build` from three agents fights over `.next/`; and
Next 16 allows only one `next dev` per directory (`.next/dev/lock`).

**So each task runs in its own git worktree on its own branch.**

```bash
# from /Users/chanchan/Programming/Iridel/demos/adrianding-DEMO — orchestrator, or the
# coder itself if not spawned with isolation: "worktree"
git worktree add ../adrianding-DEMO-wt-A -b feedback-2/a-workshop-tags
git worktree add ../adrianding-DEMO-wt-B -b feedback-2/b-program-carousel
git worktree add ../adrianding-DEMO-wt-C -b feedback-2/c-inquiry-form
# in each worktree: APFS copy-on-write clone of node_modules (seconds, not an npm install)
cp -cR ../adrianding-DEMO/node_modules ./node_modules
```

| Task                                                      | Branch                          | Dev port |
| --------------------------------------------------------- | ------------------------------- | -------- |
| A — workshop tags + filter + handoff docs                 | `feedback-2/a-workshop-tags`    | 3101     |
| B — corporate "Programs we run" carousel                  | `feedback-2/b-program-carousel` | 3102     |
| C — inquiry prefill + multi-select + about-prompt cleanup | `feedback-2/c-inquiry-form`     | 3103     |

Start the dev server with `npx next dev -p 310X` **in your own worktree** and record its PID.
Kill that PID (and any browser you opened) before reporting, on the failure path too
(`~/Programming/CLAUDE.md` → "Clean up what you started"). Verify with
`lsof -i :310X` returning nothing. Never `pkill -f next`.

Merge order after all three are green: A, B, C into `main` (no conflicts expected — disjoint
files). Then run the **integration checks** at the bottom once on the merged tree.

### The one contract between B and C (read by both)

B's **Inquire** button and C's form talk through two things only — no shared import, so
neither branch depends on the other to compile:

1. **URL:** `/corporate-training?program=<key>#inquiry`, where `<key>` is a
   `Specialization.key` from `src/lib/specializations.ts` (`leadership`, `keynotes`,
   `culture`, `communication`, `train-the-trainer`, `personal-branding`).
2. **Window event:** `window.dispatchEvent(new CustomEvent("ad:program-inquire", { detail: { key } }))`
   with `detail: { key: string }`.

The event name string `"ad:program-inquire"` is declared as a local `const
PROGRAM_INQUIRE_EVENT` in **both** `program-carousel.tsx` (B) and `inquiry-form.tsx` (C), each
with the comment `// Must match the constant in <other file> — see PLAN-feedback-2.md.`
Duplicated on purpose so the tasks build independently.

Why both: the URL makes a deep link / reload / shared link work; the event makes a second
click on the **same** program (after the visitor changed the select by hand) re-apply,
which a URL that did not change cannot do. C reads the URL from `window.location.search` in
a mount effect — **not** `useSearchParams`, which would force a Suspense boundary and a
client-render bailout on an otherwise static page.

---

## Task A — Workshop tags, /workshops filter, dev-handoff docs

**Read first:** `tasks/rules/04-styling.md`, `05-responsive.md`, `06-accessibility.md`.

### A1. `src/lib/workshops.ts` — taxonomy + field

Add above `export type Workshop`:

```ts
/**
 * Fixed taxonomy for "which area does this workshop serve". Order here is the
 * display order everywhere (card pills, filter chips). In the real build this is
 * a CMS taxonomy field, not free text — see README "Backend / CRM / CMS".
 */
export const WORKSHOP_TAGS = [
  "Leadership",
  "Sales",
  "Communication",
  "Coaching",
  "Customer Experience",
  "Culture",
  "Train-the-Trainer",
] as const
export type WorkshopTag = (typeof WORKSHOP_TAGS)[number]
```

Add to the `Workshop` type, directly after `title`:

```ts
  /** 1–3 tags from WORKSHOP_TAGS, most relevant first. Shown as pills on every
   *  card and on the detail hero; drives the /workshops filter. */
  tags: WorkshopTag[]
```

Add `tags` to each entry, directly after its `title` line, **exactly**:

| slug                               | tags                                     |
| ---------------------------------- | ---------------------------------------- |
| `exceptional-salesmanship`         | `["Sales", "Customer Experience"]`       |
| `exceptional-leadership`           | `["Leadership", "Communication"]`        |
| `train-the-trainers-certification` | `["Train-the-Trainer", "Communication"]` |
| `presenting-with-impact`           | `["Communication"]`                      |
| `negotiation-essentials`           | `["Sales", "Communication"]`             |
| `coaching-for-managers`            | `["Coaching", "Leadership"]`             |
| `customer-experience-excellence`   | `["Customer Experience"]`                |
| `building-winning-cultures-2025`   | `["Culture", "Leadership"]`              |

Add `// TODO: client sign-off on tags` once, above the first entry's `tags` line. Update the
file's top doc-comment with one sentence: "Each workshop carries 1–3 `tags` from
`WORKSHOP_TAGS` (added 2026-09-19 — the client wanted it obvious at a glance which area a
course serves)."

### A2. NEW `src/app/_components/workshop-tags.tsx` (server-safe: no `"use client"`, no hooks)

```ts
export function WorkshopTagPills({
  tags,
  size = "sm",
  className = "",
}: {
  tags: WorkshopTag[]
  size?: "sm" | "md"
  className?: string
})
```

- Renders `<ul aria-label="Focus areas" className={`flex flex-wrap gap-1.5 ${className}`}>`,
  one `<li>` per tag, in the order given.
- Each pill: `<span>` with lucide icon + label. Icon map (literal object, no class-name
  building):
  `Leadership → Compass`, `Sales → TrendingUp`, `Communication → MessagesSquare`,
  `Coaching → Sprout`, `Customer Experience → HeartHandshake`, `Culture → Users`,
  `Train-the-Trainer → GraduationCap`. Icons `aria-hidden`.
- Class strings (two literal constants, pick by `size`):
  - `sm`: `inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/25 backdrop-blur-sm` — icon `size-3.5 shrink-0`
  - `md`: `inline-flex min-h-9 items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-sm` — icon `size-4 shrink-0`
- Not uppercase. Not interactive (no link, no hover state). Both variants are for dark/photo
  grounds only — say so in the doc-comment.
- Also export `export const WORKSHOP_TAG_ICONS` (the icon map) so the filter chips reuse it.

### A3. `src/app/_components/event-cards.tsx` — pills on every card

In `renderCard`, inside the `<Link>`, **after** the gradient `<div className="absolute inset-0 …" />`
and **before** the bottom content block, add:

```tsx
<WorkshopTagPills
  tags={w.tags}
  className="absolute top-5 right-6 left-6 z-[1] lg:top-6 lg:right-8 lg:left-8"
/>
```

- Always visible — **not** inside the reveal/collapse block, on both `row` and `grid`
  variants, desktop and mobile. It must be readable at rest on the landing row.
- Do not touch the soon-card, the hover take-over, the arrows or any existing constant.
- Add one sentence to the file's doc-comment: "Every card carries its tag pills top-left,
  always visible (2026-09-19)."

### A4. NEW `src/app/_components/workshop-tag-filter.tsx` (`"use client"`)

```ts
export function WorkshopTagFilter({ workshops }: { workshops: Workshop[] })
```

Renders the chip row, then `<EventCards workshops={filtered} variant="grid" />`.

State: `const [selected, setSelected] = useState<WorkshopTag[]>([])`. Empty = "All".

- **Chips shown:** `All`, then every tag in `WORKSHOP_TAGS` order **that at least one of
  `workshops` carries** (so `Culture`, which only the past workshop has, does not appear on
  the open list). Compute with `useMemo`.
- **Semantics: OR.** A workshop is shown if it carries **any** selected tag. Chosen over AND
  because a visitor picking "Sales" and "Leadership" wants to see both kinds of course, and
  AND on 1–3 tags per course empties the grid after two clicks. Write this reason in the
  doc-comment.
- Clicking a tag chip toggles it in `selected`. Clicking `All` sets `selected` to `[]`.
  `All` is pressed exactly when `selected.length === 0`.
- `filtered` keeps the original array order.
- Layout (sits above the full-bleed grid, aligned to the grid's own gutters):
  ```
  <div className="mx-auto mb-8 flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:mb-12 lg:flex-row lg:items-center lg:justify-between">
    <div role="group" aria-labelledby="workshop-filter-label" className="flex flex-wrap items-center gap-2">
      <span id="workshop-filter-label" className="text-muted-foreground mr-1 text-sm font-medium">Filter by focus</span>
      …chips
    </div>
    <p aria-live="polite" className="text-muted-foreground text-sm">Showing {filtered.length} of {workshops.length} workshops</p>
  </div>
  ```
- Chip = `<button type="button" aria-pressed={on}>` with the tag's icon (`size-4`, from
  `WORKSHOP_TAG_ICONS`; `All` has no icon), the label, and a count
  `<span className="tabular-nums opacity-60">{n}</span>` (count of workshops carrying that
  tag; `All` shows `workshops.length`). Classes (two literal constants):
  - base: `inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium ring-1 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none motion-reduce:transition-none`
  - off: `text-muted-foreground ring-border hover:text-foreground hover:ring-foreground`
  - on: `bg-brand text-brand-foreground ring-brand hover:bg-brand-accent hover:ring-brand-accent`
    (ring changes with fill on hover — satisfies the glow/border memory rule.)
- Filter changes are **instant** (no animation). The calendar above is **not** filtered.
- **Empty state** (only reachable if data changes so a chip matches nothing — Chan asked for
  it; keep it small): when `filtered.length === 0`, render instead of `EventCards`:
  ```
  <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
    <p className="font-serif text-3xl">No open dates in that area right now.</p>
    <p className="text-muted-foreground mt-3">New dates are added through the year — or bring the programme to your team instead.</p>
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      <Button variant="outline" onClick={() => setSelected([])}>Show all workshops</Button>
      <Button variant="ghost" asChild><Link href="/corporate-training#inquiry">Ask about in-house training</Link></Button>
    </div>
  </div>
  ```
- No URL sync (`?tag=`) in v1 — deferred, see "Out of scope".

### A5. `src/app/workshops/_sections/list.tsx`

Replace `<EventCards workshops={OPEN_WORKSHOPS} variant="grid" />` with
`<WorkshopTagFilter workshops={OPEN_WORKSHOPS} />`; drop the now-unused `EventCards` import.
Keep the calendar section untouched. Add one line to the doc-comment: "Tag filter chips sit
above the grid (OR semantics — see `workshop-tag-filter.tsx`); the calendar is unfiltered."

### A6. `src/app/workshops/[slug]/_sections/hero.tsx` — pills on the detail page

Directly after the `<SplitReveal as="h1" …>{workshop.title}</SplitReveal>`, add:

```tsx
<Reveal className="mt-5">
  <WorkshopTagPills tags={workshop.tags} size="md" />
</Reveal>
```

and change the following chips row's `mt-9` to `mt-6`. Nothing above the h1 changes (no
eyebrow — RULES §4).

### A7. Docs — `README.md` and `PRD.md` (A owns both files)

**README.md**, section "Backend / CRM / CMS — not yet built": insert this bullet directly
after the "**Registration forms don't submit anywhere.**" bullet, verbatim:

```md
- **Every form submission must notify the owners and land in the CRM as `NEW`** (client
  ask, 2026-09-19). This covers _both_ entry points — workshop registration
  (`workshops/[slug]/_sections/registration-form.tsx`) and the corporate inquiry
  (`corporate-training/_sections/inquiry-form.tsx`) — and any form added later. On submit
  the backend must, server-side:
  1. **Create the CRM record first, with status `NEW`** — every field the form collects
     (corporate: the primary programme _and_ the "Also interested in" list; workshop: the
     course slug and its date), plus `source` (`workshop-registration` |
     `corporate-inquiry`) and a submitted-at timestamp. `NEW` is the only status the site
     sets; the rest of the lifecycle is the CRM's, to be agreed with Adrian.
  2. **Then email the owners** a "new inquiry" notification: who, which form, the key
     fields, and a link to the CRM record.
     The record is the source of truth. If the email fails, the lead still exists and still
     shows as `NEW` (retry the email, never the record). If the record write fails, the
     visitor must see an error and must **not** be sent to the confirmation page. Owner
     recipient addresses are TBD with Adrian — configuration, not code. The visitor-facing
     acknowledgement emails in `/email-templates` are a separate send and do not replace the
     owner notification.
- **Workshop `tags`** (`WORKSHOP_TAGS` in `src/lib/workshops.ts`) become a fixed CMS
  taxonomy field (multi-select, 1–3 per course), not free text — the /workshops filter
  chips are derived from it.
```

**PRD.md**:

1. Under `### Parent (/workshops)`, append a bullet after "Each card: …":
   `- **Focus tags (added 2026-09-19, client feedback):** every workshop carries 1–3 tags from a fixed taxonomy (Leadership, Sales, Communication, Coaching, Customer Experience, Culture, Train-the-Trainer) shown as pills on every card (landing + list) and on the course hero. Filter chips above the /workshops grid — "All" by default, multi-select, **OR** semantics (a course shows if it has any selected tag). Chips only list tags an open course actually carries.`
2. In `### Credibility exit + corporate off-ramp`, replace the sentence run starting
   "Three presentations are built —" through "The switcher and the variant plumbing come out
   once he picks one." with:
   `Presentation: **inline only** — the client picked it on 2026-09-19 ("INLINE WINS"). The button sits in the section; nothing floats or pops up. The \`card\` and \`modal\` variants and the meeting switcher were deleted the same week.`
3. Under `## Page 5: Corporate Training Page`, replace item 3 with:
   `3. **Programs we run** — header on top, then a horizontal carousel of the six programmes (~3.5 cards visible at 1440px, prev/next arrows on desktop). Hovering or keyboard-focusing a card widens it sideways while its neighbours narrow — the row's total width is fixed, so nothing jumps — and reveals who the programme is useful for plus an **Inquire** button that scrolls to the form with that programme preselected (\`?program=<key>#inquiry\`). Mobile: swipe rail, tap to expand. Added 2026-09-19; the landing page's specializations section is deliberately unchanged. The "useful for" bullets are representative — TODO client sign-off.`
4. In item 7, change "**Preferred topic or programme**" to "**Preferred programme**" and
   append to that item: ` Added 2026-09-19: an optional **Also interested in** checkbox list of the other programmes, so one inquiry can cover more than one; the primary is prefilled when the visitor arrives from a programme card.`
5. In `### Child (/corporate-training/inquiry-received)`, change "a read-back of the
   submitted programme / attendees / date / venue" to "a read-back of the submitted
   programme / attendees / date / venue (plus any \"also interested in\" programmes)".
6. Insert a new section immediately **before** `## Email Templates`:

   ```md
   ## Phase 2 handoff — lead capture (added 2026-09-19, client feedback)

   Every submission from any form — workshop registration and corporate inquiry today,
   anything added later — must (1) create a CRM record with status **`NEW`** and (2) email
   the owners that someone filled out the form. Record first, email second; a failed email
   never loses a lead, and a failed record write never shows the visitor a confirmation.
   Full contract (fields, `source` values, failure handling): README →
   "Backend / CRM / CMS — not yet built".
   ```

### A — Definition of done

- `npm run validate` → exit 0. `npm run build` → exit 0 (in worktree A).
- `grep -n "tags:" src/lib/workshops.ts | wc -l` → `9` (1 type field + 8 entries).
- `grep -rn "uppercase" src/app/_components/workshop-tags.tsx src/app/_components/workshop-tag-filter.tsx` → empty.
- Dev server on :3101, check at 1440×900 and 390×844:
  - `/` workshops row: every card shows its pills top-left at rest; hover take-over still works.
  - `/workshops`: chips `All 7 · Leadership 2 · Sales 2 · Communication 4 · Coaching 1 · Customer Experience 2 · Train-the-Trainer 1` (7 open workshops); no `Culture` chip. Select Sales → 2 cards (Salesmanship, Negotiation); add Coaching → 3; `All` → 7 and all chips unpressed. "Showing X of 7 workshops" matches.
  - `/workshops/exceptional-salesmanship`: `Sales` + `Customer Experience` pills under the title.
- Kill your dev server + browser; `lsof -i :3101` empty.

---

## Task B — Corporate "Programs we run" carousel

**Read first:** `tasks/rules/02-motion.md` (§8, §10, §11), `05-responsive.md` §14,
`06-accessibility.md`. Reference implementations to copy patterns from (read, do **not**
edit): `src/app/_components/event-cards.tsx` (row, arrows, flex-basis take-over),
`src/app/_components/spec-reveal-cards.tsx` (timings, image/scrim).

**Decision: new component.** `SpecRevealCards` stays untouched because the landing still uses
it and must not change. `programs.tsx` stops importing it.

### B1. `src/lib/specializations.ts` — `usefulFor` bullets

Add to `Specialization` type, after `detail`:

```ts
  /** "Useful for" bullets on the corporate carousel's expanded card — who this
   *  programme is for. TODO: representative copy; Adrian to confirm. */
  usefulFor: string[]
```

Add a `// TODO: Adrian to confirm the usefulFor bullets (representative, 2026-09-19)` above
the array, and these values verbatim:

- `leadership`:
  - "New and first-time managers promoted from strong individual roles"
  - "Supervisors who still take the work back instead of delegating it"
  - "Mid-level leaders who need to hold people accountable without losing their trust"
  - "Companies building a leadership bench ahead of growth or succession"
- `keynotes`:
  - "Conventions, kick-offs and awards nights that need a high-energy opener"
  - "Sales and leadership summits of 100 to 1,000+ people"
  - "Moments of change — a merger, a relaunch, a hard year — when the room needs a reset"
  - "Events that want a takeaway people still use next week, not just a good mood"
- `culture`:
  - "Teams that grew fast and lost the habits that made them good"
  - "Departments working in silos that need to operate as one team"
  - "Leadership teams relaunching values that currently live only on a poster"
  - "Organisations coming out of a restructure, redundancy or merger"
- `communication`:
  - "Leaders who present to boards, clients or large internal audiences"
  - "Client-facing and sales teams whose pitch has to land the first time"
  - "Technical experts who need to explain complex work to non-experts"
  - "Managers handling feedback, difficult conversations and tough questions"
- `train-the-trainer`:
  - "In-house L&D teams and internal facilitators"
  - "Subject-matter experts asked to train their own colleagues"
  - "Team leads rolling out a coaching culture internally"
  - "Companies that want the capability to stay after the external trainer leaves"
- `personal-branding`:
  - "Senior leaders stepping into more visible, external-facing roles"
  - "Client-facing professionals in banking, insurance, real estate and consulting"
  - "Newly promoted executives whose presence needs to match the title"
  - "Teams representing the company at events, pitches and online"

Update the top doc-comment: "`usefulFor` feeds the corporate page's programme carousel
only; the landing section does not read it."

### B2. NEW `src/app/_components/program-carousel.tsx` (`"use client"`)

```ts
export type ProgramCard = {
  key: string // Specialization.key — used in ?program=<key>
  title: string
  blurb: string
  usefulFor: string[]
  image: string
  imageAlt: string
  imagePosition?: string // CSS object-position, default "50% 50%"
}

export function ProgramCarousel({
  items,
  heading,
}: {
  items: ProgramCard[]
  /** Rendered in the header row, left; the desktop arrows sit right of it. */
  heading: React.ReactNode
})
```

The component renders the header row **and** the rail (the arrows need the rail's ref, and
the header must sit on top).

**Constants (top of file, exactly):**

```ts
const REST_REM = 22 // every card at rest
const ACTIVE_REM = 34 // hovered / focused / tapped card
const GAP_REM = 1.25 // gap-5
// Siblings give up exactly what the active card takes, so the row's total width
// never changes — nothing to the right of the hovered card jumps, the scroll range
// is constant, and the arrows' enabled state never flips mid-hover.
// Invariant also relied on for hover stability (RULES §14): with these numbers the
// newly-active card's new span always contains its previous span, so the pointer
// can't fall off the card it just entered. Re-check that before changing any value.
const SIBLING_REM = (n: number) => (n * REST_REM - ACTIVE_REM) / (n - 1) // 19.6 for n=6
const EASE = "cubic-bezier(0.33, 1, 0.68, 1)" // = SpecRevealCards' [0.33,1,0.68,1]
const DURATION_MS = 420 // = SpecRevealCards' 0.42s
const PROGRAM_INQUIRE_EVENT = "ad:program-inquire" // Must match the constant in corporate-training/_sections/inquiry-form.tsx — see PLAN-feedback-2.md.
```

**Media state** (one effect, mount-gated so SSR and first render agree — RULES §10):
`desktop` = `matchMedia("(min-width: 1024px)")`, `canHover` =
`matchMedia("(hover: hover) and (pointer: fine)")`, both start `false`, listen to `change`.
`reduce = useReducedMotionSafe()` from `@/app/_lib/use-reduced-motion-safe`.

**State:** `const [active, setActive] = useState<number | null>(null)` — `null` = all cards
at rest, equal width. Lives on the rail, as in `event-cards.tsx`.

**Header row** (inside `mx-auto max-w-7xl px-6 sm:px-8`):
`flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-10 lg:mb-14` — left:
`{heading}`; right: arrows, `hidden lg:flex items-center gap-2.5`, rendered only when the
rail overflows. Arrow buttons: copy the `btn` class string and markup of `ScrollArrows` in
`event-cards.tsx` **literally** (lucide `ArrowLeft`/`ArrowRight`, `size-11`), aria-labels
`"Previous programmes"` / `"Next programmes"`, disabled at each end. Edge detection: copy
event-cards' rAF-gated scroll + `ResizeObserver` sync, **without** the "freeze while active"
guard (unneeded — width is constant). Nudge: `el.scrollBy({ left: dir * Math.max(320,
el.clientWidth * 0.8), behavior: reduce ? "instant" : "smooth" })`.

**Rail** — wrap in `<Reveal>` (no `stagger`). Rail element:
`no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-1 sm:scroll-px-8 sm:px-8 lg:snap-none lg:gap-5 lg:scroll-px-0 lg:pr-0 lg:pb-0 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]`
(first card aligns with the 80rem content column; the row runs off the right edge). Last
child: `<div aria-hidden className="w-px shrink-0 lg:w-8" />` as the trailing gutter
(`scrollWidth` drops trailing padding — RULES §8 pinned-track note).
Handlers on the rail: `onMouseLeave={() => canHover && setActive(null)}` and
`onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setActive(null) }}`.

**Card** (one per item, `key={item.key}`), root `<div>`:
`group relative h-[32rem] w-[82vw] max-w-[22rem] shrink-0 snap-start overflow-hidden rounded-3xl contain-layout lg:h-[34rem] lg:w-auto lg:max-w-none lg:flex-[0_0_22rem]`

- Inline style **only when `desktop`**:
  `{ flexGrow: 0, flexShrink: 0, flexBasis: `${basis}rem`, transition: reduce ? "none" : `flex-basis ${DURATION_MS}ms ${EASE}` }`
  where `basis = active === null ? REST_REM : active === i ? ACTIVE_REM : SIBLING_REM(items.length)`.
  Always present on desktop (also at rest) so the return to rest animates.
- `onMouseEnter={() => canHover && setActive(i)}` on the root.
- Children, in DOM order:
  1. `<Image fill src alt={item.imageAlt} sizes="(min-width: 1024px) 34rem, 82vw" style={{ objectPosition: item.imagePosition ?? "50% 50%" }} className={`object-cover transition-transform duration-500 motion-reduce:transition-none ${isOpen ? "scale-[1.03]" : "scale-100"}`} />`
  2. Scrim: `<div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/35 to-black/10" />`
  3. Open-state darkener: `<div className={`absolute inset-0 bg-black/35 transition-opacity duration-300 motion-reduce:transition-none ${isOpen ? "opacity-100" : "opacity-0"}`} />`
  4. Toggle — full-card button, the only thing that expands a card by click/tap/focus:
     `<button type="button" aria-expanded={isOpen} aria-controls={panelId} aria-label={`${item.title} — who it's for`} className="absolute inset-0 z-10 cursor-pointer rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-inset" />`
     - `onClick`: `canHover ? setActive(i) : setActive((a) => (a === i ? null : i))` (touch = tap toggles; tapping another card switches).
     - `onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) setActive(i) }}` — keyboard focus expands; a tap's focus does not (the click handles it, otherwise tap would open-then-close).
  5. Content, `className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col gap-3 p-6 lg:p-8"`:
     - `<h3 className="max-w-[15.5rem] text-xl leading-tight font-semibold tracking-[-0.01em] text-balance text-white lg:text-[1.65rem]">{item.title}</h3>` — max-width fits the narrowest (19.6rem) card so the title never reflows while widths animate.
     - Blurb collapse (open when `!isOpen`): `<Collapse open={!isOpen}><p className="max-w-[15.5rem] text-sm leading-relaxed text-white/85 line-clamp-3 lg:text-base">{item.blurb}</p></Collapse>`
     - Detail collapse (open when `isOpen`): `<Collapse open={isOpen} id={panelId} inert={!isOpen}>` containing
       `<div className="w-full pt-1 lg:w-[30rem]">` — **fixed 30rem on desktop** (= 34rem − 2×2rem padding) so the bullets never reflow during the widen; the card's `overflow-hidden` clips them until it arrives.
       - `<p className="text-sm font-semibold text-white">Useful for</p>`
       - `<ul className="mt-2 space-y-1.5">` each `<li className="flex gap-2.5 text-sm leading-snug text-white/90"><Check className="mt-0.5 size-4 shrink-0 text-white/70" aria-hidden />{b}</li>` (lucide `Check`)
       - Inquire: `<a href={`/corporate-training?program=${item.key}#inquiry`} onClick={(e) => { e.preventDefault(); inquire(item.key, reduce) }} className=<REGISTER PILL> + " pointer-events-auto mt-5">Inquire<span className="sr-only"> about {item.title}</span><ArrowRight … /></a>`
         where `<REGISTER PILL>` is the **exact** class string of the "Register" `<span>` in
         `event-cards.tsx` (wipe fill brand→background, text inverts, black shadow deepens,
         lift-only, `group/reg`), and the arrow is the same
         `ArrowRight className="size-4 transition-transform duration-300 group-hover/reg:translate-x-1"`.
         Add `focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none`.
  - `Collapse` is a local component: `<div className={`grid transition-[grid-template-rows,opacity] duration-[420ms] ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} …><div className="min-h-0 overflow-hidden">{children}</div></div>` (literal classes only; passes `id`/`inert` through; React 19 `inert` boolean prop).
  - `panelId = `program-${item.key}-detail``.

**`inquire(key)`** (module-level function in the same file):

```ts
function inquire(key: string, reduce: boolean) {
  window.history.replaceState(
    window.history.state,
    "",
    `/corporate-training?program=${encodeURIComponent(key)}#inquiry`
  )
  window.dispatchEvent(
    new CustomEvent(PROGRAM_INQUIRE_EVENT, { detail: { key } })
  )
  const target = document.getElementById("inquiry")
  if (!target) return
  if (reduce) target.scrollIntoView({ block: "start", behavior: "instant" })
  else smoothScrollToElement(target) // @/app/_lib/smooth-scroll-to — already honours scroll-margin-top
}
```

(call it with the component's `reduce`).

**Doc-comment** at the top of the file: what it is, that it's the corporate page only, the
constant-total-width rule and why, hover/tap/focus behaviour, the B↔C contract, and "the
landing keeps `SpecRevealCards` — do not merge them."

### B3. `src/app/corporate-training/_sections/programs.tsx`

Rewrite to: section `bg-muted/40 py-24 lg:py-36` (same ground as today — neighbours'
alternation unchanged), no grid, no sticky rail. Map `SPECIALIZATIONS` to `ProgramCard[]`
(`key, title, blurb, usefulFor, image: SPECIALIZATION_IMAGES[key], imageAlt:
SPECIALIZATION_IMAGE_ALTS[key], imagePosition: SPECIALIZATION_IMAGE_POSITIONS[key]`) and
render:

```tsx
<ProgramCarousel
  items={CARDS}
  heading={
    <div className="max-w-2xl">
      <SplitReveal className="font-serif text-[2.5rem] leading-[1.05] tracking-[-0.02em] lg:text-[3.5rem]">
        Programs <span className="text-brand">we run</span>
      </SplitReveal>
      <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
        Six areas, refined over twenty years on the training circuit — tailored
        to your team&rsquo;s roles, industry and goals. Hover a programme to see
        who it&rsquo;s for.
      </p>
    </div>
  }
/>
```

Mobile copy is the same sentence (touch users see "Hover" — acceptable? **No:** use
`<span className="lg:hidden">Tap</span><span className="hidden lg:inline">Hover</span> a programme to see who it&rsquo;s for.`).
Update the file's doc-comment (it currently claims "same reveal-card treatment as the
landing" — that is no longer true; say it's the carousel and why).

### B — Definition of done

- `npm run validate` → 0; `npm run build` → 0 (worktree B).
- `git diff --stat main -- src/app/_sections/specializations.tsx src/app/_components/spec-reveal-cards.tsx` → empty.
- Dev :3102, `/corporate-training`:
  - 1440×900: header top-left, arrows right; ~3.5 cards visible, first card's left edge
    aligned with the header text. Hover card 2: it widens to 34rem over ~420ms, others
    narrow, **the right edge of the last card does not move** (measure
    `rail.scrollWidth` before/after hover: identical). "Useful for" + 4 bullets + Inquire
    visible. Slide pointer card 1 → 2 → 3: clean hand-off, no flicker. Leave rail → all
    equal.
  - Tab from the element before the section: first card expands with a visible ring; Tab →
    its Inquire; Tab → next card expands. Shift-Tab reverses. Tab out → all rest.
  - Click Inquire: URL becomes `/corporate-training?program=<key>#inquiry`, page scrolls to
    the red inquiry section, and in DevTools
    `window.addEventListener("ad:program-inquire", e => console.log(e.detail))` logs
    `{key: "<key>"}`. (Form prefill is C's — verified in integration.)
  - Emulate `prefers-reduced-motion: reduce`: widths and panels switch instantly, still work.
  - 390×844: swipe rail, one card + a peek; tap expands (bullets + Inquire fit inside the
    card, nothing clipped at 32rem), tap again collapses, tap another switches. No arrows.
- `/` landing specializations: pixel-identical to `main` (compare screenshots at 1440 and 390).
- Kill dev server + browser; `lsof -i :3102` empty.

---

## Task C — Inquiry prefill + "Also interested in" + about-prompt cleanup

**Read first:** `tasks/rules/07-nextjs.md` (forms, hydration, null handoff payloads),
`06-accessibility.md`.

### C1. `src/app/_components/about-prompt.tsx` — keep inline only

Delete: `AboutPromptVariant`, `VARIANTS`, `STORAGE_KEY` (`"ad-about-prompt-variant"`),
`EVENT`, `DEFAULT_VARIANT`, `readVariant`, `useVariant`, `AboutPromptOverlay`,
`PromptPortrait`, `SlideInCard`, `PopupModal`, `AboutPromptSwitcher`, and the now-unused
imports (`useCallback`, `useEffect`, `useState`, `Image`, `X`). Remove the `"use client"`
directive (only `Link` remains — server-safe) and the `data-about-prompt-anchor` attribute
(it only existed as the overlay's scroll sentinel). `AboutPromptAnchor` keeps its exact
markup, classes and props otherwise.

Rewrite the doc-comment: what the button is, where it goes (one per page, end of the
section with his portrait/story, never `variant="brand"`), and
`History: three presentations (inline / slide-in card / pop-up) were built for the client
meeting; the client chose inline on 2026-09-19 and the other two plus the switcher were
deleted.`

### C2. Page files — remove the switcher and overlay

- `src/app/workshops/[slug]/page.tsx`: delete the `AboutPromptOverlay, AboutPromptSwitcher`
  import, the `{/* DEMO ONLY … */}` comment + `<AboutPromptSwitcher />`, and
  `<AboutPromptOverlay />`.
- `src/app/corporate-training/page.tsx`: same three deletions.
- Do **not** touch `proof.tsx` or `trainer.tsx` — they import `AboutPromptAnchor`, which
  stays.
- Proof: `grep -rn "AboutPromptSwitcher\|AboutPromptOverlay\|ad-about-prompt\|data-about-prompt-anchor\|SlideInCard\|PopupModal" src` → empty.

### C3. `src/app/_lib/handoff.ts`

Add to `CorporateHandoff`: `/** Optional extra programmes (titles). Absent on payloads saved before 2026-09-19. */ alsoInterested?: string[]`.

### C4. `src/app/corporate-training/_sections/inquiry-form.tsx`

1. Constants: `const PROGRAM_INQUIRE_EVENT = "ad:program-inquire" // Must match the constant in _components/program-carousel.tsx — see PLAN-feedback-2.md.`
   and `const SPEC_TITLES = SPECIALIZATIONS.map((s) => s.title) as [string, ...string[]]`.
2. Schema: add `alsoInterested: z.array(z.enum(SPEC_TITLES)).optional()`. `useForm`
   gets `defaultValues: { alsoInterested: [] }`.
3. Step 2 fields list becomes `["program", "alsoInterested", "attendees", "targetDate", "venue"]`.
4. Label change: `"Preferred topic or programme"` → `"Preferred programme"`. Options
   unchanged (six titles + "Not sure yet — help us scope it").
5. New field **directly after** the programme select:
   - `<Field label="Also interested in (optional)">` then helper
     `<p className="text-muted-foreground -mt-0.5 mb-2 text-xs">Tick any others you&rsquo;d like the proposal to cover.</p>`
   - `<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">` of checkboxes — every
     `SPECIALIZATIONS` title **except** the currently selected primary (all six when the
     primary is empty or "Not sure yet — help us scope it").
   - Each: `<label className="border-input hover:border-foreground/40 has-[:checked]:border-brand has-[:checked]:bg-brand/5 flex min-h-11 cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors">` + `<input type="checkbox" className="accent-brand mt-0.5 size-4 shrink-0" checked={also.includes(t)} onChange={() => toggleAlso(t)} />` + `<span>{t}</span>`.
   - Controlled, not `register`: `const primary = watch("program")`, `const also = watch("alsoInterested") ?? []`;
     `toggleAlso(t)` → `setValue("alsoInterested", also.includes(t) ? also.filter(x => x !== t) : [...also, t], { shouldDirty: true })`.
   - `useEffect` on `primary`: if `also.includes(primary)`, `setValue("alsoInterested", also.filter(x => x !== primary))` — the primary can never also be an extra.
6. Review step: after the `Programme` row add
   `<Row k="Also interested in" v={(getValues("alsoInterested") ?? []).join(", ") || "—"} />`.
7. `onSubmit`: add `alsoInterested: v.alsoInterested ?? []` to the `saveHandoff` payload.
8. `fillSample`: add `alsoInterested: [SPECIALIZATIONS[3].title]` (Communications).
9. **Prefill.**
   - `const formRef = useRef<HTMLFormElement>(null)`; the `<form>` gets `ref={formRef}`,
     `tabIndex={-1}` and `outline-none` added to its className.
   - `const [prefilled, setPrefilled] = useState<string | null>(null)` (the title).
   - `applyProgram(key: string, focus: boolean)`: find `SPECIALIZATIONS.find(s => s.key === key)`;
     if none, return (unknown keys are ignored silently). Else
     `setValue("program", title, { shouldValidate: false, shouldDirty: true })`, drop
     `title` from `alsoInterested` if present, `setPrefilled(title)`, and if `focus`,
     `requestAnimationFrame(() => formRef.current?.focus({ preventScroll: true }))`.
   - Mount effect: `const key = new URLSearchParams(window.location.search).get("program"); if (key) applyProgram(key, false)`.
   - Mount effect: listen for `PROGRAM_INQUIRE_EVENT` on `window`;
     handler `(e) => { const key = (e as CustomEvent<{ key?: unknown }>).detail?.key; if (typeof key === "string") applyProgram(key, true) }`; remove on unmount.
   - Does **not** change `step`. The programme select lives on step 3; it is filled
     whenever the visitor reaches it (RHF keeps values across unmounted steps — the form
     already relies on this).
   - Visible confirmation, rendered under the "Step N of 4" row while `prefilled && step < 2`:
     `<p className="text-muted-foreground mt-3 text-sm">Enquiring about <span className="text-foreground font-medium">{prefilled}</span> — you can change this on step 3.</p>`
   - If the visitor later picks a different programme in the select, clear `prefilled`
     (`useEffect` on `primary`: `if (prefilled && primary !== prefilled) setPrefilled(null)`).
10. Update the file doc-comment: the `?program=<key>` / event prefill and the extra-programmes
    field (2026-09-19).

### C5. `src/app/corporate-training/inquiry-received/_sections/summary.tsx`

After the `FIELDS.map(...)`, inside the same `<Reveal>`, render — **only when**
`handoff?.alsoInterested?.length` — one more block:

```tsx
<div className="bg-muted/50 rounded-lg p-6 sm:col-span-2">
  <dl>
    <dt className="text-muted-foreground flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase">
      <Layers className="size-3.5" /> Also interested in
    </dt>
    <dd className="text-foreground mt-2 text-lg font-medium">
      {handoff.alsoInterested.join(", ")}
    </dd>
  </dl>
</div>
```

(`Layers` from lucide; same label treatment as the four existing blocks — these are labels
inside cards, not section eyebrows.) With no handoff, or an empty list, nothing new renders
and the "four things we ask for" copy stays true. Doc-comment: one sentence noting it.

### C — Definition of done

- `npm run validate` → 0; `npm run build` → 0 (worktree C).
- The C2 grep → empty.
- Dev :3103:
  - `/corporate-training` and `/workshops/exceptional-leadership`: no "Demo control" bar; no
    card or pop-up ever appears after scrolling past the trainer/proof section; the
    "Know more about Coach Adrian" button is still there and links to `/about`.
  - `/corporate-training?program=culture#inquiry` (fresh load): lands on the form; the line
    "Enquiring about Winning Cultures & High-Performing Teams" shows on step 1; fill steps
    1–2 (or use "fill sample data" then change programme back) → step 3 select shows it;
    "Also interested in" lists the other five.
  - In the console: `window.dispatchEvent(new CustomEvent("ad:program-inquire",{detail:{key:"keynotes"}}))`
    → select/confirmation switch to Inspirational Keynotes; `{key:"nope"}` → nothing changes,
    no error.
  - Tick two extras, then choose one of them as primary → it disappears from the checkbox
    list and from the review row.
  - Submit → `/corporate-training/inquiry-received` shows "Also interested in" with the ticked
    titles; submit with none ticked → the block is absent. Direct visit (new tab) → page
    renders with fallbacks, no block, no error.
  - Workshop registration still submits to `/workshops/<slug>/registered` (handoff type
    change must not break it).
- Kill dev server + browser; `lsof -i :3103` empty.

---

## File ownership (no file appears twice)

| File                                                                | Task | New/modified                                                           |
| ------------------------------------------------------------------- | ---- | ---------------------------------------------------------------------- |
| `src/lib/workshops.ts`                                              | A    | modified — `WORKSHOP_TAGS`, `tags` field + data                        |
| `src/app/_components/workshop-tags.tsx`                             | A    | new — `WorkshopTagPills`, `WORKSHOP_TAG_ICONS`                         |
| `src/app/_components/workshop-tag-filter.tsx`                       | A    | new — chips + filtered grid                                            |
| `src/app/_components/event-cards.tsx`                               | A    | modified — pills on cards                                              |
| `src/app/workshops/_sections/list.tsx`                              | A    | modified — uses the filter                                             |
| `src/app/workshops/[slug]/_sections/hero.tsx`                       | A    | modified — pills under title                                           |
| `README.md`                                                         | A    | modified — lead-capture + tags handoff notes                           |
| `PRD.md`                                                            | A    | modified — tags, inline decision, carousel, form, Phase 2 lead capture |
| `src/lib/specializations.ts`                                        | B    | modified — `usefulFor`                                                 |
| `src/app/_components/program-carousel.tsx`                          | B    | new                                                                    |
| `src/app/corporate-training/_sections/programs.tsx`                 | B    | modified — header + carousel                                           |
| `src/app/_components/about-prompt.tsx`                              | C    | modified — inline only                                                 |
| `src/app/workshops/[slug]/page.tsx`                                 | C    | modified — switcher/overlay removed                                    |
| `src/app/corporate-training/page.tsx`                               | C    | modified — switcher/overlay removed                                    |
| `src/app/_lib/handoff.ts`                                           | C    | modified — `alsoInterested?`                                           |
| `src/app/corporate-training/_sections/inquiry-form.tsx`             | C    | modified — prefill + extras                                            |
| `src/app/corporate-training/inquiry-received/_sections/summary.tsx` | C    | modified — extras block                                                |

Read-only for everyone: `spec-reveal-cards.tsx`, `_sections/specializations.tsx`,
`companies-marquee.tsx` (both), `MEETING-NOTES.md`, `proof.tsx`, `trainer.tsx`,
`inquiry-cta.tsx`.

---

## Out of scope (v2, said out loud)

- `?tag=` URL sync on /workshops and clickable pills on the detail page linking to a
  filtered list — useful for ads, not asked for.
- Tagging corporate programmes or gallery events with the same taxonomy.
- Any real backend: the lead-capture contract is documented, not built (Iridel demos are
  frontend-only).
- Real programme photos (Unsplash placeholders in `SPECIALIZATION_IMAGES` remain, as today).

## Known deviations — flagged, not hidden

- The carousel animates `flex-basis` (a layout property), against RULES §8's "never animate
  height" spirit. Deliberate: it is the only way neighbours can narrow in real layout, and it
  is the same technique already shipped in `event-cards.tsx`; cost is scoped with
  `contain-layout` on six cards. The tester should watch for jank on a throttled CPU.
- At 1024–1279px fewer than 3.5 cards fit (≈2.7 at 1024); "3.5 visible" holds at ≈1440px.
- Hovering the right-most partly visible card expands it partly off-screen; it is not
  auto-scrolled into view (moving the card under a stationary pointer is the §14 jitter
  trap). Keyboard focus does scroll it in (browser default).
- `MEETING-NOTES.md` line "Demo scaffolding to strip before handoff: the variant switcher…"
  goes stale after Task C. Left for Chan, since he has uncommitted edits in that file.

---

## Tester checklist (merged tree, after A → B → C land on main)

Run `npm run validate && npm run build` first; both exit 0. Then `npm run dev` on a free
port; 1440×900, 1024×768 and 390×844; light and dark mode; then reduced motion.

**Integration (B ↔ C) — the part no single coder could test**

1. `/corporate-training`, hover "Winning Cultures…", click Inquire → scrolls to the red
   inquiry section; URL `?program=culture#inquiry`; step 1 shows "Enquiring about Winning
   Cultures & High-Performing Teams"; step 3 select preselected; extras list excludes it.
2. Change the select to Keynotes by hand, scroll up, click Culture's Inquire **again** →
   select returns to Culture (proves the event path, not just the URL).
3. Inquire from Leadership while already on step 3 → select updates live.
4. Reload with the `?program=` URL → still prefilled. Hand-edit to `?program=xyz` → nothing
   prefilled, no console error.
5. Keyboard only: Tab into the carousel, expand a card, Tab to Inquire, Enter → lands on the
   form and focus is on the form (next Tab goes to the first field), not back at the top.
6. Submit with 2 extras → confirmation page lists both; review step lists both.

**Tags / filter** 7. Every workshop card on `/` and `/workshops` shows its pills at rest, readable over the
photo in both themes; detail hero shows them under the title. 8. Filter: OR semantics (Sales + Coaching = 3 cards), `All` resets, counts correct, "Showing
X of 7" updates and is announced (aria-live), chips reachable and toggleable by keyboard
with `aria-pressed` correct, 44px touch targets on mobile, chips wrap without overflow at
390px. Mobile grid rail still swipes after filtering.

**Carousel** 9. Row total width constant during hover (`scrollWidth` identical); no card to the right of
the hovered one shifts its right edge; no hover flicker when sweeping the pointer fast
across all six; arrows disable at the ends and never flip mid-hover. 10. Tap behaviour on a touch emulation: tap opens, tap again closes, tap Inquire navigates
(does not just toggle). Nothing in an expanded mobile card is clipped. 11. Reduced motion: no width/opacity transitions, everything still reachable. 12. Landing specializations section unchanged vs `main`.

**About-prompt** 13. No switcher bar on either page; no floating card or modal ever appears; the inline button
is present once per page. `grep -rn "ad-about-prompt" src` → empty.

**Regression / hygiene** 14. Workshop registration flow still reaches `/workshops/<slug>/registered` with the name
read back. 15. `grep -rn "uppercase" src/app` — no new eyebrow above any heading. 16. `grep -rn "TODO" src/lib/specializations.ts src/lib/workshops.ts` includes the two new
sign-off TODOs. 17. `grep -rn '"ad:program-inquire"' src` → exactly two hits (carousel + form). 18. No orphaned processes: `ps aux | grep -iE "playwright|chromium|headless|next dev"` shows
nothing you started; your ports free.

A defect is: anything above failing, a hydration warning in the console on any of the four
touched routes, a layout jump when a card expands, or any change to the landing
specializations or companies marquee.
