"use client"

import { Wand2 } from "lucide-react"

/**
 * "Fill sample data" shortcut, shown on both multi-step forms.
 *
 * This is a demo affordance, not a product feature: the client reviews this
 * site on a phone, and typing a full name, email, mobile number, occupation and
 * four programme fields on a touch keyboard just to see what the confirmation
 * page looks like is enough friction that the flow does not get walked at all.
 * One tap populates every step so the funnel can be judged instead of typed.
 *
 * It stays deliberately quiet — a hairline ghost pill, never a `brand` button —
 * so it can't be mistaken for the form's own call to action. It is labelled
 * "demo" in the accessible name for the same reason.
 *
 * Remove this component and its two call sites when the site goes live.
 */
export function DemoFillButton({ onFill }: { onFill: () => void }) {
  return (
    <button
      type="button"
      onClick={onFill}
      aria-label="Demo shortcut: fill this form with sample data"
      className="text-muted-foreground/80 ring-border/70 hover:text-foreground hover:ring-border focus-visible:ring-brand inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[0.6875rem] font-medium tracking-[0.06em] uppercase ring-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <Wand2 className="size-3" />
      Fill sample data
    </button>
  )
}
