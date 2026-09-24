# PLAN — Feedback pass 3 (programme cards, placeholders, tiles, copy)

> Chan's decisions were taken on 2026-09-24. This plan contains **no open questions**.
> Coders do not make design calls. Every class, size, string and duration below is decided.
> If something here is genuinely impossible, stop and report `ESCALATE: <why>`. Do not
> improvise.
>
> Binding reading for every coder before starting: repo `CLAUDE.md`,
> `~/Programming/Iridel/tasks/RULES.md`, and the topic files named in your task.
> **`DESIGN.md` does not exist in this repo.** The binding visual language is the existing
> components this plan tells you to copy from. Do not invent tokens.
>
> Hard constraints (from memory / Chan):
>
> - **Never edit `src/app/_sections/companies-marquee.tsx` or `src/app/_components/companies-marquee.tsx`.**
> - A control whose fill changes on hover must change its glow/shadow and border colour too.
> - Gallery hover only scales and never dims siblings. This plan does not touch it, so do not regress it.
> - `MEETING-NOTES.md` has uncommitted edits by Chan. **Nobody touches it.** Stage explicit
>   paths only (`git add <file>`), never `git add -A` / `git add .`.
> - Don't touch `src/app/_components/event-cards.tsx` or `workshop-tags.tsx`. See item 7: no code
>   change is needed there.

---

## What Chan asked, and where each item lands

| #   | Ask                                                                                     | Where                                                              |
| --- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 1   | Corporate carousel: first card too far in from the left                                 | Task A                                                             |
| 2   | 4 placeholder programmes (10 total) on corporate + form; landing keeps the real 6       | Phase 0 (data), Task A (carousel), Task C (form)                   |
| 3   | Resting = title + full description; hovered = title + bullets + Inquire (both sections) | Task A (corporate), Task B (landing)                               |
| 4   | Touch / below `lg`: no expand at all. Static title + bullets + Inquire                  | Task A, Task B                                                     |
| 5   | "Also interested in" becomes selectable tiles                                           | Task C                                                             |
| 6   | Copy rewrite of both programme sections (explicitly in-house corporate)                 | Task A (`programs.tsx`), Task B (`specializations.tsx`)            |
| 7   | Landing workshop tag pills visible at rest **and** on hover                             | **Already true, measured.** Tester guards it. No code (see below). |

### Item 7 finding (measured 2026-09-24 against `main` @ 91a834e, served by the running :3000)

The pills (`ul[aria-label="Focus areas"]`, `z-[1]`, top of each card) render and are
unobstructed at rest **and** while hovered:

- **Chromium:** measured at 1024, 1280 and 1440, hovering every one of the 7 row cards.
- **WebKit / Safari engine:** measured at 1024 and 1440, with 8 frames captured across the 600 ms widen transition.
- **Touch emulation:** measured at 390, 768 and 1024.

The pill row's bottom sits at 48 px from the card top. The content block's first line (the
date) never rises above 211 px, even when expanded. The `elementFromPoint` hit-test at the pill centre
returns the pill. The pills came in with task A of the feedback-2 pass, merged earlier on
2026-09-24. Whatever Chan saw was most likely a build from before that merge, or a stale dev
server. **No code change.** If the tester reproduces a missing or covered pill in any engine,
report it as a defect with the engine, width and card index. Don't patch it speculatively
(`~/Programming/CLAUDE.md`: no fixes for unobserved problems).

---

## How the work runs

**Phase 0 runs first, serially, and is small.** It owns the shared data file both A and C
import from. Once it is committed, A, B and C run **in parallel**, each in its own git worktree
branched from Phase 0's branch. Their file sets are disjoint (ownership table at the end).

```bash
# from /Users/chanchan/Programming/Iridel/demos/adrianding-DEMO
git worktree add ../adrianding-DEMO-wt-0 -b feedback-3/0-programme-data main
cd ../adrianding-DEMO-wt-0 && cp -cR ../adrianding-DEMO/node_modules ./node_modules
#   ... Phase 0 work, validate, build, commit ...
cd ../adrianding-DEMO
git worktree add ../adrianding-DEMO-wt-A -b feedback-3/a-corporate-carousel feedback-3/0-programme-data
git worktree add ../adrianding-DEMO-wt-B -b feedback-3/b-landing-programmes feedback-3/0-programme-data
git worktree add ../adrianding-DEMO-wt-C -b feedback-3/c-inquiry-tiles     feedback-3/0-programme-data
# in each: cp -cR ../adrianding-DEMO/node_modules ./node_modules   (APFS clone, seconds)
```

| Task                                          | Branch                            | Dev port |
| --------------------------------------------- | --------------------------------- | -------- |
| 0 — programme data + PRD                      | `feedback-3/0-programme-data`     | none     |
| A — corporate carousel (inset, content, copy) | `feedback-3/a-corporate-carousel` | 3201     |
| B — landing programme cards (content, copy)   | `feedback-3/b-landing-programmes` | 3202     |
| C — inquiry form programme tiles              | `feedback-3/c-inquiry-tiles`      | 3203     |

A dev server may already be running on **:3000 from the main repo dir. It is not yours.
Never kill it and never test against it.** Start yours with `npx next dev -p 320X` inside your
own worktree and record the PID. Kill that PID, and every browser/context you opened, before
reporting. Do it on the failure path too (`finally`). Verify with `lsof -i :320X` → empty and
`ps aux | grep -iE "playwright|chromium|headless|webkit"` → nothing you started. Never
`pkill -f next`.

Merge order once all are green: 0 → A → B → C into `main`. No conflicts are expected because
the files are disjoint. Then the tester runs the **integration checklist** at the bottom once, on
the merged tree.

**Playwright:** `node_modules/playwright-core` is installed. Chromium and WebKit browser
builds are in `~/Library/Caches/ms-playwright` (WebKit v2359 was downloaded on 2026-09-24).
Use fresh contexts per viewport. Mobile checks use
`{ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }`. Tablet-touch
checks use `{ viewport: { width: 1024, height: 768 }, hasTouch: true }`. Read
`tasks/rules/09-verification.md` before trusting a capture.

