"use client"

import { useEffect, useState } from "react"
import { Building2, CalendarDays, MapPin, Users } from "lucide-react"
import { Reveal } from "@/app/_components/reveal"
import { SplitReveal } from "@/app/_components/split-reveal"
import { readHandoff, type CorporateHandoff } from "@/app/_lib/handoff"

/**
 * Plays the submitted inquiry back. A corporate sender fires off a form and
 * immediately wonders whether the date and headcount landed — showing them
 * verbatim removes the doubt, and gives them the exact wording to correct if
 * anything is wrong.
 *
 * On a direct visit (no handoff, e.g. the link was shared or the tab is new)
 * the same block explains what an inquiry captures instead of collapsing to
 * nothing — the page must never look broken or half-built.
 */

const FIELDS = [
  {
    key: "program" as const,
    icon: Building2,
    label: "Programme",
    fallback: "The programme closest to what the team needs",
  },
  {
    key: "attendees" as const,
    icon: Users,
    label: "Attendees",
    fallback: "How many people would be in the room",
  },
  {
    key: "targetDate" as const,
    icon: CalendarDays,
    label: "Possible date",
    fallback: "The month or week you're aiming for",
  },
  {
    key: "venue" as const,
    icon: MapPin,
    label: "Possible venue",
    fallback: "Your office, a hotel, or somewhere we help you source",
  },
]

export function InquirySummary() {
  const [handoff, setHandoff] = useState<CorporateHandoff | null>(null)

  useEffect(() => {
    setHandoff(readHandoff("corporate"))
  }, [])

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <SplitReveal className="max-w-2xl font-serif text-[2rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.5rem] lg:text-[3rem]">
          {handoff ? "What you sent us" : "What an inquiry captures"}
        </SplitReveal>
        <p className="text-muted-foreground mt-5 max-w-2xl leading-relaxed">
          {handoff
            ? "This is what came through. If anything needs correcting, reply to the email confirmation or call us — nothing is locked in yet."
            : "These are the four things we ask for up front. They are enough to prepare properly for the call, and none of them are commitments."}
        </p>

        <Reveal
          stagger={0.07}
          className="mt-12 grid gap-8 sm:grid-cols-2 lg:mt-16 lg:gap-10"
        >
          {FIELDS.map((field) => {
            const value = handoff?.[field.key]?.trim()
            const Icon = field.icon
            return (
              <div key={field.key} className="bg-muted/50 rounded-lg p-6">
                <dl>
                  <dt className="text-muted-foreground flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase">
                    <Icon className="size-3.5" />
                    {field.label}
                  </dt>
                  <dd
                    className={
                      value
                        ? "text-foreground mt-2 text-lg font-medium"
                        : "text-muted-foreground mt-2 text-lg"
                    }
                  >
                    {value || field.fallback}
                  </dd>
                </dl>
              </div>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
