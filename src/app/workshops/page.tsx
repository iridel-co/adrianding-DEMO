import type { Metadata } from "next"
import { SiteNavbar } from "@/app/_components/site-navbar"
import { SiteFooter } from "@/app/_components/site-footer"
import { SiteCta } from "@/app/_components/site-cta"
import { WorkshopsHero } from "./_sections/hero"
import { WorkshopsList } from "./_sections/list"
import { getPublicPrograms } from "@/lib/public-api"

export const metadata: Metadata = {
  title: "Public Workshops — Coach Adrian Ding",
  description:
    "Full-day workshops on salesmanship and leadership, open for individual registration. Upcoming dates in Cebu.",
}

export default async function WorkshopsPage() {
  const programs = await getPublicPrograms()
  return (
    <>
      <SiteNavbar />
      <main>
        <WorkshopsHero />
        <WorkshopsList />
        <SiteCta
          programs={programs}
          heading="Not sure which workshop fits?"
          subtext="Tell us about your team and we'll point you to the right one — or design something custom."
        />
      </main>
      <SiteFooter />
    </>
  )
}
