"use client"

import { useState } from "react"
import type { PublicFaq } from "@/lib/public-content"
import { useIsTouch } from "@/app/_lib/use-is-touch"
import { Reveal } from "@/app/_components/reveal"
import { SplitReveal } from "@/app/_components/split-reveal"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

/**
 * About — FAQ accordion, same hairline-divided editorial treatment as
 * certifications: border-t/divide-y list, no cards. Controlled so hovering
 * a question opens it, on top of the normal click-to-toggle.
 */
export function AboutFaq({ faqs }: { faqs: PublicFaq[] }) {
  const [openValue, setOpenValue] = useState<string | undefined>(undefined)
  const touch = useIsTouch()

  if (!faqs.length) return null

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
          {faqs.map((item, i) => {
            const value = `item-${i}`

            return (
              <AccordionItem
                key={item.id}
                value={value}
                className="border-border/60"
                // Hover-to-open is mouse-only: on touch a tap fires
                // `mouseenter` too, which raced the trigger's own toggle and
                // made a question that was already open close again.
                onMouseEnter={touch ? undefined : () => setOpenValue(value)}
              >
                <AccordionTrigger className="text-lg tracking-[-0.01em] sm:text-xl">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed sm:max-w-2xl">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </Reveal>
    </section>
  )
}
