# PLAN — Feedback pass 4 (programme cards, corporate inset, workshops filter)

> Chan's decisions were taken on 2026-09-24. This plan has **no open questions**.
> Coders make no design calls: every class, value and string below is already decided.
> If something here turns out to be impossible, stop and report `ESCALATE: <why>`. Don't
> improvise.
>
> Every coder reads these before starting: repo `CLAUDE.md`,
> `~/Programming/Iridel/tasks/RULES.md`, and the topic files named in your task.
> **This repo has no `DESIGN.md`.** The binding visual language is the existing components
> this plan points you at.
>
> Hard constraints:
>
> - **Never edit `src/app/_sections/companies-marquee.tsx` or `src/app/_components/companies-marquee.tsx`.**
> - A control whose fill changes on hover must also change its glow/shadow and its border or
>   ring colour. Every pill below already does this. Don't regress it.
> - Gallery hover only scales and never dims siblings. Nothing here touches it.
> - Chan has uncommitted edits in `MEETING-NOTES.md`. **Nobody touches that file.** Stage
>   explicit paths only (`git add <file>`). Never use `git add -A` or `git add .`.
> - Prettier (`prettier-plugin-tailwindcss`) may re-order classes inside the literals below.
>   That is expected and fine. The tests check tokens, not order.

---

## What Chan asked, and where each item lands

| #   | Ask                                                                             | Task |
| --- | ------------------------------------------------------------------------------- | ---- |
| 1   | Landing programme cards: Inquire at the bottom-right (desktop open + static)    | A    |
| 2   | Landing static/mobile cards: heavier, centred title, more space before bullets  | A    |
| 3   | Corporate carousel start inset must match the landing workshops row exactly     | A    |
| 4   | Corporate titles heavier at all sizes, centred on mobile, Inquire bottom-right  | A    |
| 5   | Workshops: "Filter by focus" and "Showing X of Y" on one line, space-between    | B    |
| 6   | Workshops: smaller chips on one row at every size, with a phone scroll and fade | B    |
| 7   | Workshops: the "More events coming soon" card fills the shorter grid column     | B    |

---

## Measurements this plan is built on

Taken 2026-09-24 against `main` @ a0c3049, served by the :3000 dev server running from the
main repo dir. Chromium, a fresh context per size.

### Carousel insets (item 3)

| Width | Landing workshops heading | Landing first workshop card | Corporate heading (now) | Corporate first card (now) | Other corporate h2s |
| ----- | ------------------------- | --------------------------- | ----------------------- | -------------------------- | ------------------- |
| 1024  | 32                        | **40**                      | 32                      | 32                         | 32                  |
| 1440  | 112                       | **40**                      | 32                      | 32                         | 112                 |
| 1920  | 352                       | **40**                      | 224                     | 224                        | 352                 |

- The landing row is `ROW` in `event-cards.tsx`: `px-6 sm:px-8 … lg:pl-10`. Below `lg` that is
  24px (<640) or 32px. From `lg` up it is a **constant 40px**. Its heading stays on the
  page's `max-w-7xl px-6 sm:px-8` column.
- The corporate rail's `lg:pl-[max(2rem,calc((100vw-96rem)/2+2rem))]` is where the 224px at
  1920 comes from. Its mobile padding (`px-6 sm:px-8`) already matches the landing row.
- **Heading decision:** follow the landing section. The rail starts at 40px, and the header
  goes back to the page's `max-w-7xl` column, so it lines up with every other corporate
  heading again (32/112/352). That also clears the Pass 3 known deviation, where this one
  heading sat left of all the others.

### Programme card titles (items 2 and 4)

- Font: Red Hat Display, with weights 300–900 loaded. Both components render titles at
  `font-semibold` (600). The workshop card titles on the same site use `font-extrabold`
  (800).
- I prototyped 700 and 800 with centring, `max-w-[15.5rem]` and an 8px bottom margin by
  injecting styles into the live page. Both weights fit with the same line counts: at most 2
  lines below `lg` and 3 at `lg`. **Decision: `font-extrabold`**, to match the workshop card
  titles.
- **Landing static card at 360px is tight.** The title top already sits at 28px from the card
  top (Leadership, Communications). With the new spacing it drops to **20px**, flush with the
  `p-5` padding. **Decision:** the landing rail card goes from 27rem to **28rem** below `lg`,
  which puts it at about 36px. The corporate mobile card has plenty of room (at least 96px), so
  it doesn't change.

### Inquire position (items 1 and 4)

- Today every Inquire is bottom-**left**. Measured right-edge gaps: landing mobile 153–176px,
  corporate mobile 163–188px, landing open card at 1440 was 308px.
