"use client"

import { EventCard } from "./event-card"
import { ScrollArrows } from "./scroll-arrows"
import { useHorizontalOverflow } from "@/app/_lib/use-horizontal-overflow"

import { useEffect, useRef, useState } from "react"
import { Reveal } from "@/app/_components/reveal"
import { type Workshop } from "@/lib/workshops"

/**
 * Shared event grid — one rounded, image-filled card per workshop, with a
 * permanent "more coming soon" card pinned last. Used on the landing
 * (<LandingWorkshopsOpen>) and the /workshops list.
 *
 * The component renders full-bleed: below `lg` cards use a snap rail; from `lg` they
 * become one horizontally scrolling row that starts near the left viewport
 * gutter (`lg:pl-10`) and runs off the right edge of the viewport when there
 * are more cards than fit. Render it OUTSIDE the section's `max-w-*` wrapper.
 *
 * Card content is anchored to the bottom-left. At rest a desktop card shows
 * only its date eyebrow + title. Hovering (lg only, pointer + no
 * reduced-motion) widens the card (grows its `flex-grow` AND its `flex-basis`)
 * while the siblings hold at a readable minimum, and reveals the rest —
 * summary, venue, price, and a Register button pinned to the card's
 * bottom-right — via a `grid-template-rows: 0fr → 1fr` collapse. Animating the
 * basis too means the expansion still reads once the row has overflowed into a
 * scroll. It is a real layout change — no `transform: scale`, whose hitbox
 * would lag the paint. On mobile every card shows the full content in a swipeable rail.
 *
 * The native scrollbar is hidden (`no-scrollbar`); overflowing rails are driven by
 * a pair of prev/next arrow buttons pinned bottom-right under the cards (aligned
 * to the 80rem content column), each enabled only while there's more row to
 * scroll that way. Trackpad / shift-wheel scrolling still works. The section
 * heading and any "see all" link live in the calling section, above this.
 *
 * State lives on the row (`active`): set on a card's mouse-enter, cleared only
 * on the row's own mouse-leave, so sliding straight from one card to the next
 * hands off without a flicker (lessons 2026-08-14). Keyboard focus mirrors it.
 * Arrow enabled-state is frozen while a card is open so it doesn't flip under
 * the pointer as the row balloons.
 *
 * `variant="grid"` (used on /workshops) drops the horizontal scroll row and
 * hover take-over entirely: cards render permanently in their "expanded"
 * state (summary, venue, price, Register all showing), split into two
 * independent columns — left holds the first half of the list, right holds
 * the rest, offset downward (`lg:mt-20`) for a staggered, skewed look rather
 * than a strict row-aligned grid. Because the split is first-half/second-half
 * (not interleaved odd/even), stacking the two columns on mobile reproduces
 * the original chronological order exactly. On the grid, the pinned "more
 * coming soon" card fills the shorter column: right when the count is odd,
 * left when it's even (pass 4). On mobile it's last in the rail.
 *
 * Every card carries its tag pills top-left, always visible (2026-09-19).
 */

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
const TRANSITION = `flex-grow 600ms ${EASE}, flex-basis 600ms ${EASE}`
const GROW_ACTIVE = 3
const GROW_SOON = 0.6
const BASIS_REST = "21rem"
const BASIS_ACTIVE = "36rem"

// `shrink-0` + an inline `flex-basis` is the whole trick: the active card keeps
// its expanded width even once the row overflows into a horizontal scroll.
// `contain-layout` scopes the flex-grow/flex-basis take-over's reflow cost to
// each card — it can't force a recalc outside its own box. Doesn't change the
// animation itself (still a deliberate layout transition, not a mistake —
// `transform: scale` would leave the hitbox lagging the paint, see below).
// Below `lg` a card is a fixed-width panel in a horizontal snap rail (see
// `ROW`/`GRID_ROW`) rather than a full-width block in a stack — six stacked
// cards ran to roughly four phone screens of scrolling on their own.
const CARD =
  "group relative flex h-104 w-[86vw] max-w-96 min-w-0 shrink-0 snap-start flex-col justify-end overflow-hidden rounded-4xl contain-layout lg:h-128 lg:w-auto lg:max-w-none"

// From `lg` the first card sits near the left viewport gutter (not aligned to
// the centred 80rem content column — that left too much dead space on wide
// screens). Below `lg` the same row is a swipeable, snapping rail: same flex
// direction as desktop, just snapped and given its own scroll padding so a
// card lands flush against the gutter. `lg:snap-none` because the desktop
// arrows nudge by a pixel amount and shouldn't be re-aligned by snapping.
const ROW =
  "no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-1 sm:scroll-px-8 sm:px-8 lg:snap-none lg:gap-5 lg:scroll-px-0 lg:pb-0 lg:pl-10"

