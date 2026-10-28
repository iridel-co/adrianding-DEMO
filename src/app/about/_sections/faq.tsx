"use client"

import { useState } from "react"
import { useIsTouch } from "@/app/_lib/use-is-touch"
import { Reveal } from "@/app/_components/reveal"
import { SplitReveal } from "@/app/_components/split-reveal"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQS = [
  {
    q: "What size groups does Adrian train?",
    a: "From intact teams of 10-15 to full-company sessions of 200+. The format adapts — smaller groups run more interactive breakouts, larger ones lean on keynote plus workshop stations.",
  },
  {
    q: "Do you run public workshops or only in-house?",
    a: "Both. Public workshops are open-enrollment and listed on the site as they're scheduled. In-house sessions are built around your team's specific goals and delivered on-site or virtually.",
  },
  {
    q: "How far in advance should we book?",
    a: "6-8 weeks is ideal for in-house engagements — it gives time for a discovery call, content customization, and scheduling. Public workshops can be booked as soon as a date is announced.",
  },
  {
    q: "Can sessions be delivered virtually?",
    a: "Yes. Virtual and hybrid formats are available for both public and in-house sessions, with the same interactive exercises adapted for a remote setting.",
  },
  {
    q: "What industries has Adrian worked with?",
    a: "A wide range — from manufacturing and BPO to healthcare and financial services. The core leadership and communication frameworks translate across industries; examples and case studies are tailored to yours.",
  },
]

/**
 * About — FAQ accordion, same hairline-divided editorial treatment as
 * certifications: border-t/divide-y list, no cards. Controlled so hovering
 * a question opens it, on top of the normal click-to-toggle.
 */
export function AboutFaq() {
  const [openValue, setOpenValue] = useState<string | undefined>(undefined)
  const touch = useIsTouch()

  return (
    <section className="border-border/60 mx-auto max-w-7xl border-t px-6 py-24 sm:px-8 lg:py-36">
      <SplitReveal className="font-serif text-[2.75rem] leading-[1.05] tracking-[-0.02em] lg:text-[3.75rem]">
        Frequently asked questions
      </SplitReveal>

      <Reveal className="mt-16 max-w-3xl">
        <Accordion
          type="single"
          collapsible
          value={openValue}
          onValueChange={setOpenValue}
          className="w-full"
        >
          {FAQS.map((item, i) => {
            const value = `item-${i}`
            return (
              <AccordionItem
                key={item.q}
                value={value}
                className="border-border/60"
                // Hover-to-open is mouse-only: on touch a tap fires
                // `mouseenter` too, which raced the trigger's own toggle and
                // made a question that was already open close again.
                onMouseEnter={touch ? undefined : () => setOpenValue(value)}
              >
                <AccordionTrigger className="text-lg tracking-[-0.01em] sm:text-xl">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed sm:max-w-2xl">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </Reveal>
    </section>
  )
}
