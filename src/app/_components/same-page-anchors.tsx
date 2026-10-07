"use client"

import { useEffect } from "react"
import { smoothScrollToElement } from "@/app/_lib/smooth-scroll-to"

/** Repeated fragment links still navigate when Next considers the URL unchanged. */
export function SamePageAnchors() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      const anchor =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>("a[href]")
          : null
      if (
        !anchor ||
        anchor.download ||
        (anchor.target && anchor.target !== "_self")
      )
        return
      const url = new URL(anchor.href, window.location.href)
      if (
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname ||
        !url.hash
      )
        return
      // Programme links use a changed query to prefill the form; keep their router/event handling.
      if (
        url.search !== window.location.search &&
        !anchor.getAttribute("href")?.startsWith("#")
      )
        return
      let id: string
      try {
        id = decodeURIComponent(url.hash.slice(1))
      } catch {
        return
      }
      const target = document.getElementById(id)
      if (!target) return
      event.preventDefault()
      // A fragment-only CTA preserves a programme prefill already selected in the URL.
      const destination = anchor.getAttribute("href")?.startsWith("#")
        ? `${window.location.pathname}${window.location.search}${url.hash}`
        : `${url.pathname}${url.search}${url.hash}`
      window.history.replaceState(window.history.state, "", destination)
      smoothScrollToElement(target)
      if (id === "main-content") target.focus({ preventScroll: true })
    }
    // Capture before Next's Link suppresses clicks at an unchanged URL.
    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [])
  return null
}
