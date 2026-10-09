"use client"

import { useEffect, useState } from "react"
import NumberFlow from "@number-flow/react"
import { cn } from "@/lib/utils"

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
 * Live countdown to an event. Renders zeros until mounted so server and
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

  // Size digits from the card width: the desktop rail is narrower than tablet.
  return (
    <div
      className={cn("@container grid w-full min-w-0 grid-cols-4", className)}
    >
      {UNITS.map(({ key, label }, i) => (
        <div
          key={key}
          role="group"
          aria-label={label}
          className="flex min-w-0 flex-col items-center"
        >
          <div className="relative flex w-full items-center justify-center">
            <NumberFlow
              value={parts ? parts[key] : 0}
              format={{ minimumIntegerDigits: 2, useGrouping: false }}
              className="text-[clamp(1.25rem,9cqw,3rem)] leading-none font-semibold tracking-tighter tabular-nums"
            />
            {i < UNITS.length - 1 && (
              <span
                aria-hidden
                className="text-muted-foreground/40 absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 text-[clamp(1rem,6cqw,2rem)] leading-none font-medium"
              >
                :
              </span>
            )}
          </div>
          <span className="text-muted-foreground mt-2 text-[0.5625rem] font-medium tracking-[0.08em] uppercase">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
