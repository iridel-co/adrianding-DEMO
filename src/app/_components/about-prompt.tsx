"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, X } from "lucide-react"

/**
 * "Know more about Coach Adrian" — the credibility exit from the two pages that
 * paid traffic actually lands on (workshop detail, corporate training).
 *
 * Client asked for a maroon/white pop-up that fires "as they near the thought of
 * wondering who I am". Three presentations are built, switchable live from
 * <AboutPromptSwitcher /> so the difference can be shown in a meeting:
 *
 *   inline — the button alone, sitting in the section that already tells his
 *            story. Nothing floats, nothing interrupts.
 *   card   — inline, plus a dismissible maroon card that slides in bottom-LEFT
 *            once that section has been read. Runs on phones too: it clears the
 *            sticky register bar by sitting above it rather than by hiding, so
 *            the only always-reachable CTA on the page is never covered.
 *   modal  — inline, plus a centred maroon dialog on the same trigger. The
 *            client's literal request. Deliberately NOT suppressed on mobile,
 *            because seeing it land on top of the register bar is the argument.
 *
 * The trigger is the anchor element scrolling out of view upward — by then the
 * visitor has read the credibility block and the prompt is an invitation to go
 * deeper rather than an interruption of a question nobody asked yet.
 *
 * DEMO SCAFFOLD: <AboutPromptSwitcher /> and the variant plumbing come out when
 * the client picks one. The chosen presentation stays.
 */

export type AboutPromptVariant = "inline" | "card" | "modal"

const VARIANTS: { id: AboutPromptVariant; label: string; note: string }[] = [
  {
    id: "inline",
    label: "Inline only",
    note: "Button in the section. Nothing floats.",
  },
  {
    id: "card",
    label: "Slide-in card",
    note: "Quiet card, bottom-left, above the register bar.",
  },
  { id: "modal", label: "Pop-up", note: "Centred dialog over the page." },
]

const STORAGE_KEY = "ad-about-prompt-variant"
const EVENT = "ad-about-prompt-change"
const DEFAULT_VARIANT: AboutPromptVariant = "card"

function readVariant(): AboutPromptVariant {
  if (typeof window === "undefined") return DEFAULT_VARIANT
  try {
    const v = window.sessionStorage.getItem(STORAGE_KEY)
    if (v === "inline" || v === "card" || v === "modal") return v
  } catch {
    /* private mode — fall through to the default */
  }
  return DEFAULT_VARIANT
}

/**
 * Shared variant state. sessionStorage rather than context so the choice
 * survives navigating between course pages mid-demo; a window event keeps the
 * switcher and the overlay in step within a single page.
 */
function useVariant(): [AboutPromptVariant, (v: AboutPromptVariant) => void] {
  // Server and first client render must agree, so start on the default and
  // adopt the stored value in an effect.
  const [variant, setVariant] = useState<AboutPromptVariant>(DEFAULT_VARIANT)

  useEffect(() => {
    setVariant(readVariant())
    const sync = () => setVariant(readVariant())
    window.addEventListener(EVENT, sync)
    return () => window.removeEventListener(EVENT, sync)
  }, [])

  const set = useCallback((v: AboutPromptVariant) => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, v)
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(EVENT))
  }, [])

  return [variant, set]
}

/* -------------------------------------------------------------------------- */

/**
 * The button itself, and the scroll sentinel the floating variants key off.
 * Goes at the end of whichever section already carries his portrait and story —
 * one per page, never two, and never `variant="brand"`, so it can't compete
 * with Register / Send inquiry.
 */
