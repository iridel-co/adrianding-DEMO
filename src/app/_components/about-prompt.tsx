import Link from "next/link"
import { ArrowRight } from "lucide-react"

/**
 * "Know more about Coach Adrian" — the credibility exit from the two pages
 * that paid traffic actually lands on (workshop detail, corporate training).
 *
 * History: three presentations (inline / slide-in card / pop-up) were built
 * for the client meeting; the client chose inline on 2026-09-19 and the
 * other two plus the switcher were deleted.
 *
 * One per page, at the end of whichever section already carries his portrait
 * and story — never `variant="brand"`, so it can't compete with
 * Register / Send inquiry.
 */
export function AboutPromptAnchor({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
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
