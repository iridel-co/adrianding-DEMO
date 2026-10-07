"use client"

import { WorkshopAvailabilityText } from "@/app/_components/workshop-availability-text"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useReducedMotionSafe } from "@/app/_lib/use-reduced-motion-safe"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Workshop } from "@/lib/workshops"

/**
 * Wobbly marker-circle strokes. Each is an off-round loop that overshoots
 * where it closes, the way a hand does. Four variants (each with its own
 * tilt, weight and drift) so a month with several marked dates doesn't look
 * stamped — picked deterministically by date, never randomized, so SSR and
 * the client agree.
 */
const CIRCLE_VARIANTS = [
  {
    d: "M30.5 4.5C41 4 52.5 10.8 53.5 24.5C54.4 37 45.8 47.4 32.5 48.5C19.6 49.6 7.3 41.7 6.5 28.5C5.7 15.9 15.4 6.6 27.5 5.2C29 5 30 5.3 31.5 5",
    rotate: -8,
    width: 2.5,
  },
  {
    d: "M33 6.5C45 6 55.5 14 55 27C54.5 39.5 43 51.5 29 51C15.5 50.5 5.5 41 5.5 28.5C5.5 16.5 15.5 7.5 27 6.5C31 6.1 36 6.8 39.5 8.5",
    rotate: 5,
    width: 2.2,
  },
  {
    d: "M28 5.5C16 7 6 15.5 6.5 28.5C7 40.5 18 50 31 49.5C43.5 49 53.5 40 53.5 27.5C53.5 16.5 45 8 34 6C31 5.5 27.5 5.7 25 6.8",
    rotate: -3,
    width: 2.7,
  },
  {
    d: "M35 7C22 5 8.5 13 7 25.5C5.5 38.5 16 50.5 30 51C44 51.5 54.5 41 54 28C53.6 17.5 45.5 9 34 7.2C30.5 6.6 27 7 24 8",
    rotate: 9,
    width: 2.4,
  },
]

function HandDrawnCircle({
  seed,
  className,
}: {
  seed: number
  className?: string
}) {
  const variant = CIRCLE_VARIANTS[seed % CIRCLE_VARIANTS.length]

  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      aria-hidden="true"
      className={cn("pointer-events-none absolute", className)}
    >
      <path
        d={variant.d}
        transform={`rotate(${variant.rotate} 30 30)`}
        stroke="currentColor"
        strokeWidth={variant.width}
        strokeLinecap="round"
      />
    </svg>
  )
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

/** Shared box for both cell kinds — a marked `button` and a plain `div`. */
const CELL =
  "relative flex h-16 w-full items-center justify-center rounded-lg text-sm transition-colors duration-200 lg:h-20"

/**
 * Local-date key (not `toISOString`, which shifts across UTC and would land
 * a 9am PH-time workshop on the wrong calendar day for viewers west of PH).
 */
function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

type DayCell = { date: Date; inMonth: boolean; workshops: Workshop[] }

function buildMonth(
  year: number,
  month: number,
  byDay: Map<string, Workshop[]>
): DayCell[] {
  const first = new Date(year, month, 1)
  const startOffset = first.getDay()
  const gridStart = new Date(year, month, 1 - startOffset)

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + i)
    return {
      date,
      inMonth: date.getMonth() === month,
      workshops: byDay.get(dateKey(date)) ?? [],
    }
  })
}

/**
 * Month-grid calendar marking every open workshop date. Click a marked date
 * to preview its events, then follow an explicit workshop link. The shared
 * popover handles keyboard focus, dismissal and viewport collisions.
 *
 * Defaults to the soonest open workshop's month so the first thing a visitor
 * sees already has a marked date, not a search.
 */
