"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, MapPin, Ticket } from "lucide-react"
import { Reveal } from "@/app/_components/reveal"
import { WorkshopTagPills } from "@/app/_components/workshop-tags"
import { type Workshop } from "@/lib/workshops"

/**
 * Shared event grid — one rounded, image-filled card per workshop, with a
 * permanent "more coming soon" card pinned last. Used on the landing
 * (<LandingWorkshopsOpen>) and the /workshops list.
 *
 * The component renders full-bleed: below `lg` the cards stack; from `lg` they
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
 * would lag the paint. On mobile every card shows the full content, stacked.
 *
 * The native scrollbar is hidden (`no-scrollbar`); on `lg` the row is driven by
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
 * the original chronological order exactly. The pinned "more coming soon"
 * card is just appended as the last item, so it lands wherever the list
 * naturally ends — no odd/even special-casing needed.
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

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  })
}

function ScrollArrows({
  edges,
  onNudge,
  className = "",
}: {
  edges: { left: boolean; right: boolean }
  onNudge: (dir: 1 | -1) => void
  className?: string
}) {
  const btn =
    "border-border/80 text-foreground flex size-11 items-center justify-center rounded-full border transition-colors hover:border-foreground hover:bg-foreground hover:text-background disabled:cursor-default disabled:opacity-25 disabled:hover:border-border/80 disabled:hover:bg-transparent disabled:hover:text-foreground"
  return (
    <div className={`${className} shrink-0 items-center gap-2.5`}>
      <button
        type="button"
        aria-label="Scroll to previous workshops"
        onClick={() => onNudge(-1)}
        disabled={!edges.left}
        className={btn}
      >
        <ArrowLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Scroll to more workshops"
        onClick={() => onNudge(1)}
        disabled={!edges.right}
        className={btn}
      >
        <ArrowRight className="size-5" />
      </button>
    </div>
  )
}

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
   *  the landing. "grid": static 2-column grid, no scroll/hover — every card
   *  renders in its expanded state. Used on /workshops. */
  variant?: "row" | "grid"
}) {
  const isGrid = variant === "grid"

  // null = resting. Set on a card's mouse-enter, cleared only by the row's own
  // mouse-leave — never per card — so adjacent cards hand off cleanly.
  const [active, setActive] = useState<number | null>(null)

  // Mirror `active` into a ref so the arrow-state sync (below) can read the live
  // hover state without having to be re-created every time it changes.
  const activeRef = useRef<number | null>(null)
  useEffect(() => {
    activeRef.current = active
  }, [active])

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

  // Scroll arrows (lg only). `edges` says whether there's more row to scroll in
  // each direction — drives the buttons' disabled state.
  const rowRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ left: false, right: false })

  useEffect(() => {
    if (isGrid) return
    const el = rowRef.current
    if (!el) return
    let raf = 0
    const sync = () => {
      raf = 0
      // Don't re-evaluate mid-hover: an expanded card balloons scrollWidth and
      // would flip an arrow's enabled state under the pointer.
      if (activeRef.current !== null) return
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
    // A card's hover take-over grows scrollWidth without a scroll/resize event.
    el.addEventListener("transitionend", queue)
    const ro = new ResizeObserver(queue)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", queue)
      el.removeEventListener("transitionend", queue)
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [isGrid, workshops.length])

  const nudge = (dir: 1 | -1) => {
    const el = rowRef.current
    if (!el) return
    el.scrollBy({
      left: dir * Math.max(320, el.clientWidth * 0.8),
      behavior: "smooth",
    })
  }

  const hasOverflow = edges.left || edges.right

  const renderCard = (w: Workshop, i: number) => {
    const isActive = interactive && active === i
    // A resting desktop card shows just its date eyebrow + title. The
    // summary, venue/price and Register button unfurl on the hovered
    // card, and show always on mobile (where every card is full-width).
    const revealed = !interactive || isActive
    return (
      <Link
        key={w.slug}
        href={`/workshops/${w.slug}`}
        onMouseEnter={() => interactive && setActive(i)}
        onFocus={() => interactive && setActive(i)}
        onBlur={() => interactive && setActive(null)}
        style={cardStyle(i)}
        className={`${CARD} ${isGrid ? GRID_HOVER : ""} ${
          isGrid || interactive ? "" : "lg:min-w-80 lg:flex-1 lg:basis-0"
        }`}
      >
        <Image
          src={w.image}
          alt={`${w.title} — Coach Adrian Ding`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover object-[center_26%]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/40 to-black/5" />

        <WorkshopTagPills
          tags={w.tags}
          className="absolute top-5 right-6 left-6 z-[1] lg:top-6 lg:right-8 lg:left-8"
        />

        <div className="relative flex h-full w-full flex-col justify-end gap-3 px-6 py-8 text-left text-white lg:px-8">
          <p className="text-xs font-semibold tracking-[0.22em] text-white/75 uppercase">
            {shortDate(w.start)}
          </p>
          <h3 className="text-[1.75rem] leading-[1.08] font-extrabold tracking-[-0.01em] text-balance lg:text-[2.125rem]">
            {w.title}
          </h3>

          <div
            className={`grid w-full transition-[grid-template-rows,opacity] duration-500 ease-out ${
              revealed
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0 lg:pointer-events-none"
            }`}
          >
            <div className="flex min-h-0 flex-col gap-4 overflow-hidden pt-3">
              <p className="max-w-md text-base leading-relaxed text-white/85">
                {w.summary}
              </p>
              {/* Venue/price and Register share one row, pinned to the
                  card's bottom edge — `justify-between` spaces them
                  apart instead of stacking Register on its own row. */}
              <div className="flex items-end justify-between gap-3 pt-1">
                <dl className="flex flex-col gap-1.5 text-sm text-white/85">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-4 shrink-0" />
                    <span className="line-clamp-1">{w.venue}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Ticket className="size-4 shrink-0" />
                    <span className="font-semibold text-white">{w.price}</span>
                  </div>
                </dl>
                {/* Register carries its own hover animation, separate
                    from the card-wide hover that drives the expansion.
                    Same wipe-fill + color-invert mechanic as `Button`
                    (see button.tsx) — a `::before` sweeps in from the
                    left and the label inverts brand-red-on-white to
                    white-on-dark. Lift-only, never scale: this pill
                    sits at the bottom-right corner of an
                    `overflow-hidden rounded-4xl` card, so any
                    transform that grows the box (scale) clips against
                    that edge. Translate is safe since it only needs
                    headroom above. */}
                <span className="group/reg text-brand-foreground bg-brand before:bg-background hover:text-foreground relative isolate inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg shadow-black/25 transition-[color,transform,box-shadow] duration-300 before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:transition-transform before:duration-300 before:content-[''] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40 hover:before:scale-x-100">
                  Register
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover/reg:translate-x-1" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
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
          // rest — the last real workshop always lands in the right column
          // (it holds the later half) unless there are 0-1 workshops total,
          // in which case right is empty and the last card is in left
          // instead. The soon-card goes in whichever column does NOT hold
          // that last real card, so it reads as an alternating close rather
          // than stacking directly under the final workshop.
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

            const lastCardIsRight = right.length > 0
            const soonDesktop = renderSoonCard("soon-desktop", "hidden lg:flex")
            if (lastCardIsRight) left.push(soonDesktop)
            else right.push(soonDesktop)

            return (
              <div className={GRID_ROW}>
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

      {!isGrid && hasOverflow && (
        <div className="mx-auto mt-8 hidden max-w-7xl justify-end px-6 sm:px-8 lg:flex">
          <ScrollArrows edges={edges} onNudge={nudge} className="flex" />
        </div>
      )}
    </div>
  )
}
