import type { Metadata } from "next"
import { SiteNavbar } from "@/app/_components/site-navbar"
import { SiteFooter } from "@/app/_components/site-footer"
import { SiteCta } from "@/app/_components/site-cta"
import { AboutHero } from "./_sections/hero"
import { AboutStory } from "./_sections/story"
import { AboutNumbers } from "./_sections/numbers"
import { AboutJourney } from "./_sections/journey"
import { AboutCertifications } from "./_sections/certifications"
import { AboutFaq } from "./_sections/faq"

export const metadata: Metadata = {
  title: "About Coach Adrian Ding — 20+ years in the training circuit",
  description:
    "Adrian Ding, CEO of Maximum Impact PH — corporate trainer, leadership coach and keynote speaker. His story, certifications and career milestones.",
}

export default function AboutPage() {
  return (
    <>
      <SiteNavbar initialTheme="dark" />
      <main>
        <AboutHero />
        <AboutStory />
        <AboutNumbers />
        <AboutJourney />
        <AboutCertifications />
        <AboutFaq />
        <SiteCta
          heading="Work with Adrian"
          subtext="Join a public workshop, or bring him in to train your team."
        />
      </main>
      <SiteFooter />
    </>
  )
}
