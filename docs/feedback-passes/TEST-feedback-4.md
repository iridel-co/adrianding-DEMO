# TEST — Feedback pass 4 (merged tree, main @ 977d8d6)

Tested against the existing `:3000` server from this repo dir (confirmed serving the merged
HEAD via distinctive class-string grep before use; never touched/killed it, per instructions).
My own `next dev -p 3403` attempt self-terminated on Next 16's directory-scoped dev-server
lock ("Another next dev server is already running") — expected once `:3000` was confirmed
live and current, so I didn't fight it.

## Verdict

SHIP — every item in the plan's tester checklist (both DoD sections and the merged-tree
checklist) passed live, with two pre-existing/out-of-scope nits noted below, neither a
regression from this plan.

## What I ran

```
npm run typecheck        → exit 0
npx eslint src            → 0 problems
npx prettier --check src PRD.md → clean
npm run build              → exit 0, all 45 pages generated

grep -c 'const TITLE_STATIC =' spec-reveal-cards.tsx program-carousel.tsx → 1, 1
diff <TITLE_STATIC lines in both files>  → no output (byte-identical)
grep -n "96rem" program-carousel.tsx     → only the doc-comment history line (known-OK)
git diff a0c3049 -- specializations.tsx corporate-training/_sections/programs.tsx → empty
git diff a0c3049 -- companies-marquee.tsx (both copies) → empty
grep -n "chipBase" workshop-tag-filter.tsx → empty
grep -n "lg:pl-10" event-cards.tsx        → still hits ROW
grep -rn "uppercase" src/app              → only pre-existing small in-card labels, no new eyebrow
```

Playwright (fresh context per viewport, `hasTouch`+`isMobile` for phone/touch), driven live
against `:3000`, measurements via real `getBoundingClientRect()`/`getComputedStyle()` after
settle waits — not screenshots-as-proof, per `09-verification.md`.

## Defects

None found that block ship. See "Held up under attack" for the full list of what was
actually driven.

### [Nit] Pre-existing Next/Image aspect-ratio console warnings on `/corporate-training`

- **Where:** browser console, `/corporate-training`, any viewport. 4 warnings:
  `/images/logos/trainer-logo.webp`, `genos-logo.webp`, `aet-logo.png`, `cpd-logo.webp` —
  "has either width or height modified, but not the other."
- **Repro:** load `/corporate-training`, open console.
- **Expected:** clean console.
- **Actual:** 4 warnings, 0 errors.
- **Why it matters:** cosmetic only, doesn't affect layout or a11y. Flagging because RULES
  §29 wants a clean console, but this is in `trust-logos.tsx`, a file neither Task A nor B
  touched (`git diff a0c3049` confirms), so it predates this pass and isn't a regression.
  Not blocking; worth a follow-up ticket outside this plan.
- **Confidence:** verified live.

### [Nit] 420ms corporate widen mid-frame not independently captured

- **Where:** `/corporate-training`, hover any card, 1440.
- **What I could confirm:** rest state and settled hover state are both correct (Inquire
  gaps 32±1, `rail.scrollWidth` constant through the whole sweep). Two screenshots taken at
  ~60ms and ~180ms into the 420ms transition both showed the panel already in its settled
  look — consistent with the plan's own note that "it appears as the panel fades in" and
  with `09-verification.md`'s point that a screenshot loop can't reliably catch a specific
  animation frame; a screencast would be needed to prove the exact clip moment.
- **Why it matters:** low — the plan explicitly accepts this as designed behavior, and I
  found no frame where it read as visually broken.
- **Confidence:** unverified for the specific clipped mid-frame (tooling limitation, noted
  honestly rather than claimed either way); the settled states on both ends are verified live.

## Held up under attack

**Programme cards (items 1–7 of the plan's DoD, checklist 1–7)**

- Corporate first-card left = landing first-card left at 1024/1440/1920 (all 40) and at 390
  (24, both pages). Corporate heading left = 32/112/352, matching the page's other h2s, at
  1024/1440/1920.
- Corporate `h3` weight 800 at 1440 mouse (all 10 cards, `text-align: start`), 1024 touch
  tablet (left-aligned), and 390/360 phone (centered, offset ≤0.004px from true center).
- Landing static cards: weight 800, centered at 390/360 and 1024 touch (left-aligned); the
  1440 mouse open card kept weight 600 as the plan's judgement call specifies.
- Gap title→"Useful for" = 24px on every static card tested, both components, both phone
  widths.
- Inquire bottom-right on: corporate phone (24/24 both widths, all 10 cards), corporate 1024
  touch (32/32), corporate 1440 hover-settled (32/32, after re-measuring with a proper
  `mouse.move(..., {steps: 10})` — see the tooling note below), landing phone (20/20, all 6
  cards, both widths), landing 1024 touch (32/32), landing 1440 open card (32/32).
- No clipping at 360: every landing card's `h3` top is 36–95px from the card top (well over
  the 30px floor the plan calls out), card height = 448px (28rem) confirmed directly.