---

## Phase 0 — Programme data + PRD (serial, one coder, ~10 min)

**Read first:** RULES.md §3 (data in `src/lib/` is fine for shared records).

**Why a separate list instead of a flag filter:** three existing consumers read
`SPECIALIZATIONS` and must keep exactly six. `about/_sections/numbers.tsx` shows
`SPECIALIZATIONS.length` as "Core program tracks". `_components/site-cta.tsx` maps every
key through a six-entry `FOCUS_TAGS` record, so an unknown key renders `undefined`. The landing
also reads it. So `SPECIALIZATIONS` stays the real six, **unchanged**. The placeholders live in
their own array and carry a `placeholder: true` flag, and a combined `CORPORATE_PROGRAMMES` feeds
only the corporate carousel and the form.

### 0.1 `src/lib/specializations.ts`

1. Add `TrendingUp, HeartHandshake, RefreshCw, Brain` to the `lucide-react` import.
2. Add to the `Specialization` type, after `icon`:
   ```ts
     /** Demo-only programme, not confirmed with Adrian — shown on the corporate
      *  page (carousel + inquiry form) so the long list can be judged. Never on the
      *  landing page, About numbers or the site CTA (those read `SPECIALIZATIONS`). */
     placeholder?: true
   ```
3. Leave `SPECIALIZATIONS` byte-identical.
4. Directly after `SPECIALIZATIONS`, add the block below verbatim. Each entry carries its own
   TODO line.

```ts
/**
 * Four placeholder programmes (added 2026-09-24) so the corporate carousel and
 * the inquiry form can be seen with a long list. Plausible for Adrian's
 * practice (sales, service, change, EQ) but NOT confirmed — confirm or delete
 * each with Adrian before handoff.
 */
export const PLACEHOLDER_PROGRAMMES: Specialization[] = [
  // TODO: placeholder programme — confirm with Adrian
  {
    key: "sales-leadership",
    title: "Sales Leadership & Coaching",
    blurb:
      "Helping sales managers coach, not just chase — so the whole floor lifts its numbers, not only the stars.",
    detail:
      "For sales managers who got the job by selling: how to coach reps in the field and in the huddle, run a pipeline review that changes behaviour, and build a floor where the middle of the team moves, not just the stars.",
    usefulFor: [
      "Sales managers promoted from top-producer roles",
      "Teams where a few stars carry the target and the rest trail behind",
      "Organisations launching a new product, territory or sales process",
      "Leaders who want weekly coaching huddles that actually move numbers",
    ],
    icon: TrendingUp,
    placeholder: true,
  },
  // TODO: placeholder programme — confirm with Adrian
  {
    key: "customer-service",
    title: "Customer Service Excellence",
    blurb:
      "Service customers talk about — the standards, language and recovery habits every frontliner can use.",
    detail:
      "Service standards, the language that de-escalates, and a recovery routine for when things go wrong — practised on real scenarios from your own counters, calls and chats.",
    usefulFor: [
      "Frontline, contact-centre and branch teams who face customers every day",
      "Hospitality, retail, banking and healthcare service teams",
      "Companies whose satisfaction scores or reviews have started to slip",
      "Supervisors who handle escalations and need a recovery playbook",
    ],
    icon: HeartHandshake,
    placeholder: true,
  },
  // TODO: placeholder programme — confirm with Adrian
  {
    key: "change-resilience",
    title: "Change Management & Resilience",
    blurb:
      "Keeping teams steady and productive through restructures, new systems and hard years, without burning out.",
    detail:
      "How people actually experience change, how managers lead them through it, and the personal habits that keep a team steady and productive while the ground moves.",
    usefulFor: [
      "Organisations going through a restructure, merger or leadership change",
      "Teams rolling out a new system, process or operating model",
      "Managers leading people through change they didn't choose",
      "Teams showing fatigue, cynicism or burnout after a hard year",
    ],
    icon: RefreshCw,
    placeholder: true,
  },
  // TODO: placeholder programme — confirm with Adrian
  {
    key: "emotional-intelligence",
    title: "Emotional Intelligence at Work",
    blurb:
      "Self-awareness, composure and empathy as working skills — better calls under pressure, fewer blow-ups.",
    detail:
      "Recognising what you and others are feeling, staying composed under pressure, and turning that awareness into better conversations, decisions and working relationships.",
    usefulFor: [
      "Managers promoted for technical skill who now need people skills",
      "Teams where friction, silence or blow-ups get in the way of the work",
      "High-pressure roles in sales, operations and service where composure matters",
      "Leaders building a culture of honest feedback and psychological safety",
    ],
    icon: Brain,
    placeholder: true,
  },
]

/** Everything the corporate page offers — the six real programmes first, then
 *  the placeholders. Read by the corporate carousel and the inquiry form only. */
export const CORPORATE_PROGRAMMES: Specialization[] = [
  ...SPECIALIZATIONS,
  ...PLACEHOLDER_PROGRAMMES,
]
```

5. Add to `SPECIALIZATION_IMAGES`, after `"personal-branding"`. The IDs were checked for a 200
   from images.unsplash.com and for subject fit on 2026-09-24:
   ```ts
     // Placeholder programmes (2026-09-24) — Unsplash stand-ins, same TODO as above.
     "sales-leadership": placeholderImg("1600880292203-757bb62b4baf", 1400, 800),
     "customer-service": placeholderImg("1556745757-8d76bdb6984b", 1400, 800),
     "change-resilience": placeholderImg("1542744173-8e7e53415bb0", 1400, 800),
     "emotional-intelligence": placeholderImg("1515187029135-18ee286d815b", 1400, 800),
   ```
6. Add to `SPECIALIZATION_IMAGE_ALTS`:
   ```ts
     "sales-leadership": "A sales manager and a rep celebrating a closed deal at the office",
     "customer-service": "A customer paying at a service counter",
     "change-resilience": "A leader walking a team through a plan in a boardroom",
     "emotional-intelligence": "Colleagues listening closely to one another in a group discussion",
   ```
