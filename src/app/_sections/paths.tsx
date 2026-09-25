"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { useReducedMotionSafe } from "@/app/_lib/use-reduced-motion-safe"
import { useIsTouch } from "@/app/_lib/use-is-touch"
import { smoothScrollToElement } from "@/app/_lib/smooth-scroll-to"
import { AttentionOnView } from "@/app/_components/attention-on-view"
import { Reveal } from "@/app/_components/reveal"
import { TextSweepReveal } from "@/app/_components/text-sweep-reveal"

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

type Path = {
  href: string
  bg: string
  /** 10px blur-up placeholder for `bg`, so the lazy-loaded photo doesn't pop
   * in as a blank rectangle mid-hover (lessons: same pattern as gallery-blur). */
  bgBlur: string
  fg: string
  imageAlt: string
  /**
   * Per-card position tweak for the fg cut-out (Tailwind translate utils).
   *
   * A percentage here resolves against the *plate*, not the card — so any
   * horizontal nudge needs an `lg:` restatement, because `PLATE` switches from
   * a 62vw-equivalent box to a fixed 80vw one at that breakpoint. Restate it in
   * `vw` (5% of 62vw = 3.1vw) so the cut-out lands in the same place either
   * side of the breakpoint. Vertical nudges resolve against the plate height,
   * which `PLATE` doesn't touch, so they need no restatement.
   */
  fgClass: string
  eyebrow: string
  title: string
  blurb: string
  cta: string
}

const PATHS: readonly [Path, Path] = [
  {
    href: "/workshops",
    bg: "/images/hero/workshop-bg.jpg",
    bgBlur:
      "data:image/jpeg;base64,/9j/2wBDABIMDRANCxIQDhAUExIVGywdGxgYGzYnKSAsQDlEQz85Pj1HUGZXR0thTT0+WXlaYWltcnNyRVV9hnxvhWZwcm7/2wBDARMUFBsXGzQdHTRuST5Jbm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm7/wAARCAAGAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAfEAABAwQDAQAAAAAAAAAAAAACAAEDBAURIRITMeH/xAAVAQEBAAAAAAAAAAAAAAAAAAABA//EABYRAQEBAAAAAAAAAAAAAAAAAAEAAv/aAAwDAQACEQMRAD8AobjS081HHLIPAnZncgFt6ypmS1R9hYPWX9H6iK2Fhv/Z",
    fg: "/images/mascot/workshop-fg.png",
    imageAlt: "Adrian Ding working a public workshop room",
    fgClass: "translate-y-[4%]",
    eyebrow: "For individuals",
    title: "Join a public workshop",
    blurb:
      "Spend a day with Adrian on salesmanship or leadership — the same material Fortune 500 teams get, open for individual registration.",
    cta: "See upcoming workshops",
  },
  {
    href: "/corporate-training#inquiry",
    bg: "/images/hero/corporate-bg.jpg",
    bgBlur:
      "data:image/jpeg;base64,/9j/2wBDABIMDRANCxIQDhAUExIVGywdGxgYGzYnKSAsQDlEQz85Pj1HUGZXR0thTT0+WXlaYWltcnNyRVV9hnxvhWZwcm7/2wBDARMUFBsXGzQdHTRuST5Jbm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm7/wAARCAAGAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAT/xAAgEAABAwQCAwAAAAAAAAAAAAABAAIDBRESIQQTMUHh/8QAFAEBAAAAAAAAAAAAAAAAAAAAAv/EABYRAQEBAAAAAAAAAAAAAAAAAAABMf/aAAwDAQACEQMRAD8AsolbZypJWyxvDWtGO8j5PtUS1CMSvx7QLm2/qInBuv/Z",
    fg: "/images/mascot/corporate-fg.png",
    imageAlt: "Adrian Ding leading a corporate training session",
    fgClass: "translate-x-[5%] translate-y-[4%] lg:translate-x-[3.1vw]",
    eyebrow: "For companies",
    title: "Train your team",
    blurb:
      "Custom leadership, culture and communication programs, built around your people and delivered on-site or off.",
    cta: "Inquire for corporate training",
  },
]

const CARD =
  "group relative flex min-h-[54svh] min-w-0 flex-col justify-end overflow-hidden md:min-h-[104svh]"

// Anti-reflow width lock (2026-09-25) — shared by the title and the blurb,
// see the "Shrunk-card body fade" block comment below for why. `vw`-based so
// it depends on the viewport, never the card's own animated grid-track width.
const LOCKED_WIDTH = "lg:w-[min(28rem,calc(100vw/3-10rem))] lg:max-w-none"

