# TEST — feedback pass 3 (merged tree, main @ a0c3049)

Tested against the already-running dev server on :3000 (this repo's own tree, confirmed
live and serving the merged commits). No worktree/dev-server of my own was started, so
there was nothing to kill on that front. All Playwright driving was done via ad-hoc
`playwright-core` Node scripts (Chromium + WebKit from `~/Library/Caches/ms-playwright`),
fresh `browser.newContext()` per scenario, `browser.close()` in a `finally` on every
script. Verified after every run: no `chromium`/`headless_shell` process left behind
(`ps aux | grep -i "headless_shell\|ms-playwright"` → empty), no port bound on
3201–3204 (never used).

## Verdict

SHIP — no reproducible defects found against the plan's Definition of Done or the tester
checklist. Task B's previously-reported "Leadership → landed on Keynotes" off-by-one does
not reproduce on the merged tree; all 16 Inquire links (10 corporate + 6 landing) resolve
to their own programme.

## What I ran

```
npm run typecheck            → exit 0
npx eslint src                → 0 problems
npx prettier --check src PRD.md → clean
npm run build                 → exit 0 (Turbopack, 45 static pages)
grep -n "line-clamp\|canHover" src/app/_components/program-carousel.tsx        → empty
grep -n "line-clamp\|role=\"button\"" src/app/_components/spec-reveal-cards.tsx → only doc-comment mentions
grep -n "CORPORATE_PROGRAMMES" src/app/_sections/specializations.tsx           → only doc-comment
grep -n "SPECIALIZATIONS" src/app/corporate-training/_sections/inquiry-form.tsx → empty
grep -n "accent-brand mt-0.5 size-4" .../inquiry-form.tsx (old checkbox)        → empty
grep -c "TODO: placeholder programme — confirm with Adrian" src/lib/specializations.ts → 4
git diff 91a834e -- .../companies-marquee.tsx (both)                            → empty
```

Then ~14 ad-hoc Playwright scripts against `localhost:3000`, fresh context per scenario:

- All 10 corporate Inquire links (hover + click, 1440 mouse) → each `?program=<own key>`,
  each lands on "Enquiring about <own title>". Same for all 6 landing cards (hover each,
  click Inquire). **No off-by-one in either section.**
- Corporate + landing resting blurbs at 1440/1024: every `<p>` `scrollHeight === clientHeight`,
  computed `-webkit-line-clamp: none` — full text, no ellipsis, on all 10 + 6 cards.
- Corporate card hover (card 3, 1440): the blurb's Collapse ancestor measured
  `offsetHeight: 0, overflow: hidden` while hovered (truly hidden, not just visually
  covered) and the detail panel's ancestor measured `187px` visible. `rail.scrollWidth`
  identical before/during/after hover (3784px). 30-move rapid pointer sweep across the rail
  → zero console errors, zero pageerrors.
- Touch (1024 `hasTouch`) and mobile (390 `hasTouch+isMobile`) corporate: all 10 cards —
  no `button[aria-expanded]`, 4 bullets each, Inquire bottom never within 16px+ of clipping
  (measured `inquireBottom` vs `cardBottom`, both widths).
- Carousel inset: heading-left === card-left at 1024 (32px), 1440 (32px), 1920 (224px) —
  exact match to the plan's spec, never increases beyond 224px.
- Landing touch (1024 `hasTouch`, 390 mobile): all 6 cards static, 432px (27rem) height,
  no toggle button, 4 bullets, Inquire inside bounds.
- Keyboard: Tab onto the corporate rail reaches a card's toggle at `aria-expanded=true`
  (card expands on focus), next Tab lands on that card's own Inquire `<a>`. Same pattern
  confirmed on the landing stack (toggle found with `aria-expanded=true` at index 27 in tab
  order).
- Form (`/corporate-training#inquiry`, fill-sample → step 3): select has 12 options (10 +
  "Not sure yet" + presumably a disabled placeholder — see Nit below); 9 tiles in 2 columns
  at 1440 (`grid-template-columns: 256.719px 256.719px`), 1 column at 390
  (`grid-template-columns: 294px`, all tiles ≥ 62px tall). Primary (Leadership) correctly
  excluded from tiles; switching primary to "Customer Service Excellence" removed it from
  the tiles and returned Leadership to the list.
- Tile hover, measured `getComputedStyle` before/after on `background-color`,
  `border-color` and `box-shadow`: selected tile `lab(32.6…)→lab(53.1…)` background,
  matching border, shadow opacity `0.35→0.45` — all three shift together. Unselected tile:
  white→light brand wash background, transparent→brand/60 border, shadow appears. Matches
  the house "fill+border+glow move together" rule.
- Keyboard Space toggle on a tile checkbox: **confirmed working** (see note below — an
  earlier locator-based check of mine looked like a failure and it was a test artifact, not
  a product bug).
- Ticking 2 tiles (Customer Service Excellence, Emotional Intelligence at Work) → both
  appear in the step-4 review → Send inquiry → lands on `/corporate-training/inquiry-received`
  → both titles present in the confirmation page body. No console errors during the whole
  flow.
- Dark mode: selected tile background `lab(43.8…)` (brand, darker in dark mode as expected)
  with text color `lab(98.26 0 0)` (near-white) — readable.
- Copy: corporate heading exactly "Programs we run in-house", body opens exactly "Coach
  Adrian's corporate training programmes, delivered in-house for your company…". Landing
  heading "In-house programs, two decades deep", body opens "Coach Adrian's corporate
  training programmes, run in-house for companies and their teams…". Both match the plan
  literal strings.