7. Rewrite the file's top doc-comment to say: `SPECIALIZATIONS` = Adrian's six real programmes
   (landing, About numbers, site CTA). `PLACEHOLDER_PROGRAMMES` = four demo-only entries.
   `CORPORATE_PROGRAMMES` = both, for the corporate carousel and inquiry form. `usefulFor` is
   now read by the landing cards **and** the corporate carousel. The current comment says "the
   landing section does not read it", which becomes false with Task B, so fix it now.

### 0.2 `PRD.md` (Phase 0 owns it; nobody else edits it)

1. Replace the whole line that starts `6. **Areas of Specialization** — plain editorial list`
   (landing section list) with:
   `6. **Areas of Specialization** (\`\_sections/specializations.tsx\` + \`\_components/spec-reveal-cards.tsx\`) — framed explicitly as Coach Adrian's corporate training programmes, delivered in-house for companies and their teams. The six real programmes as a vertical stack of photo cards. With a mouse on a desktop-width screen, each card at rest shows its title and full one-line description. Hovering or keyboard-focusing a card grows it and swaps the description for who it's useful for (4 bullets) plus an **Inquire** button → \`/corporate-training?program=<key>#inquiry\`. On touch devices, and on any screen below 1024px, nothing expands: every card simply shows title, bullets and Inquire (a swipe rail below 1024px). The four placeholder programmes shown on the corporate page never appear here. Updated 2026-09-24.`
2. Replace the whole line that starts `3. **Programs we run** — header on top` with:
   `3. **Programs we run** — header on top, then a horizontal carousel of the programmes. The first card lines up with the header, and both sit on a 96rem column (32px from the left edge up to 1536px wide), so the row starts near the left edge and runs off the right. With a mouse on a desktop-width screen, each card at rest shows its title and full description. Hovering or keyboard-focusing a card widens it sideways while its neighbours narrow (the row's total width is fixed, so nothing jumps) and swaps the description for who it's useful for plus an **Inquire** button that scrolls to the form with that programme preselected (\`?program=<key>#inquiry\`). On touch devices and below 1024px nothing expands: every card statically shows title, bullets and Inquire. **Ten programmes: Adrian's six plus four placeholders added 2026-09-24 to judge a long list (Sales Leadership & Coaching, Customer Service Excellence, Change Management & Resilience, Emotional Intelligence at Work). TODO: confirm or delete each with Adrian.** The "useful for" bullets are representative. TODO: client sign-off.`
3. In the line starting `7. **Corporate Training Inquiry Form**`, replace
   `an optional **Also interested in** checkbox list of the other programmes`
   with
   `an optional **Also interested in** group of selectable tiles (icon + title; 2026-09-24) listing every other programme`.

### Phase 0 — Definition of done

- `npm run typecheck` → exit 0. `npx eslint src` → 0 problems. `npx prettier --check src PRD.md` → clean. `npm run build` → exit 0.
- `git diff feedback-3/0-programme-data~1 -- src/lib/specializations.ts` shows **no** change
  inside the `SPECIALIZATIONS` array literal.
- `grep -c "TODO: placeholder programme — confirm with Adrian" src/lib/specializations.ts` → `4`.
- Commit (explicit paths: `git add src/lib/specializations.ts PRD.md`) on
  `feedback-3/0-programme-data`. Only then are the A/B/C worktrees created.

---

## Task A — Corporate carousel: inset, 10 cards, content rules, touch, copy

