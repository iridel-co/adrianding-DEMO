"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Fires a one-shot attention cue on the first time its subtree scrolls into
 * view. Sets `data-beat` on a plain wrapper `<div>`; the actual animation lives
 * in `globals.css` (`[data-beat] .cta-beat-target`), so any descendant carrying
 * `cta-beat-target` plays it.
 *
 * Deliberately not GSAP: the elements this wraps are inside cards that GSAP and
 * framer-motion already animate, and two systems writing the same `transform`
 * on one node fight. A CSS keyframe on a descendant composes cleanly and costs
 * nothing if JS never arrives — the CTA just sits there, which is a finished
 * design on its own.
 *
 * The observer disconnects after the first hit: the cue is a one-time nudge,
 * not something that re-fires every time the user scrolls back up.
 */
export function AttentionOnView({
  children,
  className,
  /** Wait this long after entering view before firing. */
  delayMs = 550,
}: {
  children: React.ReactNode
  className?: string
  delayMs?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [beat, setBeat] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let timer: ReturnType<typeof setTimeout>
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        timer = setTimeout(() => setBeat(true), delayMs)
      },
      { threshold: 0.45 }
    )
    io.observe(el)

    return () => {
      io.disconnect()
      clearTimeout(timer)
    }
  }, [delayMs])

  return (
    <div ref={ref} className={className} data-beat={beat || undefined}>
      {children}
    </div>
  )
}
