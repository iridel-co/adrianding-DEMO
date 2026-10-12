import { HeroEditorial } from "./_sections/hero-editorial"
import { QuoteReveal } from "./_sections/quote-reveal"
import { LandingCompanies } from "./_sections/companies"
import { LandingStats } from "./_sections/stats"
import { LandingSpecializations } from "./_sections/specializations"
import { LandingPaths } from "./_sections/paths"
import { LandingWorkshopsOpen } from "./_sections/workshops-open"
import { LandingTestimonials } from "./_sections/testimonials"
import { SiteFooter } from "./_components/site-footer"

/**
 * Landing funnel, top to bottom:
 *   Hero (who) → Quote (the belief) →
 *   Companies (client roster) → Stats (the numbers) — one credibility block →
 *   Paths (#which-path — pick a lane: workshops vs corporate; the hero's
 *   only CTA scrolls here) →
 *   Workshops open (the individual lane's concrete next step) →
 *   Specializations → Testimonials → Footer.
 *
 * Reordered 2026-09-06 on client feedback. Specializations used to sit between
 * the roster and the fork, which pushed the page's only decision point below
 * three full sections of background. Proof (logos + figures) now runs straight
 * into the fork, so a visitor reaches "which of these is me" early; the deeper
 * capability material sits after it for anyone still reading.
 */
export default function Page() {
  return (
    <main id="main-content">
      {/* Editorial-cover hero. Renders the same <SiteNavbar> every other page
          does, just started at the hero's bottom edge instead of the top
          (`startBelowHero`); its sticky containing block is this <main>, so
          it stays pinned through every section below. */}
      <HeroEditorial />
      {/* Video-transition beat: an opaque cream sheet rides up over the held
          (sticky) hero, pins, and writes the belief line in word by word. */}
      <QuoteReveal />
      {/* Opaque plane the rest of the page scrolls up on, above the hero.
          Tagged light so the navbar hit-test resolves here and never falls
          through to the still-pinned dark hero underneath; the dark sections
          nested inside (LandingPaths, SiteFooter) carry their own
          `data-navbar-theme="dark"` and win locally via `.closest()`. */}
      <div data-navbar-theme="light" className="bg-background relative z-10">
        {/* Client roster right off the hero. */}
        <LandingCompanies />
        {/* Headline figures — shares Companies' ground, one credibility block. */}
        <LandingStats />
        {/* The fork and the page's single CTA target: workshops (individuals)
            vs corporate training. #which-path — the hero bar scrolls here. */}
        <LandingPaths />
        {/* Concrete next step for anyone who picked the workshop lane. */}
        <LandingWorkshopsOpen />
        {/* The six areas every engagement is built from — depth for anyone who
            didn't convert at the fork above. */}
        <LandingSpecializations />
        <LandingTestimonials />
        <SiteFooter />
      </div>
    </main>
  )
}
