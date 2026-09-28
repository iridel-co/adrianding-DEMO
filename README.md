# Coach Adrian Ding — Demo Site

A multi-page Next.js site built to pitch Coach Adrian Ding on a rebuild of
adrianding.com. **Frontend-only** — every form, login, and content list is UI without a
backend. For project status, what's mocked vs. real, the Phase 2 scope map, and open
questions, see [HANDOFF.md](HANDOFF.md). `PRD.md` is the scope/copy source of truth;
`MEETING-NOTES.md` has the client decisions behind it.

---

## Setup

| Requirement     | Value                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------- |
| Node            | `>=18.0.0` (`package.json` → `engines`; no `.nvmrc` committed — this session ran Node 23.9.0) |
| Package manager | npm (only a `package-lock.json` is committed)                                                 |

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run validate # typecheck + lint + format check — run before any handoff
```

No backend, no database, no `.env` file required to run it.

### Environment variables

| Variable               | Required | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | No       | Sets `metadataBase` in `src/app/layout.tsx` — the host every canonical / `og:url` / `og:image` URL resolves against. Unset, it falls back to `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL` → `http://localhost:3000`, which is correct on every Vercel preview deploy. **Never hard-code `adrianding.com`** — that's the client's existing live site; pointing `og:image` there makes link previews 404 silently. Set it explicitly only when this build is served from a domain Vercel doesn't already know about. |

### Other scripts

```bash
npm run lint        # ESLint (src/)
npm run lint:css    # Stylelint (src/**/*.css)
npm run lint:fix     # ESLint --fix
npm run format       # Prettier --write .
npm run format:check # Prettier --check . (part of `validate`)
npm run typecheck    # tsc --noEmit
```

---

## Stack

Versions as pinned in `package.json` (run `npm ls <pkg>` for the resolved version if a
range differs):

| Layer      | Package                                                          | Version                          |
| ---------- | ---------------------------------------------------------------- | -------------------------------- |
| Framework  | `next`                                                           | `16.3.0`                         |
| UI         | `react` / `react-dom`                                            | `19.2.1`                         |
| Language   | `typescript`                                                     | `^5`                             |
| Styling    | `tailwindcss` (+ `@tailwindcss/postcss`)                         | `^4`                             |
| Components | Radix UI primitives (`@radix-ui/react-*`)                        | see `package.json`               |
| Motion     | `gsap` / `@gsap/react`                                           | `^3.15.0` / `^2.1.2`             |
| Motion     | `framer-motion`                                                  | `^13.1.1`                        |
| Forms      | `react-hook-form` + `@hookform/resolvers` + `zod`                | `^7.68.0` / `^5.2.2` / `^4.1.13` |
| Icons      | `lucide-react`                                                   | `^0.557.0`                       |
| Images     | `sharp` (build-time recompression, not a runtime dep of the app) | `^0.35.4`                        |

The build runs **Next.js 16.3.0**. A few source comments (e.g. the `params`-is-a-Promise
note in the OG image routes) still say "Next 15"; the behavior they describe still holds
in 16.

---

## Project structure

```
src/
  app/
    page.tsx                  composition only, no copy
    layout.tsx                 metadata, fonts, <ScrollRefresh />, font-toggle init script
    opengraph-image.tsx        site-wide 1200x630 social card (next/og)
    og-assets/                 TTF/PNG copies Satori can read (see Gotchas)
    globals.css                design tokens + custom utilities
    fonts/                     The Seasons, Abramo, Prata (.woff2) — see Fonts below
    _sections/*.tsx             homepage sections
    _components/*.tsx           site-wide shared components (navbar, footer, GSAP primitives)
    _lib/                       gsap.ts, handoff.ts, hooks (see below)
    about/ workshops/ workshops/[slug]/ workshops/[slug]/registered/
    corporate-training/ corporate-training/inquiry-received/
    gallery/ gallery/[slug]/
    staff-login/ email-templates/
      page.tsx                  route metadata + composition
      _sections/*.tsx            that route's sections
      opengraph-image.tsx        (workshops/[slug] only — per-course social card)
  components/
    common/                    shared marketing/dashboard components (template — don't edit)
    ui/                        primitives, shadcn-style (template — don't edit)
  lib/                         mock content modules (see below)
public/images/                 gallery/, hero/, icons/, logos/, mascot/ — subfoldered, not flat
```