// `variant="grid"`: two independent columns (no scroll row, no hover
// take-over) — side by side from `lg` with the right column pushed down for
// the staggered look. Below `lg` the columns collapse to `display: contents`
// so their cards become direct children of this one horizontal snap rail, in
// chronological order (left column holds the earlier half), instead of two
// stacked columns several screens tall.
const GRID_ROW =
  "no-scrollbar mx-auto flex max-w-7xl snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 sm:scroll-px-6 sm:px-6 lg:snap-none lg:items-start lg:gap-8 lg:overflow-visible lg:scroll-px-0 lg:pb-0"
const GRID_COL = "contents lg:flex lg:flex-1 lg:flex-col lg:gap-8"

// Grid-only hover: the whole card scales up in place (transform, not a real
// layout resize) and lifts above its neighbours — the same "grows on
// hover" interaction the gallery wall uses on its photo tiles. `isolate` +
// `hover:z-10` keeps the scaled-up card painting over its siblings instead
// of sinking behind the next one in DOM order.
//
// CSS transitions take their duration/easing from the state being entered
// (spec: "after-change style"), so the unprefixed values drive the drop
// back to rest and the `hover:` values drive the grow — split so the drop
// can lean on a slow, soft-landing decelerate distinct from the grow's
// snappier settle, instead of one curve doing both jobs symmetrically.
//
// `shadow-2xl` is applied at rest too (not just on `hover:`), just at
// `shadow-black/0` — box-shadow can only interpolate between two values
// that share the same shape (same offset/blur/spread layers); animating
// from an undefined shadow (`none`) can't interpolate at all, so the
// shadow was snapping in/out instantly instead of easing with the scale,
// reading as a "pop" rather than a raise. Keeping the same shadow shape at
// both ends and only transitioning its alpha lets it fade in and out.
//
// Tailwind v4's `scale-*` utility sets the standalone CSS `scale` property,
// not `transform` — so `transition-[transform,...]` was transitioning a
// property nothing ever touches, leaving `scale` itself to jump instantly
// (the actual source of the "pop": the card snapped to size while only the
// shadow eased in). `scale` has to be named explicitly in the property list.
const GRID_HOVER =
  "isolate will-change-transform shadow-2xl shadow-black/0 transition-[scale,box-shadow] duration-600 ease-out hover:duration-700 hover:ease-[cubic-bezier(0.16,1,0.3,1)] hover:z-10 hover:scale-[1.035] hover:shadow-black/40"

