import type { Metadata } from "next"
import { SiteNavbar } from "@/app/_components/site-navbar"
import { SiteFooter } from "@/app/_components/site-footer"
import { SiteCta } from "@/app/_components/site-cta"
import { WorkshopsHero } from "./_sections/hero"
import { WorkshopsList } from "./_sections/list"

export const metadata: Metadata = {
  title: "Public Workshops — Coach Adrian Ding",
  description:
    "Full-day workshops on salesmanship and leadership, open for individual registration. Upcoming dates in Cebu.",
}

export default function WorkshopsPage() {
  return (
    <>
      <SiteNavbar />
      <main>
        <WorkshopsHero />
        <WorkshopsList />
        <SiteCta
          heading="Not sure which workshop fits?"
          subtext="Tell us about your team and we'll point you to the right one — or design something custom."
        />
      </main>
      <SiteFooter />
    </>
  )
}
