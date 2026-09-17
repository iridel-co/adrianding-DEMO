import type { Metadata } from "next"
import { SiteNavbar } from "@/app/_components/site-navbar"
import { SiteFooter } from "@/app/_components/site-footer"
import { CorporateTrainingHero } from "./_sections/hero"
import { CorporateWhy } from "./_sections/why"
import { CorporatePrograms } from "./_sections/programs"
import { CorporateCompanies } from "./_sections/companies"
import { CorporateTestimonials } from "./_sections/testimonials"
import { CorporateTrainer } from "./_sections/trainer"
import { CorporateCredentials } from "./_sections/credentials"
import { CorporateInquiryCta } from "./_sections/inquiry-cta"
import { SupportBand } from "@/app/_components/support-band"
import {
  AboutPromptOverlay,
  AboutPromptSwitcher,
} from "@/app/_components/about-prompt"

export const metadata: Metadata = {
  title: "Corporate Training — Coach Adrian Ding",
  description:
    "Custom corporate training on leadership, culture and communication. 20,000+ professionals trained across the Top 500 companies in the Philippines.",
}

export default function CorporateTrainingPage() {
  return (
    <>
      <SiteNavbar />
      {/* DEMO ONLY — see the workshop detail page. */}
      <AboutPromptSwitcher />
      <main>
        <CorporateTrainingHero />
        <CorporateWhy />
        <CorporatePrograms />
        <CorporateCompanies />
        <CorporateTestimonials />
        {/* The person, then his paperwork — one credibility block on a shared
            ground, immediately before the form. */}
        <CorporateTrainer />
        {/* Accreditation before the form — the last objection an L&D head has
            to answer internally. */}
        <CorporateCredentials />
        <CorporateInquiryCta />
        {/* Anyone not ready to fill a form still gets a way through. */}
        <SupportBand
          heading="Would rather talk it through first?"
          blurb="Tell us roughly what your team needs and we will come back with a shape and a number. No form required to start the conversation."
        />
      </main>
      <SiteFooter />
      <AboutPromptOverlay />
    </>
  )
}