**Owns:** `src/app/_components/program-carousel.tsx`, `src/app/corporate-training/_sections/programs.tsx`.
**Read first:** `tasks/rules/02-motion.md` §8, §10. `05-responsive.md` §14 (the "touch
controls belong to the pointer, not the width" and `useIsTouch` bullets). `06-accessibility.md`.

### A1. Left inset: root cause and fix

Measured on `main`: the first card already lines up with the heading. Both sit on the
**80rem** centred column: header `mx-auto max-w-7xl px-6 sm:px-8` and rail
`lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]`. That puts both at 112 px from the left at
1440 and 352 px at 1920. The inset Chan dislikes _is_ that 80rem column. The fix widens the
column for this section only, **header and rail together**, so they stay aligned:

- In `program-carousel.tsx`, header wrapper: `mx-auto max-w-7xl px-6 sm:px-8` →
  `mx-auto max-w-[96rem] px-6 sm:px-8`.
- In the `RAIL` constant: `lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]` →
  `lg:pl-[max(2rem,calc((100vw-96rem)/2+2rem))]`. Change nothing else in `RAIL`: `lg:pr-0`
  and the trailing `w-px lg:w-8` spacer keep the right-edge bleed.
- Result: 32 px at 1024, 1280 and 1440. 224 px at 1920. It never increases at any width.

### A2. Mode: interactive vs static (item 4)

- `import { useIsTouch } from "@/app/_lib/use-is-touch"`. Delete the `canHover` state and its
  `(hover: hover) and (pointer: fine)` media query from the existing effect. Keep the
  `desktop` (`(min-width: 1024px)`) query as is.
- `const touch = useIsTouch()` and
  `const interactive = desktop && !touch // hover take-over only with a real pointer on a desktop-width screen (RULES §14)`.
  Both start `false`, so SSR and first paint are the **static** layout, which is the rule's
  "touch control is the default".
- `interactive === false` (touch at any width, or below 1024px):
  - No inline `style` on the card (the class `lg:flex-[0_0_22rem]` sizes it on lg).
  - Don't render the full-card toggle `<button>`. No `onMouseEnter`.
  - Content = title + **detail panel** (Useful for + bullets + Inquire), always visible, not
    inside a `Collapse`, with no `id`/`inert`. The blurb is **not rendered**.
  - No darkener overlay change: render the `bg-black/35` darkener at `opacity-100` always, so
    the bullets have the same contrast they get when expanded on desktop.
- `interactive === true`: behaviour as today, with these edits:
  - Card `onMouseEnter={() => setActive(i)}` (no `canHover &&`).
  - Rail `onMouseLeave={() => interactive && setActive(null)}`.
  - Toggle `onClick={() => setActive(i)}` (tap-toggle branch deleted; interactive implies a mouse).
  - `onFocus` focus-visible handler unchanged.
  - Inline flex-basis `style` only when `interactive` (was `desktop`).
- If `interactive` flips false while a card is active (mouse unplugged, window resized), call
  `setActive(null)` in an effect on `[interactive]`.

### A3. Card content (item 3)

- Blurb `<p>`: remove `line-clamp-3`. The class becomes
  `max-w-[15.5rem] text-sm leading-relaxed text-white/85 lg:text-base`. Full text, never an
  ellipsis. It only renders in interactive mode, inside `<Collapse open={!isOpen}>` as today.
  Fit check: the longest of the 10 blurbs at 15.5rem/16px is 5 lines (130 px). With a 3-line
  title that's about 300 px, inside the 34rem (544 px) card.
- Detail panel inner wrapper: two literal constants.
  - `const DETAIL_INTERACTIVE = "w-full pt-1 lg:w-[30rem]"`. This is the existing one: fixed
    width so the bullets don't reflow while the card widens.
  - `const DETAIL_STATIC = "w-full pt-1"`. A 22rem card on a touch tablet can't hold 30rem.
- Title `<h3>`: unchanged.
- Update the comment on `SIBLING_REM`: `// 20.67rem for n=10 (19.6 for n=6)`. The math holds for
  any n ≥ 2: total `(n−1)·S + A = n·R`, and the hover-containment invariant needs
  `i ≤ n−1`, which always holds. Checked for n=10: S = (220−34)/9 = 20.667rem, and 20.667 −
  4rem padding = 16.67rem ≥ the 15.5rem blurb/title max-width, so text never reflows during the
  widen.

### A4. Doc-comment

Rewrite the top doc-comment's behaviour paragraphs to cover:

- Interactive only with a desktop-width screen **and** a real pointer (`useIsTouch`).
- At rest: title + full description. Hover/focus: title + Useful for + Inquire.
- Touch / below lg: no expand, static title + Useful for + Inquire, and no toggle button.
- The inset: header and rail share a 96rem column (changed 2026-09-24 from 80rem at Chan's
  request).

Delete the old "A tap toggles open/closed…" sentences. Keep the B↔C contract paragraph and the
"do not merge with SpecRevealCards" paragraph.

### A5. `programs.tsx`: data + copy (items 2 and 6)

- Import `CORPORATE_PROGRAMMES` instead of `SPECIALIZATIONS`. `CARDS` maps
  `CORPORATE_PROGRAMMES` (10 items, real six first).
- Heading and body, exactly:

```tsx
<div className="max-w-2xl">
  <SplitReveal className="font-serif text-[2.5rem] leading-[1.05] tracking-[-0.02em] lg:text-[3.5rem]">
    Programs <span className="text-brand">we run in-house</span>
  </SplitReveal>
  <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
    Coach Adrian&rsquo;s corporate training programmes, delivered in-house for
    your company — at your office or offsite, for one team or the whole
    organisation. Each is tailored to your people&rsquo;s roles, industry and
    goals, drawing on twenty years on the training circuit.
    <span className="hidden lg:pointer-fine:inline">
      {" "}
      Hover a programme to see who it&rsquo;s for.
    </span>
  </p>
</div>
```

(`lg:pointer-fine:` is a Tailwind 4.1 built-in. Touch visitors see the bullets already, so
they get no instruction. The old `Tap`/`Hover` swap spans and their comment are deleted.)

- Doc-comment: 10 cards (six real + four placeholders from `CORPORATE_PROGRAMMES`), the
  static touch layout, and "copy rewritten 2026-09-24 to say plainly these are in-house
  corporate programmes".

### A — Definition of done

- `npm run typecheck` → 0. `npx eslint src` → 0 problems. `npx prettier --check src` → clean. `npm run build` → 0.
- `grep -n "line-clamp" src/app/_components/program-carousel.tsx` → empty.
- `grep -n "canHover" src/app/_components/program-carousel.tsx` → empty.
- Dev server on :3201, `/corporate-training`, Playwright, fresh context per size:
  - **1440×900 (mouse):**
    - Heading left edge == first card left edge == 32 px (`getBoundingClientRect().left`).
    - 10 cards. Each resting card shows its full blurb: for every blurb `<p>`,
      `scrollHeight <= clientHeight + 1` and the computed `-webkit-line-clamp` is `none`.
    - Hover card 3: it widens to 34rem over ~420 ms, and "Useful for" + 4 bullets + Inquire are
      visible with no blurb. `rail.scrollWidth` before hover == during hover == after leave.
    - Sweep the pointer across cards 1→5 with no flicker. Arrows present; "Next" scrolls; both
      disable correctly at the ends.
  - **1024×768 (mouse):** heading and card left both 32 px. Same hover behaviour.
  - **1024×768 `hasTouch: true`:**
    - Every card shows title + Useful for + bullets + Inquire, with no blurb.
    - No `button[aria-expanded]` inside the rail. Tapping a card changes nothing. Nothing is clipped (for every card, the Inquire link's bottom < card bottom − 16 px).
    - The "Hover a programme…" sentence is hidden.
  - **390×844 `hasTouch, isMobile`:** same static content. The Inquire bottom is inside the card on
    all 10 cards (the longest measured static content is 368 px in the 512 px card). Swipe/snap
    rail works.
  - Keyboard at 1440: Tab onto card 1 → it expands with a white inset ring → Tab → its Inquire
    → Tab → card 2 expands.
  - Clicking Inquire (desktop and touch) → URL `/corporate-training?program=<key>#inquiry` and
    scrolls to the red inquiry section. A placeholder key like `customer-service` must work
    too (prefill itself is Task C's, checked in integration).
  - `prefers-reduced-motion: reduce` (mouse, 1440): widths and panels switch instantly.
- Kill the dev server and browser. `lsof -i :3201` → empty.

---

## Task B — Landing programme cards: content rules, touch, Inquire, copy

**Owns:** `src/app/_components/spec-reveal-cards.tsx`, `src/app/_sections/specializations.tsx`.
**Read first:** `tasks/rules/02-motion.md` §10–11 (framer-motion + hydration),
`05-responsive.md` §14, `06-accessibility.md`.

The vertical grow-on-hover stack, the collapsed/expanded heights (11.5rem / 27rem), the
420 ms `[0.33,1,0.68,1]` tween, the alternating 7% offsets, and "one card always open" (default
card 0) **stay exactly as they are**. What changes is content, the touch behaviour, and the
removal of the nested-interactive `role="button"` wrapper, which can't contain a link.

### B1. Data (`specializations.tsx`)

- `SpecCard` gains `usefulFor: string[]` (Task B edits the type in `spec-reveal-cards.tsx`).
- `CARDS` maps `SPECIALIZATIONS` (the real six. **Do not** import `CORPORATE_PROGRAMMES`)
  and adds `usefulFor: spec.usefulFor`. `key` is already passed and is used for the Inquire URL.

### B2. Mode (`spec-reveal-cards.tsx`)

- Keep the `stacked` state (`(min-width: 1024px)`, mount-gated).
- `import { useIsTouch } from "@/app/_lib/use-is-touch"`. `const touch = useIsTouch()`.
  `const interactive = stacked && !touch`.
- Per card: `const open = active === i` and `const showDetail = !interactive || open`.
- Height passed to `animate`:
  `height: stacked ? (interactive ? (open ? EXPANDED_H : COLLAPSED_H) : EXPANDED_H) : RAIL_H`.
  A static lg card (touch tablet) gets the expanded height so bullets fit.
- `RAIL_H` `"24rem"` → `"27rem"`, and the card class `h-96` → `h-[27rem]` (they must match, per
  the existing comment). Measured: the tallest static card content at 360px wide is 368 px + 40 px
  padding = 408 ≤ 432.

### B3. Card markup (`spec-reveal-cards.tsx`)

Root `motion.div`:

- **Remove:** `role`, `tabIndex`, `aria-expanded`, `aria-label`, `onFocus`, `onClick`,
  `onKeyDown`, and the classes `cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/80`.
- `onHoverStart={() => interactive && setActive(i)}`.
- Class becomes
  `group relative h-[27rem] w-[78vw] max-w-96 shrink-0 snap-start overflow-hidden rounded-3xl contain-layout lg:h-auto lg:w-auto lg:max-w-none lg:shrink`
  plus `OFFSETS[i % OFFSETS.length]` (unchanged).

Children, in DOM order:

1. `Image`: unchanged.
2. Scrim `div`: unchanged (keeps its `open` ? lighter : darker classes. Use `showDetail` in
   place of `open` for that ternary).
3. **New** detail darkener:
   `<div className={cn("absolute inset-0 bg-black/30 transition-opacity duration-300 motion-reduce:transition-none", showDetail ? "opacity-100" : "opacity-0")} />`
   (contrast for bullets over the brighter top of the photo).
4. **Toggle, interactive only.** Copied from the corporate carousel pattern:
   ```tsx
   {
     interactive && (
       <button
         type="button"
         aria-expanded={open}
         aria-label={`${item.title} — who it's for`}
         className="absolute inset-0 z-10 cursor-pointer rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-inset"
         onClick={() => setActive(i)}
         onFocus={() => setActive(i)}
       />
     )
   }
   ```
5. Content, wrapped in a keyed fade so the swap isn't a hard cut while the height tweens:
   ```tsx
   <motion.div
     key={showDetail ? "detail" : "blurb"}
     initial={stacked && !reduce ? { opacity: 0 } : false}
     animate={{ opacity: 1 }}
     transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1], delay: showDetail && interactive ? 0.12 : 0 }}
     className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
   >
     {showDetail ? <Detail … /> : <Blurb … />}
   </motion.div>
   ```
   `initial` is `false` on SSR and first render (`stacked` starts `false`), so nothing renders at
   opacity 0 before hydration.

`TITLE` constant (literal):
`"text-xl leading-tight font-semibold tracking-[-0.01em] text-balance text-white lg:max-w-60 lg:shrink-0 lg:text-[1.65rem]"`

**Blurb branch** (only reachable when `interactive && !open`, so lg+ only):

```tsx
<div className="flex flex-row items-end justify-between gap-8 p-8 xl:gap-12">
  <h3 className={TITLE}>{item.title}</h3>
  <p className="max-w-sm text-right text-sm leading-relaxed text-white/85 xl:text-base">
    {item.blurb}
  </p>
