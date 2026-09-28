"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "adrianding-fonts"

type Mode = "current" | "alt"

const OPTIONS: { mode: Mode; label: string; caption: string }[] = [
  {
    mode: "current",
    label: "Current fonts",
    caption: "The Seasons",
  },
  {
    mode: "alt",
    label: "Free alternative",
    caption: "Prata",
  },
]

/**
 * Client-review-only font toggle — swaps the site's display serif (The
 * Seasons -> Prata) so Adrian can compare the paid font against a free-license
 * alternative before licensing one for handoff. Body font (Red Hat Display)
 * and the accent serif (Abramo) are unaffected; the generated OG cards
 * (`opengraph-image.tsx`) always render with The Seasons regardless of this
 * toggle, since they're built at request/build time, not from client state.
 *
 * Sets `data-fonts="alt"|"current"` on <html> and reloads rather than
 * flipping the attribute live. That's deliberate: dozens of headings below
 * the fold split into GSAP SplitText line/word spans sized against whichever
 * font is active at mount, and the roles marquee in this same hero measures
 * its track width the same way — a live attribute flip would leave those
 * already-split elements wrapped for the old font's metrics. A reload re-runs
 * that measurement against the new font with nothing stale. The saved choice
 * is applied before first paint by the inline script in `layout.tsx`, so the
 * reload never flashes back to the default font.
 *
 * Remove: this file, its import + render in hero-editorial.tsx, the Prata
 * load + variable class + inline script in layout.tsx, and the
 * `[data-fonts="alt"]` block in globals.css.
 */
export function FontSwitch() {
  const [mode, setMode] = useState<Mode>("current")

  // Read the live attribute (already applied pre-paint by the inline script
  // in layout.tsx) after mount, so SSR and the client agree without needing
  // to thread the choice through props.
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-fonts")
    setMode(current === "alt" ? "alt" : "current")
  }, [])

  function choose(next: Mode) {
    if (next === mode) return
    document.documentElement.setAttribute("data-fonts", next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private browsing / storage disabled — the toggle still applies for
      // this load, it just won't persist across a fresh visit.
    }
    window.location.reload()
  }

  const active = OPTIONS.find((option) => option.mode === mode) ?? OPTIONS[0]

  return (
    // Anchored with an extra `var(--nav-h)` on top of the usual corner inset:
    // <SiteNavbar> sits in normal flow before this hero, so the hero's own
    // `min-h-[100svh]` box starts one navbar-height below the viewport top —
    // a plain `bottom-4` would land in the ~64px strip of the hero's box
    // that's below the fold on initial load, defeating "always visible".
    <div className="he-line pointer-events-auto absolute bottom-[calc(var(--nav-h)+1rem)] left-4 z-40 flex flex-col items-start gap-1.5 sm:bottom-[calc(var(--nav-h)+1.5rem)] sm:left-6">
      <div
        role="radiogroup"
        aria-label="Typeface set"
        className="flex rounded-full border border-white/15 bg-black/55 p-1 backdrop-blur-md"
      >
        {OPTIONS.map((option) => {
          const checked = option.mode === mode
          return (
            <button
              key={option.mode}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => choose(option.mode)}
              className={cn(
                "focus-visible:ring-brand-accent min-h-11 rounded-full px-3.5 text-[0.7rem] font-semibold tracking-[0.02em] whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none sm:px-4 sm:text-xs",
                checked
                  ? "bg-white text-[#141414]"
                  : "text-white/70 hover:text-white"
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      <span className="text-[0.65rem] text-white/60 [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">
        {active.caption}
      </span>
    </div>
  )
}
