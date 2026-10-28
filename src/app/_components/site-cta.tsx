"use client"

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PublicProgram } from "@/lib/public-content"
import { BloomFieldBackground } from "./bloom-field-background"

type SiteCtaProps = {
  programs?: Pick<PublicProgram, "slug" | "title">[]
  heading?: string
  subtext?: string
  /** Primary button — defaults to the workshop-forward copy used
   *  everywhere else this section appears. */
  primaryLabel?: string
  primaryHref?: string
  secondaryLabel?: string
  secondaryHref?: string
}

/**
 * Two stacked copies of the same list, shifted by exactly one copy's height
 * via the `.cta-marquee-track` keyframe defined inline below (kept local to
 * this component rather than globals.css) — the standard seamless-loop
 * trick. The two track elements must sit flush against each other (no gap
 * on their shared parent) or the loop shows a visible seam once a lap
 * completes — item spacing lives inside each track instead (`gap-3` +
 * matching `pb-3` so the last item of one copy and the first item of the
 * next are spaced the same as every other pair). The animation only exists
 * under `prefers-reduced-motion: no-preference`.
 */
function VerticalMarqueeTrack({ children }: { children: ReactNode }) {
  return (
    <div className="cta-marquee-track flex shrink-0 flex-col gap-3 pb-3 xl:gap-4 xl:pb-4">
      {children}
    </div>
  )
}

/**
 * Right-column focus-area marquee — modeled on the reference
 * `cta-with-text-marquee` component: two stacked copies of the list loop
 * vertically, and items fade toward the panel edges (opacity driven by each
 * item's distance from the panel's vertical center, recomputed every frame)
 * so the centered item always reads as the focused one.
 */
function FocusAreaMarquee({
  programs,
}: {
  programs: Pick<PublicProgram, "slug" | "title">[]
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let raf = 0
    const updateOpacity = () => {
      const items = panel.querySelectorAll<HTMLElement>(".cta-marquee-item")
      const panelRect = panel.getBoundingClientRect()
      const centerY = panelRect.top + panelRect.height / 2

      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect()
        const itemCenterY = itemRect.top + itemRect.height / 2
        const distance = Math.abs(centerY - itemCenterY)
        const maxDistance = panelRect.height / 2
        const normalized = Math.min(distance / maxDistance, 1)
        item.style.opacity = String(1 - normalized * 0.75)
      })

      raf = requestAnimationFrame(updateOpacity)
    }

    raf = requestAnimationFrame(updateOpacity)
    return () => cancelAnimationFrame(raf)
  }, [])

  const list = (
    <>
      {programs.map((program) => (
        <div
          key={program.slug}
          className="cta-marquee-item shrink-0 text-2xl font-semibold tracking-[0.06em] uppercase lg:text-3xl xl:text-4xl"
        >
          {program.title}
        </div>
      ))}
    </>
  )

  return (
    <div
      ref={panelRef}
      className="relative hidden h-96 overflow-hidden lg:flex xl:h-112"
    >
      {/* Scoped here rather than globals.css — the keyframe only exists
          because this component uses it. Animation itself lives inside the
          reduced-motion media query so it's simply absent (not overridden)
          for users who asked for no motion. */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes cta-marquee-vertical {
            from { transform: translateY(0); }
            to { transform: translateY(-100%); }
          }
          .cta-marquee-track {
            animation: cta-marquee-vertical 34s linear infinite;
          }
        }
      `}</style>
      {/* The two tracks sit flush (no gap on this wrapper) — see
          `VerticalMarqueeTrack` for why. */}
      <div className="flex w-full flex-col">
        <VerticalMarqueeTrack>{list}</VerticalMarqueeTrack>
        <VerticalMarqueeTrack>{list}</VerticalMarqueeTrack>
      </div>
    </div>
  )
}

/**
 * Shared closing call-to-action — full-bleed maroon, dual path, workshop-forward
 * (the workshop button is the primary action everywhere). Closes every inner
 * route (the landing page has its own CTA fork, `LandingPaths`).
 *
 * Right column follows the reference `cta-with-text-marquee` component: a
 * vertical marquee of the six things Adrian focuses on, center-weighted by
 * opacity. The panel is sized on its own terms (`h-96`/`xl:h-112`) rather
 * than `min-h-screen` — big enough to read as the section's second act, not
 * the whole viewport — and `items-center` on the grid lets the left column
 * sit centered beside it instead of forcing the section shorter.
 */
export function SiteCta({
  programs = [
    "Leadership",
    "Keynotes",
    "Winning Culture",
    "Communication",
    "Train the Trainer",
    "Personal Branding",
  ].map((title) => ({ slug: title, title })),
  heading = "Ready to build a winning culture?",
  subtext = "Start with a workshop, or bring Adrian in to train your whole team.",
  primaryLabel = "Register for a workshop",
  primaryHref = "/workshops",
  secondaryLabel = "Inquire for corporate training",
  secondaryHref = "/corporate-training#inquiry",
}: SiteCtaProps) {
  const pathname = usePathname()

  // If the primary link points at the page we're already on, Next.js only
  // scrolls on a route change, so a same-route click would otherwise do
  // nothing. Scroll to top by hand instead.
  const handlePrimaryClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (pathname === primaryHref) {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <section className="text-brand-foreground relative overflow-hidden">
      <BloomFieldBackground />
      {/* Mobile-only decorative dot grid, standing in for the marquee panel
          that's hidden below `lg`. Static (no motion) — see FocusAreaMarquee
          for the desktop equivalent. Radial mask fades it toward the edges
          so it reads as texture behind the copy, not a hard-edged tile. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,black,transparent_75%)] opacity-[0.14] lg:hidden"
        style={{
          color: "var(--brand-foreground)",
          backgroundImage:
            "radial-gradient(currentColor 1.5px, transparent 1.5px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-28 xl:gap-40">
          <div className="text-center lg:text-left">
            <h2 className="mx-auto max-w-3xl font-serif text-[2.75rem] leading-[1.03] tracking-[-0.02em] max-lg:text-balance lg:mx-0 lg:text-[4rem] lg:text-wrap">
              {heading}
            </h2>
            <p className="text-brand-foreground/80 mx-auto mt-6 max-w-xl text-lg leading-relaxed lg:mx-0 lg:text-xl">
              {subtext}
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:items-stretch lg:justify-start">
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="h-12 px-8"
              >
                <Link href={primaryHref} onClick={handlePrimaryClick}>
                  {primaryLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-brand-foreground/40 text-brand-foreground hover:bg-brand-foreground/10 hover:text-brand-foreground h-12 bg-transparent px-8"
              >
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </Button>
            </div>
          </div>

          <FocusAreaMarquee programs={programs} />
        </div>
      </div>
    </section>
  )
}
