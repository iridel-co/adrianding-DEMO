"use client"

import { useEffect, useState } from "react"
import NumberFlow from "@number-flow/react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const MotionNumberFlow = motion.create(NumberFlow)

type CountdownProps = {
  /** Event start — ISO string or Date. */
  target: string | Date
  className?: string
}

const UNITS = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
] as const

function breakdown(ms: number) {
  const c = Math.max(0, ms)
  return {
    days: Math.floor(c / 86_400_000),
    hours: Math.floor((c / 3_600_000) % 24),
    minutes: Math.floor((c / 60_000) % 60),
    seconds: Math.floor((c / 1_000) % 60),
  }
}

/**
 * Live countdown to an event. Renders em-dashes until mounted so server and
 * client markup match, then ticks once a second with animated digit flips.
 */
export function Countdown({ target, className }: CountdownProps) {
  const targetMs = new Date(target).getTime()
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    const update = () => setRemaining(targetMs - Date.now())
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [targetMs])

  const done = remaining != null && remaining <= 0
  const parts = remaining == null ? null : breakdown(remaining)

  if (done) {
    return (
      <span className={cn("text-muted-foreground text-sm", className)}>
        This workshop has started.
      </span>
    )
  }

  /**
   * Sized to fit the workshop page's narrow register rail (a `max-w-xs` card,
   * ~272px of content once its padding is off). Four 2-digit figures plus three
   * separators at the old `text-4xl`/`text-5xl` overflowed it — the digits ran
   * past the card's right edge. `min-w-0` on the row lets it shrink inside a
   * flex/grid parent rather than forcing the parent wider.
   */
  return (
    <div className={cn("flex min-w-0 items-start gap-2", className)}>
      {UNITS.map(({ key, label }, i) => (
        <div key={key} className="flex min-w-0 items-start gap-2">
          <div className="flex flex-col items-center">
            <MotionNumberFlow
              value={parts ? parts[key] : 0}
              format={{ minimumIntegerDigits: 2 }}
              className="text-[1.75rem] leading-none font-semibold tracking-tighter tabular-nums sm:text-[2rem]"
            />
            <span className="text-muted-foreground mt-1.5 text-[0.5625rem] font-medium tracking-[0.12em] uppercase">
              {label}
            </span>
          </div>
          {i < UNITS.length - 1 && (
            <span className="text-muted-foreground/40 text-lg leading-none font-semibold">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