export function AboutPromptAnchor({ className = "" }: { className?: string }) {
  return (
    <div data-about-prompt-anchor className={className}>
      <Link
        href="/about"
        className="bg-brand text-brand-foreground hover:bg-brand-accent focus-visible:ring-brand focus-visible:ring-offset-background group inline-flex min-h-11 items-center gap-2.5 rounded-full px-5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Know more about Coach Adrian
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </Link>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

/** Mount once per page, after the last section. Renders nothing for `inline`. */
export function AboutPromptOverlay() {
  const [variant] = useVariant()
  const [armed, setArmed] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Fire once the anchor's section has been scrolled past, so the prompt reads
  // as "finished reading about him" rather than "came into view".
  //
  // A scroll listener rather than an IntersectionObserver on purpose: IO only
  // reports threshold *crossings*, so a fast flick, a hash jump or a click on
  // the sticky register bar can take the anchor from below the fold to above it
  // without ever intersecting — and the prompt then never arms at all. Reading
  // the position directly has no such hole. rAF-gated and passive, so it costs
  // one rect read per frame at most (same pattern as `sticky-register-bar.tsx`).
  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const anchor = document.querySelector("[data-about-prompt-anchor]")
      if (!anchor) return
      if (anchor.getBoundingClientRect().bottom < 0) setArmed(true)
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

  // Re-arm when the variant is switched mid-demo, so the client sees the next
  // presentation without having to scroll back up.
  useEffect(() => {
    setDismissed(false)
  }, [variant])

  if (variant === "inline") return null
  const open = armed && !dismissed

  return variant === "card" ? (
    <SlideInCard open={open} onDismiss={() => setDismissed(true)} />
  ) : (
    <PopupModal open={open} onDismiss={() => setDismissed(true)} />
  )
}

function PromptPortrait() {
  return (
    <Image
      src="/images/mascot/ad-photo-2.webp"
      alt=""
      width={112}
      height={112}
      className="size-14 shrink-0 rounded-full object-cover object-top"
    />
  )
}

/**
 * Bottom-CENTRE, on every viewport. The sticky register bar owns the full width
 * of the bottom edge on phones, so the two are separated vertically rather than
 * by hiding one of them — `bottom-28` (7rem) clears the bar's ~69px with ~43px
 * to spare, and the bar still outranks this at `z-40` if a future layout change
 * ever brings them back into contact.
 *
 * That clearance is a constant, not a measurement: on the corporate page, where
 * no bar exists, the card simply sits a little off the floor, which costs
 * nothing. Width is the viewport minus a 1rem gutter either side, capped at the
 * desktop width, so it never runs off-screen on a phone.
 *
 * Centring is `left-1/2` + `-translate-x-1/2`, which shares the transform with
 * the slide-in `translate-y` — Tailwind drives the two axes through separate
 * custom properties, so neither clobbers the other.
 */
function SlideInCard({
  open,
  onDismiss,
}: {
  open: boolean
  onDismiss: () => void
}) {
  return (
    <div
      className={`bg-brand text-brand-foreground fixed bottom-28 left-1/2 z-30 w-[calc(100vw-2rem)] max-w-[20rem] -translate-x-1/2 rounded-xl p-5 shadow-2xl transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
        open
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        tabIndex={open ? 0 : -1}
        className="text-brand-foreground/70 hover:text-brand-foreground focus-visible:ring-brand-foreground absolute top-3 right-3 rounded-full p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-center gap-4">
        <PromptPortrait />
        <div>
          <p className="font-serif text-xl leading-tight">
            Who is teaching this?
          </p>
          <p className="text-brand-foreground/75 mt-1 text-xs leading-snug">
            20+ years, 20,000+ professionals trained.
          </p>
        </div>
      </div>

      <Link
        href="/about"
        tabIndex={open ? 0 : -1}
        className="text-brand-foreground/95 hover:text-brand-foreground focus-visible:ring-brand-foreground group mt-4 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4 focus-visible:ring-2 focus-visible:outline-none"
      >
        Know more about Coach Adrian
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </Link>
    </div>
  )
}

/** The client's literal request: a centred maroon pop-up over the page. */
function PopupModal({
  open,
  onDismiss,
}: {
  open: boolean
  onDismiss: () => void
}) {
  // Escape closes it, matching what anyone expects from a dialog.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onDismiss])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Know more about Coach Adrian"
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
    >
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
      />
      <div className="bg-brand text-brand-foreground relative w-full max-w-md rounded-2xl p-8 text-center shadow-2xl">
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="text-brand-foreground/70 hover:text-brand-foreground focus-visible:ring-brand-foreground absolute top-4 right-4 rounded-full p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <X className="size-5" />
        </button>

        <div className="flex justify-center">
          <Image
            src="/images/mascot/ad-photo-2.webp"
            alt=""
            width={144}
            height={144}
            className="size-20 rounded-full object-cover object-top"
          />
        </div>
        <p className="mt-5 font-serif text-3xl leading-tight">
          Know more about Coach Adrian
        </p>
        <p className="text-brand-foreground/80 mt-3 text-sm leading-relaxed">
          Two decades in the training circuit, 20,000+ professionals trained,
          and the Top 500 companies in the Philippines on the client list.
        </p>
        <Link
          href="/about"
          className="text-brand hover:bg-background/90 focus-visible:ring-brand-foreground mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          Read his story
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

/**
 * DEMO ONLY — the meeting control. Deliberately findable (a labelled bar under
 * the navbar) rather than hidden behind a query param, because its whole job is
 * to be reachable live in front of the client.
 *
 * Delete this component and its call sites once a variant is chosen.
 */
export function AboutPromptSwitcher() {
  const [variant, setVariant] = useVariant()

  return (
    <div className="bg-foreground/[0.04] border-border/60 border-b">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-2.5 sm:px-8">
        <span className="text-muted-foreground text-[0.6875rem] font-semibold tracking-[0.12em] uppercase">
          Demo control · &ldquo;About Adrian&rdquo; prompt
        </span>
        <div
          role="radiogroup"
          aria-label="About prompt presentation"
          className="flex flex-wrap gap-1.5"
        >
          {VARIANTS.map((v) => {
            const active = v.id === variant
            return (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={active}
                title={v.note}
                onClick={() => setVariant(v.id)}
                className={`focus-visible:ring-brand min-h-8 rounded-full px-3.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                  active
                    ? "bg-brand text-brand-foreground"
                    : "text-muted-foreground ring-border/70 hover:text-foreground ring-1"
                }`}
              >
                {v.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
