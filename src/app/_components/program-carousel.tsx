"use client"

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import Image from "next/image"
import { ArrowRight, Check } from "lucide-react"
import { ScrollArrows } from "@/app/_components/scroll-arrows"
import { Reveal } from "@/app/_components/reveal"
import { useReducedMotionSafe } from "@/app/_lib/use-reduced-motion-safe"
import { useIsTouch } from "@/app/_lib/use-is-touch"
import { smoothScrollToElement } from "@/app/_lib/smooth-scroll-to"

/**
 * Corporate Training page only — "Programs we run in-house". A horizontal
 * rail of ten programme cards (Adrian's six plus four 2026-09-24
 * placeholders, from `CORPORATE_PROGRAMMES`), ~3.5 visible at 1440px.
 *
 * Interactive only with a desktop-width screen **and** a real pointer
 * (`useIsTouch`, RULES §14 — a tablet is desktop-wide and cannot hover).
 * At rest a card shows its title and full description. Hovering or
 * keyboard-focusing (desktop + pointer only) widens it sideways to reveal
 * who the programme is for and an Inquire button, swapping out the
 * description; its siblings give up exactly the width the active card
 * gains, via `SIBLING_REM`, so the row's total width never changes —
 * nothing to the right of the hovered card jumps and the arrows' enabled
 * state can't flip mid-hover. That invariant also keeps hover stable
 * (RULES §14): the newly-active card's span always contains its previous
 * span, so the pointer can never fall off the card it just entered —
 * re-check the constants below before changing any of them.
 *
 * On touch (any width) and below `lg`, nothing expands: every card is
 * static — title, "Useful for" bullets and Inquire, no description, no
 * toggle button, and the constant-width take-over is off (cards are a
 * fixed-width swipe rail with snap). This is the RULES §14 "touch control
 * is the default" order — `interactive` starts `false` on SSR and first
 * paint, so both layouts hydrate safely (§10).
 *
 * The inset (pass 4, 2026-09-24): the rail starts at a constant 40px
 * (`lg:pl-10`) at every desktop width, identical to the landing workshops
 * row (`ROW` in `event-cards.tsx`). The header stays on the page's 80rem
 * column like every other heading, which is also what the landing workshops
 * section does. History: 80rem column → 96rem column (pass 3) → constant
 * 40px (pass 4).
 *
 * B <-> C contract (see docs/feedback-passes/PLAN-feedback-2.md): clicking Inquire replaces the
 * URL with `/corporate-training?program=<key>#inquiry` (so a reload / shared
 * link preselects the programme) *and* dispatches a `PROGRAM_INQUIRE_EVENT`
 * window CustomEvent with `{ key }` (so a second click on the same programme,
 * after the visitor changed the form's select by hand, re-applies — a URL
 * that didn't change can't do that). `inquiry-form.tsx` (task C) listens for
 * both. The event name string is duplicated as a local constant in both
 * files on purpose, so neither task depends on the other to compile.
 *
 * The landing page keeps `SpecRevealCards` unchanged — do not merge these two
 * components, they solve different layouts (vertical expand-in-place stack
 * vs. a horizontal constant-width rail).
 */

export type ProgramCard = {
  key: string // Specialization.key — used in ?program=<key>
  title: string
  blurb: string
  usefulFor: string[]
  image: string
  imageAlt: string
  imagePosition?: string // CSS object-position, default "50% 50%"
}

const REST_REM = 22 // every card at rest
const ACTIVE_REM = 34 // hovered / focused / tapped card
// Rail gap is `gap-5` (1.25rem) — see RAIL below. No sibling-width math reads
// this value; it stays as a comment for whoever edits the gap next.
// Siblings give up exactly what the active card takes, so the row's total
// width never changes — nothing to the right of the hovered card jumps, the
// scroll range is constant, and the arrows' enabled state never flips
// mid-hover.
// Invariant also relied on for hover stability (RULES §14): with these
// numbers the newly-active card's new span always contains its previous
// span, so the pointer can't fall off the card it just entered. Re-check
// that before changing any value.
const SIBLING_REM = (n: number) => (n * REST_REM - ACTIVE_REM) / (n - 1) // 20.67rem for n=10 (19.6 for n=6)
const EASE = "cubic-bezier(0.33, 1, 0.68, 1)" // = SpecRevealCards' [0.33,1,0.68,1]
const DURATION_MS = 420 // = SpecRevealCards' 0.42s
const PROGRAM_INQUIRE_EVENT = "ad:program-inquire" // Must match the constant in corporate-training/_sections/inquiry-form.tsx — see docs/feedback-passes/PLAN-feedback-2.md.

