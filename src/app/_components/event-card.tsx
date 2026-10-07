"use client"

import type { CSSProperties } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MapPin, Ticket } from "lucide-react"
import { WorkshopAvailabilityText } from "@/app/_components/workshop-availability-text"
import { WorkshopTagPills } from "@/app/_components/workshop-tags"
import { type Workshop } from "@/lib/workshops"
import { getWorkshopAvailability } from "@/lib/workshop-availability"

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  })
}

export function EventCard({
  workshop,
  priority,
  revealed,
  className,
  style,
  onActivate,
  onDeactivate,
}: {
  workshop: Workshop
  priority: boolean
  revealed: boolean
  className: string
  style: CSSProperties
  onActivate: () => void
  onDeactivate: () => void
}) {
  const availability = getWorkshopAvailability(workshop)
  return (
    <Link
      href={`/workshops/${workshop.slug}`}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
      style={style}
      className={className}
    >
      <Image
        src={workshop.image}
        alt={`${workshop.title} — Coach Adrian Ding`}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 55vw, 100vw"
        className="object-cover object-[center_26%]"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/40 to-black/5" />

      <WorkshopTagPills
        tags={workshop.tags}
        className="absolute top-5 right-6 left-6 z-[1] lg:top-6 lg:right-8 lg:left-8"
      />

      <div className="relative flex h-full w-full flex-col justify-end gap-3 px-6 py-8 text-left text-white lg:px-8">
        <p className="text-xs font-semibold tracking-[0.22em] text-white/75 uppercase">
          {workshop.status === "past" ? "Past workshop · " : ""}
          {shortDate(workshop.start)}
        </p>
        <h3 className="text-[1.75rem] leading-[1.08] font-extrabold tracking-[-0.01em] text-balance lg:text-[2.125rem]">
          {workshop.title}
        </h3>

        <div
          className={`grid w-full transition-[grid-template-rows,opacity] duration-500 ease-out ${
            revealed
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 lg:pointer-events-none"
          }`}
        >
          <div className="flex min-h-0 flex-col gap-4 overflow-hidden pt-3">
            <p className="text-sm font-semibold text-white">
              <WorkshopAvailabilityText workshop={workshop} onDark />
            </p>
            <p className="max-w-md text-base leading-relaxed text-white/85">
              {workshop.summary}
            </p>
            {/* Venue/price and Register share one row, pinned to the
                  card's bottom edge — `justify-between` spaces them
                  apart instead of stacking Register on its own row. */}
            <div className="flex items-end justify-between gap-3 pt-1">
              <dl className="flex flex-col gap-1.5 text-sm text-white/85">
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-4 shrink-0" />
                  <span className="line-clamp-1">{workshop.venue}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Ticket className="size-4 shrink-0" />
                  <span className="font-semibold text-white">
                    {workshop.price}
                  </span>
                </div>
              </dl>
              {/* Register carries its own hover animation, separate
                    from the card-wide hover that drives the expansion.
                    Same wipe-fill + color-invert mechanic as `Button`
                    (see button.tsx) — a `::before` sweeps in from the
                    left and the label inverts brand-red-on-white to
                    white-on-dark. Lift-only, never scale: this pill
                    sits at the bottom-right corner of an
                    `overflow-hidden rounded-4xl` card, so any
                    transform that grows the box (scale) clips against
                    that edge. Translate is safe since it only needs
                    headroom above. */}
              <span className="group/reg text-brand-foreground bg-brand before:bg-background hover:text-foreground relative isolate inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg shadow-black/25 transition-[color,transform,box-shadow] duration-300 before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:transition-transform before:duration-300 before:content-[''] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40 hover:before:scale-x-100">
                {availability.canRegister ? "Register" : "View details"}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover/reg:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
