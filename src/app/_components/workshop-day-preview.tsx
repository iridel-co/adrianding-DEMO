import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"
import { WorkshopAvailabilityText } from "./workshop-availability-text"
import type { Workshop } from "@/lib/workshops"

/** Preview content is independent of the calendar's month and popover state. */
export function WorkshopDayPreview({ workshops }: { workshops: Workshop[] }) {
  return (
    <div className="space-y-6">
      {workshops.map((event) => (
        <div key={event.slug} className="space-y-3">
          <p className="text-brand text-sm font-semibold">{event.schedule}</p>
          <p className="font-serif text-2xl leading-tight">{event.title}</p>
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
  )
}