- Landing section: exactly 6 cards, `page.content()` search confirms none of the 4
  placeholder titles (Sales Leadership & Coaching / Customer Service Excellence / Change
  Management & Resilience / Emotional Intelligence at Work) appear anywhere on `/`.
- About page: "Core program tracks" counter settles at **6** after scroll-triggered count-up.
- Workshop pill regression guard (item 7/13): Chromium **and** WebKit, 1024 and 1440, all 7
  row cards — `elementFromPoint` at the pill centre hits the pill both at rest and while the
  card is hovered (650ms settle). **Item 7 does not reproduce**, consistent with Phase 0's
  own finding — no code touched it and it still measures clean.
- Hydration/console: `reducedMotion: "reduce"` context, `/` and `/corporate-training`
  (including one reload) at 1024 and 1440 — the only console output on any of these routes
  is framer-motion's own dev-mode "Reduced Motion enabled" informational warning (pre-existing
  library notice, not a hydration warning, not caused by this pass). Zero React/Next
  hydration mismatches, zero page errors.
- Companies marquee: `git diff 91a834e` on both possible paths → empty, confirmed untouched.

### A methodology note worth recording (not a product defect)

While testing tile keyboard-Space, one locator pattern —
`fieldset.locator('label').filter({ hasNot: page.locator('input:checked') }).nth(1)` —
produced a false negative: `cb.isChecked()` read `false` after Space even though
`document.activeElement.checked` (captured at the same instant) read `true` and stayed
`true`. Root cause: that locator re-resolves its `hasNot` filter live, and the very act of
the checkbox becoming checked removes it from the "unchecked" set the filter matches, so
re-querying the same locator after the toggle returns a _different_ tile at `nth(1)`. Fixed
by reading `document.activeElement` directly instead of re-resolving a filtered locator
after a state-changing action. Confirmed clean with three independent methods (raw
`document.activeElement.checked`, a stable index-by-text locator, and a fresh
mouse-click test) — Space and click both toggle correctly on the first press, every time.
Flagging this so nobody re-trips on the same locator pattern in a future pass.

## Defects

None found at Blocker/Major/Minor severity.

### [Nit] Programme select shows 12 options, not 11

- **Where:** `/corporate-training#inquiry` → step 3 → `<select>`
- **Repro:** Fill sample data, Continue ×2, `select.locator('option').count()`.
- **Expected (plan A.5/Task C, checklist item 11):** "The select has 11 options (10 + 'Not
  sure yet')."
- **Actual:** 12 options counted.
- **Why it matters:** cosmetic/count-only; almost certainly a leading disabled
  `<option value="">Select a programme</option>` placeholder that the plan's option count
  didn't account for — visible in the step-3 dump as `"Select a programme"` before the 10
  titles. Not a functional problem (the real 10 + "Not sure yet" are all present and each
  is selectable), and it predates this pass structurally (a placeholder option is normal
  `<select>` practice). Flagging only because the plan's own DoD states "11 options"
  literally and the count is 12 — worth a one-line correction to the DoD text, not a code
  fix.
- **Confidence:** verified live.

## Held up under attack

- Off-by-one on Inquire prefill (the specific regression Task B's own report flagged) —
  tested exhaustively across all 16 cards, in DOM order, by hover-then-click on each: zero
  mismatches.
- Rail width stability under hover / rapid pointer sweep (30-point sweep, no flicker, zero
  console errors).
- Collapse containment: blurb genuinely `offsetHeight:0` while hovered, not just visually
  covered — ruled out a "both texts present, z-fighting" bug.
- Static/interactive mode switch on real touch emulation (not just narrow viewport) for both
  sections, both a mid-size touch tablet (1024) and a phone (390).
- Primary↔tile exclusion in both directions (pick new primary removes it from tiles AND
  restores the previous primary to the tile list).
- Full submit round-trip with 2 tiles ticked, through to the confirmation page, with the
  tiles' titles surviving into the confirmation list.
- Dark mode contrast on the one new component (tiles).
- Hydration/console cleanliness under `reducedMotion: reduce`, including a reload.
- Workshop pill regression in both browser engines, both widths — matches Phase 0's own
  measurement.
- Companies marquee byte-identical to `91a834e`.

## Not tested

- **Real touch gesture swipe/snap physics** on the corporate and landing rails at 390 —
  I verified the static layout renders correctly at that width/touch combination, but did
  not drive an actual `touchstart/touchmove/touchend` swipe sequence to confirm snap-scroll
  feel (Playwright's touch emulation doesn't cheaply reproduce native momentum scrolling).
- **Safari/WebKit** beyond the item-7 pill regression guard — did not re-run the full
  content/hover/touch matrix in WebKit, only Chromium. The plan's own DoD only requires
  WebKit for item 7.
- **1280×900 and other in-between widths** for the carousel inset beyond the three specified
  (1024/1440/1920) — not required by the DoD but would be quick to add if Chan wants it.
- **Real production build serving** (`next build && next start` under throttled
  CPU/network) — I ran `npm run build` for correctness but tested interactions against the
  dev server per the task's own instruction to test the already-running :3000. RULES §28
  flags dev-vs-prod image/decode timing as a real gap; not exercised here.
- **Emoji / RTL / 5000-char / SQL-ish input** into the inquiry form's text fields — this
  plan didn't touch validation or the text inputs (owns only the tile group + data source),
  so I didn't re-test unrelated form fields that Task C's own scope excludes.