### Routes

| Route                                  | Notes                                                                   |
| -------------------------------------- | ----------------------------------------------------------------------- |
| `/`                                    | landing                                                                 |
| `/about`                               |                                                                         |
| `/workshops`                           | list/calendar                                                           |
| `/workshops/[slug]`                    | course detail — has its own `opengraph-image.tsx`                       |
| `/workshops/[slug]/registered`         | post-registration confirmation — `noindex`                              |
| `/corporate-training`                  |                                                                         |
| `/corporate-training/inquiry-received` | post-inquiry confirmation — `noindex`                                   |
| `/gallery`                             |                                                                         |
| `/gallery/[slug]`                      | event detail                                                            |
| `/staff-login`                         | UI shell only, no auth — see [HANDOFF.md](HANDOFF.md)                   |
| `/email-templates`                     | copy/layout preview only, no send wiring — see [HANDOFF.md](HANDOFF.md) |

Every route folder follows the same convention: `page.tsx` is imports + composition +
route metadata only; that route's copy and layout live in its own `_sections/*.tsx`.

### Where content lives

- **Page-specific copy** (hero headings, one-off sections) is inline in that route's
  `_sections/*.tsx` file.
- **Shared/repeated content** lives in `src/lib/*.ts` instead, since multiple pages or
  cards read the same data:

  | File                                                     | Backs                               |
  | -------------------------------------------------------- | ----------------------------------- |
  | `workshops.ts`                                           | workshop cards + detail pages, tags |
  | `workshop-faq.ts`                                        | registration FAQ                    |
  | `gallery.ts`                                             | past-event cards + detail pages     |
  | `testimonials.ts`                                        | testimonial quotes across pages     |
  | `timeline.ts`                                            | About page journey/milestones       |
  | `companies.ts`                                           | "companies served" logo marquee     |
  | `specializations.ts`                                     | corporate programme cards           |
  | `certifications.ts`                                      | About page accrediting-body list    |
  | `images.ts`, `utils.ts`, `og-jpeg.ts`, `gallery-blur.ts` | helpers, not content                |

  These `src/lib/*.ts` files are the seams Phase 2 replaces with real CMS data — treat
  each one's shape as the data contract a CMS schema should match. See
  [HANDOFF.md](HANDOFF.md) for the full approval/Phase-2 status of each.

Two rules carried from the base template that still hold:

1. **`page.tsx` files carry no copy.** Imports, metadata, and composition only.
2. **Don't edit `src/components/`.** It's the template's shared UI layer; content and
   layout changes happen in `_sections/*.tsx` or `src/lib/*.ts`.

---

## Design system

Tokens live in `src/app/globals.css`. The site is **committed to light mode** — there is
no theme toggle, so `.dark` utilities/tokens exist (carried from the template) but are
inert on purpose.

| Token                 | Value                        | Notes                                                                                                                   |
| --------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `--brand`             | `oklch(0.4331 0.1689 29.22)` | `#980F09` deep maroon/wine — primary buttons/links                                                                      |
| `--brand-accent`      | `oklch(0.615 0.23 29.22)`    | same hue, lifted for legibility as an inline accent on the cream quote sheet, and for the navbar CTA over dark sections |
| `--brand-accent-dark` | `oklch(0.72 0.15 29.22)`     | dark-mode variant (inert — see above)                                                                                   |
| `--radius`            | `0.25rem`                    | near-square                                                                                                             |

### Typography

Three type families, loaded via `next/font` and exposed as CSS vars in
`src/app/layout.tsx`:

- `--font-red-hat` (`--font-sans`) — Red Hat Display, Google font, body/UI text.
- `--font-the-seasons` (`--font-serif`) — display serif for the logo, headings, pull
  quotes. Self-hosted from `src/app/fonts/`.
