import { CmsImage as Image } from "@/app/_components/cms-image"
import { getPublicProfile } from "@/lib/public-api"
import { Reveal } from "@/app/_components/reveal"
import { SplitReveal } from "@/app/_components/split-reveal"

export async function AboutStory() {
  const profile = await getPublicProfile()
  if (!profile.tagline && !profile.longBio.length) return null
  return (
    <section className="mx-auto max-w-7xl px-6 pt-20 pb-24 sm:px-8 lg:pt-28 lg:pb-36">
      <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.78fr] lg:gap-24">
        <div>
          {profile.tagline && (
            <SplitReveal
              as="h2"
              className="font-serif text-[2.25rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.75rem] lg:text-[3.25rem]"
            >
              {profile.tagline}
            </SplitReveal>
          )}

          <Reveal delay={0.1} className="mt-10 space-y-6">
            {profile.longBio.map((paragraph, index) => (
              <p
                key={index}
                className="text-muted-foreground text-lg leading-relaxed lg:text-xl"
              >
                {paragraph}
              </p>
            ))}
          </Reveal>
        </div>

        <Reveal className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={profile.portrait?.url}
            alt={profile.portrait?.alt ?? ""}
            fill
            priority
            sizes="(min-width: 1024px) 34vw, 100vw"
            className="object-cover"
          />
        </Reveal>
      </div>
    </section>
  )
}
