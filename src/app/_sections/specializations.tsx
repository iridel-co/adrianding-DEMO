"use client"

import { useRef } from "react"
import { useHorizontalOverflow } from "@/app/_lib/use-horizontal-overflow"
import { ScrollArrows } from "@/app/_components/scroll-arrows"
import { useReducedMotionSafe } from "@/app/_lib/use-reduced-motion-safe"
import { SplitReveal } from "@/app/_components/split-reveal"
import { Reveal } from "@/app/_components/reveal"
import { SpecRevealCards } from "@/app/_components/spec-reveal-cards"
import type { PublicProgram } from "@/lib/public-content"

export function LandingSpecializations({
  programs,
}: {
  programs: PublicProgram[]
}) {
  const CARDS = programs.map((program) => ({
    key: program.slug,
    title: program.title,
    blurb: program.summary,
    usefulFor: program.usefulFor,
    image: program.image?.url ?? null,
    imageAlt: program.image?.alt ?? "",
  }))
  const railRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotionSafe()
  const { edges } = useHorizontalOverflow(railRef, {
    resetKey: CARDS.map((card) => card.key).join("|"),
  })

  const move = (direction: number) => {
    const rail = railRef.current
    if (!(rail instanceof HTMLElement)) return
    const card = rail.firstElementChild
    if (!(card instanceof HTMLElement)) return
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0
    rail.scrollBy({
      left: direction * (card.offsetWidth + gap),
      behavior: reduced ? "instant" : "smooth",
    })
  }

  return (
    <section className="bg-muted/40 py-24 lg:py-36">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        <div>
          {/* Full-width introduction keeps the heading readable above cards. */}
          <div>
            <SplitReveal className="font-serif text-[2.75rem] leading-[1.05] tracking-[-0.02em] lg:text-[3.75rem]">
              In-house programs,
              <br />
              <span className="text-brand">two decades</span> deep
            </SplitReveal>
            <p className="text-muted-foreground mt-6 max-w-3xl text-lg leading-relaxed">
              Coach Adrian&rsquo;s corporate training programmes, run in-house
              for companies and their teams — at your office or offsite, and
              shaped around your people and goals.
              <span className="hidden lg:pointer-fine:inline">
                {" "}
                Hover one to see who it&rsquo;s for.
              </span>
            </p>
          </div>

          {/* Right — the ten reveal cards. A horizontal snap rail below `lg`
              (six stacked cards ran ~2 phone screens on their own), the
              vertical expand-on-hover stack from `lg` up. `-mx-6`/`px-6`
              lets the rail bleed to the viewport edges while its first card
              still lines up with the section gutter. */}
          <div className="min-w-0">
            <Reveal
              ref={railRef}
              stagger={0.08}
              className="no-scrollbar -mx-6 mt-12 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 pb-1 sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:snap-none lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
            >
              <SpecRevealCards items={CARDS} />
            </Reveal>
            <div className="mt-5 flex items-center justify-end gap-3 lg:hidden">
              <span className="text-muted-foreground mr-auto text-sm">
                More programs
              </span>
              <ScrollArrows
                className="flex"
                edges={edges}
                onNudge={move}
                previousLabel="Previous programs"
                nextLabel="Next programs"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