const RAIL =
  "no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-1 sm:scroll-px-8 sm:px-8 lg:snap-none lg:gap-5 lg:scroll-px-0 lg:pr-0 lg:pb-0 lg:pl-10"

const CARD =
  "group relative h-[32rem] w-[82vw] max-w-[22rem] shrink-0 snap-start overflow-hidden rounded-3xl contain-layout lg:h-[34rem] lg:w-auto lg:max-w-none lg:flex-[0_0_22rem]"

// Static (touch / below lg) detail wrapper: full width, no fixed rail width.
// Interactive (desktop + pointer) detail wrapper: fixed width so the bullets
// don't reflow while the card widens.
const DETAIL_INTERACTIVE = "w-full pt-1 lg:w-[30rem]"
const DETAIL_STATIC = "w-full pt-1"

// Desktop + pointer card title. Extra-bold at all sizes (pass 4, 2026-09-24).
// max-w keeps the text from reflowing while the card widens (see SIBLING_REM).
const TITLE_INTERACTIVE =
  "max-w-[15.5rem] text-xl leading-tight font-extrabold tracking-[-0.01em] text-balance text-white lg:text-[1.65rem]"

// Static (touch / below lg) card title — IDENTICAL literal in
// spec-reveal-cards.tsx and program-carousel.tsx (feedback pass 4,
// 2026-09-24): extra-bold like the workshop card titles, centred on
// phones with 24px to the bullets (mb-2 + the column's 16px gap). From lg
// (touch tablets only reach this) it drops back to left-aligned.
const TITLE_STATIC =
  "mx-auto mb-2 max-w-[15.5rem] text-center text-xl leading-tight font-extrabold tracking-[-0.01em] text-balance text-white lg:mx-0 lg:mb-0 lg:shrink-0 lg:text-left lg:text-[1.65rem]"

// Same wipe-fill + colour-invert Register mechanic as `event-cards.tsx` —
// copied literally so the glow/border still changes with the fill on hover
// (memory rule).
const REGISTER_PILL =
  "group/reg text-brand-foreground bg-brand before:bg-background hover:text-foreground relative isolate inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg shadow-black/25 transition-[color,transform,box-shadow] duration-300 before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:transition-transform before:duration-300 before:content-[''] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40 hover:before:scale-x-100"

/** Grid-rows collapse, shared by the blurb (open at rest) and the detail
 *  panel (open on expand). Literal classes only. */
