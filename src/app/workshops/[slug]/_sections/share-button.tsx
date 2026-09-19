"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Link2 } from "lucide-react"

/**
 * Copies this course's URL to the clipboard.
 *
 * Sits in the hero chip row because sharing is a decision a visitor makes while
 * reading the title and date, not after they have finished the page — the
 * client's own traffic arrives by forwarded link, so the page has to make
 * forwarding a one-tap action.
 *
 * The URL is rebuilt from `origin + pathname` rather than taken from
 * `location.href`: the demo carries a switcher and ad traffic arrives with
 * tracking params, and neither belongs in a link someone pastes into a group
 * chat.
 *
 * `navigator.clipboard` needs a secure context, so it is absent on a plain-http
 * preview and in some in-app browsers. The `execCommand` path is the fallback
 * for exactly those, and the button reports failure rather than lying about a
 * copy that did not happen.
 */
export function ShareButton() {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle")
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    const url = window.location.origin + window.location.pathname
    let ok = false

    try {
      await navigator.clipboard.writeText(url)
      ok = true
    } catch {
      // Insecure context or a browser that blocks the async API — fall back to
      // the old selection trick, which needs a node in the document.
      try {
        const field = document.createElement("textarea")
        field.value = url
        field.setAttribute("readonly", "")
        field.style.position = "fixed"
        field.style.opacity = "0"
        document.body.appendChild(field)
        field.select()
        ok = document.execCommand("copy")
        document.body.removeChild(field)
      } catch {
        ok = false
      }
    }

    setState(ok ? "copied" : "failed")
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState("idle"), 2400)
  }

  // "Copied to clipboard", not "Copied" — the visitor has to be told WHERE the
  // link went, or the button reads as having done nothing they can act on.
  const label =
    state === "copied"
      ? "Copied to clipboard"
      : state === "failed"
        ? "Couldn’t copy"
        : "Share"

  return (
    <button
      type="button"
      onClick={copy}
      // The visible label already changes, but it changes in place — a screen
      // reader needs to be told, and the button's own name is not announced
      // again just because its text was replaced.
      aria-live="polite"
      className="focus-visible:ring-brand inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 ring-1 ring-white/15 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50 focus-visible:outline-none"
    >
      {state === "copied" ? (
        <Check className="size-3.5 shrink-0" />
      ) : (
        <Link2 className="size-3.5 shrink-0" />
      )}
      {label}
    </button>
  )
}
