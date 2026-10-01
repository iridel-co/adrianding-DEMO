"use client"

import Image from "next/image"
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react"
import { Marquee } from "@/app/_components/marquee"
import { SiteNavbar } from "@/app/_components/site-navbar"
import { gsap, useGSAP, EASE, DUR } from "@/app/_lib/gsap"

/**
 * Hero option #7 — "Editorial cover".
 *
 * A single full-screen frame in the GQ / Architectural Digest register, modelled
 * on the Jasmine Star cover treatment:
 *
 *   - `ad-bg-2.webp` fills the frame (the file already carries a mono grade); a
 *     light scrim + vignette keep the white type legible.
 *   - The portrait cut-out sits right-of-centre, magazine-cover-subject style,
 *     with the wordmark's tail running over its shoulder.
 *   - "Adrian Ding" is set as one enormous serif line, left-aligned and parked
 *     on the page's y-axis (it runs across the vertical middle and into the
 *     portrait, cover-style), with a quiet static role line (coach / trainer /
 *     speaker / writer) under it; the social icons sit right under that group.
 *
 * Nav: no CTA floats over the hero itself — the shared <SiteNavbar> (same
 * component, same logo/links/CTA, as every other page) is pinned to the top
 * of the viewport from the first frame, same as every other page. It renders
 * as the *first* child, before the hero, so its own `position: sticky; top: 0`
 * engages immediately instead of waiting for the hero to scroll past; its
 * `z-50` keeps it painting above the hero's `z-0` regardless of DOM order.
 *
 * No scroll pin, no page-rise curtain, no scroll-snap. Reduced motion -> the
 * resolved composition, painted immediately.
 *
 * Assets: mascot/ad-bg-2.webp · mascot/ad-hero-portrait.webp ·
 * logos/ad-logo-white.svg · logos/ad-logo-black.svg
 * (both `.webp`s are `cwebp`-recompressed from the original `.png`s — 2.2MB →
 * 139KB and 2.3MB → 158KB — the PNGs stay on disk unreferenced since
 * `ad-bg-2.png` is still the `og:image` in `layout.tsx`, which wants a real
 * PNG/JPG for social-platform compatibility, not WebP.)
 */

// Kept in step with SiteFooter's own SOCIALS — same five platforms in both
// places (TikTok rendered from an inline glyph; lucide ships no TikTok icon).
const SOCIALS: {
  label: string
  href: string
  Icon: React.ComponentType<{ className?: string }>
}[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/coachadrianding/?hl=en",
    Icon: Instagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/adrianding.mi/",
    Icon: Facebook,
  },
  {
    label: "LinkedIn",
    href: "https://ph.linkedin.com/in/coachadrianding",
    Icon: Linkedin,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCugWqssJknpyGE0k-jexhfA",
    Icon: Youtube,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@coachadrianding",
    Icon: TikTokIcon,
  },
]

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M16.5 3c.3 2 1.5 3.6 3.5 3.9v2.7c-1.3.1-2.5-.2-3.6-.8v6.6c0 3.4-2.6 5.6-5.7 5.6A5.5 5.5 0 0 1 5 12.9c1-.7 2.2-1.1 3.5-1v2.9a2.7 2.7 0 0 0-1.2-.1 2.6 2.6 0 0 0 .5 5.1c1.5 0 2.8-1.2 2.8-3V3h3.9Z" />
    </svg>
  )
}

// His four hats, set as one quiet line under the wordmark, magazine-cover style.
const ROLES = [
  "Leadership Development Coach",
  "Corporate Trainer",
  "Keynote Speaker",
  "Inspirational Writer",
]

// No clip mask around the wordmark (see the wrapper below), so leading is free —
// it can't chop the caps height or the "g" tail whatever the size. Sizing
// is still being tuned. The role marquee below is clipped short of the final "g"
// (~89% width), so the descender has its own clear lane — no `pb` reserve needed.
// Mobile gets its own, bigger clamp (`sm:` restores the original formula
// exactly, so nothing above 640px changes from the pre-mobile-pass sizing).
const WORD =
  "block font-serif font-normal whitespace-nowrap leading-[0.95] tracking-[-0.03em] text-white text-[clamp(3.85rem,14vw,9.5rem)] sm:text-[clamp(2.75rem,10vw,9.5rem)] [text-shadow:0_12px_60px_rgba(0,0,0,0.6)]"