</div>
```

No `line-clamp`. Fit (measured): at 1024 the blurb column is 215 px. At `text-sm` the longest
real blurb is 4 lines = 91 px, and the tallest title is 99 px, both ≤ the 120 px content box of the
11.5rem card. From 1280 up the column is 384 px, `text-base`, 2 lines = 52 px. The `text-sm`
below `xl` and `gap-8` below `xl` are what make 1024 fit. Don't change them.

**Detail branch** (static on touch or below lg, or the open card on desktop):

```tsx
<div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:p-8 xl:gap-12">
  <h3 className={TITLE}>{item.title}</h3>
  <div className="w-full lg:max-w-sm">
    <p className="text-sm font-semibold text-white">Useful for</p>
    <ul className="mt-2 space-y-1.5">
      {item.usefulFor.map((b) => (
        <li key={b} className="flex gap-2.5 text-sm leading-snug text-white/90">
          <Check className="mt-0.5 size-4 shrink-0 text-white/70" aria-hidden />
          {b}
        </li>
      ))}
    </ul>
    {/* Plain <a>, not next/link: a full load is what triggers the inquiry
        form's cold-load `#inquiry` landing (commit 91a834e) and its
        `?program=` prefill. */}
    <a
      href={`/corporate-training?program=${item.key}#inquiry`}
      className={`${INQUIRE_PILL} pointer-events-auto mt-5 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none`}
    >
      Inquire
      <span className="sr-only"> about {item.title}</span>
      <ArrowRight className="size-4 transition-transform duration-300 group-hover/reg:translate-x-1" />
    </a>
  </div>
