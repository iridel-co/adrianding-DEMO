import Image from "next/image"
import { Reveal } from "@/app/_components/reveal"
import { SplitReveal } from "@/app/_components/split-reveal"
import { AboutPromptAnchor } from "@/app/_components/about-prompt"

/**
 * "Who actually stands in front of your people."
 *
 * Until now this page proved the *company* — client logos, testimonials,
 * accreditation marks — and never once showed the man. An L&D head is
 * authorising a stranger to hold forty of their employees for a full day; the
 * face is not decoration, it is the thing being bought.
 *
 * Shares `bg-background` with the accreditation band directly below it and
 * carries no divider, so the person and the paperwork read as one credibility
 * block — the same treatment Companies + Stats get on the landing page.
 */
export function CorporateTrainer() {
  return (
    <section className="bg-background pt-16 lg:pt-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:px-8 lg:grid-cols-[0.5fr_minmax(0,1fr)] lg:items-center lg:gap-16">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-lg lg:max-w-sm">
          <Image
            src="/images/mascot/ad-photo-2.webp"
            alt="Coach Adrian Ding leading a corporate training session"
            fill
            sizes="(min-width: 1024px) 28vw, 100vw"
            className="object-cover"
          />
        </Reveal>

        <div>
          <SplitReveal className="max-w-2xl font-serif text-[2rem] leading-[1.1] tracking-[-0.02em] lg:text-[2.75rem]">
            Who stands in front of your people
          </SplitReveal>

          <Reveal className="mt-6 max-w-2xl space-y-5" stagger={0.08}>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Adrian Ding is CEO of Maximum Impact PH and has spent over two
              decades in the training circuit — 20,000+ professionals across
              banks, insurers, manufacturers, developers and family businesses
              in the Philippines.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              He designs and delivers every engagement himself. What your team
              gets is not a franchised curriculum read off a licensed deck — it
              is built around your industry, your numbers and the problem you
              actually called about. He also specializes in customized keynotes
              for sales kick off rallies, conference and conventions.
              Mentally-stimulating, high-energy, and high impact!
            </p>
          </Reveal>

          {/* One link to /about per page, secondary weight — it must not pull
              against "Send inquiry" further down. */}
          <AboutPromptAnchor className="mt-9" />
        </div>
      </div>
    </section>
  )
}
