import Image from "next/image"
import { Counter } from "@/app/_components/counter"
import { Reveal } from "@/app/_components/reveal"
import { CERTIFICATIONS } from "@/lib/certifications"

/**
 * Instructor-credibility band on the workshop detail page.
 *
 * Ad traffic lands here cold and has never seen the homepage or the About page,
 * so the only answer to "who is teaching this?" has to be on this page. Portrait,
 * one grounding paragraph, three figures, and the accreditations in compact form.
 *
 * The figures are sans-serif and brand-coloured on purpose — serif numerals read
 * as decoration, and these are the load-bearing proof.
 *
 * TODO: client sign-off on the three headline figures (years, professionals
 * trained, company count) — they are from the PRD, not from a verified source.
 */
export function WorkshopProof() {
  return (
    <section className="bg-muted/40 py-16 lg:py-24">
      <div className="mx-auto grid max-w-5xl gap-12 px-6 sm:px-8 lg:grid-cols-[0.75fr_minmax(0,1fr)] lg:items-start lg:gap-16">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-lg lg:sticky lg:top-[calc(var(--nav-h)+3rem)]">
          <Image
            src="/images/mascot/ad-photo-2.webp"
            alt="Coach Adrian Ding leading a workshop session"
            fill
            sizes="(min-width: 1024px) 32vw, 100vw"
            className="object-cover"
          />
        </Reveal>

        <div>
          <Reveal>
            <h2 className="font-serif text-[2rem] leading-[1.08] tracking-[-0.02em] sm:text-[2.5rem]">
              The person at the front of the room
            </h2>
          </Reveal>

          <Reveal className="mt-6 space-y-5" stagger={0.08}>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Coach Adrian Ding has spent two decades training sales teams,
              managers and front-line staff across the Philippines — for banks,
              insurers, developers, manufacturers and family businesses. He
              still teaches every public workshop himself.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Nothing in the room is theory borrowed from a book. Every
              framework in the day has been run with a real team, in a real
              quarter, against a real number.
            </p>
          </Reveal>

          <Reveal
            className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3"
            stagger={0.1}
          >
            <div>
              <p className="text-brand text-4xl font-semibold tracking-[-0.02em]">
                <Counter to={20} suffix="+" />
              </p>
              <p className="text-muted-foreground mt-2 text-sm leading-snug">
                Years training professionals
              </p>
            </div>
            <div>
              <p className="text-brand text-4xl font-semibold tracking-[-0.02em]">
                <Counter to={20000} suffix="+" />
              </p>
              <p className="text-muted-foreground mt-2 text-sm leading-snug">
                Professionals trained in person
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-brand text-4xl font-semibold tracking-[-0.02em]">
                <Counter to={500} prefix="Top " />
              </p>
              <p className="text-muted-foreground mt-2 text-sm leading-snug">
                Philippine companies on the client list
              </p>
            </div>
          </Reveal>

          {/* Same centred logo cards as the corporate page's accreditation
              band, rather than the text-only chips this used to carry — an
              accrediting body is recognised by its mark first, and a visitor
              from an ad has no other reason to trust the names. */}
          <Reveal className="mt-12">
            <p className="text-sm font-medium">Certified and accredited</p>
            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
              {CERTIFICATIONS.map((c, i) => (
                <li
                  key={c.name}
                  className={`flex flex-col items-center text-center ${
                    i === CERTIFICATIONS.length - 1
                      ? "col-span-2 sm:col-span-1"
                      : ""
                  }`}
                >
                  <div className="flex h-12 items-center justify-center">
                    {c.circleBg ? (
                      <div
                        className="relative size-12 shrink-0 rounded-full"
                        style={{ backgroundColor: c.circleBg }}
                      >
                        <Image
                          src={c.src}
                          alt={c.name}
                          fill
                          sizes="48px"
                          className="object-contain p-1.5"
                        />
                      </div>
                    ) : (
                      <Image
                        src={c.src}
                        alt={c.name}
                        height={48}
                        width={96}
                        style={{ width: "auto" }}
                        className="max-h-12 object-contain"
                      />
                    )}
                  </div>
                  <span className="mt-3 text-xs font-medium">{c.name}</span>
                  <span className="text-muted-foreground mt-1 text-xs leading-snug">
                    {c.short}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
