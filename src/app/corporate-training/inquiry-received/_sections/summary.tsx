"use client"

import { useEffect, useState } from "react"
import { Building2, CalendarDays, Layers, MapPin, Users } from "lucide-react"
import { Reveal } from "@/app/_components/reveal"
import { SplitReveal } from "@/app/_components/split-reveal"
import { readReceipt, type CorporateReceipt } from "@/app/_lib/handoff"

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
  const [handoff, setHandoff] = useState<CorporateReceipt | null>(null)

  useEffect(() => {
    setHandoff(readReceipt("corporate"))
  }, [])

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <SplitReveal className="max-w-2xl font-serif text-[2rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.5rem] lg:text-[3rem]">
          {handoff ? "What you sent us" : "What an inquiry captures"}
        </SplitReveal>
        <p className="text-muted-foreground mt-5 max-w-2xl leading-relaxed">
          {handoff
            ? "These are the details saved with your accepted inquiry. Contact the team if anything needs correcting."
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
              <div
                key={field.key}
                className="bg-muted/50 min-w-0 rounded-lg p-6 [overflow-wrap:anywhere]"
              >
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
          {/* Only renders when the visitor ticked at least one extra programme
              — with no handoff or an empty list, the "four things we ask for"
              copy above stays true. */}
          {handoff?.alsoInterested?.length ? (
            <div className="bg-muted/50 min-w-0 rounded-lg p-6 [overflow-wrap:anywhere] sm:col-span-2">
              <dl>
                <dt className="text-muted-foreground flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase">
                  <Layers className="size-3.5" /> Also interested in
                </dt>
                <dd className="text-foreground mt-2 text-lg font-medium">
                  {handoff.alsoInterested.join(", ")}
                </dd>
              </dl>
            </div>
          ) : null}
        </Reveal>
      </div>
    </section>
  )
}