- `--font-abramo` (`--font-accent`) — all-caps serif, special callouts only.
- `--font-prata` — free stand-in for The Seasons, used only by the review-only font
  toggle (see below).

`globals.css` maps `font-sans` / `font-serif` / `font-accent` Tailwind utilities to these
vars — use those utilities rather than `var(--font-the-seasons)` directly except in the
handful of places already noted in `globals.css` (`html[data-fonts="alt"]` override).

### Buttons

Glow and border color must shift on hover together with the fill, not the fill alone —
check this specifically on any button variant you touch.

### Motion

- Mount-time reveals (e.g. the gallery wall tiles) are CSS keyframes, not JS, so they
  paint immediately instead of sitting blank until a motion library hydrates.
- Scroll- and interaction-driven motion is GSAP-first (see below); `framer-motion` is
  used more broadly than just the hero — it backs `countdown.tsx`,
  `spec-reveal-cards.tsx`, `text-sweep-reveal.tsx`, `timeline.tsx`,
  `workshops-calendar.tsx`, `quote-reveal.tsx`, `paths.tsx`, `photo-wall.tsx`,
  `site-navbar.tsx`, and `parallax-floating.tsx` — mostly simple `motion.div`
  fades/hovers and `AnimatePresence` exits, not scroll orchestration.

### Hover states

Gallery/photo tile hover should only scale the tile up. Never dim or white-out sibling
tiles on hover — that reads as a bug, not an effect.

---

## Animation architecture (GSAP)

`src/app/_lib/gsap.ts` is the single registration point. Every animated component
imports `gsap` + plugins + shared tokens (`EASE`, `EASE_IO`, `DUR`, `RISE`) from there so
plugin registration happens exactly once, guarded to the client
(`typeof window !== "undefined"`) since several plugins touch `window` and would throw
during RSC/SSR evaluation.

