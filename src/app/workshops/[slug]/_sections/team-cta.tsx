import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Reveal } from "@/app/_components/reveal"

/**
 * The corporate off-ramp, on the page paid traffic lands on.
 *
 * Client's third priority: after the course and after his profile, "train your
 * team" follows. Placement is the whole point — this sits AFTER the register
 * CTA, never before it. A private-workshop pitch above the register button on a
 * page an ad paid to fill would cannibalise the exact conversion that ad bought.
 *
 * Deliberately quiet: no brand ground, no `variant="brand"`. It is an exit for
 * the minority who arrived as a decision-maker rather than a seat-buyer, and it
 * has to stay visibly subordinate to the seat above it.
 */
export function TeamCta() {
  return (
    <section className="bg-background py-14 lg:py-20">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <Reveal className="border-border/60 flex flex-col gap-6 border-t pt-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
              Sending more than one person?
            </p>
            <h2 className="mt-3 font-serif text-[1.75rem] leading-[1.12] tracking-[-0.02em] sm:text-[2.125rem]">
              Run this for your own team instead
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Every public workshop also runs in-house — rebuilt around your
              industry, your numbers and your people, on your date and at your
              venue.
            </p>
          </div>

          <Link
            href="/corporate-training#inquiry"
            className="text-foreground ring-border/70 hover:ring-brand/60 hover:text-brand focus-visible:ring-brand group inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-full px-5 text-sm font-medium ring-1 transition-[color,box-shadow] focus-visible:ring-2 focus-visible:outline-none"
          >
            Explore corporate training
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