export function EventCards({
  workshops,
  className,
  priority = false,
  variant = "row",
}: {
  workshops: Workshop[]
  className?: string
  /** Set when this grid is the page's above-the-fold content (e.g. /workshops),
   *  so the card images — one of which is the LCP — load eagerly. */
  priority?: boolean
  /** "row" (default): horizontal scroll row with the hover take-over, used on
   *  the landing. "grid": mobile snap rail, desktop 2-column grid — every card
   *  renders in its expanded state. Used on /workshops. */
  variant?: "row" | "grid"
}) {
  const isGrid = variant === "grid"

  // null = resting. Set on a card's mouse-enter, cleared only by the row's own
  // mouse-leave — never per card — so adjacent cards hand off cleanly.
  const [active, setActive] = useState<number | null>(null)

  // The width take-over is lg-only and pointer-only. Drive the flex sizing from
  // an inline style, but only once we know we're on a wide viewport with a real
  // pointer and motion is allowed — otherwise leave the stacked / equal layout
  // to Tailwind. Never on `variant="grid"` — those cards never take over width.
  const [interactive, setInteractive] = useState(false)
  useEffect(() => {
    if (isGrid) return
    const mq = window.matchMedia(
      "(min-width: 1024px) and (hover: hover) and (pointer: fine)"
    )
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setInteractive(mq.matches && !rm.matches)
    sync()
    mq.addEventListener("change", sync)
    rm.addEventListener("change", sync)
    return () => {
      mq.removeEventListener("change", sync)
      rm.removeEventListener("change", sync)
    }
  }, [isGrid])

  useEffect(() => {
    if (!interactive) setActive(null)
  }, [interactive])

  const cardStyle = (i: number): React.CSSProperties => {
    if (!interactive) return {}
    const isActive = active === i
    return {
      flexGrow: isActive ? GROW_ACTIVE : 1,
      flexShrink: 0,
      flexBasis: isActive ? BASIS_ACTIVE : BASIS_REST,
      transition: TRANSITION,
    }
  }

  // Controls follow actual overflow at every breakpoint. `edges` says whether there's more row to scroll in
  // each direction — drives the buttons' disabled state.
  const rowRef = useRef<HTMLDivElement>(null)
  const listKey = workshops.map((w) => w.slug).join("|")
  const { edges } = useHorizontalOverflow(rowRef, {
    resetKey: `${variant}:${listKey}:${interactive}`,
    suppressed: interactive && active !== null,
    childSelector: "a, :scope > div",
  })

  const nudge = (dir: 1 | -1) => {
    const el = rowRef.current
    if (!el) return
    el.scrollBy({
      left: dir * Math.max(320, el.clientWidth * 0.8),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    })
  }

  const hasOverflow = edges.left || edges.right

  const renderCard = (w: Workshop, i: number) => {
    const isActive = interactive && active === i
    return (
      <EventCard
        key={w.slug}
        workshop={w}
        priority={priority}
        revealed={!interactive || isActive}
        onActivate={() => interactive && setActive(i)}
        onDeactivate={() => setActive(null)}
        style={cardStyle(i)}
        className={`${CARD} ${isGrid ? GRID_HOVER : ""} ${
          isGrid || interactive ? "" : "lg:min-w-80 lg:flex-1 lg:basis-0"
        }`}
      />
    )
  }

  // Pinned last — always present, never expands. Half-height on the grid
  // variant. `display` defaults to a plain flex item ("flex"); the grid
  // variant passes a breakpoint-gated value so two copies can be rendered —
  // one sitting inside a column for desktop, one as a standalone trailing
  // block for mobile — without ever showing both at once.
  const renderSoonCard = (key: string, display = "flex") => (
    <div
      key={key}
      style={
        interactive
          ? {
              flexGrow: GROW_SOON,
              flexShrink: 0,
              flexBasis: BASIS_REST,
              transition: TRANSITION,
            }
          : undefined
      }
      className={`relative ${display} w-[86vw] max-w-96 min-w-0 shrink-0 snap-start flex-col items-center justify-center overflow-hidden rounded-4xl bg-black lg:w-auto lg:max-w-none ${
        // Matches the rail's card height on mobile (it sits in the same
        // horizontal row); still the shorter block on the desktop grid.
        isGrid ? "h-104 lg:h-64" : "h-104 lg:h-128"
      } ${isGrid || interactive ? "" : "lg:min-w-80 lg:flex-1 lg:basis-0"}`}
    >
      <div className="relative px-6 text-center">
        <p className="text-xl font-medium text-balance text-white lg:text-2xl">
          More events coming soon
        </p>
        <p className="mt-2 text-xs tracking-[0.16em] text-white/60 uppercase">
          Check back for new dates
        </p>
      </div>
    </div>
  )

  return (
    <div className={className}>
      <Reveal>
        {isGrid ? (
          // Left column holds the first half of the list, right holds the
          // rest. The soon-card goes in the shorter column, i.e. right when
          // the count is odd and left when it's even (see the math at the
          // push below).
          //
          // That desktop placement is rendered as a second, breakpoint-gated
          // copy (`hidden lg:flex`) inside the chosen column; a separate
          // mobile-only copy (`flex lg:hidden`) is appended after both
          // columns so stacking on mobile still reproduces the original
          // chronological order (workshops, then soon, last) regardless of
          // which column the desktop copy sits in.
          (() => {
            const leftCount = Math.ceil(workshops.length / 2)
            const left = workshops
              .slice(0, leftCount)
              .map((w, i) => renderCard(w, i))
            const right = workshops
              .slice(leftCount)
              .map((w, i) => renderCard(w, leftCount + i))

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

            return (
              <div ref={rowRef} className={GRID_ROW}>
                <div className={GRID_COL}>{left}</div>
                <div className={`${GRID_COL} lg:mt-20`}>{right}</div>
                {renderSoonCard("soon-mobile", "flex lg:hidden")}
              </div>
            )
          })()
        ) : (
          <div
            ref={rowRef}
            onMouseLeave={() => setActive(null)}
            className={ROW}
          >
            {workshops.map((w, i) => renderCard(w, i))}
            {renderSoonCard("soon")}
          </div>
        )}
      </Reveal>

      {hasOverflow && (
        <div className="mx-auto mt-8 flex max-w-7xl justify-end px-6 sm:px-8">
          <ScrollArrows
            edges={edges}
            onNudge={nudge}
            className="flex"
            previousLabel="Scroll to previous workshops"
            nextLabel="Scroll to more workshops"
          />
        </div>
      )}
    </div>
  )
}
