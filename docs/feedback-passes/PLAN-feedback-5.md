# PLAN — Feedback pass 5 (landing "In-house programs" shows all 10)

> Chan decided this on 2026-09-24. **No open questions.** The coder makes no design calls:
> every change below is exact. If something turns out to be impossible, stop and report
> `ESCALATE: <why>`. Don't improvise.
>
> Read first: repo `CLAUDE.md`, `~/Programming/Iridel/tasks/RULES.md`,
> `tasks/rules/05-responsive.md` (§14, touch default) and `tasks/rules/09-verification.md`
> (before you trust a capture). **This repo has no `DESIGN.md`.** The existing components are
> the binding visual language.
>
> Hard constraints, carried over from passes 3 and 4:
>
> - **Never edit `src/app/_sections/companies-marquee.tsx` or `src/app/_components/companies-marquee.tsx`.**
> - **Never touch `MEETING-NOTES.md`** (Chan's uncommitted edits). Stage explicit paths only.
>   Never `git add -A` or `git add .`.
> - About "Core program tracks" (`src/app/about/_sections/numbers.tsx`) and the CTA marquee
>   (`src/app/_components/site-cta.tsx`) **stay on `SPECIALIZATIONS` (6)**. Don't touch them.
> - Prettier (`prettier-plugin-tailwindcss`) may reorder classes. That's fine.

---

## What Chan asked

The landing "In-house programs" section (`src/app/_sections/specializations.tsx` →
`src/app/_components/spec-reveal-cards.tsx`) shows all 10 programmes (`CORPORATE_PROGRAMMES`:
the real 6 followed by the 4 placeholders) instead of `SPECIALIZATIONS` (6).

## Layout decision: keep the vertical grow-on-hover stack, 10 rows. No class or value changes.

This is the least-change option, and measurement shows it needs **zero layout edits**. The
change is a data-source swap plus doc/comment updates.

### Measurements (2026-09-24, `main` @ 977d8d6, :3000 dev server, Chromium, fresh context per size)

Current desktop stack (lg+, mouse): 1 open card (27rem = 432px) + 5 collapsed (11.5rem =
184px), `gap-3` (12px). Stack **1412px**, section **1700px**, sticky left rail 401px. Card
width 551px at 1024, 774px at 1440 and 1920 (the page caps at `max-w-7xl`, so 1920 = 1440).

With 10 cards, by arithmetic from the measured values: 432 + 9×184 + 9×12 = **2196px stack**,
so the section grows to about **2484px** at every lg+ width. That's +784px, or ~0.9 of a 1440×900
screen. The left rail is `lg:sticky lg:top-28`, so the heading stays pinned beside the list the
whole way. The longer list reads as the same deliberate editorial column, not as overflow.

**Fit of the 4 placeholder programmes.** I injected their real titles, blurbs and bullets into
the live cards and measured. "Clearance" is the space from the card top to the top of the
content block. The tightest cases are the 3-line titles ("Change Management & Resilience" and
the existing "Winning Cultures…" / "Effective & Compelling…"):

| State                    | 1024                            | 1440 / 1920              | Verdict                                       |
| ------------------------ | ------------------------------- | ------------------------ | --------------------------------------------- |
| Collapsed (rest, blurb)  | content ≤163px in 184px → ≥21px | ≤163px in 184px → ≥21px  | Full blurb, un-clamped, same as today's worst |
| Open (bullets + Inquire) | ≤401px in 432px → ≥31px         | ≤324px in 432px → ≥108px | Same as today's card 0                        |
| Static rail 390 (touch)  | —                               | —                        | title ≥75px from top in 448px card            |
| Static rail 360 (touch)  | —                               | —                        | title ≥36px from top (= today's worst)        |

The placeholder blurbs and bullets are the same length class as the real six. No placeholder
is the new worst case at any size.

### Options rejected

- **Shrink the collapsed height** to shorten the stack. Rejected: the 3-line-title rows already
  fill 163 of 184px, and shrinking would clip or clamp blurbs.
- **Two-column stack or grid at lg+.** Rejected: a height tween in a grid shifts the
  neighbouring column. The title/blurb row layout (`lg:max-w-60` title + `max-w-sm` blurb)
  doesn't fit in a ~410px column. It would be a redesign, not a count change.
- **Horizontal rail on desktop.** Rejected: it duplicates the corporate page's carousel, so
  the landing would lose its own pattern, and it's a larger rewrite.

### Existing behaviour that 10 rows makes more visible (not changed, see Risks)

When the page scrolls under a stationary mouse, Chrome re-fires hover, so the card under the
cursor opens as the list passes beneath it. I measured this at 1440 with 6 cards: the open card
followed the cursor 0→1→2→5 over 6 wheel steps. With 10 cards it keeps doing that for longer.
It reads as a scroll-driven accordion, and it's pre-existing. **Out of scope. Don't "fix" it.**

### Copy

The section copy states no count ("In-house programs, two decades deep" / "Coach Adrian's
corporate training programmes, run in-house…"). **No visible copy changes.** Only code comments
and `PRD.md` say "six".

---

## How the work runs

A single Sonnet coder task in its own worktree.

```bash
# from /Users/chanchan/Programming/Iridel/demos/adrianding-DEMO
git worktree add ../adrianding-DEMO-wt5 -b feedback-5/landing-ten-programmes main
cd ../adrianding-DEMO-wt5
cp -cR ../adrianding-DEMO/node_modules ./node_modules   # APFS clone, seconds
npx next dev -p 3601 &   # record the PID
```

A dev server may already be running on **:3000 from the main repo dir. It is not yours. Never
kill it and never test against it.** Test only against **:3601**. Before reporting, on the
failure path too (`finally`), kill your dev-server PID and every browser/context you opened.
Verify: `lsof -i :3601` → empty, and `ps aux | grep -iE "playwright|chromium|headless"` shows
nothing you started. Never `pkill -f next`.

Playwright: `node_modules/playwright-core`, Chromium in `~/Library/Caches/ms-playwright`. Use a
**fresh context per viewport**. Mouse: `{ viewport: { width: W, height: 900 } }`. Phone:
`{ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }`. Touch tablet:
`{ viewport: { width: 1024, height: 768 }, hasTouch: true }`. Wait 700ms after any hover
before measuring, because the tween is 420ms and `boundingBox()` goes stale mid-transition.
**Park the mouse on the left rail (x=100) before any wheel/scroll**, or the cards will open as
they scroll under the cursor (see above).

Merge: commit explicit paths on the branch, then merge into `main` with `--no-ff`, following
the pass 3/4 pattern ("Merge feedback-5: landing shows all 10 programmes"). Remove the
worktree after merging.

---

## Task — Landing programme section reads `CORPORATE_PROGRAMMES`

**Owns:** `src/app/_sections/specializations.tsx`, `src/app/_components/spec-reveal-cards.tsx`
(comments only), `src/lib/specializations.ts` (comments only), `PRD.md` (one paragraph).
**Read-only:** everything else. In particular `about/_sections/numbers.tsx`,
`_components/site-cta.tsx`, `_components/program-carousel.tsx`,
`corporate-training/_sections/*`.

### 1. `src/app/_sections/specializations.tsx`

a. Import: replace `SPECIALIZATIONS,` with `CORPORATE_PROGRAMMES,` in the
`@/lib/specializations` import. Keep `SPECIALIZATION_IMAGES`, `SPECIALIZATION_IMAGE_ALTS`
and `SPECIALIZATION_IMAGE_POSITIONS`. All three already have entries for all 10 keys, or
fall back correctly in the positions case.

b. `const CARDS: SpecCard[] = SPECIALIZATIONS.map(` → `CORPORATE_PROGRAMMES.map(`. The mapper
body is unchanged.

c. Replace the file doc-comment with exactly:

```tsx
/**
 * Landing — Coach Adrian's in-house corporate training programmes, framed
 * explicitly as run for companies and their teams (2026-09-24 copy pass).
 * Each is a reveal card: at rest it shows the title and full blurb; hovering
 * or keyboard-focusing a card (desktop, real pointer only) swaps the blurb
 * for "Useful for" + 4 bullets and an Inquire button, and grows the card.
 * Touch devices and screens below `lg` never expand — every card is static
 * at the detail height. Sits on the muted ground between the credibility
 * block and the workshop/corporate fork.
 *
 * Reads `CORPORATE_PROGRAMMES` — all ten: Adrian's real six, then the four
 * placeholder programmes (pass 5, 2026-09-24, Chan's call; the placeholders
 * are still TODO-confirm-with-Adrian in `lib/specializations.ts`). The About
 * "Core program tracks" figure and the site CTA marquee deliberately stay on
 * `SPECIALIZATIONS` (the real six). Ten rows needed no layout change: the
 * placeholder blurbs/bullets fit the same 11.5rem / 27rem / 28rem heights.
 */
```

d. In the JSX comment above `<Reveal …>`, change `Right — the six reveal cards.` to
`Right — the ten reveal cards.`. Leave the rest of that comment as it is. It's history.

e. **No class changes** anywhere in this file. The `<Reveal stagger={0.08} …>` and the grid
classes stay byte-identical.

### 2. `src/app/_components/spec-reveal-cards.tsx`: comments only, zero code changes

a. Doc-comment first sentence: `The six programs as a vertical stack of expand-on-hover image
cards` → `The programmes (all ten on the landing page since pass 5, 2026-09-24) as a vertical
stack of expand-on-hover image cards`.

b. Doc-comment paragraph starting `Below \`lg\` the same six cards are a horizontal snap rail`→`Below \`lg\` the same cards are a horizontal snap rail`. Keep the rest of that paragraph.

c. `git diff main -- src/app/_components/spec-reveal-cards.tsx` must show changes **only inside
the `/** … \*/` doc-comment\*\*.

### 3. `src/lib/specializations.ts`: comments only, zero code changes

a. Header doc-comment. Replace the first paragraph (`SPECIALIZATIONS — Adrian's six real
areas … the corporate carousel.`) with:

```ts
 * `SPECIALIZATIONS` — Adrian's six real areas of specialization. Read by the
 * About page's "Core program tracks" count and the site CTA marquee
 * (`FOCUS_TAGS`), so it stays exactly six and byte-identical inside the
 * array. Longer `detail` for the About page's expanded version; `blurb` and
 * `usefulFor` feed the landing cards and the corporate carousel.
```

b. Same header. Replace the `CORPORATE_PROGRAMMES` paragraph with:

```ts
 * `CORPORATE_PROGRAMMES` — both lists combined (real six first), read by the
 * landing "In-house programs" cards (since pass 5, 2026-09-24), the
 * corporate page's programme carousel, and its inquiry form.
```

c. The `placeholder?: true` field doc. Replace the comment with:

```ts
/** Demo-only programme, not confirmed with Adrian — shown wherever
 *  `CORPORATE_PROGRAMMES` is read (landing cards, corporate carousel,
 *  inquiry form) so the long list can be judged. Never in the About numbers
 *  or the site CTA (those read `SPECIALIZATIONS`). */
```

d. The comment above `export const CORPORATE_PROGRAMMES` becomes:

```ts
/** Everything Adrian offers in-house — the six real programmes first, then
 *  the placeholders. Read by the landing cards, the corporate carousel and
 *  the inquiry form. */
```

### 4. `PRD.md`: landing section 6 paragraph (line ~130, starts `6. **Areas of Specialization**`)

- `The six real programmes as a vertical stack of photo cards.` → `All ten programmes
(Adrian's six, then the four corporate-page placeholders) as a vertical stack of photo
cards.`
- Delete the sentence `The four placeholder programmes shown on the corporate page never
appear here.`
- Append: `Pass 5 (2026-09-24): the landing now shows all ten (Chan's call). Same layout, no
size changes; the About "Core program tracks" figure and the CTA marquee stay on the real
six. TODO: the four placeholders must be confirmed or deleted with Adrian before handoff,
and deleting one now removes it from the landing too.`

---

## Definition of done (coder, then tester re-runs on merged `main`)

**Static checks, all in the worktree:**

1. `npm run typecheck` → exit 0.
2. `npx eslint src` → 0 problems.
3. `npx prettier --check src PRD.md` → clean.
4. `npm run build` → exit 0.
5. `grep -n "CORPORATE_PROGRAMMES" src/app/_sections/specializations.tsx` → 2 hits (import + map),
   plus any in the doc-comment. `grep -nw "SPECIALIZATIONS" src/app/_sections/specializations.tsx`
   → only the doc-comment mention, no import.
6. `git diff main --stat` → exactly these 4 files: `PRD.md`, `src/app/_sections/specializations.tsx`,
   `src/app/_components/spec-reveal-cards.tsx`, `src/lib/specializations.ts`.
   `git diff main -- src/app/about src/app/_components/site-cta.tsx src/app/_components/program-carousel.tsx src/app/corporate-training`
   → empty.
7. `git diff main -- src/lib/specializations.ts src/app/_components/spec-reveal-cards.tsx`
   → every changed line is inside a comment (`*`, `/**`, `//`).

**Playwright against :3601, a fresh context per size.** The section is
`page.locator('section', { hasText: 'In-house programs' })`, and the cards are its
`div.group.rounded-3xl` elements.

8. **1440×900 mouse:** exactly **10** cards, and their `h3` texts in this order: Leadership
   Training & Development, Inspirational Keynotes, Winning Cultures & High-Performing Teams,
   Effective & Compelling Communications, Train the Trainer + Coach the Coaches, Corporate
   Imaging & Personal Branding, Sales Leadership & Coaching, Customer Service Excellence,
   Change Management & Resilience, Emotional Intelligence at Work.
   - At rest (mouse parked at x=100 on the rail): card 0 is 432px, cards 1–9 are 184px (±1),
     and the stack (the cards' parent) is **2196px ±2**.
   - For each i in 0..9: hover card i and wait 700ms. Card i is 432px, the other nine are 184px.
     Card i shows "Useful for", 4 `li` and one `a[href="/corporate-training?program=<key>#inquiry"]`.
     Every other card shows its blurb `p`, where `p.scrollHeight <= p.clientHeight + 1` (not
     clamped) and its computed `-webkit-line-clamp` is `none`.
   - **No clipping:** in every card, in both states, the top of the
     `.absolute.inset-x-0.bottom-0` content block is ≥ 16px below the card top. Expected
     minimums: collapsed ≥ 21, open ≥ 100.
   - The alternating stagger holds: even-index cards have `margin-right` > 0, odd-index cards
     have `margin-left` > 0.
   - Sticky rail: scroll to where card 9 is in view (mouse parked at x=100). The heading
     `In-house programs` still has `getBoundingClientRect().top` ≈ 112 (`top-28`), ±2.
9. **1024×768 mouse:** repeat the counts and heights from 8. Stack 2196 ±2. Expected open-card
   clearance minimum ≥ 31, collapsed ≥ 21. Width of every card = 551 ±2.
10. **1920×1080 mouse:** 10 cards, stack 2196 ±2, card width 774 ±2 (same as 1440, capped by
    `max-w-7xl`).
11. **1024×768 touch tablet** (`hasTouch: true`): 10 cards, all 432px, each with 4 `li` +
    Inquire, and **no** `button[aria-expanded]` inside the section.
12. **390×844 phone (touch):** 10 panels, each 448px tall, `width <= 384`. Scroll the rail
    to the end (`scrollLeft = scrollWidth`) and wait 500ms. The last panel's `h3` is "Emotional
    Intelligence at Work" and it is fully inside the rail's box. Every panel's title top is
    ≥ 36px from its card top (check at 360×780 too). `document.documentElement.scrollWidth === 390`
    (no page overflow).
13. **Inquire prefill, all 10, 1440 mouse, fresh page per key:** go to `/`, scroll the section
    in, hover card i, wait 700ms, click its Inquire. Assert the URL pathname is
    `/corporate-training`, `searchParams.get("program")` is the key, and the text
    `Enquiring about <title>` is visible. Keys, in order: `leadership`, `keynotes`, `culture`,
    `communication`, `train-the-trainer`, `personal-branding`, `sales-leadership`,
    `customer-service`, `change-resilience`, `emotional-intelligence`. The same 10 must also pass
    on the 390 phone, clicking the static Inquire after scrolling the rail to the panel.
14. **Unchanged elsewhere:** on `/about`, the "Core program tracks" stat reads **6**. The site
    CTA marquee on `/` contains no "Sales", "Customer Service", "Change" or "Emotional" tag.
15. Browser console: 0 errors on `/` at 1440 and 390.
16. Cleanup: dev server PID killed, `lsof -i :3601` empty, no Chromium you launched still alive.
    The :3000 server is untouched.

**What counts as broken (tester):** any count other than 10; the wrong order; a blurb clamped,
ellipsised or clipped at rest; any title or Inquire clipped at 360/390/1024; two cards open at
once on a mouse; any card expanding on touch; an Inquire landing on the wrong programme or with
no "Enquiring about" line; the About figure ≠ 6; a diff outside the 4 owned files; a
leftover process on 3601.

---

## Risks

- **Unconfirmed programmes on the landing page.** The four placeholders are now on the most
  visible page of the site. They're TODO-flagged in data and PRD, but if a demo goes to Adrian
  before he confirms them, he'll see programmes he may not run. Chan's call. Flagged, not blocked.
- **Scroll-under-cursor opening** (measured above) gets more visible over 10 rows. It's
  pre-existing. If Chan dislikes it, a separate pass could gate `onHoverStart` on real pointer
  movement. Not this pass.
- **Phone rail is now 10 swipes long.** It has no position indicator today. It's acceptable
  because the rail is snap-scrolled and the first card lines up with the gutter. Worth a look
  in Chan's review.
- **Section length.** It grows by about 784px at lg+. Measured values are in the table above.
  If Chan finds it long in review, the cheapest follow-up is `COLLAPSED_H` 11.5rem → 11rem
  (176px). That still clears the 163px worst-case content by 13px, so it's safe, but it isn't
  done here because nothing asked for it.

## Files

- `src/app/_sections/specializations.tsx` — modified: data source → `CORPORATE_PROGRAMMES`, doc-comment.
- `src/app/_components/spec-reveal-cards.tsx` — modified: doc-comment only.
- `src/lib/specializations.ts` — modified: doc-comments only.
- `PRD.md` — modified: landing §6 paragraph.
