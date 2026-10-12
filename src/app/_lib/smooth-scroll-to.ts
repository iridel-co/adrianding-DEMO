/**
 * Manually-driven smooth scroll, immune to abandonment under mid-scroll
 * layout shift. Chromium's native smooth scroll (`scrollIntoView` /
 * `scrollTo({behavior:"smooth"})`) can quietly give up early — no
 * `scrollend` fires — if the page reflows while it's animating. On the
 * landing page that happens because the cursor stays put while the page
 * scrolls under it: once it crosses into the `<LandingPaths>` grid it fires
 * that card's `mouseenter`, which kicks off the hover take-over's 650ms
 * `grid-template-columns` transition, and the resulting layout shift cancels
 * the in-flight scroll (cf. tasks/lessons.md "Smooth-Scroll Anchor
 * Navigation").
 *
 * Fix: kick off a smooth `scrollTo` by hand, poll `window.scrollY` until it
 * holds steady for two ticks (or a ~2.4s ceiling), then issue a corrective
 * *instant* scroll if it landed short of the (re-measured) target — instant,
 * not "auto", since `scroll-behavior: smooth` on `<html>` would otherwise
 * turn "auto" into just another animation to abandon.
 * Visitor input cancels both the animation and correction; a newer navigation
 * also replaces the previous scroll instead of leaving competing deadlines.
 */
let cancelActiveScroll: (() => void) | undefined

export const scrollInteractionEvents = [
  "wheel",
  "touchstart",
  "pointerdown",
  "keydown",
] as const

function driveScroll(getTargetY: () => number) {
  cancelActiveScroll?.()
  // Effects can run before SSR-safe motion hooks resolve the visitor's preference.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo({ top: getTargetY(), behavior: "instant" })
    return () => {}
  }
  window.scrollTo({ top: getTargetY(), behavior: "smooth" })

  let lastY = window.scrollY
  let steady = 0
  let finished = false

  const cleanup = () => {
    window.clearInterval(interval)
    window.clearTimeout(ceiling)
    scrollInteractionEvents.forEach((type) =>
      window.removeEventListener(type, cancel)
    )
    if (cancelActiveScroll === cancel) cancelActiveScroll = undefined
  }
  const cancel = () => {
    if (finished) return
    finished = true
    cleanup()
    window.scrollTo({ top: window.scrollY, behavior: "instant" })
  }

  const finish = () => {
    if (finished) return
    finished = true
    cleanup()
    const y = getTargetY()
    if (Math.abs(window.scrollY - y) > 2) {
      window.scrollTo({ top: y, behavior: "instant" })
    }
  }

  const interval = window.setInterval(() => {
    const y = window.scrollY
    if (Math.abs(y - lastY) < 1) {
      steady += 1
      if (steady >= 2) finish()
    } else {
      steady = 0
    }
    lastY = y
  }, 120)
  const ceiling = window.setTimeout(finish, 2400)
  scrollInteractionEvents.forEach((type) =>
    window.addEventListener(type, cancel, { passive: true })
  )
  cancelActiveScroll = cancel
  return cancel
}

/** Scrolls `target` into view, honoring its own `scroll-margin-top` (e.g.
 * Tailwind's `scroll-mt-*`) — read straight off the computed style so this
 * never drifts out of sync with whatever offset the element already
 * declares for the fixed navbar. */
export function smoothScrollToElement(target: HTMLElement) {
  const marginTop = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
  return driveScroll(
    () => target.getBoundingClientRect().top + window.scrollY - marginTop
  )
}

/** Scrolls the page back to the very top. */
export function smoothScrollToTop() {
  return driveScroll(() => 0)
}
