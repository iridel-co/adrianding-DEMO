import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SplitReveal } from "@/app/_components/split-reveal"
import SocialCards from "@/components/ui/card-fan-carousel"
import { GALLERY_EVENTS } from "@/lib/gallery"

/**
 * A look inside recent rooms, as a GSAP card fan. Each card links through to
 * its event page; the whole thing links on to the full gallery. 6 events sit
 * under the carousel's MAX_VISIBLE (7), so it fans them all with no pager.
 * Own data import, but heading/subtext are overridable — rendered on the
 * landing page with its default "Inside the room" copy, and reused on
 * `/workshops` with "Past events" copy, standing in for that page's removed
 * past-workshops list.
 * TODO: covers reuse the available Adrian / stage stand-ins until real event
 * photo sets land.
 */

export function LandingGalleryPreview({
  heading = "Inside the room",
  subtext = "A few of the workshops and keynotes from the last two years.",
}: {
  heading?: string
  subtext?: string
}) {
  const cards = GALLERY_EVENTS.map((e) => ({
    imgUrl: e.cover,
    alt: e.name,
    linkUrl: "/gallery",
  }))

  return (
    <section className="bg-muted/40 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SplitReveal className="font-serif text-[2.75rem] leading-[1.05] tracking-[-0.02em] lg:text-[3.75rem]">
              {heading}
            </SplitReveal>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed lg:text-xl">
              {subtext}
            </p>
          </div>
          <Link
            href="/gallery"
            className="text-brand group hidden items-center gap-2 pb-2 text-sm font-semibold tracking-[0.12em] uppercase sm:inline-flex"
          >
            All events
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Full-bleed so the fan can spread; `overflow-x-clip` masks the fly-in
          and hover push without turning this into a scroll container (which
          `overflow-hidden` would — and that breaks the page's sticky hero). */}
      <div className="mt-2 overflow-x-clip lg:mt-4">
        <SocialCards cards={cards} />
      </div>

      <div className="mx-auto flex max-w-7xl justify-center px-6 sm:hidden">
        <Link
          href="/gallery"
          className="text-brand mt-6 inline-flex items-center gap-2 text-sm font-semibold tracking-[0.12em] uppercase"
        >
          All events
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  )
}