</div>
```

- `INQUIRE_PILL` = copy the `REGISTER_PILL` string from `program-carousel.tsx`
  **character for character** (wipe fill, colour invert, shadow deepens on hover, lift-only).
  That satisfies the glow/border-with-fill memory rule. Comment it as a literal copy.
- Imports: `Check, ArrowRight` from `lucide-react`.
- If `@next/next/no-html-link-for-pages` flags the `<a>`, add
  `// eslint-disable-next-line @next/next/no-html-link-for-pages -- full load needed, see comment above`.
  Do not switch to `Link`.
- Fit (measured): the open card at 1024 has a 215 px right column. Bullets 249 + label 28 +
  Inquire 60 = 337 ≤ the 368 px content box of the 27rem card.

### B4. Copy (`specializations.tsx`, item 6)

Replace the heading and paragraph with exactly:

```tsx
<SplitReveal className="font-serif text-[2.5rem] leading-[1.05] tracking-[-0.02em] lg:text-[3rem]">
  In-house programs,
  <br />
  <span className="text-brand">two decades</span> deep
</SplitReveal>
<p className="text-muted-foreground mt-6 text-lg leading-relaxed">
  Coach Adrian&rsquo;s corporate training programmes, run in-house for
  companies and their teams — at your office or offsite, and shaped around
  your people and goals.
  <span className="hidden lg:pointer-fine:inline">
    {" "}
    Hover one to see who it&rsquo;s for.
  </span>
</p>
```

(No number in the copy: the corporate page lists ten, the landing six, and neither should
contradict the other.)

### B5. Doc-comments

- `spec-reveal-cards.tsx`: rest = title + full blurb. Open (hover/focus) = title + Useful for +
  Inquire → `/corporate-training?program=<key>#inquiry`. Touch or below lg = static detail, no
  expand, no toggle. The overlay-button structure exists because an `<a>` inside
  `role="button"` is invalid. Add a `History:` line noting that the 2026-09-24 content change
  replaced the blurb-only card.
- `specializations.tsx`: fix the stale "plain editorial row … one line of copy" sentence to
  describe the above, and state it reads `SPECIALIZATIONS` (real six) on purpose.

### B — Definition of done

- `npm run typecheck` → 0. `npx eslint src` → 0 problems. `npx prettier --check src` → clean. `npm run build` → 0.
- `grep -n "line-clamp\|role=\"button\"" src/app/_components/spec-reveal-cards.tsx` → empty.
- `grep -n "CORPORATE_PROGRAMMES" src/app/_sections/specializations.tsx` → empty.
- Dev :3202, `/`:
  - **1440×900 (mouse):**
    - 6 cards (not 10). Card 1 is open at load with Useful for + 4 bullets + Inquire and no blurb. Cards 2–6 show the title and the full blurb (each `<p>`: `scrollHeight <= clientHeight + 1`).
    - Hover card 4: it grows, its blurb fades out and the bullets fade in. Card 1 collapses to title + blurb.
    - Clicking Inquire on card 3 (Culture) does a full navigation to `/corporate-training?program=culture#inquiry` and lands on the inquiry section after settle (integration checks prefill).
  - **1024×768 (mouse):** every collapsed card's blurb and title fit inside the 11.5rem card:
    for each, `p.getBoundingClientRect().top >= card.top` and the same for `h3`. On the open
    card the Inquire bottom sits above the card bottom.
  - **1024×768 `hasTouch`:** all 6 cards are static detail at 27rem, with no blurb and no
    `button[aria-expanded]`. Tapping does nothing but Inquire navigates. The "Hover one…"
    sentence is hidden.
  - **390×844 `hasTouch, isMobile` and 360×780 `hasTouch, isMobile`:** horizontal snap rail
    with static detail cards. The Inquire bottom is inside the card on all 6 (tolerance 16 px).
  - Keyboard at 1440: Tab onto a card → it opens with a white inset ring → Tab → its Inquire →
    Tab → next card opens and the previous one closes.
  - `prefers-reduced-motion: reduce`: height and fade are instant, and everything still works.
  - No hydration warning in the console on `/` (reload once with reduced motion on as well).
- Kill the dev server and browser. `lsof -i :3202` → empty.

---

## Task C — Inquiry form: 10 programmes + "Also interested in" tiles

**Owns:** `src/app/corporate-training/_sections/inquiry-form.tsx` (only).
**Read first:** `tasks/rules/07-nextjs.md` (forms, hydration), `06-accessibility.md`,
`04-styling.md` (never build class names from variables. Use literal constants).

### C1. Programme source

- Import `CORPORATE_PROGRAMMES` (drop the `SPECIALIZATIONS` import) and replace every use:
  `SPEC_TITLES`, `PROGRAMS`, `applyProgram`'s `.find`, `fillSample` (`CORPORATE_PROGRAMMES[0]`
  / `[3]`, which are the same programmes as today), and the tile list.
- Result: the primary select lists 10 titles plus "Not sure yet — help us scope it". The tile group
  lists the other 9 (or all 10 when the primary is empty or "Not sure yet…").
  `?program=customer-service` and the `ad:program-inquire` event with a placeholder key both
  prefill.

### C2. Tile group (replaces the `<Field label="Also interested in (optional)">` block)

```tsx
<fieldset className="space-y-1.5">
  <legend className="text-sm leading-none font-medium">
    Also interested in (optional)
  </legend>
  <p
    id="also-interested-help"
    className="text-muted-foreground mt-2 mb-3 text-xs"
  >
    Tick any others you&rsquo;d like the proposal to cover.
  </p>
  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
    {CORPORATE_PROGRAMMES.filter((p) => p.title !== primary).map((p) => {
      const on = also.includes(p.title)
      const Icon = p.icon
      return (
        <label key={p.key} className={cn(TILE_BASE, on ? TILE_ON : TILE_OFF)}>
          <input
            type="checkbox"
            className="sr-only"
            checked={on}
            onChange={() => toggleAlso(p.title)}
            aria-describedby="also-interested-help"
          />
          <span
            className={cn(TILE_ICON_BASE, on ? TILE_ICON_ON : TILE_ICON_OFF)}
          >
            <Icon className="size-[1.125rem]" aria-hidden />
          </span>
          <span className="flex-1 leading-snug">{p.title}</span>
          <span
            aria-hidden
            className={cn(TILE_CHECK_BASE, on ? TILE_CHECK_ON : TILE_CHECK_OFF)}
          >
            <Check className="size-3.5" strokeWidth={3} />
          </span>
        </label>
      )
    })}
  </div>
</fieldset>
```

