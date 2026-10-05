"use client"

import { useEffect } from "react"
import { ScrollTrigger } from "@/app/_lib/gsap"

/**
 * Recomputes every ScrollTrigger's start/end once the page has actually
 * settled.
 *
 * ScrollTrigger resolves `start: "top 85%"` into an absolute scroll position
 * at *creation* time. On this site the components mount before the layout is
 * final — the Prata webfont swaps in, SplitText re-wraps the quote into
 * per-word spans, and the sticky hero + QuoteReveal track above the fold
 * resize as that happens. Every position cached before then is wrong by
 * however much the content above shifted.
 *
 * Measured on the landing page before this existed: the <LandingStats> grid
 * reveal fired at scrollY 5300 instead of 4298 — a full viewport late, so the
 * numbers only appeared once you'd scrolled past the top of <LandingPaths>.
 *
 * Mounted once in the root layout, so it covers every route.
 */
export function ScrollRefresh() {
  useEffect(() => {
    let frame = 0
    const refresh = () => {
      cancelAnimationFrame(frame)
      // Wait for active scrolling to finish before rebuilding trigger positions.
      // An immediate refresh can restore an old scroll offset mid-click.
      frame = requestAnimationFrame(() => ScrollTrigger.refresh(true))
    }

    // Fonts are the big one — the serif swap moves everything below it.
    document.fonts?.ready.then(refresh)
    // Images without an intrinsic box, plus anything still in flight.
    if (document.readyState === "complete") refresh()
    else window.addEventListener("load", refresh)

    // Catch-all for late shifts the two hooks above miss (lazy sections
    // expanding, a marquee measuring itself). Debounced via rAF in `refresh`.
    const ro = new ResizeObserver(refresh)
    ro.observe(document.body)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("load", refresh)
      ro.disconnect()
    }
  }, [])

  return null
}