Registered plugins: `ScrollTrigger`, `SplitText`, `CustomEase`, `DrawSVGPlugin`,
`Draggable`, `InertiaPlugin`, `Flip`, `useGSAP`. Two named eases are created once at
registration: `ad-ease` (the site's signature long, quiet editorial ease-out) and
`ad-ease-io` (for interactive/step transitions).

### Primitives (`src/app/_components/`)

| Component                                        | Does                                                               |
| ------------------------------------------------ | ------------------------------------------------------------------ |
| `reveal.tsx`                                     | scroll-in fade + rise, once, optional stagger over direct children |
| `split-reveal.tsx`                               | heading reveal via `SplitText`, line/word split                    |
| `spec-reveal-cards.tsx`, `text-sweep-reveal.tsx` | other scroll-reveal variants                                       |
| `marquee.tsx`, `companies-marquee.tsx`           | logo/content marquees                                              |
| `counter.tsx`, `countdown.tsx`                   | animated numbers                                                   |
| `timeline.tsx`                                   | About page journey                                                 |
| `testimonial-columns.tsx`                        | testimonial layout/animation                                       |
| `scroll-refresh.tsx`                             | see below                                                          |

### Reduced motion

Gated via `gsap.matchMedia()` — e.g. `reveal.tsx` registers a
`(prefers-reduced-motion: reduce)` branch that snaps straight to the resting state and a
`(prefers-reduced-motion: no-preference)` branch that runs the real animation. 8 files
under `src/app` use this pattern. `src/app/_lib/use-reduced-motion-safe.ts` and
`src/app/_lib/use-is-touch.ts` provide the same gating for non-GSAP interactions —
`useIsTouch` in particular exists because a tap on a touchscreen still synthesises
`mouseenter`/`mousemove`, so pointer-driven effects (cursor parallax, hover take-overs)
need to check this rather than trusting that mouse events mean a mouse.

### `<ScrollRefresh />`

Mounted once in `src/app/layout.tsx`, covers every route. `ScrollTrigger` resolves a
trigger like `start: "top 85%"` into an absolute scroll position **at creation time**.
Components on this site mount before layout is final — webfonts swap in, `SplitText`
re-wraps text into spans, the sticky hero resizes — so triggers created before that
settles are wrong by however much the page shifted. `ScrollRefresh` re-runs
`ScrollTrigger.refresh()` (debounced via `requestAnimationFrame`) after
`document.fonts.ready`, on window `load`, and on any `ResizeObserver` hit on
`document.body`. Measured impact before this existed: a stats-grid reveal fired at
scrollY 5300 instead of 4298 — a full viewport late.

---

## Gotchas

- **`SplitText` splits are fixed at mount.** A component that splits a heading into
  line/word spans measures against whichever font is active when it mounts. If the font
  changes after that (see the font-toggle below), the split is stale — this is why the
  font toggle reloads the page instead of flipping a live attribute.
- **ScrollTrigger positions need a refresh after fonts load** — see `<ScrollRefresh />`
  above. Don't reintroduce a scroll reveal that skips it.
- **`next/og` (Satori) can't read `.webp` images or `.woff2` fonts.** Both
  `opengraph-image.tsx` routes (`src/app/opengraph-image.tsx` and
  `src/app/workshops/[slug]/opengraph-image.tsx`) read assets from
  `src/app/og-assets/` (PNG + TTF) instead of the site's normal `.webp`/`.woff2` files,
  and inline them as base64 data URIs — Satori doesn't resolve root-relative
  `/images/...` paths. Regenerate those TTF/PNG copies from the originals if the source
  fonts or portrait change. This is also why `grep -rn "<img" src/` isn't empty — the two
  OG routes use a raw `<img>` inside `ImageResponse`, which is correct there (`next/image`
  doesn't work inside Satori's renderer); every other `<img>` in `src/` would be a bug.
- **Verify OG cards against `next build`, not `next dev`.** Turbopack dev rejects the
  inlined PNGs with "Input buffer contains unsupported image format" while the
  production render of the identical code is fine. Check
  `.next/server/app/opengraph-image.body` after a build.
- **`params` is a Promise in these metadata routes.** `workshops/[slug]/opengraph-image.tsx`
  types `params` as `Promise<{ slug: string }>` and awaits it — typing it as a plain
  object compiles fine and silently yields `undefined` for every slug, rendering the same
  fallback card for all eight workshops.
- **The landing hero is `sticky`; don't put `overflow-hidden` on an ancestor.**
  `hero-editorial.tsx`'s own root is `sticky top-0 ... overflow-hidden` by design, but a
  `sticky` element stops sticking the moment any ancestor clips overflow. If a future
  section needs to clip content, use `overflow-x-clip` on that ancestor instead of
  `overflow-hidden`, so the sticky hero above it keeps working.
- **`companies-marquee.tsx` is fragile — don't edit it, even for small audit fixes.** It's
  been tuned; if something looks off, flag it rather than patching it directly.
- **`workshops-calendar.tsx`**: marked days are real `<button>`s, plain days are `<div>`s
  — a `disabled` button swallows pointer events, so hover styling never lands on a plain
  day. The day popover renders in a portal on `document.body`, positioned from the
  trigger's viewport rect. Marker-circle wobble is picked by `date % 4` from four fixed
  SVG paths — deterministic, not randomized, so SSR and client agree.
- **`workshops/[slug]/_sections/sticky-register-bar.tsx`** hides itself the instant the
  page's `<footer>` scrolls into view (`document.querySelector("footer")` — there's only
  ever one per page) rather than padding the footer to clear a bar that stays shown.
  Don't reintroduce footer padding or an always-shown bar — both were tried and reverted.
- **Form → confirmation handoff never branches on `sessionStorage` during render.** Both
  forms write submitted values to `sessionStorage` via `src/app/_lib/handoff.ts`, then
  `router.push` to their confirmation route, which reads the value back in a `useEffect`.
  `sessionStorage` doesn't exist during SSR, so branching the first client render on it
  hydration-mismatches. Every confirmation section must render a complete generic state
  when the handoff is `null` (direct visit, private mode, blocked site data).
- **`useIsTouch()`** (`src/app/_lib/use-is-touch.ts`) gates pointer-only effects (cursor
  parallax, hover take-overs) — see Reduced motion above.

