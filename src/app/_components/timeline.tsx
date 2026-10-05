"use client"

import Image from "next/image"
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useReducedMotionSafe } from "@/app/_lib/use-reduced-motion-safe"
import { cn } from "@/lib/utils"

// Gap between mobile cards (`gap-6`), used to step the rail by exactly one
// card width when reading scroll position or driving the arrow buttons.
const MOBILE_GAP_PX = 24

/**
 * Mobile journey rail — the same entries as a horizontal snap-scroll strip,
 * with a dot indicator (which card is centred) and arrow buttons that step
 * one card at a time, matching the fan-carousel's dots + arrows treatment.
 */
function MobileJourneyRail({ entries }: { entries: TimelineEntry[] }) {
  const railRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const step = useCallback(() => {
    const card = railRef.current?.children[0] as HTMLElement | undefined
    return (card?.offsetWidth ?? 0) + MOBILE_GAP_PX
  }, [])

  useEffect(() => {
    const el = railRef.current
    if (!el) return
    const onScroll = () => {
      const s = step()
      if (!s) return
      setActive(Math.round(el.scrollLeft / s))
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [step])

  const go = (dir: 1 | -1) => {
    const el = railRef.current
    const s = step()
    if (!el || !s) return
    const target = Math.min(entries.length - 1, Math.max(0, active + dir))
    el.scrollTo({ left: target * s, behavior: "smooth" })
  }

  return (
    <div className="md:hidden">
      <div
        ref={railRef}
        className="no-scrollbar -mx-6 flex snap-x snap-mandatory scroll-px-6 gap-6 overflow-x-auto px-6 pb-2"
      >
        {entries.map((entry, i) => (
          <article
            key={`${entry.year}-${i}-m`}
            className="w-[78vw] shrink-0 snap-start"
          >
            <h3 className="text-brand font-serif text-3xl tracking-[-0.02em]">
              {entry.year}
            </h3>
            {entry.logoSrc && (
              <div className="relative mt-5 h-32 w-full">
                <Image
                  src={entry.logoSrc}
                  alt={entry.logoAlt ?? ""}
                  fill
                  sizes="280px"
                  className="object-contain object-center"
                />
              </div>
            )}
            <h4 className="text-foreground mt-5 font-serif text-xl tracking-tight">
              {entry.title}
            </h4>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              {entry.body}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={active === 0}
          aria-label="Previous"
          className="border-border/60 text-foreground flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="flex items-center gap-2">
          {entries.map((_, i) => (
            <span
              key={i}
              className={cn(
                "size-2 rounded-full transition-all duration-300",
                i === active ? "bg-brand scale-125" : "bg-foreground/15"
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={active === entries.length - 1}
          aria-label="Next"
          className="border-border/60 text-foreground flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-30"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

export type TimelineEntry = {
  /** Year or short period label, e.g. "2004" or "2017–2019". */
  year: string
  title: string
  body: string
  /** Optional logo (cert body, school). */
  logoSrc?: string
  logoAlt?: string
}

type JourneyTimelineProps = {
  entries: TimelineEntry[]
  className?: string
}

// Scroll-linked MotionValues are stepped — one discrete jump per wheel/trackpad
// event — which makes a raw beam stutter. Running progress through a spring
// turns those steps into a continuous glide, and because everything downstream
// reads this one spring, the beam and every entry's highlight can never drift
// out of step with each other.
//
// Tuned stiff and only lightly underdamped: the years it is chasing are pinned
// by CSS and have zero lag, so a softer spring leaves the tip visibly trailing
// on a fast scroll. Kept just short of critical damping — overshoot here would
// run the tip past the node it had just reached.
const SPRING = { stiffness: 300, damping: 24, mass: 0.25, restDelta: 0.0005 }

// The lock: a year holds at `md:top-40` — 160px down the viewport — for as
// long as its own card is passing, then its row pushes it up as the next year
// arrives. A fixed `md:h-16` column is what makes the node's resting line a
// known constant rather than something that shifts with the year's type size:
// the node is centred in that column, so it comes to rest 160 + 32 = 192px
// down. Both the beam and every highlight are measured against that one line.
const LOCK_PX = 160
const COLUMN_PX = 64
const ANCHOR_PX = LOCK_PX + COLUMN_PX / 2
// Below md nothing locks: the column collapses and only the node is left,
// sitting half its own height below the card's top edge.
const LOOSE_NODE_PX = 20

// How much scroll, in px, a highlight takes to fade in before it comes on and
// to fade out after it releases.
const RAMP_PX = 150

// How far ahead of its own node the year comes on, so it hands off from the
// entry above with no dead stretch where nothing is lit. The dot and its halo
// stay on the unshifted window — the beam's tip IS the anchor line, so lighting
// a node early would light it while the beam was still short of it.
const YEAR_LEAD_PX = 240

// Out-of-range stops, used until a row has been measured, so every entry reads
// "inactive" on first render instead of flashing a highlight.
const UNMEASURED: [number, number] = [2, 2.0001]
const UNMEASURED_STOPS = [2, 2.0001, 2.0002, 2.0003]

function smoothstep(t: number) {
  return t * t * (3 - 2 * t)
}

// A 0→1 "this is the active entry" pulse: ramps up to `on`, holds flat across
// the locked stretch, ramps back down after `off`.
function rampAt(v: number, stops: number[]) {
  const [fadeIn, on, off, fadeOut] = stops
  if (v <= fadeIn || v >= fadeOut) return 0
  if (v < on) return smoothstep((v - fadeIn) / (on - fadeIn))
  if (v <= off) return 1
  return smoothstep((fadeOut - v) / (fadeOut - off))
}

function TimelineRow({
  entry,
  progress,
  railHeight,
  reduced,
}: {
  entry: TimelineEntry
  progress: MotionValue<number>
  railHeight: number
  reduced: boolean
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const columnRef = useRef<HTMLDivElement>(null)

  // The window, in px down the rail, during which this entry's year is locked
  // at the anchor line — measured rather than guessed, since it's pure sticky
  // geometry and depends on how tall this particular card happens to be.
  const [span, setSpan] = useState<[number, number]>(UNMEASURED)

  useEffect(() => {
    const row = rowRef.current
    const column = columnRef.current
    if (!row || !column) return

    const measure = () => {
      // Rows are in-flow children of the rail, which is `relative`, so
      // `offsetTop` is the row's position down the rail. The column is
      // sticky, so only its height is read from it — never its offset.
      const rowStyle = getComputedStyle(row)
      const padTop = parseFloat(rowStyle.paddingTop) || 0
      const padBottom = parseFloat(rowStyle.paddingBottom) || 0
      const contentHeight = row.clientHeight - padTop - padBottom

      // Sticky is bounded by the row's content box, not its padding box, so
      // padding above the entry buys no travel at all.
      const locks = getComputedStyle(column).position === "sticky"
      const node = locks ? column.offsetHeight / 2 : LOOSE_NODE_PX
      const start = row.offsetTop + padTop + node
      const end = locks
        ? start + Math.max(0, contentHeight - column.offsetHeight)
        : start

      setSpan((prev) =>
        prev[0] === start && prev[1] === end ? prev : [start, end]
      )
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(row)
    observer.observe(column)
    return () => observer.disconnect()
    // A row above this one growing (late photos) shifts this row's offsetTop
    // without resizing it, and always changes the rail's height — so
    // re-measure whenever the parent reports a new one.
  }, [railHeight])

  const { nodeStops, yearStops } = useMemo(() => {
    if (!railHeight || span === UNMEASURED) {
      return { nodeStops: UNMEASURED_STOPS, yearStops: UNMEASURED_STOPS }
    }
    const ramp = RAMP_PX / railHeight
    const lead = YEAR_LEAD_PX / railHeight
    const a = span[0] / railHeight
    // Below md nothing locks, so the window collapses to a point. Keep the
    // stops strictly increasing so the ramp still resolves.
    const b = Math.max(a + 0.0001, span[1] / railHeight)
    return {
      nodeStops: [a - ramp, a, b, b + ramp],
      // Only the leading edge moves — the release stays put, so an entry
      // holds its colour right up to the moment its row pushes it off.
      yearStops: [a - lead - ramp, a - lead, b, b + ramp],
    }
  }, [span, railHeight])

  const stopsRef = useRef({ nodeStops, yearStops })
  stopsRef.current = { nodeStops, yearStops }

  // Drives the dot and its halo: strictly the window in which the beam's tip
  // is on this node.
  const active = useTransform(progress, (v) =>
    rampAt(v, stopsRef.current.nodeStops)
  )
  // Drives the year, which comes on ahead of that.
  const highlight = useTransform(progress, (v) =>
    rampAt(v, stopsRef.current.yearStops)
  )
  const dotScale = useTransform(active, [0, 1], [0.62, 1])
  // Colour is not motion, so — unlike the dot scale and halo — it stays live
  // for reduced-motion users too; the highlight still reads even with the
  // beam and node animation switched off.
  const yearColor = useTransform(
    highlight,
    (v) =>
      `color-mix(in oklch, var(--muted-foreground), var(--brand) ${v * 100}%)`
  )

  return (
    // `relative z-20` so the rail (a later DOM sibling) doesn't paint its
    // line over the nodes. `pt` is breathing room only — sticky is bounded
    // by the content box, so the dwell comes from the card column's `min-h`.
    <div
      ref={rowRef}
      className="relative z-20 flex justify-start gap-6 pt-16 first:pt-0 md:pt-40 lg:gap-10"
    >
      {/* `self-start` is what makes the lock work: as a stretched flex item
          the column would be as tall as the card beside it and never unstick.
          At its own height it holds at the lock line for the card's whole
          pass, then the row's content box runs out and pushes it up exactly
          as the next year arrives. */}
      <div
        ref={columnRef}
        className="relative flex max-w-xs flex-col items-center md:sticky md:top-40 md:h-16 md:w-full md:flex-row md:items-center md:self-start md:max-lg:w-48 md:max-lg:shrink-0 lg:max-w-sm"
      >
        <div className="absolute left-3 z-10 flex h-10 w-10 items-center justify-center md:top-1/2 md:-translate-y-1/2">
          {/* Halo blooms only while this entry is the one the beam rests on. */}
          <motion.span
            aria-hidden
            className="bg-brand/30 absolute inset-0 rounded-full blur-md"
            style={{ opacity: reduced ? 0 : active }}
          />
          <span className="bg-background absolute inset-0 rounded-full" />
          <motion.span
            className="bg-brand relative block h-3.5 w-3.5 rounded-full"
            style={{ scale: reduced ? 1 : dotScale }}
          />
        </div>

        {/* Single label, colour driven by a CSS `color-mix()` string recomputed
            each frame — muted at rest, brand at full highlight. Stacking a
            separate muted layer under a fading brand overlay (the earlier
            approach) reads as a drop shadow behind the digits at every
            partial-opacity frame; one element never has that problem. */}
        <motion.h3
          className="hidden pl-20 font-serif text-4xl tracking-[-0.02em] md:block lg:text-5xl"
          style={{ color: yearColor }}
        >
          {entry.year}
        </motion.h3>
      </div>

      <div className="relative w-full pr-4 pl-20 md:min-h-[26rem] md:pl-4 md:max-lg:min-w-0 md:max-lg:flex-1">
        <h3 className="text-muted-foreground mb-4 block font-serif text-3xl tracking-[-0.02em] md:hidden">
          {entry.year}
        </h3>
        {entry.logoSrc && (
          <div className="relative mb-8 h-44 w-full max-w-lg sm:h-56">
            <Image
              src={entry.logoSrc}
              alt={entry.logoAlt ?? ""}
              fill
              sizes="(min-width: 640px) 512px, 400px"
              className="object-contain object-center"
            />
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h4 className="text-foreground font-serif text-2xl tracking-tight lg:text-[1.75rem]">
            {entry.title}
          </h4>
          <p className="text-muted-foreground mt-4 max-w-xl text-lg leading-relaxed">
            {entry.body}
          </p>
        </motion.div>
      </div>
    </div>
  )
}

/**
 * A guided journey rail. Each entry's year locks in place at a fixed line
 * while its content passes beneath it, and a spring-eased beam grows down the
 * spine in step with scroll progress. Every entry measures its own lock
 * window off real layout (`ResizeObserver`), so the beam's tip and each
 * entry's highlight can never drift apart — even as photos load in late and
 * reflow the rail.
 */
export function JourneyTimeline({ entries, className }: JourneyTimelineProps) {
  const railRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)
  const reduced = useReducedMotionSafe()

  useEffect(() => {
    const el = railRef.current
    if (!el) return

    const measure = () => setHeight(el.getBoundingClientRect().height)
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Both ends measured against the anchor line: progress is 0 when the rail's
  // top edge crosses it and 1 when its bottom edge does. So `progress *
  // railHeight` is always the distance from the rail's top down to that
  // line — the beam's tip sits permanently on it, the same line every year
  // locks to.
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: [`start ${ANCHOR_PX}px`, `end ${ANCHOR_PX}px`],
  })
  const progress = useSpring(scrollYProgress, SPRING)

  // The spring overshoots both ends of 0→1. Past 1 the beam would run beyond
  // the last node; below 0 a negative scaleY flips it and draws upward out of
  // the rail.
  const beamScale = useTransform(progress, (v) => Math.min(1, Math.max(0, v)))
  const beamOpacity = useTransform(progress, [0, 0.05], [0, 1])

  return (
    <div className={cn("relative", className)}>
      {/* Mobile — the same entries as a horizontal snap rail. The scroll-locked
          rail below is a desktop reading experience: each year holds at a fixed
          line while its content passes under it, which needs a tall row (26rem
          minimum) per entry. On a phone that added up to nearly four screens of
          scrolling for six entries, so there the journey is swiped through
          instead. Both branches are in the DOM and swapped with CSS — the logos
          are lazy images, so the hidden branch never fetches one. */}
      <MobileJourneyRail entries={entries} />

      <div ref={railRef} className="relative hidden md:block">
        {entries.map((entry, i) => (
          <TimelineRow
            key={`${entry.year}-${i}`}
            entry={entry}
            progress={progress}
            railHeight={height}
            reduced={reduced}
          />
        ))}

        {/* Fades are deliberately short — as percentages of a rail thousands of
          pixels tall, wide ones put the first node inside the transparent
          stretch, hiding the beam reaching it at exactly the moment it
          matters. */}
        <div
          style={{ height }}
          className="bg-border absolute top-0 left-8 w-0.5 overflow-hidden mask-[linear-gradient(to_bottom,transparent_0%,black_2%,black_98%,transparent_100%)]"
        >
          {/* Drawn at full height and revealed with scaleY rather than an
            animated height — height is a layout property recomputed on the
            main thread every frame, while a transform stays on the
            compositor, keeping the beam smooth against the locked columns. */}
          <motion.div
            style={{
              height,
              scaleY: reduced ? 1 : beamScale,
              opacity: reduced ? 1 : beamOpacity,
            }}
            className="bg-brand absolute inset-x-0 top-0 w-0.5 origin-top rounded-full"
          />
        </div>
      </div>
    </div>
  )
}
