import { CmsImage as Image } from "@/app/_components/cms-image"
import { CmsCounter } from "@/app/_components/cms-counter"
import { Reveal } from "@/app/_components/reveal"
import { AboutPromptAnchor } from "@/app/_components/about-prompt"
import { getPublicProfile } from "@/lib/public-api"

export async function WorkshopProof() {
  const profile = await getPublicProfile()
  const stats = profile.stats.filter((stat) => stat.pages.includes("corporate"))
  return (
    <section className="bg-muted/40 py-16 lg:py-24">
      <div className="mx-auto grid max-w-5xl gap-12 px-6 sm:px-8 lg:grid-cols-[0.75fr_minmax(0,1fr)] lg:items-start lg:gap-16">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-lg lg:sticky lg:top-[calc(var(--nav-h)+3rem)]">
          <Image
            src={profile.portrait?.url}
            alt={profile.portrait?.alt ?? ""}
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
            {profile.longBio.map((paragraph, index) => (
              <p
                key={index}
                className="text-muted-foreground text-lg leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </Reveal>
          {stats.length > 0 && (
            <Reveal
              className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3"
              stagger={0.1}
            >
              {stats.map((stat, index) => (
                <div key={index} className="min-w-0">
                  <p className="text-brand text-4xl font-semibold tracking-[-0.02em] break-words">
                    <CmsCounter value={stat.value} />
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm leading-snug">
                    {stat.description || stat.label}
                  </p>
                </div>
              ))}
            </Reveal>
          )}
          {profile.credentials.length > 0 && (
            <Reveal className="mt-12">
              <p className="text-sm font-medium">Certified and credentialed</p>
              <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                {profile.credentials.map((credential, index) => (
                  <li
                    key={index}
                    className={`flex flex-col items-center text-center ${index === profile.credentials.length - 1 ? "col-span-2 sm:col-span-1" : ""}`}
                  >
                    <div className="flex h-12 items-center justify-center">
                      <Image
                        src={credential.logo?.url}
                        alt={credential.logo?.alt ?? credential.organization}
                        height={48}
                        width={96}
                        style={{ width: "auto" }}
                        className="max-h-12 object-contain"
                      />
                    </div>
                    <span className="mt-3 text-xs font-medium">
                      {credential.organization}
                    </span>
                    <span className="text-muted-foreground mt-1 text-xs leading-snug">
                      {credential.description}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
          <AboutPromptAnchor className="mt-10" />
        </div>
      </div>
    </section>
  )
}