- `rail.scrollWidth` on the corporate carousel stayed at 3792 across a 6-card hover sweep —
  invariant holds, no flicker.
- Keyboard: Tab reaches the corporate Inquire link; computed `box-shadow` shows a full
  `inset` white ring (not clipped, per the `ring-inset` the plan specifies for the
  `Collapse`-clipped corner).
- Landing Inquire → real navigation to `/corporate-training?program=<key>#inquiry`, prefill
  text "Enquiring about <title>" confirmed live. Corporate Inquire → URL replace (no full
  reload, same page title before/after), same prefill text confirmed live with a real mouse
  down/up on the link's actual coordinates.
- Dark mode: landing/corporate `h3` renders white text, no drift.
- Reduced motion (`reducedMotion: "reduce"`) at 1440: zero hydration-tagged console messages
  across `/`, `/corporate-training`, `/workshops`.

**Workshops (items 8–11)**

- Label + "Showing X of Y" on one line at 390, 768, 1024, 1440 — tops within 4px, label left
  and "Showing" right both match the documented gutters (16/24/24/104).
- All 7 chip buttons share one `top`, min height 44px, inner pill 32px, at every size tested.
- 1024/1440: `scrollWidth === clientWidth`, `mask-image: none` — no scroll, no fade.
- 768/390: `scrollWidth > clientWidth`; `mask-image` is right-only at `scrollLeft=0`,
  left-only at the end, both in the middle — exact fade logic from the plan.
- **Real touch swipe at 390** via CDP `Input.synthesizeScrollGesture` (gestureSourceType:
  touch): the chip row's `scrollLeft` moved from 0 to 248.5, while `window.scrollX` stayed 0
  — the row scrolls, the page does not scroll horizontally, confirming the priority ask
  directly. (A raw `Input.dispatchTouchEvent` sequence without gesture synthesis did _not_
  produce scroll — a known headless-touch limitation, not a product bug; noted so the next
  tester doesn't waste time on the same dead end.)
- No page-level horizontal overflow at 390/768 (`document.documentElement.scrollWidth ===
innerWidth`).
- Soon-card placement, 1440, all 7 n-values via real chip clicks (not just math): n=1 right,
  n=2 left, n=3 right, n=4 left, n=5 right, n=6 left, n=7 (All) right — matches the parity
  table exactly, x-positions match (left 104 / right 736).
- Dark mode on the workshops chip row: "All" pill renders in brand red, unselected chips
  keep visible ring/text contrast — screenshot-confirmed, no default-blue leakage.

**Regression / hygiene**

- Landing workshops row first card still at 40 (unchanged by this pass).
- `companies-marquee.tsx` (both copies) byte-identical to `a0c3049`.
- No new `uppercase` eyebrow above any heading.
- No hydration warnings on any of the three routes under reduced motion.

## Tooling notes worth keeping (RULES-style, not shipped as defects)

- A `locator.click()` on the corporate program cards timed out with "element is not stable"
  — Playwright's built-in `scrollIntoViewIfNeeded()` + implicit hover fought the rail's
  scroll-snap and the card's own hover-widen transition. Switching to a manual
  `mouse.move({steps: N})` → settle → `mouse.down/up` at the link's real coordinates
  resolved it and proved the click genuinely works. Matches the existing
  `09-verification.md` lesson about `boundingBox()`/hover artifacts; didn't need a new entry.
- A `mouse.move` straight to an off-screen (not-yet-scrolled-to) card coordinate silently
  no-ops — this is the exact "target's y below the viewport" lesson already in
  `09-verification.md` §28. My first hover measurement hit it and produced a false-looking
  negative-gap "defect" that didn't reproduce once I scrolled the card into view first.
  Recording this so it's clear the false positive was caught, not shipped.

## Not tested

- The empty-state ("Show all workshops") path in `workshop-tag-filter.tsx` — every tag has
  ≥1 workshop today (OR semantics across 6 tags, 7 workshops), so no chip combination
  currently produces `filtered.length === 0` through the UI. The code path exists
  (`src/app/_components/workshop-tag-filter.tsx:193`) but I could not reach it without
  editing workshop data, which is out of scope. Flagging as untested rather than assuming it
  works.
- Visual regression at 320px was not separately driven (checklist only asks for 390/360 down
  to 1920) — the 360px numbers above (28rem card, 24px gaps) leave enough margin that 320px
  is very likely fine, but this is reasoned, not measured.
- No real iOS/Android device pass — all touch behaviour is CDP-emulated per the plan's own
  instructions.

## Cleanup

- Never started or killed the `:3000` server (confirmed not mine, left running).
- My own `next dev -p 3403` attempt exited itself (Next 16 directory lock) — `lsof -i :3403`
  → empty, `ps -p <pid>` → gone.
- `mcp__playwright browser_close` called; `lsof -i :3401 -i :3402 -i :3403` → empty.
- Removed working screenshots/`.playwright-mcp/` artifacts created during this pass.
- Did not touch `MEETING-NOTES.md` or any file outside the two owned by this plan's tester
  scope (`TEST-feedback-4.md` only).