---

## Temporary review tools

Two things currently in the UI exist only for the client review. Both must be removed
before go-live.

### Hero font switch

`src/app/_components/font-switch.tsx` — a toggle in the hero letting Adrian compare the
paid **The Seasons** against free **Prata**. Persists the choice in `localStorage` under
`adrianding-fonts` (`"current"` | `"alt"`); switching calls `window.location.reload()`
rather than flipping a live attribute, because dozens of `SplitText`-split headings below
the fold are sized against whichever font is active at mount (see Gotchas above). The
saved choice is applied pre-paint by an inline `<Script id="font-init" strategy="beforeInteractive">`
in `layout.tsx`, so a stored "alt" choice never flashes the default font on reload.

To remove:

1. Delete `src/app/_components/font-switch.tsx`.
2. Remove its import and render in `src/app/_sections/hero-editorial.tsx`.
3. In `src/app/layout.tsx`: remove the `prata` font load, its `.variable` class in the
   `<body className>` string, and the `<Script id="font-init">` block.
4. In `src/app/globals.css`: remove the `html[data-fonts="alt"] body` override block.

Font licensing (full detail in [HANDOFF.md](HANDOFF.md)): **The Seasons** and **Abramo**
in `src/app/fonts/` are web-sourced demo copies of commercial fonts — swap for licensed
files (same filenames) before any real handoff. A TTF copy of The Seasons also lives in
`src/app/og-assets/` for the social cards and needs the same swap. **Abramo is loaded but
currently unused** in visible copy (reserved for future callouts) — confirm with Adrian
whether to keep licensing it.

### "Fill sample data" button

`src/app/_components/demo-fill.tsx` (`DemoFillButton`) — a quiet pill on both multi-step
forms that fills every step with sample data, so the funnel can be walked on a phone
without typing.

To remove:

1. Delete `src/app/_components/demo-fill.tsx`.
2. In `src/app/workshops/[slug]/_sections/registration-form.tsx` and
   `src/app/corporate-training/_sections/inquiry-form.tsx`: remove the `DemoFillButton`
   import, its render, and the `fillSample` function it calls.

`src/app/_components/about-prompt.tsx` (`AboutPromptAnchor`) is **not** a review tool: it
is the permanent "Know more about Coach Adrian" link on the workshop-detail and
corporate-training pages. Adrian chose this inline version on 2026-09-19.

---

## Images

`public/images/` is subfoldered (`gallery/`, `hero/`, `icons/`, `logos/`, `mascot/`) —
this diverges from the base template's flat-file rule because of the volume of company
logos and per-event gallery photos. Company logo files are named `co-<slug>.<ext>`.

`src/app/og-assets/` is deliberately not `.webp`/`.woff2` — see Gotchas above.

---

## Quality gates

```bash
npm run validate                        # typecheck + lint + format check
npx prettier --check "src/**/*.{ts,tsx,css}"  # format:check flags graphify-out/ too; scope to src/ to isolate real issues
grep -rn "placeholderImg(" src/lib/specializations.ts  # 11 calls — Unsplash stand-ins, real photography pending
grep -rn "<img" src/                    # 2 hits, both inside the OG image routes — expected, see Gotchas
grep -rn "TODO" src/                    # 37 hits — each maps to an open item in HANDOFF.md / PRD.md
```

Current state (verified 2026-09-28): `npm run typecheck` and `npm run lint` both pass
clean. `npm run format:check` reports issues only because `graphify-out/` (a generated
knowledge-graph cache, not source) isn't yet excluded from Prettier's glob — `src/` itself
is fully Prettier-clean. That `.prettierignore` gap is being fixed in parallel; if it's
still open when you read this, add `graphify-out/` to `.prettierignore` rather than
running `prettier --write .` at the repo root.

---

## Deploy

No `vercel.json` or other deploy config is committed. The `NEXT_PUBLIC_SITE_URL` fallback
chain in `layout.tsx` (`VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL` → localhost) assumes
a **Vercel** deploy and needs those env vars if deployed elsewhere. No other
platform-specific config exists in the repo.
