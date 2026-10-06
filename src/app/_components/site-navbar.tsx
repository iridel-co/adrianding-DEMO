"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLayoutEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { MenuIcon } from "lucide-react"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useNavbarTheme } from "@/app/_lib/use-navbar-theme"
import {
  smoothScrollToElement,
  smoothScrollToTop,
} from "@/app/_lib/smooth-scroll-to"
import { cn } from "@/lib/utils"

/**
 * The one navbar for the whole site — identical everywhere. The only thing
 * that ever differs is where it starts: every page just renders
 * `<SiteNavbar />` and it's stuck to the top from the first frame. The
 * landing page is the sole exception, and only for *position* — it passes
 * `startBelowHero`, which drops the bar to the hero's bottom edge with a
 * negative top margin so it rides up into the sticky position as the visitor
 * scrolls past the hero, instead of starting pinned. Same logo, same links,
 * same CTA, same everything else. (cf. tasks/lessons.md 2026-08-09 — sticky,
 * not a JS position state-machine. Sticky, not a scroll container: an
 * ancestor with `overflow: hidden` — never used here, only `overflow-x: clip`
 * — would make the page a scroll container and the bar would ride away with
 * the content instead of staying pinned.)
 *
 * The surface adapts to whatever section sits behind it: `useNavbarTheme`
 * hit-tests the element under the bar and, if that element (or an ancestor)
 * carries `data-navbar-theme="dark"`, the bar switches to its dark treatment —
 * solid black, white logo, light link text. Everything else is the default
 * light bar (solid white, dark logo/links). Both surfaces are fully opaque —
 * no translucency/backdrop-blur — so a mid-scroll-restore reload never reads
 * as a gray blend of the two (cf. tasks/lessons.md 2026-09-03).
 *
 * The single CTA is workshop-forward on purpose: growing public-workshop
 * registrations is the goal (corporate is already the bigger channel). It
 * points at the fork (`#which-path` on <LandingPaths>, landing page only)
 * rather than straight at `/workshops` — from any other page it's `/` +
 * hash, so it lands on the homepage already scrolled to the choice.
 */

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/workshops", label: "Workshops" },
  { href: "/corporate-training", label: "Corporate Training" },
  { href: "/gallery", label: "Gallery" },
]

const CTA_HREF = "/#which-path"
const CTA_LABEL = "Train with Me"

type SiteNavbarProps = {
  /** Landing page only. Starts the bar at the hero's bottom edge (negative
   * top margin) instead of the viewport top. */
  startBelowHero?: boolean
  /** First-paint guess for the bar's theme, e.g. `"dark"` when the page opens
   * on a section tagged `data-navbar-theme="dark"` (the landing/About hero).
   * Held as-is until the first scroll event — `useNavbarTheme`'s hit-test runs
   * on mount at scroll 0, before anything is actually behind a normal
   * (non-overlapping) bar, so its first read always resolves to "light" and
   * would otherwise stomp this guess for a single frame. */
  initialTheme?: "light" | "dark"
  /** Landing page only. Hooks the bar into the hero's GSAP intro timeline
   * (`.he-nav`) — see hero-editorial.tsx. */
  className?: string
}

