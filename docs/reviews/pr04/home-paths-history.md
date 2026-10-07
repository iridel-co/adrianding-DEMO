# Home paths implementation history

Archived from the source header during PR04 cleanup. This preserves historical rationale; current behavior remains documented in source and the milestone plan.

```text
/**
 * Landing — the fork, straight out of the quote reveal. Two full-bleed cards,
 * edge-to-edge halves of the viewport on desktop and stacked on mobile:
 * workshops (individuals) on the left, corporate training on the right. The
 * cards span the whole section top to bottom; the heading is an overlay on their
 * top edge, kept legible by a page-ground fade over the card tops.
 *
 * Each card is a two-plate composite — a blurred room photo (`*-bg`) with a
 * cut-out of Adrian (`*-fg`, transparent PNG) registered on top at the same
 * frame. Both plates overscan their card (see `PLATE` + a small `scale`) so
 * they can move without ever exposing an edge; the overscan is kept modest so
 * the cut-out subject (feet on one, raised hand on the other) stays in frame.
 *
 * Parallax:
 *  - Scroll — as the card crosses the viewport both plates drift on Y, the
 *    foreground travelling further and against the background, so Adrian reads
 *    as standing in front of the scene rather than pasted onto it.
 *  - Pointer (mouse only) — a small opposing X sway follows the cursor across
 *    the card, springed so it settles rather than snaps.
 * Both are disabled wholesale under `prefers-reduced-motion`, which renders the
 * plates as two static covers.
 *
 * Mobile: the two cards are simply stacked, shorter, and the section heading is
 * NOT an overlay — it sits above them in normal flow in the page's own text
 * colour. Overlaying it works on desktop because the cards fill the viewport
 * behind it; on a phone it landed on top of the first card's photo and fought
 * that card's own title. Pointer parallax and the hover take-over are skipped
 * entirely on touch (`useIsTouch`) — a tap synthesises mouse events, so an
 * ungated handler leaves a card stuck in its hovered state.
 *
 * Take-over (lg only): hovering a card expands its grid column to ~2/3 while the
 * other yields, animated as one `grid-template-columns` transition on the
 * container. It is a real layout change, so each card's hit area grows with it —
 * no `transform: scale`, which would leave the hitbox behind and read as a snap.
 * The active card also gains `z-20` + a deeper shadow so it comes forward over
 * its neighbour. State lives on the container (`active`): set on a card's
 * mouse-enter, cleared only on the container's own mouse-leave, so sliding
 * straight from one card to the other hands off without a flicker instead of
 * blanking the state the new card just set (lessons 2026-08-14).
 *
 * White-tile flash (2026-09-04): the take-over used to resize the image plates
 * along with the card — they were `inset-[-12%]`, a percentage of a box whose
 * width is what the animation changes. Each plate carries `will-change:
 * transform`, so each is its own composited layer, and a composited layer that
 * changes size has to be re-rasterized at a new texture size every frame; tiles
 * that miss the frame deadline paint blank, which showed up as patches of the
 * card flashing white on every single hover.
 *
 * Fix: at `lg` the plates get a fixed 80vw width (`PLATE`) and the card's
 * `overflow-hidden` clips them, so the take-over is a curtain reveal over a
 * static texture instead of a resize. Parallax moved onto an inner node of each
 * plate so the wrapper can keep its own centring `-translate-x-1/2`
 * (framer-motion owns `transform` on the node it animates). The box-shadow swap
 * is now instant rather than transitioned, which drops a 110px-blur repaint of
 * the whole card from every frame of the animation.
 *
 * The scrims below are deliberately left resizing on `inset-0`: they are plain
 * gradients with no `will-change`, so they paint into the card's own layer and
 * never had the composited-resize problem. Pinning them to a fixed width was
 * tried and reverted — it visibly darkens the yielded card, for no win.
 *
 * The grid is animated in as one unit (no `Reveal` stagger) — stagger writes an
 * inline transform onto each direct child.
 *
 * Shrunk-card body fade (2026-09-25, revised): the first pass (commit
 * 55fd2f1) made each card an `lg:@container` and faded the blurb off a
 * *live* `@max-[439px]` container query — janky, because the fade tracked
 * the card's inline-size continuously through the whole 650ms
 * `grid-template-columns` transition (started late, finished ~1.3s after the
 * transition itself), and the blurb kept reflowing to the animating width
 * the whole time, which grew/shrank its wrapped line count and, because the
 * copy block is bottom-anchored (`justify-end`), visibly moved the title.
 *
 * Fixed by deciding both things ahead of time, from the viewport, instead of
 * tracking the card's own animated size:
 *
 * 1. Width lock — the blurb gets a fixed width, in `vw` rather than a
 *    container-relative unit, so it depends only on the *viewport* and can
 *    never change mid-transition regardless of what the card's own animated
 *    grid track is doing: `lg:w-[min(28rem,calc(100vw/3-10rem))]`.
 *    First attempt pinned this to the *resting* (50/50) width instead — it
 *    matched today's rest appearance exactly, but on real measurement (see
 *    `Verification`) it overflowed the *yielded* (1/3-width) card by 40–85px
 *    for any viewport where a resting-width blurb happens to still be
 *    visible (above `W`, see below), clipping mid-word against `CARD`'s
 *    `overflow-hidden`. Pinning to the yielded fraction instead (the
 *    narrowest state the blurb is ever shown in) guarantees it always fits
 *    its own card, in every hover state, at every `lg` width — the resting
 *    column is consequently a little narrower than before on very wide
 *    screens (down from 28rem to ~1/3 of viewport minus padding, e.g. 320px
 *    at 1440 vs. 448px previously), which is the correct trade: a narrower
 *    intact paragraph over a wider clipped one. Because it's viewport-driven
 *    either way, it cannot change mid-transition, so the blurb's height (and
 *    therefore the title's position above it) is constant at every point of
 *    the hover/unhover cycle, verified via `getBoundingClientRect().top` at
 *    rest, mid-hover and settled.
 * 2. Fade — the container-query check is replaced with the container's own
 *    `active` state (the same state that drives the take-over itself), so
 *    the trigger is genuinely the hover, not a width poll. Whether that
 *    trigger is allowed to fade anything at all is decided per viewport: the
 *    grid's fr ratio (`1.7fr 0.85fr`) makes the yielded card exactly
 *    `viewport / 3`, so it crosses the old 440px readability threshold at
 *    `viewport = 1320` (measured: 440.0px at 1320, 439.7px at 1319) — below
 *    that, `lg:max-[1319px]:` fades the yielded card's blurb; at/above it,
 *    the fade classes never apply and the (width-locked) blurb just stays
 *    visible. Fade-out is instant on hover start (0ms delay, 200ms
 *    opacity/visibility transition); fade-in on un-hover carries a 250ms
 *    delay before the same 200ms transition, so the text doesn't reappear
 *    until the card has mostly regrown (the grid's
 *    `cubic-bezier(0.22,1,0.36,1)` ease-out front-loads most of the growth).
 *    `motion-reduce:transition-none` keeps both edges instant, and `!reduce`
 *    gates the fade trigger itself — under reduced motion the columns never
 *    resize, so nothing should ever visually disappear.
 *
 * Title and CTA are unaffected; the paragraph keeps its layout box (no
 * `display:none`) so the card never changes height, and `CARD`'s existing
 * `overflow-hidden` still clips it. Below `lg` cards never shrink, so none
 * of this engages there.
 */
```