export function WorkshopsCalendar({
  workshops,
  className,
}: {
  workshops: Workshop[]
  className?: string
}) {
  const reduce = useReducedMotionSafe()

  const byDay = useMemo(() => {
    const map = new Map<string, Workshop[]>()
    for (const w of workshops) {
      const key = dateKey(new Date(w.start))
      map.set(key, [...(map.get(key) ?? []), w])
    }
    return map
  }, [workshops])

  const initial =
    workshops.length > 0 ? new Date(workshops[0].start) : new Date()
  const [cursor, setCursor] = useState(
    new Date(initial.getFullYear(), initial.getMonth(), 1)
  )
  const [openDay, setOpenDay] = useState<string | null>(null)
  const [direction, setDirection] = useState(1)

  const days = useMemo(
    () => buildMonth(cursor.getFullYear(), cursor.getMonth(), byDay),
    [cursor, byDay]
  )

  const monthLabel = cursor.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  function go(delta: number) {
    setOpenDay(null)
    setDirection(delta)
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1))
  }

  return (
    <div className={cn("bg-muted/40 w-full rounded-3xl p-6", className)}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="overflow-hidden text-center">
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.p
              key={monthLabel}
              custom={direction}
              initial={{ opacity: 0, x: 16 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 * direction }}
              transition={{
                duration: reduce ? 0 : 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="font-serif text-2xl tracking-[-0.01em] whitespace-nowrap sm:text-3xl lg:text-4xl"
            >
              {monthLabel}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous month"
            className="bg-background hover:bg-background/70 flex size-11 items-center justify-center rounded-full transition-colors"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next month"
            className="bg-background hover:bg-background/70 flex size-8 items-center justify-center rounded-full transition-colors"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="text-muted-foreground grid grid-cols-7 gap-1.5 text-center text-xs font-medium">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1.5">
            {d[0]}
          </div>
        ))}
      </div>

      <div className="overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={monthLabel}
            custom={direction}
            initial={{ opacity: 0, x: 24 * direction }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 * direction }}
            transition={{
              duration: reduce ? 0 : 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="grid grid-cols-7 gap-1.5"
          >
            {days.map((cell) => {
              const key = dateKey(cell.date)
              const workshop = cell.workshops[0]

              /**
               * Plain days render as a `div`, not a disabled `button` —
               * disabled controls swallow pointer events, so a `:hover` state
               * on one never lands.
               */
              if (!workshop) {
                return (
                  <div
                    key={key}
                    className={cn(
                      CELL,
                      "hover:bg-foreground/4",
                      cell.inMonth
                        ? "text-foreground"
                        : "text-muted-foreground/40"
                    )}
                  >
                    {cell.date.getDate()}
                  </div>
                )
              }

              return (
                <Popover
                  key={key}
                  open={openDay === key}
                  onOpenChange={(open) => setOpenDay(open ? key : null)}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        CELL,
                        "text-brand hover:bg-brand/8 focus-visible:bg-brand/8 group focus-visible:ring-brand cursor-pointer font-semibold focus-visible:ring-2 focus-visible:outline-none"
                      )}
                    >
                      <HandDrawnCircle
                        seed={cell.date.getDate()}
                        className="text-brand/60 group-hover:text-brand group-focus-visible:text-brand top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 transition-[color,scale] duration-200 group-hover:scale-110 group-focus-visible:scale-110 motion-reduce:transition-none sm:size-14 lg:size-16"
                      />
                      <span className="relative">{cell.date.getDate()}</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    aria-label="Workshop preview"
                    collisionPadding={12}
                    sideOffset={12}
                    className="max-h-[var(--radix-popover-content-available-height)] w-96 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-3xl p-6 motion-reduce:animate-none"
                  >
                    <div className="space-y-6">
                      {cell.workshops.map((event) => (
                        <div key={event.slug} className="space-y-3">
                          <p className="text-brand text-sm font-semibold">
                            {event.schedule}
                          </p>
                          <p className="font-serif text-2xl leading-tight">
                            {event.title}
                          </p>
                          <p className="text-muted-foreground flex items-start gap-2 text-sm">
                            <MapPin className="mt-0.5 size-4 shrink-0" />
                            {event.venue}, {event.city}
                          </p>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {event.summary}
                          </p>
                          <p className="text-sm font-semibold">
                            <WorkshopAvailabilityText workshop={event} />
                          </p>
                          <Link
                            href={`/workshops/${event.slug}`}
                            className="text-brand inline-flex min-h-11 items-center gap-2 rounded-sm font-semibold underline focus-visible:ring-2 focus-visible:outline-none"
                          >
                            View workshop
                            <span className="sr-only">: {event.title}</span>
                            <ArrowRight className="size-4" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {!days.some((day) => day.inMonth && day.workshops.length > 0) && (
        <p
          className="text-muted-foreground mt-4 text-center text-sm"
          role="status"
        >
          No workshops scheduled this month.
        </p>
      )}
    </div>
  )
}
