"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EventCards } from "@/app/_components/event-cards"
import { WORKSHOP_TAG_ICONS } from "@/app/_components/workshop-tags"
import { WORKSHOP_TAGS, type Workshop, type WorkshopTag } from "@/lib/workshops"

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
 */
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

  const chipBase =
    "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium ring-1 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none motion-reduce:transition-none"
  const chipOff =
    "text-muted-foreground ring-border hover:text-foreground hover:ring-foreground"
  const chipOn =
    "bg-brand text-brand-foreground ring-brand hover:bg-brand-accent hover:ring-brand-accent"

  return (
    <>
      <div className="mx-auto mb-8 flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:mb-12 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-labelledby="workshop-filter-label"
          className="flex flex-wrap items-center gap-2"
        >
          <span
            id="workshop-filter-label"
            className="text-muted-foreground mr-1 text-sm font-medium"
          >
            Filter by focus
          </span>
          <button
            type="button"
            aria-pressed={selected.length === 0}
            onClick={() => setSelected([])}
            className={`${chipBase} ${selected.length === 0 ? chipOn : chipOff}`}
          >
            All
            <span className="tabular-nums opacity-60">{workshops.length}</span>
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
                className={`${chipBase} ${on ? chipOn : chipOff}`}
              >
                <Icon className="size-4" aria-hidden />
                {tag}
                <span className="tabular-nums opacity-60">
                  {counts.get(tag)}
                </span>
              </button>
            )
          })}
        </div>
        <p aria-live="polite" className="text-muted-foreground text-sm">
          Showing {filtered.length} of {workshops.length} workshops
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
          <p className="font-serif text-3xl">
            No open dates in that area right now.
          </p>
          <p className="text-muted-foreground mt-3">
            New dates are added through the year — or bring the programme to
            your team instead.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={() => setSelected([])}>
              Show all workshops
            </Button>
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