export function HeroEditorial() {
  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(".he-bg, .he-portrait, .he-word, .he-line", {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        yPercent: 0,
      })
    })

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: EASE } })
      tl.from(".he-bg", { scale: 1.12, autoAlpha: 0, duration: DUR.slow + 0.2 })
        .from(
          ".he-portrait",
          { yPercent: 8, scale: 1.04, autoAlpha: 0, duration: DUR.slow },
          "-=1.05"
        )
        .from(
          ".he-word",
          { yPercent: 40, autoAlpha: 0, duration: 0.95 },
          "-=0.7"
        )
        .from(
          ".he-line",
          { y: 18, autoAlpha: 0, duration: DUR.base, stagger: 0.08 },
          "-=0.5"
        )

      // Pointer parallax — the background drifts against the cursor while the
      // portrait drifts with it, so the two planes separate as the mouse moves.
      // `quickTo` keeps it to one sprung tween per property instead of a new
      // tween per mousemove. Mouse-only: on touch there is no cursor to track,
      // and the listener would never fire anyway.
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const bgX = gsap.quickTo(".he-bg", "xPercent", {
          duration: 0.7,
          ease: "power3.out",
        })
        const bgY = gsap.quickTo(".he-bg", "yPercent", {
          duration: 0.7,
          ease: "power3.out",
        })
        const portraitX = gsap.quickTo(".he-portrait", "xPercent", {
          duration: 0.7,
          ease: "power3.out",
        })
        const onMove = (e: MouseEvent) => {
          const x = e.clientX / window.innerWidth - 0.5
          const y = e.clientY / window.innerHeight - 0.5
          bgX(x * -2)
          bgY(y * -1.5)
          portraitX(x * 2)
        }
        window.addEventListener("mousemove", onMove, { passive: true })
        return () => window.removeEventListener("mousemove", onMove)
      }
    })

    return () => mm.revert()
  })

  return (
    <>
      {/* Same navbar as every other page (<SiteNavbar>) — pinned to the top
          from the first frame. It renders before the hero so its own
          `sticky top-0` engages immediately; its `z-50` keeps it painting
          above the hero regardless of DOM order. */}
      <SiteNavbar className="he-nav" initialTheme="dark" />
      {/* `sticky top-0` so the hero holds at the top while the opaque
          <QuoteReveal /> sheet (a later sibling, z-10) rides up over it. It stays
          stuck for the rest of the page but is fully covered from there on, so no
          unpin logic is needed. `z-0` boxes its inner z-20/30/40 layers in so
          they can't poke above the sheet. (cf. tasks/lessons.md 2026-08-09.) */}
      <div
        data-navbar-theme="dark"
        className="sticky top-0 z-0 min-h-[100svh] w-full overflow-hidden bg-[#141414]"
      >
        {/* Background — ad-bg-2 (already mono). Light scrim + vignette. */}
        <div className="he-bg absolute inset-[-4%] z-0 will-change-transform">
          <Image
            src="/images/mascot/ad-bg-2.webp"
            alt=""
            fill
            priority
            sizes="110vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/18" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_40%,transparent_0%,rgba(0,0,0,0.35)_100%)]" />
          {/* Bottom-up wash — grounds the cover lines + CTA over the nav seam. */}
          <div className="absolute inset-x-0 bottom-0 h-[42%] bg-linear-to-t from-black/42 to-transparent" />
        </div>

        {/* Portrait — right-of-centre, cover-subject style */}
        {/* `-bottom` offsets each carry an added `+ var(--nav-h)` so the
            portrait's top edge clears the sticky navbar at every breakpoint —
            without it, the tighter top clearance at `lg` (~2svh, well under
            the 4rem bar) lets the subject's head sit behind/under the nav. */}
        <div className="he-portrait pointer-events-none absolute bottom-[calc(-4svh-var(--nav-h))] left-1/2 z-20 aspect-[1080/1720] h-[76svh] w-auto -translate-x-1/2 will-change-transform select-none sm:right-[2%] sm:bottom-[calc(-12svh-var(--nav-h))] sm:left-auto sm:h-[112svh] sm:translate-x-0 lg:right-[7%] lg:bottom-[calc(-18svh-var(--nav-h))] lg:h-[124svh]">
          <Image
            src="/images/mascot/ad-hero-portrait.webp"
            alt="Coach Adrian Ding"
            fill
            priority
            sizes="(max-width: 640px) 70vw, (max-width: 1024px) 50vw, 42vw"
            className="object-contain object-bottom"
          />
        </div>

        {/* Cover cluster — left-aligned, parked on the page's y-axis (`top-1/2` +
            translate) so the wordmark sits across the vertical middle. Wordmark
            + role line are one group; the socials sit under. */}
        {/* On mobile the cluster is parked a little below centre: at phone
            width the vertical middle lands across the subject's chin, and the
            wordmark reads better over the jacket than over his face. From `sm`
            it returns to the true centre-axis the cover composition is built
            on. */}
        <div className="pointer-events-none absolute top-[calc(var(--nav-h)+1.5rem)] left-1/2 z-30 flex w-full max-w-[min(90vw,44rem)] -translate-x-1/2 flex-col items-center text-center sm:top-1/2 sm:left-24 sm:w-auto sm:translate-x-0 sm:-translate-y-1/2 sm:items-start sm:text-left">
          {/* Wordmark + marquee stay mutually left-aligned to each other at
              every breakpoint (`items-start`, never centered) — the marquee's
              width is tuned relative to the wordmark's own left edge so the
              "g" descender of "Ding" keeps its clear lane on the right (see
              below). Centering them independently would split that clearance
              evenly on both sides and starve the right side of it. Centering
              on the page instead happens one level up: this whole two-line
              block is a single flex item inside the outer `items-center`
              wrapper, so it's centered as one unit while staying internally
              left-aligned. */}
          <div className="flex flex-col items-start">
            <div className="w-max">
              <h1 className={`he-word ${WORD}`}>
                Adrian Ding
                <span className="sr-only">
                  {" "}
                  — leadership development and corporate training
                </span>
              </h1>
            </div>
            {/* Roles — a slow, quiet marquee under the wordmark. Its width is
                4.5× the wordmark's font size (same clamps as `WORD`), about 88%
                of the rendered "Adrian Ding", so it stops just short of the "g"
                descender at every size and the clipped track can never blow
                out the cluster.
                `he-line` fades it in with the rest of the cluster; the Marquee's
                own tween drives the cycle. The top margin is pulled up by a
                fraction of the wordmark's own font size (same clamps as `WORD`),
                because Prata's line box leaves a tall empty band under the
                baseline for the "g" tail; this keeps the gap proportional at
                every size. Edge fades are the Marquee's default, 7% each side. */}
            <div className="he-line mt-[calc(0.75rem-0.14*clamp(3.85rem,14vw,9.5rem))] flex items-center gap-2.5 sm:mt-[calc(0.75rem-0.14*clamp(2.75rem,10vw,9.5rem))]">
              <Marquee
                speed={22}
                gap="2.75rem"
                className="w-[calc(4.5*clamp(3.85rem,14vw,9.5rem))] text-[0.7rem] font-semibold tracking-[0.16em] text-white/80 uppercase [text-shadow:0_1px_8px_rgba(0,0,0,0.55)] sm:w-[calc(4.5*clamp(2.75rem,10vw,9.5rem))] sm:text-[0.72rem] sm:tracking-[0.2em]"
              >
                {ROLES.map((role) => (
                  <span
                    key={role}
                    className="flex items-center gap-2.5 whitespace-nowrap"
                  >
                    {role}
                  </span>
                ))}
              </Marquee>
            </div>
          </div>
          {/* History: a problem-framing line briefly sat here (2026-09-06) in
              response to "credibility but not yet trust". Removed 2026-09-07 —
              it competed with the wordmark for the same band, which the cover
              composition can't carry (cf. lessons 2026-08-06, "a giant
              background wordmark and a headline cannot share the same band").
              The problem framing now lives on each course page instead, where
              the ad traffic that needs it actually lands. */}
          <div className="he-line pointer-events-auto mt-6 flex items-center justify-center gap-1.5 sm:-ml-2.5 sm:justify-start">
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex size-11 items-center justify-center text-white/80 transition-colors hover:text-white"
              >
                <Icon className="size-[1.1rem]" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
