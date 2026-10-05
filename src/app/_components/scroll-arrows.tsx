"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"

export function ScrollArrows({
  edges,
  onNudge,
  className = "",
  previousLabel,
  nextLabel,
}: {
  edges: { left: boolean; right: boolean }
  onNudge: (dir: 1 | -1) => void
  className?: string
  previousLabel: string
  nextLabel: string
}) {
  const btn =
    "border-border/80 text-foreground flex size-11 items-center justify-center rounded-full border transition-colors hover:border-foreground hover:bg-foreground hover:text-background disabled:cursor-default disabled:opacity-25 disabled:hover:border-border/80 disabled:hover:bg-transparent disabled:hover:text-foreground"
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
