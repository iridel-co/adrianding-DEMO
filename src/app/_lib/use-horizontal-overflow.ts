"use client"

import { useCallback, useEffect, useRef, useState, type RefObject } from "react"

type OverflowOptions = {
  /** Change when rail content is replaced, including same-count filters. */
  resetKey: string
  /** Freeze edges during layout expansion; release always remeasures. */
  suppressed?: boolean
  /** Include nested cards when wrappers use display: contents. */
  childSelector?: string
}

/** Measures native rails without owning their layout, movement or touch behavior. */
export function useHorizontalOverflow(
  railRef: RefObject<HTMLDivElement | null>,
  {
    resetKey,
    suppressed = false,
    childSelector = ":scope > *",
  }: OverflowOptions
) {
  const [edges, setEdges] = useState({ left: false, right: false })
  const queueRef = useRef<(() => void) | null>(null)
  const suppressedRef = useRef(suppressed)
  const invalidate = useCallback(() => queueRef.current?.(), [])

  useEffect(() => {
    suppressedRef.current = suppressed
    invalidate()
  }, [suppressed, invalidate])

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    rail.scrollLeft = 0
    let raf = 0
    const measure = () => {
      raf = 0
      if (suppressedRef.current) return
      const { scrollWidth, clientWidth, scrollLeft } = rail
      const overflow =
        getComputedStyle(rail).overflowX !== "visible" &&
        scrollWidth - clientWidth > 1
      const left = overflow && scrollLeft > 1
      const right = overflow && scrollLeft < scrollWidth - clientWidth - 1
      setEdges((previous) =>
        previous.left === left && previous.right === right
          ? previous
          : { left, right }
      )
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    queueRef.current = queue
    const observer = new ResizeObserver(queue)
    observer.observe(rail)
    for (const child of rail.querySelectorAll(childSelector))
      observer.observe(child)
    rail.addEventListener("scroll", queue, { passive: true })
    rail.addEventListener("transitionend", queue)
    window.addEventListener("resize", queue)
    measure()
    return () => {
      queueRef.current = null
      rail.removeEventListener("scroll", queue)
      rail.removeEventListener("transitionend", queue)
      window.removeEventListener("resize", queue)
      observer.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [railRef, resetKey, childSelector])

  return { edges, invalidate }
}