function Collapse({
  open,
  id,
  inert,
  children,
}: {
  open: boolean
  id?: string
  inert?: boolean
  children: ReactNode
}) {
  return (
    <div
      id={id}
      inert={inert}
      className={`grid transition-[grid-template-rows,opacity] duration-[420ms] ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}

/** Replaces the URL, fires the B<->C event, then scrolls the form into view
 *  — the scroll and prefill signal are separate on purpose (see file doc
 *  comment). */
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
  else smoothScrollToElement(target)
}

export function ProgramCarousel({
  items,
  heading,
}: {
  items: ProgramCard[]
  /** Rendered in the header row, left; the desktop arrows sit right of it. */
  heading: ReactNode
}) {
  const reduce = useReducedMotionSafe()

  // Mount-gated so SSR and the first client render agree (RULES §10).
  const [desktop, setDesktop] = useState(false)
  const touch = useIsTouch()
  // Hover take-over only with a real pointer on a desktop-width screen
  // (RULES §14). Both start `false`, so SSR and first paint are the static
  // layout — the rule's "touch control is the default".
  const interactive = desktop && !touch && items.length > 1
  useEffect(() => {
    const mqDesktop = window.matchMedia("(min-width: 1024px)")
    const sync = () => setDesktop(mqDesktop.matches)
    sync()
    mqDesktop.addEventListener("change", sync)
    return () => mqDesktop.removeEventListener("change", sync)
  }, [])

  // null = all cards at rest, equal width.
  const [active, setActive] = useState<number | null>(null)

  // Drop any active card if interactivity turns off mid-session (mouse
  // unplugged, window resized below lg).
  useEffect(() => {
    if (!interactive) setActive(null)
  }, [interactive])

  const railRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ left: false, right: false })

  useEffect(() => {
    const el = railRef.current
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
    el.addEventListener("transitionend", queue)
    const ro = new ResizeObserver(queue)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", queue)
      el.removeEventListener("transitionend", queue)
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [items])

  const nudge = (dir: 1 | -1) => {
    const el = railRef.current
    if (!el) return
    el.scrollBy({
      left: dir * Math.max(320, el.clientWidth * 0.8),
      behavior: reduce ? "instant" : "smooth",
    })
  }

  const hasOverflow = edges.left || edges.right

  const renderCard = (item: ProgramCard, i: number) => {
    const isOpen = interactive && active === i
    const basis =
      active === null
        ? REST_REM
        : active === i
          ? ACTIVE_REM
          : SIBLING_REM(items.length)
    const style: CSSProperties | undefined = interactive
      ? {
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: `${basis}rem`,
          transition: reduce ? "none" : `flex-basis ${DURATION_MS}ms ${EASE}`,
        }
      : undefined
    const panelId = `program-${item.key}-detail`

    const detail = (
      <div className={interactive ? DETAIL_INTERACTIVE : DETAIL_STATIC}>
        <p className="text-sm font-semibold text-white">Useful for</p>
        <ul className="mt-2 space-y-1.5">
          {item.usefulFor.map((b) => (
            <li
              key={b}
              className="flex gap-2.5 text-sm leading-snug text-white/90"
            >
              <Check
                className="mt-0.5 size-4 shrink-0 text-white/70"
                aria-hidden
              />
              {b}
            </li>
          ))}
        </ul>
        {/* Bottom-right (pass 4). In interactive mode this sits inside
            the fixed 30rem `DETAIL_INTERACTIVE`, which is exactly the active
            card's content width, so it lands at the card's bottom-right
            without touching any width. ring-inset because `Collapse`'s
            overflow-hidden clips an outer ring at this edge. */}
        <div className="mt-5 flex justify-end">
          <a
            href={`/corporate-training?program=${item.key}#inquiry`}
            onClick={(e) => {
              e.preventDefault()
              inquire(item.key, reduce)
            }}
            className={`${REGISTER_PILL} pointer-events-auto focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none focus-visible:ring-inset`}
          >
            Inquire
            <span className="sr-only"> about {item.title}</span>
            <ArrowRight className="size-4 transition-transform duration-300 group-hover/reg:translate-x-1" />
          </a>
        </div>
      </div>
    )

    return (
      <div
        key={item.key}
        className={CARD}
        style={style}
        onMouseEnter={interactive ? () => setActive(i) : undefined}
      >
        <Image
          fill
          src={item.image}
          alt={item.imageAlt}
          sizes="(min-width: 1024px) 34rem, 82vw"
          style={{ objectPosition: item.imagePosition ?? "50% 50%" }}
          className={`object-cover transition-transform duration-500 motion-reduce:transition-none ${isOpen ? "scale-[1.03]" : "scale-100"}`}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/35 to-black/10" />
        <div
          className={`absolute inset-0 bg-black/35 transition-opacity duration-300 motion-reduce:transition-none ${!interactive || isOpen ? "opacity-100" : "opacity-0"}`}
        />
        {interactive && (
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={`${item.title} — who it's for`}
            className="absolute inset-0 z-10 cursor-pointer rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-inset"
            onClick={() => setActive(i)}
            onFocus={(e) => {
              if (e.currentTarget.matches(":focus-visible")) setActive(i)
            }}
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col gap-3 p-6 lg:p-8">
          <h3 className={interactive ? TITLE_INTERACTIVE : TITLE_STATIC}>
            {item.title}
          </h3>
          {interactive ? (
            <>
              <Collapse open={!isOpen}>
                <p className="max-w-[15.5rem] text-sm leading-relaxed text-white/85 lg:text-base">
                  {item.blurb}
                </p>
              </Collapse>
              <Collapse open={isOpen} id={panelId} inert={!isOpen}>
                {detail}
              </Collapse>
            </>
          ) : (
            detail
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="mb-10 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          {/* Two dynamic siblings in one JSX position — the passed-in
              `heading` (owned by the caller) and the conditionally-rendered
              arrows — get reconciled as an array and need explicit keys, or
              React warns "each child in a list should have a unique key". */}
          <Fragment key="heading">{heading}</Fragment>
          {hasOverflow && (
            <ScrollArrows
              key="arrows"
              edges={edges}
              onNudge={nudge}
              previousLabel="Previous programmes"
              nextLabel="Next programmes"
              className="flex self-end"
            />
          )}
        </div>
      </div>

      <Reveal>
        <div
          ref={railRef}
          onMouseLeave={() => interactive && setActive(null)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null))
              setActive(null)
          }}
          className={RAIL}
        >
          {items.map((item, i) => renderCard(item, i))}
          <div aria-hidden className="w-px shrink-0 lg:w-8" />
        </div>
      </Reveal>
    </div>
  )
}
