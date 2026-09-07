import Image from "next/image"
import { Reveal } from "@/app/_components/reveal"
import { SplitReveal } from "@/app/_components/split-reveal"
import { CERTIFICATIONS, type Certification } from "@/lib/certifications"

/**
 * About — certifications & accreditations as a single logo row, matching the
 * "in great company" treatment: bare marks, no card chrome.
 * Data is shared with the workshop detail pages — see `src/lib/certifications.ts`.
 */

const CERTS = CERTIFICATIONS

export function AboutCertifications() {
  return (
    <section className="border-border/60 mx-auto max-w-7xl border-t px-6 py-24 sm:px-8 lg:py-36">
      <SplitReveal className="font-serif text-[2.75rem] leading-[1.05] tracking-[-0.02em] lg:text-[3.75rem]">
        Certifications &amp; accreditations
      </SplitReveal>

      <div className="mt-16 flex flex-col gap-8 lg:gap-14">
        <Reveal
          stagger={0.08}
          className="flex flex-wrap items-start justify-center gap-x-12 gap-y-8 sm:gap-x-16 lg:gap-y-14"
        >
          {CERTS.slice(0, 3).map((c) => (
            <CertCard key={c.name} cert={c} />
          ))}
        </Reveal>
        <Reveal
          stagger={0.08}
          className="flex flex-wrap items-start justify-center gap-x-12 gap-y-8 sm:gap-x-16 lg:gap-y-14"
        >
          {CERTS.slice(3).map((c) => (
            <CertCard key={c.name} cert={c} />
          ))}
        </Reveal>
      </div>
    </section>
  )
}

function CertCard({ cert }: { cert: Certification }) {
  return (
    <div className="flex w-44 flex-col items-center gap-5 text-center sm:w-56">
      <div className="relative flex h-28 w-full items-center justify-center sm:h-32">
        {cert.circleBg ? (
          <div
            className="relative size-28 shrink-0 rounded-full sm:size-32"
            style={{ backgroundColor: cert.circleBg }}
          >
            <Image
              src={cert.src}
              alt={cert.name}
              fill
              sizes="128px"
              className="object-contain p-4"
            />
          </div>
        ) : (
          <Image
            src={cert.src}
            alt={cert.name}
            fill
            sizes="224px"
            className="object-contain"
          />
        )}
      </div>
      <div>
        <h3 className="font-serif text-lg tracking-[-0.01em] sm:text-xl">
          {cert.name}
        </h3>
        <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
          {cert.line}
        </p>
      </div>
    </div>
  )
}
