import Image from "next/image"
import Link from "next/link"
import { CalendarDays, MapPin } from "lucide-react"
import { SplitReveal } from "@/app/_components/split-reveal"
import { Reveal } from "@/app/_components/reveal"
import { WorkshopTagPills } from "@/app/_components/workshop-tags"
import type { Workshop } from "@/lib/workshops"
import { ShareButton } from "./share-button"

/**
 * Course page opener.
 *
 * The page used to start on a backlink and a wall of type against the page
 * ground, which read as blank at the exact moment an ad visitor decides whether
 * to stay. This is the same full-bleed treatment as the `/workshops` and
 * `/about` banners, with the two pieces of copy doing the jobs the client asked
 * for: the `problem` line as the tag above (so a cold visitor recognises
 * themselves first) and the course title as the headline under it.
 *
 * The date/venue chips sit here rather than only in the rail below so the
 * "when and where" question is answered before the fold on a phone.
 */
export function WorkshopHero({ workshop }: { workshop: Workshop }) {
  return (
    <section
      data-navbar-theme="dark"
      className="relative flex h-auto min-h-140 w-full items-end overflow-hidden bg-neutral-950 lg:min-h-[76svh]"
    >
      <Image
        src={workshop.image}
        alt={`${workshop.title} — a past session in the room`}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_35%] opacity-70"
      />
      {/* Two stops: a heavy foot so the type always clears the photo, and a
          softer top so the navbar reads over it. */}
      <div className="absolute inset-0 bg-linear-to-t from-black/88 via-black/55 to-black/35" />

      <div className="relative mx-auto w-full max-w-7xl px-6 pt-24 pb-10 sm:px-8 lg:pb-16">
        <Reveal>
          <Link
            href="/workshops"
            className="text-xs font-semibold tracking-[0.14em] text-white/60 uppercase transition-colors hover:text-white"
          >
            ← All workshops
          </Link>
        </Reveal>

        <Reveal className="mt-8 max-w-3xl">
          <p className="text-xl leading-[1.3] text-white/90 sm:text-2xl lg:text-[1.75rem]">
            {workshop.problem}
          </p>
        </Reveal>

        <SplitReveal
          as="h1"
          className="mt-5 max-w-4xl font-serif text-[2.75rem] leading-[1.02] tracking-[-0.02em] text-white sm:text-[3.75rem] lg:text-[5rem]"
        >
          {workshop.title}
        </SplitReveal>

        <Reveal className="mt-5">
          <WorkshopTagPills tags={workshop.tags} size="md" />
        </Reveal>

        <Reveal
          stagger={0.07}
          className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-3"
        >
          <Chip icon={CalendarDays}>{workshop.schedule}</Chip>
          <Chip icon={MapPin}>
            {workshop.venue}, {workshop.city}
          </Chip>
          {workshop.status === "open" && workshop.seatsLeft > 0 && (
            <span className="bg-brand/90 inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-medium text-white">
              {workshop.seatsLeft} of {workshop.seatsTotal} seats left
            </span>
          )}
          <ShareButton />
        </Reveal>
      </div>
    </section>
  )
}

function Chip({
  icon: Icon,
  children,
}: {
  icon: typeof CalendarDays
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 ring-1 ring-white/15 backdrop-blur-sm">
      <Icon className="size-3.5 shrink-0" />
      {children}
    </span>
  )
}