- Corporate interactive: `DETAIL_INTERACTIVE` is a fixed `lg:w-[30rem]`. The active card is
  34rem wide with `lg:p-8`, which leaves exactly 30rem of content. Right-aligning Inquire inside
  that fixed wrapper puts it at the card's bottom-right in the end state. **No width or flex
  value changes, so the constant-row-width invariant holds.** During the 420ms widen, Inquire is
  clipped by the growing card and appears as the card reaches full width. That happens while the
  panel is fading in anyway, so it's accepted.
- The corporate Inquire sits inside `Collapse`'s `overflow-hidden`, flush with its right and
  bottom edges, so its outer `ring-2` focus ring is clipped there. The bottom was already clipped
  today. **Decision:** add `focus-visible:ring-inset` on the corporate Inquire only. The landing
  Inquire isn't inside an overflow box.

### Workshops filter (items 5 and 6)

- 7 chips: All plus 6 tags. Today each chip is 44px tall, 14px text, `px-4`. The row wraps to
  2 lines at 768/1024/1440 and 4 lines at 390. The "Showing" line sits below the chips under
  `lg` and to their right from `lg` up.
- I prototyped 12px text, `px-3`, `gap-1.5` and a 14px icon. Chip widths came to
  50/117/86/143/108/174/149, so the **row is 864px with 6px gaps**. The content width is 976px at
  1024 and 1232px at 1440, so the row **fits unscrolled from `lg` up**. It overflows at 768 (720px)
  and 390 (358px), so it scrolls there.

### "More events coming soon" placement (item 7)

The card lives in `src/app/_components/event-cards.tsx`, grid variant. The current rule is
"put it in the column that does not hold the last real card". It assumes the last card is
always on the right (for n ≥ 2), so for every n ≥ 2 the filler goes **left**. Measured at
1440, n=7: left column cards 1–4 end at y=3701, right column cards 5–7 end at 3237, and the
filler lands **left** at 3733–3989. The right column is left with 750px of empty space. That's
Chan's complaint.

The columns are `ceil(n/2)` / `floor(n/2)`. Every grid card is `lg:h-128` (512px), the gap is
32px, and the right column is offset down 80px (`lg:mt-20`). So:

- **n odd:** the left column has one extra card. Left bottom minus right bottom = 512 + 32 − 80 =
  **464px**, so the right column is shorter and **the filler goes right**.