Class constants at module level, **literal strings exactly as below**:

```ts
// "Also interested in" tiles (2026-09-24). Selected = filled brand + white
// check badge + slight scale + brand glow. The border AND the glow change
// together with the fill on hover in both states (memory rule).
const TILE_BASE =
  "relative flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-3 text-left text-sm font-medium select-none transition-[background-color,border-color,box-shadow,color,scale] duration-200 ease-out motion-reduce:transition-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background"
const TILE_OFF =
  "border-input bg-background text-foreground shadow-sm shadow-black/5 hover:border-brand/60 hover:bg-brand/5 hover:shadow-md hover:shadow-brand/15"
const TILE_ON =
  "border-brand bg-brand text-brand-foreground scale-[1.02] shadow-lg shadow-brand/35 hover:border-brand-accent hover:bg-brand-accent hover:shadow-brand-accent/45"
const TILE_ICON_BASE =
  "flex size-9 shrink-0 items-center justify-center rounded-md transition-colors duration-200 motion-reduce:transition-none"
const TILE_ICON_OFF = "bg-brand/10 text-brand"
const TILE_ICON_ON = "bg-white/15 text-brand-foreground"
const TILE_CHECK_BASE =
  "flex size-5 shrink-0 items-center justify-center rounded-full transition-colors duration-200 motion-reduce:transition-none"
const TILE_CHECK_OFF = "border-input border text-transparent"
const TILE_CHECK_ON = "bg-background text-brand"
```

- `Check` is added to the `lucide-react` import. `cn` is already imported.
- The real checkbox stays in the DOM (`sr-only`, not `hidden`/`display:none`). It is what
  gives Tab order, Space to toggle, and screen-reader "checkbox, checked". The `<fieldset>` +
  `<legend>` names the group. Do not add `role="checkbox"` anywhere.
- `scale` is listed in the transition because Tailwind v4 `scale-*` sets the standalone `scale`
  property (see the `GRID_HOVER` comment in `event-cards.tsx`). The 1.02 scale on a ~250 px tile
  grows it by ~2.5 px per side, which is under the `gap-2.5` (10 px), so there's no overlap.
- Everything else in the form is unchanged: the `toggleAlso`/`primary` effects, review row,
  handoff, prefill, cold-load landing, and step validation.

### C3. Doc-comment

Change "an optional 'Also interested in' checkbox list" to "an optional 'Also interested in'
group of selectable tiles (real checkboxes, visually hidden, inside a fieldset). Changed from
plain checkboxes 2026-09-24". Add that the programme list is `CORPORATE_PROGRAMMES` (6 real + 4
placeholders).

### C — Definition of done

- `npm run typecheck` → 0. `npx eslint src` → 0 problems. `npx prettier --check src` → clean. `npm run build` → 0.
- `grep -n "SPECIALIZATIONS" src/app/corporate-training/_sections/inquiry-form.tsx` → empty.
- `grep -n "accent-brand mt-0.5 size-4" src/app/corporate-training/_sections/inquiry-form.tsx` → empty (old checkbox gone).
  The consent checkbox (`accent-brand mt-1 size-4`) stays.
- Dev :3203, `/corporate-training#inquiry`, use "fill sample data" then Continue to step 3:
  - **1440×900:**
    - The select has 11 options (10 + "Not sure yet"). The tiles show 2 columns and 9 tiles, excluding Leadership (the sample primary). Communications is selected: filled brand, white text, check badge visible, visibly larger than its neighbours.
    - Hover an unselected tile: border turns brand/60, light brand wash and a soft brand glow.
    - Hover a selected tile: fill, border **and** glow all shift to `brand-accent` (read the computed `background-color`, `border-color` and `box-shadow` before and after hover. All three must differ).
  - Keyboard: Tab reaches each tile's checkbox in order, the focused tile shows a brand ring
    with offset, and Space toggles it (the review row on step 4 reflects it).
  - Pick "Customer Service Excellence" as the primary: it disappears from the tiles. If it was
    ticked, it gets unticked (the existing effect).
  - `/corporate-training?program=emotional-intelligence#inquiry` (fresh load) shows "Enquiring
    about Emotional Intelligence at Work" on step 1, and the step 3 select is preselected.
  - **390×844 `hasTouch, isMobile`:** tiles in 1 column, each ≥ 56 px tall (`min-h-14`), no
    horizontal overflow on the form.
  - Dark mode (`.dark` on `<html>`): selected tile text is readable (brand-foreground on
    brand), and the unselected icon chip is visible.
  - Submit with 2 tiles ticked → `/corporate-training/inquiry-received` lists both.
- Kill the dev server and browser. `lsof -i :3203` → empty.

---

## File ownership (no file appears twice)

| File                                                    | Owner   | Change                                                                        |
| ------------------------------------------------------- | ------- | ----------------------------------------------------------------------------- |
| `src/lib/specializations.ts`                            | Phase 0 | `placeholder?`, `PLACEHOLDER_PROGRAMMES`, `CORPORATE_PROGRAMMES`, images/alts |
| `PRD.md`                                                | Phase 0 | three line edits                                                              |
| `src/app/_components/program-carousel.tsx`              | A       | inset, interactive/static modes, no clamp                                     |
| `src/app/corporate-training/_sections/programs.tsx`     | A       | `CORPORATE_PROGRAMMES`, new copy                                              |
| `src/app/_components/spec-reveal-cards.tsx`             | B       | content modes, overlay toggle, Inquire, touch static                          |
| `src/app/_sections/specializations.tsx`                 | B       | `usefulFor` passthrough, new copy                                             |
| `src/app/corporate-training/_sections/inquiry-form.tsx` | C       | `CORPORATE_PROGRAMMES`, tile group                                            |

