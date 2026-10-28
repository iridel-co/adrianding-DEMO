import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { SplitReveal } from "@/app/_components/split-reveal"
import { Reveal } from "@/app/_components/reveal"
import { Button } from "@/components/ui/button"

/**
 * Corporate Training — opening banner. Full-bleed shot over the page's h1,
 * same treatment as `about/_sections/hero.tsx` and
 * `workshops/_sections/hero.tsx`. The follow-through copy + CTAs that used to
 * live in a separate `<CorporateIntro>` section below the fold now sit here,
 * to the header's right, so the pitch and the ask land in the same frame.
 */
export function CorporateTrainingHero() {
  return (
    <section
      data-navbar-theme="dark"
      className="relative flex h-auto min-h-120 w-full items-end overflow-hidden bg-neutral-950 lg:h-[64svh]"
    >
      <Image
        src="/images/hero/corporate-training-hero.webp"
        alt="Adrian Ding leading a corporate training session"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_28%]"
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/45 to-black/10" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pt-16 pb-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:pb-16">
        <SplitReveal
          as="h1"
          className="max-w-3xl font-serif text-[2.75rem] leading-[1.03] tracking-[-0.02em] text-white sm:text-[3.5rem] lg:text-[4.5rem]"
        >
          Training built around your team, not a template.
        </SplitReveal>

        <Reveal className="flex max-w-md flex-col gap-6 lg:max-w-lg lg:pb-2">
          <p className="text-lg leading-relaxed text-white/80 lg:text-xl">
            Most of Adrian&rsquo;s work is custom corporate programs — designed
            with your L&amp;D team around the outcome you need, delivered
            on-site or off, and reinforced after the room clears.
          </p>
          <div className="flex flex-row flex-wrap items-center gap-3">
            <Button
              asChild
              variant="brand"
              size="lg"
              className="hover:text-brand h-12 px-6 before:bg-white hover:shadow-white/30"
            >
              <Link href="#inquiry">
                Start an inquiry
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="before:bg-brand hover:border-brand h-12 px-6 hover:text-white"
            >
              <Link href="/workshops">Looking for a workshop instead?</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
