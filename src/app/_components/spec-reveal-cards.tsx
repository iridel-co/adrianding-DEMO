"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Check } from "lucide-react"
import { useReducedMotionSafe } from "@/app/_lib/use-reduced-motion-safe"
import { useIsTouch } from "@/app/_lib/use-is-touch"
import { cn } from "@/lib/utils"

/**
 * The six programs as a vertical stack of expand-on-hover image cards (adapted
 * from the `HoverExpand` primitive / 21st.dev). Every row is a rounded, cropped
 * photo with the program title laid over it behind a scrim — so even
 * collapsed it reads as an image, never a blank band.
 *
 * Content mode, changed 2026-09-24: at rest a card shows its title and full
 * blurb. Hovering, tapping-into-focus, or keyboard-focusing a card (desktop,
 * real pointer only — `useIsTouch`) grows its height, swaps the blurb for
 * "Useful for" + 4 bullets, and adds an Inquire button that navigates to
 * `/corporate-training?program=<key>#inquiry`. One row is always open on
 * desktop (default card 0). On touch devices, and below `lg`, nothing
 * expands: every card is static at the expanded height, showing the detail
 * (bullets + Inquire), never the blurb, and there is no toggle element at
 * all — see RULES §14, "the touch control is the default". Inquire sits
 * bottom-right. Static (touch / below lg) titles are extra-bold and centred
 * on phones via `TITLE_STATIC`, the same literal as `program-carousel.tsx`
 * (pass 4, 2026-09-24).
 *
 * The overlay `<button>` (interactive mode only) exists because the card's
 * content includes a real `<a>` Inquire link, and an `<a>` can't sit inside a
 * `role="button"` — the previous version wrapped the whole row in
 * `role="button"`, which axe flags as a nested interactive element; this
 * version keeps the click/focus target as a separate absolutely-positioned
 * overlay behind the link, and the link itself sits above it via `Detail`'s
 * `pointer-events-auto`.
 *
 * History: 2026-09-24 replaced the blurb-only card (title + one line, always
 * visible) with this rest/detail split, reusing the interaction pattern
 * `program-carousel.tsx` established for the corporate carousel.
 *
 * Below `lg` the same six cards are a horizontal snap rail instead (the
 * calling section supplies the scroller; these are its fixed-width panels) —
 * stacked, six of them ran to about two phone screens on their own. The
 * expand/collapse height tween is desktop-only for the same reason: in the
 * rail every card is the same height, so there is nothing to expand into.
 */

export type SpecCard = {
  key: string
  title: string
  blurb: string
  usefulFor: string[]
  image: string
  imageAlt: string
  // Vertical focal point for the cropped photo, e.g. "50% 20%" to bias the
  // crop toward the top of the frame. Defaults to centered.
  imagePosition?: string
}

const COLLAPSED_H = "11.5rem"
const EXPANDED_H = "27rem"
// Rail-panel height below `lg` — matches the `h-[28rem]` class the card
// carries before the viewport query resolves, so the two can never disagree.
// Raised 24rem → 27rem (2026-09-24) and 27rem → 28rem (pass 4): the heavier,
// centred title with 24px to the bullets left the title only 20px from the
// card top at 360px wide. 28rem gives about 36px.
const RAIL_H = "28rem"

// Alternating horizontal offset so the stack reads as a staggered, hand-set
// column rather than a locked grid — even rows pulled left, odd rows pushed
// right. `lg:`-gated: below that the cards are fixed-width panels in a
// horizontal rail, where an inset would just shrink them unevenly.
const OFFSETS = ["lg:mr-[7%] lg:w-[93%]", "lg:ml-[7%] lg:w-[93%]"]

const TITLE_INTERACTIVE =
  "text-xl leading-tight font-semibold tracking-[-0.01em] text-balance text-white lg:max-w-60 lg:shrink-0 lg:text-[1.65rem]"

// Static (touch / below lg) card title — IDENTICAL literal in
// spec-reveal-cards.tsx and program-carousel.tsx (feedback pass 4,
// 2026-09-24): extra-bold like the workshop card titles, centred on
// phones with 24px to the bullets (mb-2 + the column's 16px gap). From lg
// (touch tablets only reach this) it drops back to left-aligned.
const TITLE_STATIC =
  "mx-auto mb-2 max-w-[15.5rem] text-center text-xl leading-tight font-extrabold tracking-[-0.01em] text-balance text-white lg:mx-0 lg:mb-0 lg:shrink-0 lg:text-left lg:text-[1.65rem]"

