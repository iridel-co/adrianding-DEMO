"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { gsap, useGSAP } from "@/app/_lib/gsap"
import { cn } from "@/lib/utils"

type MarqueeProps = {
  children: ReactNode
  /** Travel speed in px/second. */
  speed?: number
  direction?: "left" | "right"
  className?: string
  /** Gap between items, any CSS length. Default `3.5rem`. */
  gap?: string
  /** External hold — a caller-driven pause that overrides hover/focus resume. */
  paused?: boolean
}

const MIN_COPIES = 2
const MAX_COPIES = 12

/**
 * Seamless infinite marquee. The track holds N identical copies of the content
 * and GSAP slides it by exactly one copy, then loops — so the seam is invisible.
 *
 * Positioning is done with `xPercent`, never a measured pixel value: one copy is
 * always `100 / copies` percent of the whole track, so the rest offset for a
 * right-drifting row (which sits one copy to the left, filled by copy 2) is
 * exact no matter what `unit.scrollWidth` happened to measure. `scrollWidth` is
 * only used to pick the copy count and the loop duration; getting it slightly
 * wrong changes the speed a hair, never the fill. It's still re-read after fonts
 * swap in and after each logo image decodes, so the speed settles correctly.
 *
 * Reduced motion: no transform, no clones — a plain horizontal scroll strip.
 */
export function Marquee({
  children,
  speed = 40,
  direction = "left",
  className,
  gap = "3.5rem",
  paused = false,
}: MarqueeProps) {
  const wrap = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const unit = useRef<HTMLDivElement>(null)
  const tween = useRef<gsap.core.Tween | null>(null)
  const [copies, setCopies] = useState(MIN_COPIES)

  // Mirror `paused` in a ref so the GSAP build closure and the hover handlers
  // can read the live value without re-running the effect.
  const pausedRef = useRef(paused)
  pausedRef.current = paused
  // Off-screen hold — separate from `paused` so scrolling back into view can't
  // override an explicit external/user pause, and an external resume can't
  // override being off-screen.
  const offscreenRef = useRef(false)

  useGSAP(
    () => {
      const t = track.current
      const u = unit.current
      const w = wrap.current
      if (!t || !u || !w) return

      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let raf = 0

        const build = () => {
          const unitW = u.scrollWidth
          const viewW = w.offsetWidth
          if (!(unitW > 0) || !(viewW > 0)) return

          // Enough copies that, with one copy slid fully off, the rest still
          // overrun the viewport by a screen. Clamped so a bad measurement
          // can't ask for thousands of clones (or a negative count).
          const raw = Math.ceil((viewW * 2) / unitW) + 1
          const need = Math.min(
            MAX_COPIES,
            Math.max(MIN_COPIES, Number.isFinite(raw) ? raw : MIN_COPIES)
          )
          if (need !== copies) {
            setCopies(need) // re-runs this effect once state commits
            return
          }

          // One copy = this fraction of the whole track. Percent, not pixels,
          // so the offset is exact regardless of measurement drift.
          const stepPct = 100 / copies
          const fromPct = direction === "left" ? 0 : -stepPct
          const toPct = direction === "left" ? -stepPct : 0

          tween.current?.kill()
          // `x: 0` alongside `xPercent` matters on a rebuild: GSAP parses the
          // killed tween's last rendered matrix into a fresh px `x` cache, and
          // a bare `xPercent` set then stacks on top of that leftover offset
          // instead of replacing it — doubling the travel on every rebuild
          // after the first. Pinning `x` to 0 keeps xPercent as the only
          // component, so the position is always an absolute percent of the
          // track's current width.
          gsap.set(t, { x: 0, xPercent: fromPct })
          tween.current = gsap.fromTo(
            t,
            { x: 0, xPercent: fromPct },
            {
              x: 0,
              xPercent: toPct,
              duration: unitW / speed,
              ease: "none",
              repeat: -1,
            }
          )
          if (pausedRef.current || offscreenRef.current) tween.current.pause()
        }

        // Coalesce the burst of triggers (fonts + dozens of image loads +
        // ResizeObserver) into one rebuild per frame.
        const schedule = () => {
          cancelAnimationFrame(raf)
          raf = requestAnimationFrame(build)
        }

        build()

        document.fonts?.ready.then(schedule).catch(() => {})

        const imgs = Array.from(u.querySelectorAll("img"))
        for (const img of imgs) {
          if (img.complete) continue
          img.addEventListener("load", schedule, { once: true })
          img.addEventListener("error", schedule, { once: true })
        }

        const ro = new ResizeObserver(schedule)
        ro.observe(t)
        ro.observe(w)

        return () => {
          cancelAnimationFrame(raf)
          ro.disconnect()
          for (const img of imgs) {
            img.removeEventListener("load", schedule)
            img.removeEventListener("error", schedule)
          }
          tween.current?.kill()
        }
      })
      return () => mm.revert()
    },
    {
      scope: wrap,
      dependencies: [copies, speed, direction],
      revertOnUpdate: true,
    }
  )

  useEffect(() => {
    if (!tween.current) return
    if (paused || offscreenRef.current) tween.current.pause()
    else tween.current.resume()
  }, [paused])

  // Stop the tween entirely while scrolled well out of view — a marquee has
  // no other reason to keep animating off-screen. `rootMargin` gives it a
  // little slack so it's already moving by the time it scrolls into frame.
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        offscreenRef.current = !entry.isIntersecting
        if (!tween.current) return
        if (offscreenRef.current) tween.current.pause()
        else if (!pausedRef.current) tween.current.resume()
      },
      { rootMargin: "200px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const pause = () => tween.current?.pause()
  const resume = () => {
    if (!pausedRef.current && !offscreenRef.current) tween.current?.resume()
  }

  const cloneCount = Math.max(0, copies - 1)

  return (
    <div
      ref={wrap}
      className={cn(
        "no-scrollbar relative overflow-hidden motion-reduce:overflow-x-auto max-md:overflow-x-auto",
        "[mask-image:linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent)]",
        "[-webkit-mask-image:linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent)]",
        "motion-reduce:[mask-image:none] motion-reduce:[-webkit-mask-image:none]",
        className
      )}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={resume}
    >
      <div ref={track} className="flex w-max flex-none">
        <div
          ref={unit}
          className="flex flex-none items-center"
          style={{ gap, paddingRight: gap }}
        >
          {children}
        </div>
        {Array.from({ length: cloneCount }, (_, i) => (
          <div
            key={i}
            aria-hidden
            className="flex flex-none items-center motion-reduce:hidden"
            style={{ gap, paddingRight: gap }}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  )
}