- **n even:** the columns have equal counts. The right column's bottom is 80px lower, so the left
  column is shorter and **the filler goes left** (today's behaviour).

**Rule: `soonRight = n % 2 === 1`.** It holds for any count from 1 to 7 at the only
multi-column breakpoint (`lg`, 2 columns). Below `lg` the grid is a single horizontal rail, and
the separate mobile copy stays last. That rail is unchanged. n=1 (right) and every even n
(left) behave exactly as they do today. Only n = 3, 5, 7 move.

---

## How the work runs

A and B run **in parallel**, each in its own worktree branched from `main`. Their file sets
don't overlap (ownership table at the end).

```bash
# from /Users/chanchan/Programming/Iridel/demos/adrianding-DEMO
git worktree add ../adrianding-DEMO-wt4-A -b feedback-4/a-programme-cards main
git worktree add ../adrianding-DEMO-wt4-B -b feedback-4/b-workshops-filter main
# in each: cp -cR ../adrianding-DEMO/node_modules ./node_modules   (APFS clone, seconds)
```

| Task                                          | Branch                          | Dev port |
| --------------------------------------------- | ------------------------------- | -------- |
| A — programme cards (landing + corporate)     | `feedback-4/a-programme-cards`  | 3401     |
| B — workshops filter bar + soon-card position | `feedback-4/b-workshops-filter` | 3402     |

A dev server may already be running on **:3000 from the main repo dir. It is not yours. Never
kill it and never test against it.** Start yours inside your own worktree with
`npx next dev -p 340X` and record the PID. Before reporting, kill that PID and every
browser/context you opened, on the failure path too (`finally`). Verify: `lsof -i :340X` →
empty, and `ps aux | grep -iE "playwright|chromium|headless"` → nothing you started. Never
`pkill -f next`.

Playwright: `node_modules/playwright-core` is installed and Chromium is in
`~/Library/Caches/ms-playwright`. Use a **fresh context per viewport**. Mouse:
`{ viewport: { width: W, height: 900 } }`. Phone:
`{ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }`. Touch tablet:
`{ viewport: { width: 1024, height: 768 }, hasTouch: true }`. Read
`tasks/rules/09-verification.md` before you trust a capture. `boundingBox()` goes stale during
transitions, so wait 700ms after any hover before measuring.

Merge order: A → B into `main`, with explicit-path commits. No conflicts are expected. Then the
tester runs the checklist at the bottom once, on the merged tree.

**DoD common to both tasks:** `npm run typecheck` → exit 0. `npx eslint src` → 0 problems.
`npx prettier --check src` → clean (A also runs `npx prettier --check PRD.md`).
`npm run build` → exit 0. Then the Playwright checks listed per task.

---

## Task A — Programme cards: landing + corporate (items 1–4)

**Owns:** `src/app/_components/spec-reveal-cards.tsx`, `src/app/_components/program-carousel.tsx`, `PRD.md`.
(`src/app/_sections/specializations.tsx` and `src/app/corporate-training/_sections/programs.tsx`
need **no** change. Don't edit them.)
**Read first:** `tasks/rules/05-responsive.md` §14 and §19, `04-styling.md` (literal class
strings only, never built from variables), `06-accessibility.md`, `02-motion.md` §10.

### A0. The shared static-title literal

Paste this constant **character for character** into **both** `spec-reveal-cards.tsx` and
`program-carousel.tsx`, with this comment above it in both files:

```ts
// Static (touch / below lg) card title — IDENTICAL literal in
// spec-reveal-cards.tsx and program-carousel.tsx (feedback pass 4,
// 2026-09-24): extra-bold like the workshop card titles, centred on
// phones with 24px to the bullets (mb-2 + the column's 16px gap). From lg
// (touch tablets only reach this) it drops back to left-aligned.
const TITLE_STATIC =
  "mx-auto mb-2 max-w-[15.5rem] text-center text-xl leading-tight font-extrabold tracking-[-0.01em] text-balance text-white lg:mx-0 lg:mb-0 lg:shrink-0 lg:text-left lg:text-[1.65rem]"
```

The 24px comes from `mb-2` (8px) plus the column gap: landing `gap-4` = 16px, and corporate
`gap-3` (12px) plus the detail's `pt-1` (4px) = 16px.

### A1. `spec-reveal-cards.tsx` (landing)

1. Rename the existing `TITLE` constant to `TITLE_INTERACTIVE` and **keep its value
   byte-identical** (`font-semibold`; see the judgement call below). Add `TITLE_STATIC` from A0.
2. Rail height below `lg`: `const RAIL_H = "27rem"` → `"28rem"`. In the card's class string,
   `h-[27rem]` → `h-[28rem]`. They must match. Rewrite the `RAIL_H` comment's numbers:
   "Raised 24rem → 27rem (2026-09-24) and 27rem → 28rem (pass 4): the heavier, centred title with
   24px to the bullets left the title only 20px from the card top at 360px wide. 28rem gives
   about 36px." `EXPANDED_H` and `COLLAPSED_H` stay unchanged.
3. Detail branch `<h3 className={TITLE}>` → `<h3 className={interactive ? TITLE_INTERACTIVE : TITLE_STATIC}>`.
   Blurb branch `<h3 className={TITLE}>` → `<h3 className={TITLE_INTERACTIVE}>`.
4. Inquire goes bottom-right. Wrap the `<a>` in a new div, and remove `mt-5` from the `<a>`'s
   classes:
   ```tsx
   <div className="mt-5 flex justify-end">
     <a
       href={`/corporate-training?program=${item.key}#inquiry`}
       className={cn(
         INQUIRE_PILL,
         "pointer-events-auto focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
       )}
     >
       … children unchanged …
     </a>
   </div>
   ```
   Keep the plain-`<a>` comment above it.
5. In the doc-comment, add to the content-mode paragraph: "Inquire sits bottom-right. Static
   (touch / below lg) titles are extra-bold and centred on phones via `TITLE_STATIC`, the same
   literal as `program-carousel.tsx` (pass 4, 2026-09-24)."

### A2. `program-carousel.tsx` (corporate)

1. **Inset (item 3).**
   - Header wrapper `className="mx-auto max-w-[96rem] px-6 sm:px-8"` →
     `className="mx-auto max-w-7xl px-6 sm:px-8"`.
   - In `RAIL`, replace `lg:pl-[max(2rem,calc((100vw-96rem)/2+2rem))]` with `lg:pl-10`. Change
     nothing else in `RAIL`: `lg:pr-0` and the trailing `w-px lg:w-8` spacer stay.
   - Rewrite the doc-comment's "The inset:" paragraph to: "The inset (pass 4, 2026-09-24):
     the rail starts at a constant 40px (`lg:pl-10`) at every desktop width, identical to the
     landing workshops row (`ROW` in `event-cards.tsx`). The header stays on the page's 80rem
     column like every other heading, which is also what the landing workshops section does.
     History: 80rem column → 96rem column (pass 3) → constant 40px (pass 4)."
2. **Titles (item 4).** Add `TITLE_STATIC` from A0 and:
   ```ts
   // Desktop + pointer card title. Extra-bold at all sizes (pass 4, 2026-09-24).
   // max-w keeps the text from reflowing while the card widens (see SIBLING_REM).
   const TITLE_INTERACTIVE =
     "max-w-[15.5rem] text-xl leading-tight font-extrabold tracking-[-0.01em] text-balance text-white lg:text-[1.65rem]"
   ```
   Replace the `<h3>`'s inline class string with `className={interactive ? TITLE_INTERACTIVE : TITLE_STATIC}`.
3. **Inquire bottom-right (item 4).** In `detail`, wrap the `<a>` in
   `<div className="mt-5 flex justify-end">`, remove `mt-5` from the `<a>`, and add
   `focus-visible:ring-inset`. The `<a>`'s className becomes:
   `` `${REGISTER_PILL} pointer-events-auto focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset focus-visible:outline-none` ``
   Add a comment above the wrapper: "Bottom-right (pass 4). In interactive mode this sits inside
   the fixed 30rem `DETAIL_INTERACTIVE`, which is exactly the active card's content width, so it
   lands at the card's bottom-right without touching any width. ring-inset because `Collapse`'s
   overflow-hidden clips an outer ring at this edge."
   `DETAIL_INTERACTIVE`, `DETAIL_STATIC`, `REST_REM`, `ACTIVE_REM`, `SIBLING_REM` and `CARD` stay
   **unchanged**.

### A3. `PRD.md`

Three exact edits. Use the Edit tool with these find strings.

1. In the line starting `3. **Programs we run**`, replace
   `The first card lines up with the header, and both sit on a 96rem column (32px from the left edge up to 1536px wide), so the row starts near the left edge and runs off the right.`
   with
   `The header sits on the page's 80rem content column like every other heading. The card row starts 40px from the left edge at every desktop width, identical to the landing page's workshop row, and runs off the right (2026-09-24, pass 4). Card titles are extra-bold, centred on phones, and Inquire sits at each card's bottom-right.`
2. At the end of the line starting `6. **Areas of Specialization** (`, after `Updated 2026-09-24.`, append:
   ` Pass 4 (2026-09-24): Inquire sits at the card's bottom-right; on touch/mobile the title is extra-bold and centred with more room before the bullets.`
3. Directly after the bullet starting `- **Focus tags (added 2026-09-19, client feedback):**`, insert this new bullet:
   `- **Filter bar (2026-09-24, pass 4):** "Filter by focus" and "Showing X of Y workshops" share one line (space-between). The chips below are smaller (32px pill, 44px touch target) and always sit on a single row, which scrolls sideways with an edge fade wherever it doesn't fit (below 1024px). On the desktop grid, the "More events coming soon" card fills the shorter column: right when the filtered count is odd, left when it's even.`

### A — Definition of done

Common DoD, plus:

- `grep -c 'const TITLE_STATIC =' src/app/_components/spec-reveal-cards.tsx src/app/_components/program-carousel.tsx`
  → 1 each. The two literal lines are identical:
  `diff <(grep -A1 'const TITLE_STATIC' src/app/_components/spec-reveal-cards.tsx) <(grep -A1 'const TITLE_STATIC' src/app/_components/program-carousel.tsx)` → no output.
- `grep -n "96rem" src/app/_components/program-carousel.tsx` → empty.
- `git diff main -- src/app/_components/event-cards.tsx src/app/_sections/specializations.tsx src/app/corporate-training/_sections/programs.tsx` → empty.
- Dev server :3401. Playwright, fresh context per size:
  - **Corporate inset, `/corporate-training` vs `/` at 1024, 1440 and 1920 (mouse):** the
    corporate first card's `getBoundingClientRect().left` = the landing first workshop card's
    left = **40** at all three. The "Programs we run in-house" heading left = **32 / 112 / 352**,
    equal to the "You'd be in good company" h2 left on the same page. At **390 phone**, both
    first cards are at **24**. The row still bleeds off the right. The arrows show and work.
  - **Corporate 1440 mouse:** every card `h3` has computed `font-weight` **800** and
    `text-align` left. Hover card 3 and wait 700ms: its Inquire right gap
    (`card.right − a.right`) = **32 ±1** and bottom gap = **32 ±1**. `rail.scrollWidth` is equal
    before, during and after the hover (the invariant still holds). Keyboard: Tab to card 1 →
    Tab to its Inquire. The white focus ring is fully visible on all four sides (screenshot the
    pill).
  - **Corporate 390 phone and 360 phone:** for all 10 cards, the `h3` has weight 800 and
    `text-align: center`. The h3's horizontal centre = the card's centre ±2px. The gap from the
    `h3` bottom to the "Useful for" `p` top = **24 ±1**. Inquire right gap = **24 ±1**, bottom
    gap = **24 ±1**. Nothing is clipped (the h3 top is at least 16px below the card top).
  - **Corporate 1024 touch tablet:** static cards. The h3 is weight 800 and left-aligned.
    Inquire right and bottom gaps are both **32 ±1**.
  - **Landing `/` 390 phone and 360 phone:** 6 rail cards at height **448** (28rem). The h3 is
    weight 800 and centred (centre ±2px). The h3→"Useful for" gap = **24 ±1**. Inquire right and
    bottom gaps = **20 ±1**. For every card, h3 top − card top ≥ **30** (expected about 36 at 360).
  - **Landing 1440 mouse:** card 1 is open. Its h3 keeps weight **600** (unchanged) and Inquire
    right gap = **32 ±1**. Collapsed cards: h3 weight 600, blurb visible, layout unchanged.
    Hover card 4 and wait 700ms: its Inquire right gap = 32 ±1.
  - **Landing 1024 mouse:** collapsed cards still fit (each `p` and `h3` top ≥ the card top).
    The open card's Inquire right and bottom gaps are both 32 ±1.
  - **Landing 1024 touch tablet:** static row cards. The h3 is weight 800 and left-aligned.
    Inquire right gap = 32 ±1.
  - Clicking Inquire still navigates: landing → `/corporate-training?program=<key>#inquiry`
    with a full load. Corporate → replaces the URL and scrolls to `#inquiry`.
  - No hydration warnings in the console on `/` or `/corporate-training`.
- Kill the dev server and browser. `lsof -i :3401` → empty.

---

## Task B — Workshops filter bar + soon-card placement (items 5–7)

**Owns:** `src/app/_components/workshop-tag-filter.tsx`, `src/app/_components/event-cards.tsx`.
(`src/app/workshops/_sections/list.tsx` needs **no** change. Don't edit it.)
**Read first:** `tasks/rules/06-accessibility.md` (44px targets via `min-h-11`),
`05-responsive.md` §14 and §19, `04-styling.md`, `07-nextjs.md` (hydration),
`01-layout.md` §5 (overflow).

### B1. `workshop-tag-filter.tsx`: layout (items 5 and 6)

1. Add imports: `useEffect, useRef` (alongside `useMemo, useState`) and
   `import { cn } from "@/lib/utils"`.
2. Replace the three `chipBase`/`chipOff`/`chipOn` locals with these **module-level** literals
   (delete the locals):

   ```ts
   // Chips (pass 4, 2026-09-24): smaller visual pill (h-8, text-xs) inside
   // a 44px hit area. The <button> is the hit area (min-h-11, RULES §20);
   // the inner <span> is what you see. Hover/focus are driven off the button
   // via group-*/chip. The fill, ring and text colours all change together on
   // hover (memory rule).
   const CHIP_HIT =
     "group/chip inline-flex min-h-11 shrink-0 items-center focus-visible:outline-none"
   const CHIP_PILL =
     "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium whitespace-nowrap ring-1 transition-colors duration-200 motion-reduce:transition-none group-focus-visible/chip:ring-2 group-focus-visible/chip:ring-brand group-focus-visible/chip:ring-offset-2 group-focus-visible/chip:ring-offset-background"
   const CHIP_OFF =
     "text-muted-foreground ring-border group-hover/chip:text-foreground group-hover/chip:ring-foreground"
   const CHIP_ON =
     "bg-brand text-brand-foreground ring-brand group-hover/chip:bg-brand-accent group-hover/chip:ring-brand-accent"

   // One row at every size. Wherever the row doesn't fit (measured: below 1024px;
   // the row is about 864px), it scrolls sideways with the scrollbar hidden and
   // fades the edge(s) that have more chips behind them. -mx/px bleed the scroller
   // to the viewport gutter while the first chip lines up with the label.
   const CHIP_ROW =
     "no-scrollbar -mx-4 mt-2 flex flex-nowrap items-center gap-1.5 overflow-x-auto scroll-px-4 px-4 sm:-mx-6 sm:scroll-px-6 sm:px-6"
   const FADE_RIGHT =
     "[mask-image:linear-gradient(to_right,#000_calc(100%-2.5rem),transparent)]"
   const FADE_LEFT =
     "[mask-image:linear-gradient(to_left,#000_calc(100%-2.5rem),transparent)]"
   const FADE_BOTH =
     "[mask-image:linear-gradient(to_right,transparent,#000_2.5rem,#000_calc(100%-2.5rem),transparent)]"
   ```

3. Edge state for the fade. Add this inside the component. It's the same sync pattern as
   `program-carousel.tsx`.

   ```tsx
   const rowRef = useRef<HTMLDivElement>(null)
   // Starts with no fade, so SSR and first paint agree (RULES §10); corrected after mount.
   const [edges, setEdges] = useState({ left: false, right: false })
   useEffect(() => {
     const el = rowRef.current
     if (!el) return
     let raf = 0
     const sync = () => {
       raf = 0
       const { scrollWidth: sw, clientWidth: cw, scrollLeft } = el
       const overflow = sw - cw > 1
       setEdges({
         left: overflow && scrollLeft > 1,
         right: overflow && scrollLeft < sw - cw - 1,
       })
     }
     const queue = () => {
       if (!raf) raf = requestAnimationFrame(sync)
     }
     sync()
     el.addEventListener("scroll", queue, { passive: true })
     const ro = new ResizeObserver(queue)
     ro.observe(el)
     return () => {
       el.removeEventListener("scroll", queue)
       ro.disconnect()
       if (raf) cancelAnimationFrame(raf)
     }
   }, [chips.length])
   const fade =
     edges.left && edges.right
       ? FADE_BOTH
       : edges.right
         ? FADE_RIGHT
         : edges.left
           ? FADE_LEFT
           : ""
   ```

4. Replace the whole top `<div className="mx-auto mb-8 flex max-w-7xl flex-col …">…</div>`
   block (label, chips and count) with:

   ```tsx
   <div className="mx-auto mb-8 max-w-7xl px-4 sm:px-6 lg:mb-12">
     <div className="flex items-baseline justify-between gap-4">
       <span
         id="workshop-filter-label"
         className="text-muted-foreground text-sm font-medium"
       >
         Filter by focus
       </span>
       <p
         aria-live="polite"
         className="text-muted-foreground text-sm tabular-nums"
       >
         Showing {filtered.length} of {workshops.length} workshops
       </p>
     </div>
     <div
       ref={rowRef}
       role="group"
       aria-labelledby="workshop-filter-label"
       className={cn(CHIP_ROW, fade)}
     >
       <button
         type="button"
         aria-pressed={selected.length === 0}
         onClick={() => setSelected([])}
         className={CHIP_HIT}
       >
         <span
           className={cn(CHIP_PILL, selected.length === 0 ? CHIP_ON : CHIP_OFF)}
         >
           All
           <span className="tabular-nums opacity-60">{workshops.length}</span>
         </span>
       </button>
       {chips.map((tag) => {
         const Icon = WORKSHOP_TAG_ICONS[tag]
         const on = selected.includes(tag)
         return (
           <button
             key={tag}
             type="button"
             aria-pressed={on}
             onClick={() => toggle(tag)}
             className={CHIP_HIT}
           >
             <span className={cn(CHIP_PILL, on ? CHIP_ON : CHIP_OFF)}>
               <Icon className="size-3.5" aria-hidden />
               {tag}
               <span className="tabular-nums opacity-60">
                 {counts.get(tag)}
               </span>
             </span>
           </button>
         )
       })}
     </div>
   </div>
   ```

   The empty-state block and the `<EventCards … variant="grid" />` below it stay unchanged.

5. Add a paragraph to the doc-comment: "Layout (pass 4, 2026-09-24): label and 'Showing X of Y'
   on one line, space-between. The chips sit on one row below them at every size: 32px visual
   pills in 44px hit areas, scrolling sideways with an edge fade wherever the row doesn't fit
   (below 1024px)."

### B2. `event-cards.tsx`: soon-card placement (item 7)

Change **only** the grid-variant placement logic and its comments. `ROW`, `CARD`, `GRID_ROW`,
`GRID_COL`, `GRID_HOVER`, `renderCard`, `renderSoonCard` and the row variant stay
byte-identical.

1. Replace:
   ```ts
   const lastCardIsRight = right.length > 0
   const soonDesktop = renderSoonCard("soon-desktop", "hidden lg:flex")
   if (lastCardIsRight) left.push(soonDesktop)
   else right.push(soonDesktop)
   ```
   with:
   ```ts
   // The soon-card fills whichever column ends higher (pass 4, 2026-09-24).
   // Every grid card is lg:h-128 (512px), the gap is 32px and the right
   // column starts 80px lower (lg:mt-20). Odd n: left holds one extra card
   // and ends 512 + 32 − 80 = 464px lower than right → soon goes right.
   // Even n: equal counts, right ends 80px lower → soon goes left.
   // Holds for every n ≥ 1. Re-derive if card height, gap or the offset changes.
   const soonRight = workshops.length % 2 === 1
   const soonDesktop = renderSoonCard("soon-desktop", "hidden lg:flex")
   if (soonRight) right.push(soonDesktop)
   else left.push(soonDesktop)
   ```
2. In the comment block directly above (the one starting "Left column holds the first half of
   the list…"), replace the sentences from "the last real workshop always lands in the right
   column" through "…stacking directly under the final workshop." with: "The soon-card goes in
   the shorter column, i.e. right when the count is odd and left when it's even (see the math at
   the push below)." Keep the "That desktop placement is rendered as a second,
   breakpoint-gated copy…" paragraph as it is.
3. In the file's top doc-comment, replace
   `The pinned "more coming soon" card is just appended as the last item, so it lands wherever the list naturally ends — no odd/even special-casing needed.`
   with
   `On the grid, the pinned "more coming soon" card fills the shorter column: right when the count is odd, left when it's even (pass 4). On mobile it's last in the rail.`
   That sentence is already stale. The code has placed it by column since pass 2.

### B — Definition of done

Common DoD, plus:

- `git diff main -- src/app/_components/event-cards.tsx` touches only the placement lines and
  comments above. `grep -n 'lg:pl-10' src/app/_components/event-cards.tsx` still hits `ROW`.
- `grep -n "chipBase" src/app/_components/workshop-tag-filter.tsx` → empty.
- Dev server :3402, `/workshops`, Playwright, fresh context per size:
  - **Same line (item 5), at 390 phone, 768 touch, 1024 mouse and 1440 mouse:** the
    `#workshop-filter-label` and "Showing…" `p` tops are within 4px of each other. The label's
    left = the gutter (16 at 390, 24 at 768/1024, 104 at 1440). The `p`'s right = viewport width
    minus the same gutter, ±1.
  - **One row (item 6):** every `[role=group] button` has the same `top`, and each button's
    height is ≥ **44**. Each inner pill `span`'s height is **32**. The `[role=group]` scroller's
    top is below the label's bottom.
    - At 1024 and 1440 mouse: `scrollWidth <= clientWidth` (no scroll), and the computed
      `mask-image` is `none`.
    - At 390 phone and 768 touch: `scrollWidth > clientWidth`. With `scrollLeft = 0` the
      computed `mask-image` contains `linear-gradient` and fades right only (the class is
      `FADE_RIGHT`). Scroll to the end: left only. Scroll to the middle: both. The page itself
      has no horizontal overflow (`document.documentElement.scrollWidth === innerWidth`).
    - A touch swipe on the row scrolls it at 390.
  - **Chips still work:** tapping or clicking toggles `aria-pressed` and updates "Showing X of 7
    workshops". Keyboard at 1440: Tab lands on each chip in order, the brand focus ring with
    offset shows on the pill and isn't clipped top or bottom, and Space/Enter toggles. Hovering
    the "All" chip while it's selected changes both its fill and its ring colour to
    `brand-accent` (read the computed `background-color` and `box-shadow` before and after).
  - **Soon-card (item 7), at 1024 and 1440 mouse.** Select these chip combinations (OR
    semantics) and check each count:

    | Selection                           | n   | Soon column |
    | ----------------------------------- | --- | ----------- |
    | Coaching                            | 1   | right       |
    | Leadership                          | 2   | left        |
    | Coaching + Sales                    | 3   | right       |
    | Communication                       | 4   | left        |
    | Communication + Coaching            | 5   | right       |
    | Communication + Customer Experience | 6   | left        |
    | All                                 | 7   | right       |

    Column x positions: left = 24 / right = 528 at 1024, and left = 104 / right = 736 at 1440.
    The soon card's top = the bottom of the last real card in its column + **32 ±1**. For n=1,
    it's the right column's top, i.e. the first card's top + 80 ±1. At n=7, 1440, expect about
    3269–3525.

  - **Below lg (390 phone):** the grid is still one horizontal rail with the soon-card last, and
    only one soon card is visible (`display` ≠ none).
  - **Landing `/` row regression, 1440 mouse:** the first workshop card left = 40. The hover
    take-over still widens. Pills are visible at rest and while hovered.

- Kill the dev server and browser. `lsof -i :3402` → empty.

---

## File ownership (no file appears twice)

| File                                          | Owner | Change                                                          |
| --------------------------------------------- | ----- | --------------------------------------------------------------- |
| `src/app/_components/spec-reveal-cards.tsx`   | A     | `TITLE_STATIC`, 28rem rail, Inquire bottom-right                |
| `src/app/_components/program-carousel.tsx`    | A     | 40px rail + 80rem header, `TITLE_*`, Inquire bottom-right       |
| `PRD.md`                                      | A     | three line edits (incl. the workshops filter bullet)            |
| `src/app/_components/workshop-tag-filter.tsx` | B     | one-line header, smaller chips, one-row scroller with edge fade |
| `src/app/_components/event-cards.tsx`         | B     | soon-card parity rule + comments only                           |

Read-only for everyone: `companies-marquee.tsx` (both), `_sections/specializations.tsx`,
`corporate-training/_sections/programs.tsx`, `workshops/_sections/list.tsx`,
`workshop-tags.tsx`, `use-is-touch.ts`, `globals.css`, `src/lib/*`, `MEETING-NOTES.md`,
`README.md`.

---

## Judgement calls, flagged rather than hidden

- **The landing desktop title stays `font-semibold`.** Chan scoped the landing ask to
  mobile/static cards and the corporate ask to "all sizes". So the landing desktop (mouse)
  title is unchanged. If he wants it heavier too, it's a one-token change
  (`font-semibold` → `font-extrabold` in `TITLE_INTERACTIVE`, `spec-reveal-cards.tsx`).
- **Weight 800, not 700**, to match the workshop card titles on the same pages. Both weights
  fit, measured.
- **Corporate first card moves from 32 to 40px at 1024/1440**, because "match the landing row
  exactly" means 40, not "less". At 1920 it goes from 224 to 40, which is the part Chan
  actually complained about.
- **The corporate heading now sits 72px right of its first card at 1440** (112 vs 40). This is
  the same relationship the landing workshops section has (112 heading vs 40 cards), and it
  puts this heading back in line with every other heading on the page.
- **The chip row also scrolls on tablets (768)**, not only phones. "One row at every size"
  can't hold without scrolling at 720px of content. The fade shows it scrolls there too.
- **During the corporate widen, Inquire is clipped** until the card reaches full width, because
  it's anchored to the right of the fixed 30rem panel. It appears as the panel fades in.
  The alternative, a width that reflows, would break the no-reflow invariant.

## Out of scope

- Moving the corporate arrows under the carousel, like the landing row. Not asked for.
- Any change to the landing workshops row itself, or to `EventCards` row behaviour.
- Mobile chip design beyond size and the row (no "clear" button, no count in the header).

---

## Tester checklist (merged tree, after A → B land on `main`)

First run `npm run typecheck && npx eslint src && npx prettier --check src PRD.md && npm run build`.
All four must exit 0. Then start `npx next dev -p 3403` from the main repo dir (don't use :3000
unless you've confirmed it serves the merged HEAD; if you start anything, record the PID and
kill it). Use a fresh Playwright context per size: 1920, 1440 and 1024 mouse, 1024 touch
tablet, 768 touch, and 390 and 360 phone. Light mode, then dark mode (`.dark` on `<html>`).
Then `reducedMotion: "reduce"` at 1440.

**Programme cards**

1. Corporate: the first card's left edge equals the landing first workshop card's left edge at
   1024, 1440 and 1920 (40), and at 390 (24). The corporate heading lines up with the page's
   other h2s (32/112/352).
2. Corporate titles have weight 800 at every size, and are centred at 390/360.
3. Landing titles have weight 800 and are centred at 390/360 (static cards). At 1440 mouse they
   stay 600.
4. The gap from title to "Useful for" is 24px on static cards in both components.
5. Inquire sits bottom-right on every static card (both pages, phone and touch tablet), on the
   landing open card at 1024/1440, and on the hovered corporate card once it has settled. The
   right gap equals the card padding (20 landing phone, 24 corporate phone, 32 at lg).
6. No title or Inquire is clipped on any card at 360 (the landing card is now 448px tall).
   Corporate `rail.scrollWidth` stays constant through hover. Sweeping the pointer across the
   cards causes no flicker.
7. Keyboard: the corporate Inquire focus ring is fully visible. Landing and corporate Inquire
   links still navigate and prefill (`?program=<key>#inquiry` → "Enquiring about <title>").

**Workshops**

8. The label and "Showing X of Y" are on one line at every tested size.
9. The chips are on one row at every size. At 1024 and above there's no scroll and no fade.
   At 768 and 390 they scroll, with the fade on the side(s) that have more chips. Hit areas are
   ≥ 44px. Focus rings aren't clipped. There's no page-level horizontal overflow.
10. The soon-card follows the parity table in Task B at 1024 and 1440 for n = 1–7. It never
    stacks under a left-column card while the right column has empty space below it.
11. The empty state (for example, deselect everything except a chip that you then untoggle)
    and "Show all workshops" still work.

**Regression / hygiene**

12. Landing workshops row: first card at 40, hover take-over intact, pills visible at rest and
    on hover.
13. The companies marquee is unchanged:
    `git diff a0c3049 -- src/app/_sections/companies-marquee.tsx src/app/_components/companies-marquee.tsx` → empty.
14. `grep -rn "uppercase" src/app` shows no new eyebrow above a heading.
15. There are no hydration warnings on `/`, `/corporate-training` or `/workshops` (including one
    reload with reduced motion).
16. Cleanup: `lsof -i :<your port>` → empty, and
    `ps aux | grep -iE "playwright|chromium|headless"` shows nothing you started.

Any of these counts as a defect: an item above failing, a clipped or ellipsised title,
bullet or Inquire, a hover flicker, a layout jump in the corporate row, a chip row that wraps,
a filler card sitting under a left-column card while the right column is shorter, or any
visual change to the companies marquee or the gallery hover.
