import { CmsImage as Image } from "@/app/_components/cms-image"
import { getPublicProfile } from "@/lib/public-api"
import { Reveal } from "@/app/_components/reveal"
import { SplitReveal } from "@/app/_components/split-reveal"

export async function CorporateCredentials() {
  const { credentials: CERTS } = await getPublicProfile()
  if (!CERTS.length) return null
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <SplitReveal className="max-w-3xl font-serif text-[2rem] leading-[1.1] tracking-[-0.02em] lg:text-[2.75rem]">
          Certified and credentialed
        </SplitReveal>
        <p className="text-muted-foreground mt-5 max-w-2xl leading-relaxed">
          The credentials your procurement and L&amp;D teams will ask for,
          before they ask for it.
        </p>

        <Reveal
          stagger={0.07}
          className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5"
        >
          {CERTS.map((c, i) => (
            <div
              key={c.organization}
              className={`flex flex-col items-center text-center ${
                i === CERTS.length - 1 ? "col-span-2 sm:col-span-1" : ""
              }`}
            >
              <div className="flex h-16 items-center justify-center">
                {c.organization === "INSEAD" ? (
                  <div
                    className="relative size-16 shrink-0 rounded-full"
                    style={{ backgroundColor: "#eaecef" }}
                  >
                    <Image
                      src={c.logo?.url}
                      alt={c.logo?.alt ?? c.organization}
                      fill
                      sizes="64px"
                      className="object-contain p-2"
                    />
                  </div>
                ) : (
                  <Image
                    src={c.logo?.url}
                    alt={c.logo?.alt ?? c.organization}
                    height={64}
                    width={120}
                    style={{ width: "auto" }}
                    className="max-h-16 object-contain"
                  />
                )}
              </div>
              <h3 className="mt-4 font-serif text-base tracking-[-0.01em]">
                {c.organization}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                {c.description}
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
