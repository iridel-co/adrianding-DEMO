"use client"
import { useEffect } from "react"
import {
  smoothScrollToElement,
  scrollInteractionEvents,
} from "@/app/_lib/smooth-scroll-to"
/** Wait for page load and fonts before correcting the initial inquiry hash landing. */
export function useInquiryLanding() {
  useEffect(() => {
    if (window.location.hash !== "#inquiry") return

    let interacted = false
    let cancelLanding: (() => void) | undefined
    const markInteracted = () => {
      interacted = true
      cancelLanding?.()
      cancelLanding = undefined
    }
    scrollInteractionEvents.forEach((type) =>
      window.addEventListener(type, markInteracted, { passive: true })
    )

    let settled = false
    let frame = 0
    const land = () => {
      if (settled || interacted) return
      settled = true
      const target = document.getElementById("inquiry")
      if (!target) return
      cancelLanding = smoothScrollToElement(target)
    }
    const queueLand = () => {
      if (settled || interacted) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(land)
    }

    let fontsReady = !document.fonts
    let pageLoaded = document.readyState === "complete"
    const tryLand = () => {
      if (settled || interacted) return
      if (fontsReady && pageLoaded) queueLand()
    }
    document.fonts?.ready.then(() => {
      fontsReady = true
      tryLand()
    })
    const onLoad = () => {
      pageLoaded = true
      tryLand()
    }
    if (pageLoaded) tryLand()
    else window.addEventListener("load", onLoad)

    // Catch-all for late shifts the two signals above miss (lazy sections
    // expanding, a marquee measuring itself) — same reasoning as
    // `ScrollRefresh`.
    const ro = new ResizeObserver(tryLand)
    ro.observe(document.body)

    return () => {
      interacted = true
      cancelAnimationFrame(frame)
      cancelLanding?.()
      window.removeEventListener("load", onLoad)
      scrollInteractionEvents.forEach((type) =>
        window.removeEventListener(type, markInteracted)
      )
      ro.disconnect()
    }
  }, [])
}