Read-only for everyone: `event-cards.tsx`, `workshop-tags.tsx`, `companies-marquee.tsx`
(both), `site-cta.tsx`, `about/_sections/numbers.tsx`, `use-is-touch.ts`, `globals.css`,
`MEETING-NOTES.md`, `README.md`.

---

## Out of scope (v2, said out loud)

- Real photos for the four placeholder programmes (Unsplash stand-ins, flagged TODO), and
  Adrian's sign-off on whether they exist at all.
- Moving the other corporate sections onto the 96rem column. Only this carousel moved. The
  heading of this section now sits left of the other headings on the page at ≥1280px. That is
  a deliberate consequence of Chan's "closer to the left", and the same trade the landing
  workshop row already makes (its cards sit at 40px while its heading stays on 80rem).
- Tags/taxonomy on programmes. Any backend.

## Known deviations: flagged, not hidden

- **Pre-mount flash on desktop:** both card components render the static (touch) layout on SSR
  and first paint, then switch to the rest/blurb layout after mount on a mouse device. This is
  the RULES §14 "touch control is the default" order and hydration-safe (§10). Both sections
  sit below the fold behind a `Reveal`, so the switch happens before they are seen. The tester
  should confirm there is no visible swap when scrolling them into view at 1440.
- **`lg:pointer-fine:` vs the JS gate:** the copy hint uses `(pointer: fine)`. `useIsTouch`
  uses `(hover: none), (pointer: coarse)`. They disagree only on a fine-pointer device with no
  hover, which is vanishingly rare. There the hint would show while the cards are static. Accepted.
- **Landing static height on touch tablets ≥1024px:** all six cards render at 27rem, so the
  stack is ~6×27rem tall there. That follows from "no expand on touch" plus the stacked lg
  layout. Converting touch tablets to the swipe rail would need width-independent layout
  classes and is not asked for.
- **Item 7:** no change was made because the defect didn't reproduce in Chromium or WebKit.
  If Chan still sees it, we need the browser, the width and the card from him.

---

## Tester checklist (merged tree, after 0 → A → B → C land on `main`)

First run `npm run typecheck && npx eslint src && npx prettier --check src && npm run build`.
All four must exit 0. Then `npx next dev -p 3204` from the main repo dir **only if :3000 is not
the tree you are testing**. Otherwise use a fresh port, and record and kill your PID. Fresh
Playwright context per size: 1440×900 mouse, 1024×768 mouse, 1024×768 `hasTouch`, 390×844
`hasTouch+isMobile`. Light and dark. Then `reducedMotion: "reduce"`.

**Corporate carousel (`/corporate-training`)**

1. The heading's left edge equals the first card's left edge, and it is 32 px at 1024/1440 and 224 px
   at 1920. The row bleeds off the right edge.
2. 10 cards: the real six, then Sales Leadership & Coaching, Customer Service Excellence,
   Change Management & Resilience, Emotional Intelligence at Work.
3. Mouse: resting cards show the full description (no "…", no clamp). Hover shows title + Useful
   for + 4 bullets + Inquire with the description gone. `rail.scrollWidth` stays constant through
   hover. Sweeping the pointer across all cards causes no flicker, and the arrows never flip mid-hover.
4. Touch (any width) and 390 mobile: static title + bullets + Inquire, no description, no
   expand on tap, and no `aria-expanded` toggles. Nothing is clipped on any of the 10 cards.
5. Keyboard: each card expands on focus-visible, and Inquire is reachable.

**Landing (`/`)**

6. The programmes section shows exactly 6 cards, and none of the four placeholder titles appears
   anywhere on `/` (`page.content()` search).
7. Mouse: the open card shows bullets + Inquire, and collapsed cards show title + full blurb. It fits at
   1024 (no text above the card top). The vertical grow-on-hover and alternating offsets look unchanged.
8. Touch and mobile: static bullets + Inquire, with no expand.
9. Landing Inquire → full navigation to `/corporate-training?program=<key>#inquiry` → lands
   on the red inquiry section after settle (scrollY within ±80 px of the section top), and step 1
   shows "Enquiring about <title>".

**Form (integration A↔C)**

10. Carousel Inquire on **Change Management & Resilience** → step 1 says "Enquiring about
    Change Management & Resilience". Step 3 select is preselected, and the tiles exclude it.
11. The tiles are 2 columns at ≥640 px and 1 column below it. Selected state is filled brand + check + scale +
    glow. Hovering a selected tile changes fill, border and glow together. Keyboard Tab/Space
    works with a visible ring. The review row and confirmation page list the ticked tiles.

**Copy (item 6)**

12. Corporate heading reads "Programs we run in-house", and the body opens "Coach Adrian's
    corporate training programmes, delivered in-house for your company". Landing heading reads
    "In-house programs, two decades deep", and the body opens "Coach Adrian's corporate training
    programmes, run in-house". The hover hint is present at 1440 mouse and absent on touch.

**Workshop pills (item 7, regression guard)**

13. `/` workshop row: every card's pills are visible at rest and while hovered, in Chromium
    **and** WebKit, at 1024 and 1440. `elementFromPoint` at the pill centre must hit the pill
    while the card is hovered. Report engine + width + card index if not.

**Regression / hygiene**

14. `about` page "Core program tracks" still reads **6**. The site CTA marquee shows six labels
    and no blank item.
15. The companies marquee is unchanged (`git diff 91a834e -- src/app/_sections/companies-marquee.tsx src/app/_components/companies-marquee.tsx` → empty).
16. `grep -rn "uppercase" src/app` shows no new eyebrow above a heading.
    `grep -rn "TODO: placeholder programme" src` → 4 hits, all in `specializations.ts`.
17. There are no hydration warnings on `/` or `/corporate-training` (including a reload with reduced motion).
18. Cleanup: `lsof -i :<your port>` → empty, and
    `ps aux | grep -iE "playwright|chromium|headless|webkit"` shows nothing you started.

A defect is anything above failing, text clipped or ellipsised in any card, a hover
flicker, a layout jump, a nested interactive element flagged by axe (`a` inside a
`role=button`), or any visual change to the companies marquee or gallery hover.
