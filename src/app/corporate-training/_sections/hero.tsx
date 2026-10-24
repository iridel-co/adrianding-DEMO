import Link from "next/link"
import { CmsImage as Image } from "@/app/_components/cms-image"
import { getPublicProfile } from "@/lib/public-api"
import { ArrowRight } from "lucide-react"
import { SplitReveal } from "@/app/_components/split-reveal"
import { Reveal } from "@/app/_components/reveal"
import { Button } from "@/components/ui/button"

export async function CorporateTrainingHero() {
  const profile = await getPublicProfile()
  return (
    <section
      data-navbar-theme="dark"
      className="relative flex h-auto min-h-120 w-full items-end overflow-hidden bg-neutral-950 lg:h-[64svh]"
    >
      <Image
        src={profile.portrait?.url}
        alt={profile.portrait?.alt ?? ""}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_28%]"
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/45 to-black/10" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pt-16 pb-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:pb-16">
        <SplitReveal
          as="h1"
          className="max-w-3xl font-serif text-[2.75rem] leading-[1.03] tracking-[-0.02em] text-white sm:text-[3.5rem] lg:text-[4.5rem]"
        >
          Training built around your team, not a template.
        </SplitReveal>

        <Reveal className="flex max-w-md flex-col gap-6 lg:max-w-lg lg:pb-2">
          <p className="text-lg leading-relaxed text-white/80 lg:text-xl">
            {profile.shortBio}
          </p>
          <div className="flex flex-row flex-wrap items-center gap-3">
            <Button
              asChild
              variant="brand"
              size="lg"
              className="hover:text-brand h-12 px-6 before:bg-white hover:shadow-white/30"
            >
              <Link href="#inquiry">
                Start an inquiry
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="before:bg-brand hover:border-brand h-12 px-6 hover:text-white"
            >
              <Link href="/workshops">Looking for a workshop instead?</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
