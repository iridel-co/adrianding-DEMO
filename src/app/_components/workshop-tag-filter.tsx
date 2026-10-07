"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArrows } from "@/app/_components/scroll-arrows"
import { EventCards } from "@/app/_components/event-cards"
import { WORKSHOP_TAG_ICONS } from "@/app/_components/workshop-tags"
import { WORKSHOP_TAGS, type Workshop, type WorkshopTag } from "@/lib/workshops"
import { cn } from "@/lib/utils"

/**
 * Focus-area filter chips above the /workshops grid (added 2026-09-19, client
 * feedback). "All" chip plus one chip per tag any of `workshops` actually
 * carries — a tag only the past workshop has (e.g. Culture on the open list)
 * never shows a chip with nothing to select.
 *
 * Semantics are **OR**, not AND: a workshop shows if it carries *any* selected
 * tag. Chosen because a visitor picking "Sales" and "Leadership" wants to see
 * both kinds of course, and AND on 1–3 tags per course empties the grid after
 * two clicks.
 *
 * Filter changes are instant — no animation. The calendar above this grid is
 * not filtered.
 *
 * Layout (pass 4, 2026-09-24): label and "Showing X of Y" on one line,
 * space-between. The chips sit on one row below them at every size: 32px
 * visual pills in 44px hit areas, scrolling sideways with an edge fade
 * wherever the row doesn't fit (below 1024px).
 */
// Chips (pass 4, 2026-09-24): smaller visual pill (h-8, text-xs) inside
// a 44px hit area. The <button> is the hit area (min-h-11, RULES §20);
// the inner <span> is what you see. Hover/focus are driven off the button
// via group-*/chip. The fill, ring and text colours all change together on
// hover (memory rule).
const CHIP_HIT =
  "group/chip inline-flex min-h-11 shrink-0 items-center focus-visible:outline-none"
const CHIP_PILL =
  "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium whitespace-nowrap ring-1 transition-colors duration-200 motion-reduce:transition-none group-focus-visible/chip:ring-2 group-focus-visible/chip:ring-brand group-focus-visible/chip:ring-offset-2 group-focus-visible/chip:ring-offset-background"
const CHIP_OFF =
  "text-muted-foreground ring-border group-hover/chip:text-foreground group-hover/chip:ring-foreground"
const CHIP_ON =
  "bg-brand text-brand-foreground ring-brand group-hover/chip:bg-brand-accent group-hover/chip:ring-brand-accent"

// One row at every size. Wherever the row doesn't fit (measured: below 1024px;
// the row is about 864px), it scrolls sideways with the scrollbar hidden and
// fades the edge(s) that have more chips behind them. -mx/px bleed the scroller
// to the viewport gutter while the first chip lines up with the label.
const CHIP_ROW =
  "no-scrollbar flex flex-nowrap items-center gap-1.5 overflow-x-auto scroll-px-4 px-4 sm:scroll-px-6 sm:px-6"
export function WorkshopTagFilter({ workshops }: { workshops: Workshop[] }) {
  const [selected, setSelected] = useState<WorkshopTag[]>([])

  const chips = useMemo(
    () =>
      WORKSHOP_TAGS.filter((tag) =>
        workshops.some((w) => w.tags.includes(tag))
      ),
    [workshops]
  )

  const counts = useMemo(() => {
    const c = new Map<WorkshopTag, number>()
    for (const tag of chips) {
      c.set(tag, workshops.filter((w) => w.tags.includes(tag)).length)
    }
    return c
  }, [chips, workshops])

  const filtered = useMemo(
    () =>
      selected.length === 0
        ? workshops
        : workshops.filter((w) => w.tags.some((t) => selected.includes(t))),
    [workshops, selected]
  )

  const toggle = (tag: WorkshopTag) => {
    setSelected((s) =>
      s.includes(tag) ? s.filter((t) => t !== tag) : [...s, tag]
    )
  }

  const rowRef = useRef<HTMLDivElement>(null)
  // Starts with no fade, so SSR and first paint agree (RULES §10); corrected after mount.
  const [edges, setEdges] = useState({ left: false, right: false })
  useEffect(() => {
    const el = rowRef.current
    if (!el) return
    let raf = 0
    const sync = () => {
      raf = 0
      const { scrollWidth: sw, clientWidth: cw, scrollLeft } = el
      const overflow = sw - cw > 1
      setEdges({
        left: overflow && scrollLeft > 1,
        right: overflow && scrollLeft < sw - cw - 1,
      })
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(sync)
    }
    sync()
    el.addEventListener("scroll", queue, { passive: true })
    const ro = new ResizeObserver(queue)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", queue)
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [chips.length])
  return (
    <>
      <div className="mx-auto mb-8 max-w-7xl px-4 sm:px-6 lg:mb-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span
            id="workshop-filter-label"
            className="text-muted-foreground text-sm font-medium"
          >
            Filter by focus
          </span>
          <p
            aria-live="polite"
            className="text-muted-foreground text-sm tabular-nums"
          >
            Showing {filtered.length} of {workshops.length} workshops
          </p>
        </div>
        <div className="relative -mx-4 mt-2 sm:-mx-6">
          <div
            ref={rowRef}
            role="group"
            aria-labelledby="workshop-filter-label"
            className={CHIP_ROW}
          >
            <button
              type="button"
              aria-pressed={selected.length === 0}
              onClick={() => setSelected([])}
              className={CHIP_HIT}
            >
              <span
                className={cn(
                  CHIP_PILL,
                  selected.length === 0 ? CHIP_ON : CHIP_OFF
                )}
              >
                All
                <span className="tabular-nums opacity-60">
                  {workshops.length}
                </span>
              </span>
            </button>
            {chips.map((tag) => {
              const Icon = WORKSHOP_TAG_ICONS[tag]
              const on = selected.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(tag)}
                  className={CHIP_HIT}
                >
                  <span className={cn(CHIP_PILL, on ? CHIP_ON : CHIP_OFF)}>
                    <Icon className="size-3.5" aria-hidden />
                    {tag}
                    <span className="tabular-nums opacity-60">
                      {counts.get(tag)}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
          {(edges.left || edges.right) && (
            <ScrollArrows
              edges={edges}
              previousLabel="Previous focus areas"
              nextLabel="More focus areas"
              overlay
              onNudge={(dir) =>
                rowRef.current?.scrollBy({
                  left: dir * Math.max(160, rowRef.current.clientWidth * 0.8),
                  behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                  ).matches
                    ? "instant"
                    : "smooth",
                })
              }
            />
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
          <p className="font-serif text-3xl">
            {workshops.length === 0
              ? "No workshops scheduled yet."
              : "No open dates in those areas right now."}
          </p>
          <p className="text-muted-foreground mt-3">
            New dates are added through the year — or bring the programme to
            your team instead.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {workshops.length > 0 && (
              <Button variant="outline" onClick={() => setSelected([])}>
                Show all workshops
              </Button>
            )}
            <Button variant="ghost" asChild>
              <Link href="/corporate-training#inquiry">
                Ask about in-house training
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <EventCards workshops={filtered} variant="grid" />
      )}
    </>
  )
}
