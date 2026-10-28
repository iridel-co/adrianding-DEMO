"use client"

import { useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Reveal } from "@/app/_components/reveal"
import { useIsTouch } from "@/app/_lib/use-is-touch"
import { WORKSHOP_FAQ } from "@/lib/workshop-faq"

/**
 * Objection handling, immediately before the registration CTA.
 *
 * Every entry answers a reason someone stops short of the form — is my money
 * safe, what if the date moves, can my employer pay. It sits here rather than
 * on a separate policy page because a visitor from an ad will not go looking
 * for one; they will just close the tab.
 *
 * Opens on hover on desktop: with eight objections, making someone click each
 * one to find the one that applies to them is friction on the page whose whole
 * job is removing it. The accordion is therefore *controlled* —
 * `onMouseEnter` sets the open item, and Radix's own `onValueChange` still
 * handles click and keyboard, so both drive the same single piece of state and
 * cannot fight each other.
 *
 * Hover never closes an item (no `onMouseLeave` reset): sweeping the pointer
 * across on the way somewhere else would otherwise flicker the whole list, and
 * an answer that vanishes while you are reading it is worse than one that
 * stays. Moving to another question replaces it, which is the behaviour that
 * reads as intended.
 *
 * `useIsTouch()` is mount-gated and only ever swaps *handlers*, never rendered
 * markup, so there is no SSR/hydration divergence. On touch no hover handler is
 * attached at all — a tap synthesises `mouseenter`, which would race the
 * trigger's own toggle and leave the item stuck (lessons 2026-09-03).
 */
export function WorkshopFaq() {
  const touch = useIsTouch()
  const [open, setOpen] = useState<string>("")

  return (
    <section className="bg-muted/40 py-16 lg:py-24">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 sm:px-8 lg:grid-cols-[0.6fr_minmax(0,1fr)] lg:gap-16">
        <Reveal className="lg:sticky lg:top-[calc(var(--nav-h)+3rem)] lg:self-start">
          <h2 className="font-serif text-[2rem] leading-[1.08] tracking-[-0.02em] sm:text-[2.5rem]">
            Before you register
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            The things people ask us on the phone, answered here so you can
            decide without waiting on a reply. Anything else — call or text, a
            real person picks up.
          </p>
        </Reveal>

        <Reveal>
          <Accordion
            type="single"
            collapsible
            value={open}
            onValueChange={setOpen}
            className="w-full"
          >
            {WORKSHOP_FAQ.map((item, i) => {
              const value = `faq-${i}`
              return (
                <AccordionItem
                  key={item.q}
                  value={value}
                  className="border-border/70"
                  onMouseEnter={touch ? undefined : () => setOpen(value)}
                >
                  <AccordionTrigger className="text-[1.0625rem]">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="max-w-prose text-[0.9375rem] leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </Reveal>
      </div>
    </section>
  )
}