// Column split for the container: resting 50/50, or ~2/3 to the hovered card.
const COLS = ["1.7fr 0.85fr", "0.85fr 1.7fr"] as const
const COLS_REST = "1fr 1fr"
const COLS_EASE = "grid-template-columns 650ms cubic-bezier(0.22, 1, 0.36, 1)"

const PLATE_SIZES = "(min-width: 1024px) 80vw, (min-width: 768px) 62vw, 124vw"

/**
 * Plate box — the frame both image layers are painted into.
 *
 * Below `lg` it is the old `inset-[-12%]` overscan of the card, which is fine
 * because nothing resizes there (the take-over is `lg`-only). At `lg` the width
 * is *fixed* at 80vw and centred on the card instead, so the take-over never
 * changes the plate's size — see the "White-tile flash" note in the block
 * comment above. 80vw comfortably exceeds the widest a card can get (66.6vw),
 * and because `object-cover` is height-driven at these proportions, widening
 * the box only reveals more of the same render — the visible framing at both
 * rest and full expansion is identical to the old percentage box.
 */
const PLATE =
  "absolute inset-[-12%] lg:right-auto lg:left-1/2 lg:w-[80vw] lg:-translate-x-1/2"

export function LandingPaths() {
  // Mount-gated (lessons 2026-09-02): `PathCard` swaps its whole plate markup on
  // this, so reading the raw `useReducedMotion()` mismatches SSR vs the first
  // client render for anyone with Reduce Motion on.
  const reduce = useReducedMotionSafe()
  const touch = useIsTouch()
  const gridRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start end", "end start"],
  })

  // Which card is expanded. `null` = resting 50/50. Set on a card's mouse-enter,
  // cleared only by the grid's own mouse-leave — never per card — so sliding
  // straight from one card to the other hands off cleanly (lessons 2026-08-14).
  const [active, setActive] = useState<0 | 1 | null>(null)

  // The column resize is `lg`-only. Drive it from an inline style (which beats
  // the `md:grid-cols-2` class cleanly) but *only* once we know we're on a wide
  // viewport, so the stacked / 2-up layouts below `lg` are left to Tailwind.
  const [wide, setWide] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    const sync = () => setWide(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  // Landing on `/#which-path` from another page: the browser's one-shot hash
  // scroll fires before hero images / GSAP layout settle, so it lands short.
  // Re-scroll once things have had a beat to reflow (cf. tasks/lessons.md
  // 2026-08-13 "Smooth-Scroll Anchor Navigation" — poll + settle, don't trust
  // a single native scroll).
  useEffect(() => {
    if (window.location.hash !== "#which-path") return
    const id = window.setTimeout(() => {
      const section = gridRef.current?.closest<HTMLElement>("section")
      if (section) smoothScrollToElement(section)
    }, 400)
    return () => window.clearTimeout(id)
  }, [])

  const gridStyle: React.CSSProperties =
    wide && !reduce
      ? {
          gridTemplateColumns: active === null ? COLS_REST : COLS[active],
          transition: COLS_EASE,
        }
      : {}

  return (
    <section
      id="which-path"
      className="relative scroll-mt-[calc(var(--nav-h)+1.5rem)]"
    >
      {/* Mobile heading — in normal flow above the cards, page text colour.
          The overlay copy below takes over from `md` (where the cards are tall
          enough to carry it) and this one is hidden. */}
      <div className="px-6 pt-16 pb-8 text-center sm:px-8 md:hidden">
        {/* Fluid, viewport-locked size + `whitespace-nowrap` so this never
            wraps to a second line, however narrow the phone. */}
        <h2 className="font-serif text-[clamp(1.75rem,8.8vw,3.2rem)] leading-[1.1] font-bold tracking-[-0.02em] whitespace-nowrap">
          <TextSweepReveal text="Which path is yours?" underline />
        </h2>
      </div>

      {/* Cards fill the whole section; from `md` the heading floats over their
          top edge. `data-navbar-theme` lives on the card grid, not the section
          — on mobile the section now starts with light-ground heading copy, and
          the navbar has to read against whatever is actually behind it. */}
      <Reveal>
        <div
          ref={gridRef}
          data-navbar-theme="dark"
          onMouseLeave={touch ? undefined : () => setActive(null)}
          style={gridStyle}
          // `contain: layout` scopes the grid-template-columns transition's
          // reflow cost to this box — it can't force a layout recalc on
          // ancestors/siblings outside it. Doesn't change the animation.
          className="grid gap-0 contain-layout md:grid-cols-2 lg:isolate"
        >
          {PATHS.map((p, i) => (
            <PathCard
              key={p.href}
              path={p}
              index={i}
              active={active}
              onActivate={() => setActive(i as 0 | 1)}
              progress={scrollYProgress}
              reduce={reduce}
              touch={touch}
            />
          ))}
        </div>
      </Reveal>

      {/* Heading — white, sits above every card layer (photos z-0/10, scrims
          z-20, card copy z-30) on its own z-40 so nothing tints it; a soft dark
          pool sized to the words keeps contrast where the photo behind is busy. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-40 hidden px-6 pt-28 text-center sm:px-8 md:block lg:pt-36">
        <div className="relative inline-block">
          <span
            aria-hidden
            className="absolute inset-0 scale-x-[1.7] scale-y-[2.6] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.66)_0%,rgba(0,0,0,0.36)_45%,transparent_74%)] blur-2xl"
          />
          <h2 className="relative font-serif text-[3rem] leading-[1.03] font-bold tracking-[-0.02em] text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.55)] lg:text-[4.5rem]">
            <TextSweepReveal
              text="Which path is yours?"
              textColor="#ffffff"
              underline
            />
          </h2>
        </div>
      </div>
    </section>
  )
}

function PathCard({
  path: p,
  index,
  active,
  onActivate,
  progress,
  reduce,
  touch,
}: {
  path: Path
  index: number
  active: 0 | 1 | null
  onActivate: () => void
  progress: MotionValue<number>
  reduce: boolean
  touch: boolean
}) {
  const isActive = active === index
  // This card is the take-over's yielded (narrowed) side. Gated on `!reduce`
  // because the grid never resizes under reduced motion (see `gridStyle`
  // below) — nothing should fade if nothing is actually shrinking.
  const isYielded = !reduce && active !== null && !isActive
  // Scroll parallax — foreground travels further and opposite the background.
  const bgY = useTransform(progress, [0, 1], ["-6%", "6%"])
  const fgY = useTransform(progress, [0, 1], ["7%", "-9%"])

  // Pointer parallax — cursor position across the card, -0.5 → 0.5, sprung.
  const pointer = useMotionValue(0)
  const spring = { stiffness: 120, damping: 20, mass: 0.4 }
  const bgX = useSpring(
    useTransform(pointer, (v) => v * 14),
    spring
  )
  const fgX = useSpring(
    useTransform(pointer, (v) => v * -24),
    spring
  )

  // Pointer parallax and the hover take-over are mouse-only: on touch a tap
  // still fires `mouseenter`/`mousemove`, which would sway the plates and
  // expand the card with no matching leave event to undo it.
  const pointerDriven = !reduce && !touch

  function handleMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    pointer.set((e.clientX - r.left) / r.width - 0.5)
  }

  return (
    <Link
      href={p.href}
      onMouseEnter={touch ? undefined : onActivate}
      onMouseMove={pointerDriven ? handleMove : undefined}
      onMouseLeave={pointerDriven ? () => pointer.set(0) : undefined}
      className={`${CARD} ${
        isActive
          ? "lg:z-20 lg:shadow-[0_50px_110px_-32px_rgba(0,0,0,0.6)]"
          : "lg:z-0 lg:shadow-[0_22px_60px_-30px_rgba(0,0,0,0.42)]"
      }`}
    >
      {reduce ? (
        <>
          <Image
            src={p.bg}
            alt=""
            fill
            sizes={PLATE_SIZES}
            placeholder="blur"
            blurDataURL={p.bgBlur}
            className="object-cover"
          />
          <Image
            src={p.fg}
            alt={p.imageAlt}
            fill
            sizes={PLATE_SIZES}
            className={`${p.fgClass} object-cover`}
          />
        </>
      ) : (
        <>
          <div className={`${PLATE} z-0`}>
            <motion.div
              style={{ x: bgX, y: bgY }}
              className="absolute inset-0 will-change-transform"
            >
              <Image
                src={p.bg}
                alt=""
                fill
                sizes={PLATE_SIZES}
                placeholder="blur"
                blurDataURL={p.bgBlur}
                className="scale-[1.08] object-cover"
              />
            </motion.div>
          </div>
          <div className={`${PLATE} z-10`}>
            <motion.div
              style={{ x: fgX, y: fgY }}
              className="absolute inset-0 will-change-transform"
            >
              <Image
                src={p.fg}
                alt={p.imageAlt}
                fill
                sizes={PLATE_SIZES}
                className={`${p.fgClass} scale-[1.04] object-cover`}
              />
            </motion.div>
          </div>
        </>
      )}

      {/* Scrims (z-20): a top vignette the section heading reads against, a
          strong bottom rise for the card's own copy, and a lighter left wash so
          the bottom-left text holds up over a bright patch of the room. All
          per-card, so they track the hover take-over resize. */}
      <div className="absolute inset-x-0 top-0 z-20 h-[36%] bg-linear-to-b from-black/30 via-black/8 to-transparent" />
      <div className="absolute inset-0 z-20 bg-linear-to-t from-black/70 via-black/25 to-black/5" />
      <div className="absolute inset-0 z-20 bg-linear-to-r from-black/40 via-black/10 to-transparent" />

      <div className="relative z-30 p-7 pb-10 text-white sm:p-16 sm:pb-24 lg:p-20 lg:pb-32">
        <p className="text-xs font-semibold tracking-[0.16em] text-white/70 uppercase">
          {p.eyebrow}
        </p>
        {/* `LOCKED_WIDTH` here too (2026-09-25): the title itself reflows
            with the card exactly like the blurb did — "Train your team"
            wraps from 1 to 3 lines once its card narrows past ~200px of
            content width, which grew *this* element's own box and moved
            *itself* (measured +92px). Same fix, same reason: pin it to a
            viewport-driven width so it can never change size mid-transition. */}
        <h3
          className={`mt-4 text-[2rem] leading-[1.05] font-bold tracking-[-0.02em] lg:text-[2.75rem] ${LOCKED_WIDTH}`}
        >
          {p.title}
        </h3>
        {/* Body-text width lock + fade (revised 2026-09-25, see block comment
            above): `LOCKED_WIDTH` pins the blurb to a viewport-driven width so it
            never reflows mid-transition (title stays put); `isYielded`
            (the container's own hover state, not a width poll) plus the
            `lg:max-[1319px]:` viewport band decides whether this card's
            blurb is allowed to fade at all. Layout box is left in place
            (no `display:none`) so the card never changes height. */}
        <p
          className={`mt-4 max-w-md leading-relaxed text-pretty text-white/80 motion-reduce:transition-none motion-reduce:duration-0 ${LOCKED_WIDTH} lg:max-[1319px]:transition-[opacity,visibility] lg:max-[1319px]:duration-200 lg:max-[1319px]:ease-out ${
            isYielded
              ? "lg:max-[1319px]:invisible lg:max-[1319px]:opacity-0 lg:max-[1319px]:delay-0"
              : "lg:max-[1319px]:delay-[250ms]"
          }`}
        >
          {p.blurb}
        </p>
        {/* Right-aligned on mobile; `sm:` restores the original left-aligned,
            edge-flush pill (`-ml-4` cancels the pill's own left padding
            against the card's padding edge — mirrored as `-mr-4` here for the
            mobile right edge). */}
        {/* The pill gets a one-shot "beat" the first time the card scrolls into
            view — the client asked for these two CTAs to entice rather than sit
            still. `cta-beat-target` is animated from globals.css by the
            `data-beat` attribute AttentionOnView sets; keeping the keyframe on
            this inner span means it never contends with the card's own
            framer-motion transforms.
            `lg:whitespace-nowrap` (2026-09-25): the real source of the
            title-rise bug the blurb width-lock above was written for — the
            longer corporate CTA text wraps to two lines once its card
            narrows past ~300px, and because the copy block is
            bottom-anchored (`justify-end`), that extra line pushed the
            title up ~65px, dwarfing whatever the blurb was doing. Pinned to
            one line at `lg` for the same reason the blurb is width-locked:
            the take-over must never change this card's content height. */}
        <AttentionOnView className="mt-8 flex justify-end sm:justify-start">
          <span className="group/cta hover:bg-brand hover:text-brand-foreground cta-beat-target -mr-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold tracking-[0.08em] text-black uppercase transition-colors duration-300 sm:mr-0 sm:-ml-4 sm:text-sm sm:tracking-[0.12em] lg:whitespace-nowrap">
            {p.cta}
            <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-1" />
          </span>
        </AttentionOnView>
      </div>
    </Link>
  )
}
