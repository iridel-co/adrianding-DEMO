import { CmsImage as Image } from "@/app/_components/cms-image"
import { getPublicProfile } from "@/lib/public-api"
import { Reveal } from "@/app/_components/reveal"
import { SplitReveal } from "@/app/_components/split-reveal"
import { AboutPromptAnchor } from "@/app/_components/about-prompt"

export async function CorporateTrainer() {
  const profile = await getPublicProfile()
  return (
    <section className="bg-background pt-16 lg:pt-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:px-8 lg:grid-cols-[0.5fr_minmax(0,1fr)] lg:items-center lg:gap-16">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-lg lg:max-w-sm">
          <Image
            src={profile.portrait?.url}
            alt={profile.portrait?.alt ?? ""}
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
            {profile.longBio.map((paragraph, index) => (
              <p
                key={index}
                className="text-muted-foreground text-lg leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </Reveal>

          {/* One link to /about per page, secondary weight — it must not pull
              against "Send inquiry" further down. */}
          <AboutPromptAnchor className="mt-9" />
        </div>
      </div>
    </section>
  )
}
