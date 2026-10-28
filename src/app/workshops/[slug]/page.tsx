import { getIntakeConfig } from "@/lib/intake-config"
import type { Metadata } from "next"
import { SiteNavbar } from "@/app/_components/site-navbar"
import { SiteFooter } from "@/app/_components/site-footer"
import { SupportBand } from "@/app/_components/support-band"
import {
  getPublicTestimonials,
  getPublicWorkshop,
  getPublicWorkshops,
} from "@/lib/public-api"
import { workshopView } from "@/lib/workshop-view"
import { WorkshopHero } from "./_sections/hero"
import { WorkshopOverview } from "./_sections/overview"
import { WorkshopProof } from "./_sections/proof"
import { WorkshopDetails } from "./_sections/details"
import { WorkshopTestimonials } from "./_sections/testimonials"
import { WorkshopFaq } from "./_sections/faq"
import { TeamCta } from "./_sections/team-cta"
import { RegisterCta } from "./_sections/register-cta"
import { PastCta } from "./_sections/past-cta"
import { StickyRegisterBar } from "./_sections/sticky-register-bar"

type Params = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ session?: string }>
}
export async function generateStaticParams() {
  return (await getPublicWorkshops()).map((workshop) => ({
    slug: workshop.slug,
  }))
}
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const workshop = await getPublicWorkshop((await params).slug)
  const title = `${workshop.title} — Coach Adrian Ding`
  return {
    title,
    description: workshop.summary,
    openGraph: { title, description: workshop.summary, type: "website" },
  }
}
export default async function WorkshopPage({ params, searchParams }: Params) {
  const { slug } = await params
  const [content, testimonials] = await Promise.all([
    getPublicWorkshop(slug),
    getPublicTestimonials(),
  ])
  const config = getIntakeConfig()
  const workshop = workshopView(
    content,
    "0920 900 7709",
    config,
    (await searchParams)?.session
  )
  return (
    <>
      <SiteNavbar />
      <main>
        <WorkshopHero workshop={workshop} />
        <WorkshopOverview workshop={workshop} />
        <WorkshopProof />
        <WorkshopDetails workshop={workshop} />
        <WorkshopTestimonials
          testimonials={testimonials.filter(
            (item) => item.workshop?.slug === slug
          )}
        />
        <WorkshopFaq />
        {workshop.status === "past" ? (
          <PastCta workshop={workshop} />
        ) : (
          <RegisterCta workshop={workshop} />
        )}
        <TeamCta />
        <SupportBand />
      </main>
      <SiteFooter />
      {workshop.status === "open" && <StickyRegisterBar workshop={workshop} />}
    </>
  )
}
