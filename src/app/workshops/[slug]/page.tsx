import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SiteNavbar } from "@/app/_components/site-navbar"
import { SiteFooter } from "@/app/_components/site-footer"
import { SupportBand } from "@/app/_components/support-band"
import { WORKSHOPS, getWorkshop } from "@/lib/workshops"
import { WorkshopHero } from "./_sections/hero"
import { WorkshopOverview } from "./_sections/overview"
import { WorkshopProof } from "./_sections/proof"
import { WorkshopDetails } from "./_sections/details"
import { WorkshopTestimonials } from "./_sections/testimonials"
import { WorkshopFaq } from "./_sections/faq"
import { RegisterCta } from "./_sections/register-cta"
import { PastCta } from "./_sections/past-cta"
import { StickyRegisterBar } from "./_sections/sticky-register-bar"

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return WORKSHOPS.map((w) => ({ slug: w.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const w = getWorkshop(slug)
  if (!w) return { title: "Workshop not found" }
  const title = `${w.title} — ${w.schedule} · Coach Adrian Ding`
  return {
    title,
    description: w.summary,
    openGraph: {
      title,
      description: w.summary,
      type: "website",
    },
  }
}

/**
 * Workshop detail — built to stand alone as a conversion landing page, because
 * paid traffic lands here without ever seeing the homepage: instructor proof,
 * testimonials and FAQ all sit on this page rather than a link away, and the
 * sticky bar keeps the register action reachable the whole way down.
 */
export default async function WorkshopPage({ params }: Params) {
  const { slug } = await params
  const workshop = getWorkshop(slug)
  if (!workshop) notFound()

  const isOpen = workshop.status === "open"

  return (
    <>
      <SiteNavbar />
      <main>
        <WorkshopHero workshop={workshop} />
        <WorkshopOverview workshop={workshop} />
        <WorkshopProof />
        <WorkshopDetails workshop={workshop} />
        <WorkshopTestimonials />
        <WorkshopFaq />
        {isOpen ? (
          <RegisterCta workshop={workshop} />
        ) : (
          <PastCta workshop={workshop} />
        )}
        <SupportBand />
      </main>
      <SiteFooter />
      {/* The fixed register bar overlays the bottom of the page. The footer's
          last row is the decorative aria-hidden wordmark (no links/content),
          so there's nothing there for the bar to cover — no spacer needed. */}
      {isOpen && <StickyRegisterBar workshop={workshop} />}
    </>
  )
}
