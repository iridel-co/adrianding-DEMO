import { getPublicPrograms, getPublicProfile } from "@/lib/public-api"
import { getIntakeConfig } from "@/lib/intake-config"
import { Reveal } from "@/app/_components/reveal"
import { BloomFieldBackground } from "@/app/_components/bloom-field-background"
import { CorporateInquiryForm } from "./inquiry-form"

/**
 * Corporate Training — closing CTA. Full-bleed brand red, split like
 * <SiteCta>: heading + supporting copy on the left, the inquiry form itself
 * (not a modal) as a floating white card on the right. The left column is
 * vertically centered against the form's height. Card floats on the red
 * ground for contrast — see `inquiry-form.tsx` for the card treatment.
 */
export async function CorporateInquiryCta() {
  const intake = await getIntakeConfig("corporate")
  const [programs, profile] = await Promise.all([
    getPublicPrograms(),
    getPublicProfile(),
  ])
  return (
    <section
      id="inquiry"
      className="text-brand-foreground relative scroll-mt-[calc(var(--nav-h)+1.5rem)] overflow-hidden"
    >
      <BloomFieldBackground />
      <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:py-28">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <Reveal>
            <div className="text-center lg:text-left">
              <h2 className="font-serif text-[2.75rem] leading-[1.03] tracking-[-0.02em] max-lg:text-balance lg:text-[3.5rem] lg:text-wrap">
                Ready to build a program for your team?
              </h2>
              <p className="text-brand-foreground/80 mx-auto mt-6 max-w-md text-lg leading-relaxed lg:mx-0 lg:text-xl">
                Explore the programmes for your team and contact us directly to
                discuss what you need.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <CorporateInquiryForm
              intake={intake}
              programs={programs}
              phone={profile.phone}
              email={profile.emails[0]}
            />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
