import Image from "next/image"
import { SplitReveal } from "@/app/_components/split-reveal"
import { Reveal } from "@/app/_components/reveal"

/**
 * About — opening banner. Full-bleed shot with the belief-chain line ("Better
 * people build better companies") set over it in the editorial serif, body
 * copy + CTA to its right — same layout as `workshops/_sections/hero.tsx`
 * and `corporate-training/_sections/hero.tsx`.
 */
export function AboutHero() {
  return (
    <section
      data-navbar-theme="dark"
      className="relative flex h-auto min-h-120 w-full items-end overflow-hidden bg-neutral-950 lg:h-[64svh]"
    >
      <Image
        src="/images/hero/about-hero.webp"
        alt="Coach Adrian Ding leading a corporate training session"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[80%_75%] lg:object-[center_75%]"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pt-16 pb-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:pb-16">
        <SplitReveal
          as="h1"
          className="max-w-3xl font-serif text-[2.75rem] leading-[1.03] tracking-[-0.02em] text-white sm:text-[3.5rem] lg:text-[4.5rem]"
        >
          Better people build better companies.
        </SplitReveal>
        <Reveal className="flex max-w-md flex-col gap-6 lg:pb-2">
          <p className="text-base leading-relaxed text-white/80 lg:text-lg">
            20+ years in the training circuit, 20,000+ professionals trained
            across the Top 500 companies in the Philippines.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