export function SiteNavbar({
  startBelowHero,
  initialTheme,
  className,
}: SiteNavbarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const detected = useNavbarTheme(
    headerRef,
    initialTheme ?? (startBelowHero ? "dark" : "light")
  )
  const [scrolled, setScrolled] = useState(false)
  // Layout effect: on a reload where the browser restores a mid-page scroll
  // position, `window.scrollY > 0` must flip `scrolled` before first paint —
  // a plain effect fires a tick late and paints one frame of `initialTheme`
  // (e.g. a dark hero guess) over whatever's actually behind the bar at that
  // scroll position (cf. tasks/lessons.md 2026-09-03).
  useLayoutEffect(() => {
    if (!initialTheme || window.scrollY > 0) {
      setScrolled(true)
      return
    }
    const onScroll = () => setScrolled(true)
    window.addEventListener("scroll", onScroll, { passive: true, once: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [initialTheme])
  const dark = (scrolled ? detected : initialTheme) === "dark"

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  // Next's App Router only auto-scrolls to a URL hash on an actual
  // navigation — clicking a same-page `Link` (already on `/`) just rewrites
  // the hash and leaves scroll position alone. Intercept and scroll by hand
  // whenever we're already on the target page.
  //
  // `smoothScrollToElement` (not native `scrollIntoView`) because the target
  // is `<LandingPaths>`: as the page scrolls under a stationary cursor, it
  // crosses into the card grid and fires that card's `mouseenter`, which
  // kicks off the hover take-over's `grid-template-columns` transition — a
  // layout shift that silently abandons a native smooth scroll partway there
  // (cf. tasks/lessons.md "Smooth-Scroll Anchor Navigation").
  const handleCtaClick = (e: React.MouseEvent) => {
    if (pathname !== "/") return
    e.preventDefault()
    const target = document.getElementById("which-path")
    if (!target) return
    window.history.replaceState(null, "", CTA_HREF)
    smoothScrollToElement(target)
  }

  // Clicking a nav link for the page you're already on doesn't navigate (Next
  // just no-ops), which reads as broken if you're scrolled deep into that
  // page. Treat it as "take me to the top" instead — same for the logo.
  const handleSamePageClick = (href: string) => (e: React.MouseEvent) => {
    if (pathname !== href) return
    e.preventDefault()
    smoothScrollToTop()
  }

  return (
    <header
      ref={headerRef}
      className={cn(
        // z-60: above the shared Sheet's overlay (z-50, portalled to the end
        // of <body> so it would otherwise paint over this sticky header at
        // equal z-index) — the mobile drawer must dim the page, not hide the
        // navbar itself, since the trigger/close button live in this header.
        "sticky top-0 z-60 h-(--nav-h) w-full border-b transition-colors duration-300",
        startBelowHero && "mt-[calc(var(--nav-h)*-1)]",
        dark ? "border-white/6 bg-black" : "border-black/6 bg-white",
        className
      )}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-6 sm:px-10"
      >
        <Link
          href="/"
          aria-label="Coach Adrian Ding — home"
          onClick={handleSamePageClick("/")}
          className="flex items-center gap-2.5"
        >
          <Image
            src={
              dark
                ? "/images/logos/ad-logo-white.svg"
                : "/images/logos/ad-logo-black.svg"
            }
            alt="Adrian Ding monogram"
            width={88}
            height={88}
            className="h-9 w-9 object-contain"
          />
        </Link>

        {/* Desktop links + CTA — untouched from the pre-mobile-pass layout, so
            the bar's `justify-between` spacing at `md`+ (Logo / this cluster,
            two flex children) stays pixel-identical to before. */}
        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={handleSamePageClick(l.href)}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "text-[0.95rem] font-medium transition-colors",
                isActive(l.href)
                  ? "text-brand"
                  : dark
                    ? "text-white/75 hover:text-white"
                    : "text-foreground/70 hover:text-foreground"
              )}
            >
              {l.label}
            </Link>
          ))}
          <motion.div
            whileHover={{ scale: 1.12 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Button
              asChild
              variant="brand"
              size="default"
              className={cn(
                "nav-cta ml-1 px-5 shadow-none",
                dark && "nav-cta-dark"
              )}
            >
              <Link href={CTA_HREF} onClick={handleCtaClick}>
                {CTA_LABEL}
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Mobile — CTA always visible next to the trigger, never tucked away
            behind the drawer alone. */}
        <div className="flex items-center gap-2 md:hidden">
          <motion.div
            whileHover={{ scale: 1.12 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Button
              asChild
              variant="brand"
              size="sm"
              className={cn(
                "nav-cta h-9 px-4 shadow-none",
                dark && "nav-cta-dark"
              )}
            >
              <Link href={CTA_HREF} onClick={handleCtaClick}>
                {CTA_LABEL}
              </Link>
            </Button>
          </motion.div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className={cn(
                  dark && "text-white hover:bg-white/10 hover:text-white"
                )}
              >
                <MenuIcon className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              // Radix restores focus to the trigger button on close by
              // default. That button lives in this `sticky` header, and
              // some mobile browsers respond to the focus restore by
              // scrolling the document to bring it "into view", which reads
              // as the page jumping to the top after closing the drawer
              // (most visible on outside-click dismiss). Not a form, so
              // restore focus without scrolling the page.
              onCloseAutoFocus={(e) => {
                e.preventDefault()
                headerRef.current
                  ?.querySelector<HTMLButtonElement>(
                    '[data-slot="sheet-trigger"]'
                  )
                  ?.focus({ preventScroll: true })
              }}
              className={cn(
                // z-70: above this header's z-60 (see the header className
                // comment) — the drawer still needs to slide in front of the
                // now-visible-through-the-scrim navbar, not behind it.
                "z-70 w-72 max-w-full overflow-y-auto motion-reduce:transition-none",
                dark &&
                  "border-white/10 bg-black text-white **:data-[slot=sheet-close]:text-white"
              )}
            >
              <SheetTitle asChild>
                <Link
                  href="/"
                  onClick={(e) => {
                    setOpen(false)
                    handleSamePageClick("/")(e)
                  }}
                  className="flex items-center gap-2.5"
                >
                  <Image
                    src={
                      dark
                        ? "/images/logos/ad-logo-white.svg"
                        : "/images/logos/ad-logo-black.svg"
                    }
                    alt="Adrian Ding monogram"
                    width={88}
                    height={88}
                    className="h-9 w-9 object-contain"
                  />
                  <span className="sr-only">Adrian Ding</span>
                </Link>
              </SheetTitle>
              <div className="mt-6 flex flex-col gap-1">
                {LINKS.map((l) => (
                  <SheetClose asChild key={l.href}>
                    <Link
                      href={l.href}
                      onClick={handleSamePageClick(l.href)}
                      aria-current={isActive(l.href) ? "page" : undefined}
                      className={cn(
                        "rounded-sm px-2 py-3 text-[0.95rem] font-medium transition-colors",
                        isActive(l.href)
                          ? "text-brand"
                          : dark
                            ? "text-white/80 hover:bg-white/10 hover:text-white"
                            : "text-foreground/80 hover:bg-muted/60 hover:text-foreground"
                      )}
                    >
                      {l.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
