"use client"

import { WorkshopAvailabilityText } from "@/app/_components/workshop-availability-text"

import { useEffect, useState } from "react"
import { CalendarDays } from "lucide-react"
import { getWorkshopAvailability } from "@/lib/workshop-availability"
import type { Workshop } from "@/lib/workshops"
import { RegistrationDialog } from "./registration-dialog"

/**
 * Bottom-fixed registration bar — the conversion device on this page, and the
 * only CTA that is always reachable on a phone.
 *
 * It appears only after the complete overview registration card passes above
 * the viewport, and hides again when the visitor returns to that card.
 *
 * It also hides itself the moment the (single, page-unique) `<footer>` enters
 * the viewport. Padding the page to clear a fixed bar landed a dead gap under
 * the footer's decorative wordmark (lessons 2026-09-07); sliding the bar away
 * before it ever reaches the black footer avoids a light bar cutting across it
 * without needing any spacer at all.
 */
export function StickyRegisterBar({ workshop }: { workshop: Workshop }) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const footerTop =
        document.querySelector("footer")?.getBoundingClientRect().top ??
        Infinity
      const closingTop =
        document
          .getElementById("workshop-register-cta")
          ?.getBoundingClientRect().top ?? Infinity
      const footerVisible = Math.min(footerTop, closingTop) < window.innerHeight
      const card = document.getElementById("workshop-registration-card")
      const cardPassed =
        card !== null &&
        card.getClientRects().length > 0 &&
        card.getBoundingClientRect().bottom <= 0
      setShown(cardPassed && !footerVisible)
    }
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(read)
    }
    read()
    const observer = new ResizeObserver(onScroll)
    const main = document.querySelector("main")
    if (main) observer.observe(main)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      observer.disconnect()
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [workshop.slug])

  const availability = getWorkshopAvailability(workshop)
  const soldOut = !availability.canRegister

  return (
    <div
      aria-hidden={!shown}
      inert={!shown}
      className={`bg-background border-border/70 fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_28px_-12px_rgba(0,0,0,0.28)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
        shown ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-6 py-3.5 sm:px-8">
        <div className="hidden min-w-0 flex-1 sm:block">
          <p className="truncate text-sm font-semibold tracking-[-0.01em]">
            {workshop.title}
          </p>
          <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 truncate text-xs">
            <CalendarDays className="size-3.5 shrink-0" />
            {workshop.schedule}
          </p>
        </div>

        <p
          className={`flex-1 text-sm sm:flex-none sm:text-right ${
            soldOut ? "text-muted-foreground" : "text-foreground/80"
          }`}
        >
          <WorkshopAvailabilityText workshop={workshop} />
        </p>

        <RegistrationDialog
          workshop={workshop}
          triggerLabel="Register"
          className="max-w-full whitespace-normal"
          tabIndex={shown ? undefined : -1}
        />
      </div>
    </div>
  )
}
