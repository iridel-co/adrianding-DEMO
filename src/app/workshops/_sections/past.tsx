import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { CmsImage as Image } from "@/app/_components/cms-image"
import { SplitReveal } from "@/app/_components/split-reveal"
import { WorkshopTagPills } from "@/app/_components/workshop-tags"
import type { PublicWorkshop } from "@/lib/public-content"

function ranOn(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  })
}

/* Workshops that have already run, newest first, so visitors can see the
   history. Each card opens the workshop page, which points to the next open
   workshop. Hidden when nothing has run yet. */
export function PastWorkshops({ workshops }: { workshops: PublicWorkshop[] }) {
  if (workshops.length === 0) return null
  return (
    <section className="bg-muted/40 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <SplitReveal className="font-serif text-[2.5rem] leading-[1.05] tracking-[-0.02em] lg:text-[3.25rem]">
          Past workshops
        </SplitReveal>
        <p className="text-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed">
          Workshops Adrian has already run. Open one to see what it covered.
        </p>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {workshops.map((workshop) => (
            <li key={workshop.slug}>
              <Link
                href={`/workshops/${workshop.slug}`}
                className="group relative flex h-80 flex-col justify-end overflow-hidden rounded-4xl bg-black lg:h-96"
              >
                <Image
                  src={workshop.heroImage?.url}
                  alt={`${workshop.title} — Coach Adrian Ding`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover object-[center_26%] transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/5" />
                <WorkshopTagPills
                  tags={workshop.tags}
                  className="absolute top-5 right-6 left-6 z-[1]"
                />
                <div className="relative flex flex-col gap-2 px-6 py-7 text-white">
                  {workshop.lastSession && (
                    <p className="text-xs font-semibold tracking-[0.22em] text-white/75 uppercase">
                      Ran {ranOn(workshop.lastSession.date)}
                    </p>
                  )}
                  <h3 className="text-2xl leading-[1.1] font-extrabold tracking-[-0.01em] text-balance">
                    {workshop.title}
                  </h3>
                  <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-white/85">
                    View workshop
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
