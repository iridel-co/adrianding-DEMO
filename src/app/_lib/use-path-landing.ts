"use client"

import { useEffect, type RefObject } from "react"
import {
  smoothScrollToElement,
  scrollInteractionEvents,
} from "./smooth-scroll-to"

/** Home's delayed fragment correction yields immediately to visitor input. */
export function usePathLanding(gridRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (window.location.hash !== "#which-path") return
    let cancelLanding: (() => void) | undefined
    const cancel = () => {
      window.clearTimeout(timer)
      cancelLanding?.()
    }
    const timer = window.setTimeout(() => {
      const section = gridRef.current?.closest<HTMLElement>("section")
      if (section) cancelLanding = smoothScrollToElement(section)
    }, 400)
    scrollInteractionEvents.forEach((type) =>
      window.addEventListener(type, cancel, { passive: true })
    )
    return () => {
      cancel()
      scrollInteractionEvents.forEach((type) =>
        window.removeEventListener(type, cancel)
      )
    }
  }, [gridRef])
}
