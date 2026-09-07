import Image from "next/image"
import { Reveal } from "@/app/_components/reveal"
import { SplitReveal } from "@/app/_components/split-reveal"
import { CERTIFICATIONS } from "@/lib/certifications"

/**
 * Corporate training — accreditation band. An L&D head signing off on a
 * training spend has to justify the choice internally, and "he is a good
 * speaker" does not survive that conversation. The accrediting bodies do, so
 * they sit on the page rather than only on /about.
 *
 * Data is shared with the About page — see `src/lib/certifications.ts`.
 */
export function CorporateCredentials() {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <SplitReveal className="max-w-3xl font-serif text-[2rem] leading-[1.1] tracking-[-0.02em] lg:text-[2.75rem]">
          Accredited, not self-declared
        </SplitReveal>
        <p className="text-muted-foreground mt-5 max-w-2xl leading-relaxed">
          Every programme is delivered by a trainer certified and accredited by
          the bodies below — the paperwork your procurement and L&amp;D teams
          will ask for, before they ask for it.
        </p>

        <Reveal
          stagger={0.07}
          className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5"
        >
          {CERTIFICATIONS.map((c, i) => (
            <div
              key={c.name}
              className={`flex flex-col items-center text-center ${
                i === CERTIFICATIONS.length - 1
                  ? "col-span-2 sm:col-span-1"
                  : ""
              }`}
            >
              <div className="flex h-16 items-center justify-center">
                {c.circleBg ? (
                  <div
                    className="relative size-16 shrink-0 rounded-full"
                    style={{ backgroundColor: c.circleBg }}
                  >
                    <Image
                      src={c.src}
                      alt={c.name}
                      fill
                      sizes="64px"
                      className="object-contain p-2"
                    />
                  </div>
                ) : (
                  <Image
                    src={c.src}
                    alt={c.name}
                    height={64}
                    width={120}
                    style={{ width: "auto" }}
                    className="max-h-16 object-contain"
                  />
                )}
              </div>
              <h3 className="mt-4 font-serif text-base tracking-[-0.01em]">
                {c.name}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                {c.short}
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
