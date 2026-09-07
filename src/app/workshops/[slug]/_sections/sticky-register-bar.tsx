"use client"

import { useEffect, useState } from "react"
import { CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Workshop } from "@/lib/workshops"
import { RegistrationDialog } from "./registration-dialog"

/**
 * Bottom-fixed registration bar — the conversion device on this page, and the
 * only CTA that is always reachable on a phone.
 *
 * It appears once the visitor has scrolled past roughly the first screen, so it
 * never competes with the hero's own register button. A scroll threshold rather
 * than a sentinel because the hero lives in `overview.tsx`, which this file does
 * not own; the check is rAF-gated and the listener is passive, so it costs one
 * `scrollY` read per frame at most (lessons 2026-07-29).
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
      const footerVisible = footerTop < window.innerHeight
      setShown(window.scrollY > window.innerHeight * 0.6 && !footerVisible)
    }
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  const soldOut = workshop.seatsLeft <= 0
  const seatsLine = soldOut
    ? "Fully booked — join the waitlist"
    : `${workshop.seatsLeft} of ${workshop.seatsTotal} seats left`

  return (
    <div
      aria-hidden={!shown}
      className={`bg-background border-border/70 fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_28px_-12px_rgba(0,0,0,0.28)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
        shown ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-3.5 sm:px-8">
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
            soldOut ? "text-muted-foreground" : "text-brand font-medium"
          }`}
        >
          {seatsLine}
        </p>

        <RegistrationDialog
          slug={workshop.slug}
          workshopTitle={workshop.title}
          schedule={workshop.schedule}
          venue={`${workshop.venue}, ${workshop.city}`}
        >
          <Button variant="brand" size="lg" tabIndex={shown ? undefined : -1}>
            {soldOut ? "Join waitlist" : "Register"}
          </Button>
        </RegistrationDialog>
      </div>
    </div>
  )
}
