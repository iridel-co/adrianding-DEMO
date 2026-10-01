"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { Quote, User } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Testimonial } from "@/lib/testimonials"

type ColumnsProps = {
  testimonials: Testimonial[]
  className?: string
}

/**
 * Landing testimonials — quote cards drifting upward on a seamless loop. One
 * column on mobile (every quote), two interleaved columns from `md` up. Hovering
 * or focusing into a column stops that column only; the others keep moving.
 *
 * Manual rAF rather than a framer-motion transform: this codebase's framer
 * transform values misbehave under headless capture and drop viewport units
 * (Iridel lessons 2026-08-27 / 2026-08-30). The loop mirrors the horizontal
 * `_components/marquee.tsx` — two identical copies, slide by exactly one copy,
 * wrap. Reduced motion drops the animation and the mask for a plain scroll strip.
 */
export function TestimonialColumns({ testimonials, className }: ColumnsProps) {
  const columnA = testimonials.filter((_, i) => i % 2 === 0)
  const columnB = testimonials.filter((_, i) => i % 2 === 1)

  return (
    <div className={className}>
      {/* Mobile: a single column carrying every quote. */}
      <div className="md:hidden">
        <TestimonialColumn testimonials={testimonials} speed={24} />
      </div>
      {/* Desktop: two interleaved columns at slightly different speeds so they
          never march in lockstep. */}
      <div className="hidden gap-5 md:grid md:grid-cols-2">
        <TestimonialColumn testimonials={columnA} speed={22} />
        <TestimonialColumn testimonials={columnB} speed={30} />
      </div>
    </div>
  )
}

type ColumnProps = {
  testimonials: Testimonial[]
  /** Upward drift in px/second. */
  speed: number
}

function TestimonialColumn({ testimonials, speed }: ColumnProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const halfRef = useRef(0)
  const lastRef = useRef(0)
  const pausedRef = useRef(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  const offscreenRef = useRef(false)

  useEffect(() => {
    const track = trackRef.current
    const copy = copyRef.current
    if (!track || !copy || reduced) return

    // One copy's box (its `pb-6` includes the seam gap to the next copy), so
    // sliding by exactly this height lands copy 2 where copy 1 was.
    const measure = () => {
      halfRef.current = copy.offsetHeight
    }
    measure()

    const ro = new ResizeObserver(measure)
    ro.observe(copy)
    document.fonts?.ready.then(measure).catch(() => {})

    // Stop the rAF loop's clock entirely while scrolled well out of view —
    // `track.offsetParent === null` already guards the hidden responsive
    // twin, this guards the visible one when it's just not on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        offscreenRef.current = !entry.isIntersecting
      },
      { rootMargin: "200px" }
    )
    io.observe(track)

    let raf = 0
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const prev = lastRef.current || now
      lastRef.current = now
      // Skip advancing while held, or while this instance is display:none
      // (the hidden mobile/desktop variant) — keep the clock fresh so there's
      // no jump when it resumes or becomes visible.
      if (
        pausedRef.current ||
        offscreenRef.current ||
        track.offsetParent === null
      )
        return
      const half = halfRef.current
      if (half <= 0) return
      const dt = Math.min(now - prev, 64) / 1000
      let next = offsetRef.current - speed * dt
      if (next <= -half) next += half
      offsetRef.current = next
      track.style.transform = `translate3d(0, ${next}px, 0)`
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      lastRef.current = 0
    }
  }, [reduced, speed])

  return (
    <div
      className={cn(
        // Horizontal padding + matching negative margin: the card grows on
        // hover, and `overflow-hidden` (needed for the vertical scroll clip)
        // would otherwise crop its left/right edges — and hard-cut the shadow's
        // side falloff. The px gutter gives the scaled card and its shadow room
        // to breathe without shifting the resting layout.
        "relative -mx-5 max-h-[600px] px-5 lg:max-h-[720px]",
        reduced
          ? "overflow-y-auto"
          : "overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_9%,#000_91%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,#000_9%,#000_91%,transparent)]"
      )}
      onMouseEnter={() => {
        pausedRef.current = true
      }}
      onMouseLeave={() => {
        pausedRef.current = false
      }}
      onFocusCapture={() => {
        pausedRef.current = true
      }}
      onBlurCapture={() => {
        pausedRef.current = false
      }}
    >
      <div ref={trackRef} className="will-change-transform">
        <div ref={copyRef} className="flex flex-col gap-6 pb-6">
          {testimonials.map((t, i) => (
            <ColumnCard key={`a-${t.org}-${i}`} testimonial={t} />
          ))}
        </div>
        {!reduced && (
          <div aria-hidden className="flex flex-col gap-6 pb-6">
            {testimonials.map((t, i) => (
              <ColumnCard key={`b-${t.org}-${i}`} testimonial={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ColumnCard({ testimonial: t }: { testimonial: Testimonial }) {
  return (
    <figure
      tabIndex={0}
      className="bg-card focus-visible:ring-brand/30 rounded-3xl p-8 shadow-md transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.03] hover:shadow-lg focus-visible:scale-[1.03] focus-visible:shadow-lg focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:focus-visible:scale-100 lg:p-10"
    >
      <div className="flex min-h-9 items-center justify-between gap-4">
        <Quote className="text-brand/25 size-7 shrink-0" aria-hidden />
        {/* Client mark, sitting inside the card. Orgs without artwork
            (Knowles, Rotary International) fall back to a name chip. */}
        {t.logo ? (
          <Image
            src={t.logo}
            alt=""
            aria-hidden
            width={200}
            height={80}
            loading="eager"
            style={{ width: "auto" }}
            className={cn(
              "w-auto object-contain opacity-80",
              t.logoShape === "square"
                ? "h-9 max-w-[110px] lg:h-10"
                : "h-7 max-w-40 lg:h-8"
            )}
          />
        ) : (
          <span className="text-foreground/65 text-sm font-semibold tracking-[-0.01em]">
            {t.org}
          </span>
        )}
      </div>
      <blockquote
        className={cn(
          "mt-4 leading-normal tracking-[-0.005em]",
          // Long testimonials step down a size so a 600-character quote
          // stays a card, not a wall.
          t.quote.length > 320
            ? "text-[1.05rem] lg:text-[1.15rem]"
            : "text-[1.3rem] text-balance lg:text-[1.45rem]"
        )}
      >
        {t.quote}
      </blockquote>
      <figcaption className="mt-7 flex items-center gap-3.5">
        {/* Round headshot; falls back to a dashed User icon if `photo` is unset. */}
        <span
          className={cn(
            "text-muted-foreground/70 flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full",
            t.photo ? "bg-muted" : "border-border border border-dashed"
          )}
        >
          {t.photo ? (
            <Image
              src={t.photo}
              alt={t.name}
              width={96}
              height={96}
              className="size-full object-cover"
            />
          ) : (
            <User className="size-5" aria-hidden />
          )}
        </span>
        <span className="text-muted-foreground text-sm tracking-[0.03em]">
          <span className="text-foreground block font-semibold">{t.name}</span>
          {t.role}, {t.org}
        </span>
      </figcaption>
    </figure>
  )
}
