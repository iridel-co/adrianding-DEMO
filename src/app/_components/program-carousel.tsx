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
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { Reveal } from "@/app/_components/reveal"
import { useReducedMotionSafe } from "@/app/_lib/use-reduced-motion-safe"
import { smoothScrollToElement } from "@/app/_lib/smooth-scroll-to"

/**
 * Corporate Training page only — "Programs we run". A horizontal rail of six
 * programme cards, ~3.5 visible at 1440px. Hovering (desktop, pointer + hover
 * capable) or tapping/focusing (touch/keyboard) a card widens it sideways to
 * reveal who the programme is for and an Inquire button; its siblings give up
 * exactly the width the active card gains, via `SIBLING_REM`, so the row's
 * total width never changes — nothing to the right of the hovered card jumps
 * and the arrows' enabled state can't flip mid-hover. That invariant also
 * keeps hover stable (RULES §14): the newly-active card's span always
 * contains its previous span, so the pointer can never fall off the card it
 * just entered — re-check the constants below before changing any of them.
 *
 * Hover expands (mouse enter/leave on the card, cleared on the rail's own
 * leave). A tap toggles open/closed on the same card, and switches straight
 * to a different card on tap. Keyboard focus expands, mirroring hover, but
 * only real `:focus-visible` focus — a tap's synthetic focus does not also
 * fire this, or a tap would open-then-immediately-look-focused-open with no
 * way to tell it apart from a second tap closing it.
 *
 * Below `lg` the constant-width take-over is off entirely (cards are a fixed-
 * width swipe rail with snap) — see the `desktop` gate.
 *
 * B <-> C contract (see PLAN-feedback-2.md): clicking Inquire replaces the
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
const GAP_REM = 1.25 // gap-5
// Siblings give up exactly what the active card takes, so the row's total
// width never changes — nothing to the right of the hovered card jumps, the
// scroll range is constant, and the arrows' enabled state never flips
// mid-hover.
// Invariant also relied on for hover stability (RULES §14): with these
// numbers the newly-active card's new span always contains its previous
// span, so the pointer can't fall off the card it just entered. Re-check
// that before changing any value.
const SIBLING_REM = (n: number) => (n * REST_REM - ACTIVE_REM) / (n - 1) // 19.6 for n=6
const EASE = "cubic-bezier(0.33, 1, 0.68, 1)" // = SpecRevealCards' [0.33,1,0.68,1]
const DURATION_MS = 420 // = SpecRevealCards' 0.42s
const PROGRAM_INQUIRE_EVENT = "ad:program-inquire" // Must match the constant in corporate-training/_sections/inquiry-form.tsx — see PLAN-feedback-2.md.

const RAIL =
  "no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-1 sm:scroll-px-8 sm:px-8 lg:snap-none lg:gap-5 lg:scroll-px-0 lg:pr-0 lg:pb-0 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]"

const CARD =
  "group relative h-[32rem] w-[82vw] max-w-[22rem] shrink-0 snap-start overflow-hidden rounded-3xl contain-layout lg:h-[34rem] lg:w-auto lg:max-w-none lg:flex-[0_0_22rem]"

// Same wipe-fill + colour-invert Register mechanic as `event-cards.tsx` —
// copied literally so the glow/border still changes with the fill on hover
// (memory rule).
const REGISTER_PILL =
  "group/reg text-brand-foreground bg-brand before:bg-background hover:text-foreground relative isolate inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg shadow-black/25 transition-[color,transform,box-shadow] duration-300 before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:transition-transform before:duration-300 before:content-[''] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40 hover:before:scale-x-100"

const ARROW_BTN =
  "border-border/80 text-foreground flex size-11 items-center justify-center rounded-full border transition-colors hover:border-foreground hover:bg-foreground hover:text-background disabled:cursor-default disabled:opacity-25 disabled:hover:border-border/80 disabled:hover:bg-transparent disabled:hover:text-foreground"

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

function CarouselArrows({
  edges,
  onNudge,
}: {
  edges: { left: boolean; right: boolean }
  onNudge: (dir: 1 | -1) => void
}) {
  return (
    <div className="hidden items-center gap-2.5 lg:flex">
      <button
        type="button"
        aria-label="Previous programmes"
        onClick={() => onNudge(-1)}
        disabled={!edges.left}
        className={ARROW_BTN}
      >
        <ArrowLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Next programmes"
        onClick={() => onNudge(1)}
        disabled={!edges.right}
        className={ARROW_BTN}
      >
        <ArrowRight className="size-5" />
      </button>
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
  const [canHover, setCanHover] = useState(false)
  useEffect(() => {
    const mqDesktop = window.matchMedia("(min-width: 1024px)")
    const mqHover = window.matchMedia("(hover: hover) and (pointer: fine)")
    const sync = () => {
      setDesktop(mqDesktop.matches)
      setCanHover(mqHover.matches)
    }
    sync()
    mqDesktop.addEventListener("change", sync)
    mqHover.addEventListener("change", sync)
    return () => {
      mqDesktop.removeEventListener("change", sync)
      mqHover.removeEventListener("change", sync)
    }
  }, [])

  // null = all cards at rest, equal width.
  const [active, setActive] = useState<number | null>(null)

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
  }, [items.length])

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
    const isOpen = active === i
    const basis =
      active === null
        ? REST_REM
        : active === i
          ? ACTIVE_REM
          : SIBLING_REM(items.length)
    const style: CSSProperties | undefined = desktop
      ? {
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: `${basis}rem`,
          transition: reduce ? "none" : `flex-basis ${DURATION_MS}ms ${EASE}`,
        }
      : undefined
    const panelId = `program-${item.key}-detail`

    return (
      <div
        key={item.key}
        className={CARD}
        style={style}
        onMouseEnter={() => canHover && setActive(i)}
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
          className={`absolute inset-0 bg-black/35 transition-opacity duration-300 motion-reduce:transition-none ${isOpen ? "opacity-100" : "opacity-0"}`}
        />
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-label={`${item.title} — who it's for`}
          className="absolute inset-0 z-10 cursor-pointer rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-inset"
          onClick={() =>
            canHover ? setActive(i) : setActive((a) => (a === i ? null : i))
          }
          onFocus={(e) => {
            if (e.currentTarget.matches(":focus-visible")) setActive(i)
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col gap-3 p-6 lg:p-8">
          <h3 className="max-w-[15.5rem] text-xl leading-tight font-semibold tracking-[-0.01em] text-balance text-white lg:text-[1.65rem]">
            {item.title}
          </h3>
          <Collapse open={!isOpen}>
            <p className="line-clamp-3 max-w-[15.5rem] text-sm leading-relaxed text-white/85 lg:text-base">
              {item.blurb}
            </p>
          </Collapse>
          <Collapse open={isOpen} id={panelId} inert={!isOpen}>
            <div className="w-full pt-1 lg:w-[30rem]">
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
              <a
                href={`/corporate-training?program=${item.key}#inquiry`}
                onClick={(e) => {
                  e.preventDefault()
                  inquire(item.key, reduce)
                }}
                className={`${REGISTER_PILL} pointer-events-auto mt-5 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none`}
              >
                Inquire
                <span className="sr-only"> about {item.title}</span>
                <ArrowRight className="size-4 transition-transform duration-300 group-hover/reg:translate-x-1" />
              </a>
            </div>
          </Collapse>
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
            <CarouselArrows key="arrows" edges={edges} onNudge={nudge} />
          )}
        </div>
      </div>

      <Reveal>
        <div
          ref={railRef}
          onMouseLeave={() => canHover && setActive(null)}
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