// Same wipe-fill + colour-invert Register mechanic as `program-carousel.tsx`
// — copied literally so the glow/border still changes with the fill on hover
// (memory rule).
const INQUIRE_PILL =
  "group/reg text-brand-foreground bg-brand before:bg-background hover:text-foreground relative isolate inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg shadow-black/25 transition-[color,transform,box-shadow] duration-300 before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:transition-transform before:duration-300 before:content-[''] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40 hover:before:scale-x-100"

export function SpecRevealCards({ items }: { items: SpecCard[] }) {
  const reduce = useReducedMotionSafe()
  const touch = useIsTouch()
  const [active, setActive] = useState(0)

  // The height tween is the desktop stack's interaction. Mount-gated so SSR
  // and the first client render agree (lessons 2026-09-02); until it syncs,
  // the CSS height on the card governs — which is what mobile wants anyway.
  const [stacked, setStacked] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    const sync = () => setStacked(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  // Interactive only with a desktop-width screen AND a real pointer. Both
  // gates start false, so SSR and first paint render the static (touch)
  // layout — RULES §14's "touch control is the default" order.
  const interactive = stacked && !touch

  return (
    <>
      {items.map((item, i) => {
        const open = active === i
        const showDetail = !interactive || open
        return (
          <motion.div
            key={item.key}
            // `contain-layout` scopes the height tween's reflow cost to this
            // row's own box, so toggling one card can't force a layout recalc
            // outside the stack.
            className={cn(
              "group relative h-[28rem] w-[78vw] max-w-96 shrink-0 snap-start overflow-hidden rounded-3xl contain-layout lg:h-auto lg:w-auto lg:max-w-none lg:shrink",
              OFFSETS[i % OFFSETS.length]
            )}
            initial={false}
            animate={{
              height: stacked
                ? interactive
                  ? open
                    ? EXPANDED_H
                    : COLLAPSED_H
                  : EXPANDED_H
                : RAIL_H,
            }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.42, ease: [0.33, 1, 0.68, 1] }
            }
            onHoverStart={() => interactive && setActive(i)}
          >
            <Image
              src={item.image}
              alt={item.imageAlt}
              fill
              sizes="(min-width: 1280px) 1216px, (min-width: 1024px) 100vw, 78vw"
              style={{ objectPosition: item.imagePosition ?? "50% 50%" }}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div
              className={cn(
                "absolute inset-0 bg-linear-to-t transition-colors duration-300",
                showDetail
                  ? "from-black/60 via-black/28 to-black/8"
                  : "from-black/65 via-black/35 to-black/15"
              )}
            />
            <div
              className={cn(
                "absolute inset-0 bg-black/30 transition-opacity duration-300 motion-reduce:transition-none",
                showDetail ? "opacity-100" : "opacity-0"
              )}
            />
            {interactive && (
              <button
                type="button"
                aria-expanded={open}
                aria-label={`${item.title} — who it's for`}
                className="absolute inset-0 z-10 cursor-pointer rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-inset"
                onClick={() => setActive(i)}
                onFocus={() => setActive(i)}
              />
            )}
            <motion.div
              key={showDetail ? "detail" : "blurb"}
              initial={stacked && !reduce ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.3,
                ease: [0.33, 1, 0.68, 1],
                delay: showDetail && interactive ? 0.12 : 0,
              }}
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
            >
              {showDetail ? (
                <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:p-8 xl:gap-12">
                  <h3
                    className={interactive ? TITLE_INTERACTIVE : TITLE_STATIC}
                  >
                    {item.title}
                  </h3>
                  <div className="w-full lg:max-w-sm">
                    <p className="text-sm font-semibold text-white">
                      Useful for
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {item.usefulFor.map((b) => (
                        <li
                          key={b}
                          className="flex gap-2.5 text-sm leading-snug text-white/90"
                        >
                          <Check
                            className="mt-0.5 size-4 shrink-0 text-white/70"
                            aria-hidden
                          />
                          {b}
                        </li>
                      ))}
                    </ul>
                    {/* Plain <a>, not next/link: a full load is what triggers
                        the inquiry form's cold-load `#inquiry` landing
                        (commit 91a834e) and its `?program=` prefill. */}
                    <div className="mt-5 flex justify-end">
                      <a
                        href={`/corporate-training?program=${item.key}#inquiry`}
                        className={cn(
                          INQUIRE_PILL,
                          "pointer-events-auto focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                        )}
                      >
                        Inquire
                        <span className="sr-only"> about {item.title}</span>
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover/reg:translate-x-1" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-row items-end justify-between gap-8 p-8 xl:gap-12">
                  <h3 className={TITLE_INTERACTIVE}>{item.title}</h3>
                  <p className="max-w-sm text-right text-sm leading-relaxed text-white/85 xl:text-base">
                    {item.blurb}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )
      })}
    </>
  )
}
