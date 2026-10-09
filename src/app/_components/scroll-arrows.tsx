"use client"

import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

/** Normal controls keep both edges visible and disable terminal directions.
 * Overlay controls show only available directions with the corresponding fade. */
export function ScrollArrows({
  edges,
  onNudge,
  className = "",
  previousLabel,
  nextLabel,
  overlay = false,
}: {
  edges: { left: boolean; right: boolean }
  onNudge: (dir: 1 | -1) => void
  className?: string
  previousLabel: string
  nextLabel: string
  overlay?: boolean
}) {
  if (overlay) {
    return (
      <div className={`pointer-events-none absolute inset-0 ${className}`}>
        {([-1, 1] as const).map((dir) => {
          if (!(dir === -1 ? edges.left : edges.right)) return null
          const Icon = dir === -1 ? ChevronLeft : ChevronRight
          return (
            <div
              key={dir}
              className={`absolute inset-y-0 flex w-16 items-center ${dir === -1 ? "from-background via-background/95 left-0 justify-start bg-linear-to-r to-transparent" : "from-background via-background/95 right-0 justify-end bg-linear-to-l to-transparent"}`}
            >
              <button
                type="button"
                aria-label={dir === -1 ? previousLabel : nextLabel}
                onClick={() => onNudge(dir)}
                className="text-foreground focus-visible:ring-ring pointer-events-auto flex size-11 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
              >
                <Icon className="size-5" aria-hidden />
              </button>
            </div>
          )
        })}
      </div>
    )
  }
  const btn =
    "border-border/80 text-foreground flex size-11 items-center justify-center rounded-full border transition-colors hover:border-foreground hover:bg-foreground hover:text-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none disabled:cursor-default disabled:opacity-25 disabled:hover:border-border/80 disabled:hover:bg-transparent disabled:hover:text-foreground"
  return (
    <div className={`${className} shrink-0 items-center gap-2.5`}>
      <button
        type="button"
        aria-label={previousLabel}
        onClick={() => onNudge(-1)}
        disabled={!edges.left}
        className={btn}
      >
        <ArrowLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label={nextLabel}
        onClick={() => onNudge(1)}
        disabled={!edges.right}
        className={btn}
      >
        <ArrowRight className="size-5" />
      </button>
    </div>
  )
}
