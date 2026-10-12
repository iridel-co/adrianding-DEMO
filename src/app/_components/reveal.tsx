"use client"

import { useRef, type ReactNode, type Ref } from "react"
import { gsap, useGSAP, EASE, DUR, RISE } from "@/app/_lib/gsap"

type RevealProps = {
  ref?: Ref<HTMLDivElement>
  children: ReactNode
  className?: string
  /** Seconds to wait after the trigger fires. */
  delay?: number
  /** Pixels the element rises from. */
  y?: number
  /**
   * When set, the wrapper's *direct children* are revealed with this stagger
   * (seconds) off a single ScrollTrigger — use for grids and lists.
   */
  stagger?: number
  /** ScrollTrigger `start`, default `"top 85%"`. */
  start?: string
}

/**
 * Scroll-in reveal — a soft fade + rise, fired once. Wraps content in a plain
 * `div`; pass `stagger` to cascade the immediate children instead of the
 * wrapper. Honours `prefers-reduced-motion` by snapping straight to rest.
 */
export function Reveal({
  ref,
  children,
  className,
  delay = 0,
  y = RISE,
  stagger,
  start = "top 85%",
}: RevealProps) {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = scope.current
      if (!el) return
      const targets: Element[] | Element =
        stagger != null ? Array.from(el.children) : el

      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(targets, { opacity: 1, y: 0 })
      })
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(targets, {
          opacity: 0,
          y,
          duration: DUR.base,
          ease: EASE,
          delay,
          stagger: stagger ?? 0,
          scrollTrigger: { trigger: el, start, once: true },
        })
      })
      return () => mm.revert()
    },
    { scope }
  )

  return (
    <div
      ref={(element) => {
        scope.current = element
        if (typeof ref === "function") return ref(element)
        if (ref) ref.current = element
      }}
      className={className}
    >
      {children}
    </div>
  )
}
