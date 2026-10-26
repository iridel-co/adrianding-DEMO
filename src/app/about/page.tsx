import type { Metadata } from "next"
import { getPublicFaqs, getPublicPrograms } from "@/lib/public-api"
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
  title: "About Coach Adrian Ding",
  description:
    "Adrian Ding, CEO of Maximum Impact PH — corporate trainer, leadership coach and keynote speaker. His story, certifications and career milestones.",
}

export default async function AboutPage() {
  const programs = await getPublicPrograms()
  const faqs = (await getPublicFaqs()).filter((faq) => faq.group === "about")
  return (
    <>
      <SiteNavbar initialTheme="dark" />
      <main>
        <AboutHero />
        <AboutStory />
        <AboutNumbers />
        <AboutJourney />
        <AboutCertifications />
        <AboutFaq faqs={faqs} />
        <SiteCta
          programs={programs}
          heading="Work with Adrian"
          subtext="Join a public workshop, or bring him in to train your team."
        />
      </main>
      <SiteFooter />
    </>
  )
}
