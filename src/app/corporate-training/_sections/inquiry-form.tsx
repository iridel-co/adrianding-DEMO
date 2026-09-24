"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, ArrowRight, Check, ChevronDown, Phone } from "lucide-react"
import { gsap, useGSAP } from "@/app/_lib/gsap"
import { saveHandoff } from "@/app/_lib/handoff"
import { smoothScrollToElement } from "@/app/_lib/smooth-scroll-to"
import { useReducedMotionSafe } from "@/app/_lib/use-reduced-motion-safe"
import { DemoFillButton } from "@/app/_components/demo-fill"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { CORPORATE_PROGRAMMES } from "@/lib/specializations"
import { cn } from "@/lib/utils"

/**
 * Corporate training inquiry — multi-step, progressive disclosure. Frontend
 * only: nothing is sent anywhere; submitting routes to
 * `/corporate-training/inquiry-received`.
 *
 * Step 3 (programme / headcount / date / venue) is the client's own ask — a
 * name and a free-text message was not enough to quote against, so those four
 * are now captured explicitly.
 *
 * Prefill (2026-09-19): the corporate carousel's Inquire button hands off a
 * programme two ways — a `?program=<key>` URL (read on mount, deep-link /
 * reload safe) and a `PROGRAM_INQUIRE_EVENT` window event (re-applies a
 * programme even if the URL didn't change, e.g. a second click after the
 * visitor picked something else by hand). Also new: an optional
 * "Also interested in" group of selectable tiles (real checkboxes, visually
 * hidden, inside a fieldset — changed from plain checkboxes 2026-09-24), so
 * one inquiry can cover more than one programme.
 *
 * Programme list (2026-09-24): reads `CORPORATE_PROGRAMMES` — Adrian's six
 * real programmes plus four demo-only placeholders — so the corporate page's
 * select and tiles show all ten. The landing page still reads the real six
 * only.
 *
 * Deep-link landing (2026-09-24): a cold load of
 * `/corporate-training?program=<key>#inquiry` prefills correctly above but
 * used to strand the visitor at scrollY ~100-650 instead of at this section
 * (4000+px down). The browser's *native* fragment jump fires immediately on
 * load — well before webfonts swap, the Programs carousel's images decode,
 * and hydration settle — and nothing re-corrects it afterward, so it lands
 * against a page that is still shifting under it. Fixed by landing ourselves,
 * once, after the same settle signals `ScrollRefresh` uses (fonts ready +
 * window load), via the existing `smoothScrollToElement` helper — and only if
 * the visitor hasn't already started scrolling by hand.
 */

// Must match the constant in _components/program-carousel.tsx — see PLAN-feedback-2.md.
const PROGRAM_INQUIRE_EVENT = "ad:program-inquire"

const SPEC_TITLES = CORPORATE_PROGRAMMES.map((s) => s.title) as [
  string,
  ...string[],
]

const PROGRAMS = [
  ...CORPORATE_PROGRAMMES.map((s) => s.title),
  "Not sure yet — help us scope it",
] as const

// "Also interested in" tiles (2026-09-24). Selected = filled brand + white
// check badge + slight scale + brand glow. The border AND the glow change
// together with the fill on hover in both states (memory rule).
const TILE_BASE =
  "relative flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-3 text-left text-sm font-medium select-none transition-[background-color,border-color,box-shadow,color,scale] duration-200 ease-out motion-reduce:transition-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background"
const TILE_OFF =
  "border-input bg-background text-foreground shadow-sm shadow-black/5 hover:border-brand/60 hover:bg-brand/5 hover:shadow-md hover:shadow-brand/15"
const TILE_ON =
  "border-brand bg-brand text-brand-foreground scale-[1.02] shadow-lg shadow-brand/35 hover:border-brand-accent hover:bg-brand-accent hover:shadow-brand-accent/45"
const TILE_ICON_BASE =
  "flex size-9 shrink-0 items-center justify-center rounded-md transition-colors duration-200 motion-reduce:transition-none"
const TILE_ICON_OFF = "bg-brand/10 text-brand"
const TILE_ICON_ON = "bg-white/15 text-brand-foreground"
const TILE_CHECK_BASE =
  "flex size-5 shrink-0 items-center justify-center rounded-full transition-colors duration-200 motion-reduce:transition-none"
const TILE_CHECK_OFF = "border-input border text-transparent"
const TILE_CHECK_ON = "bg-background text-brand"

const ATTENDEE_BANDS = [
  "1 – 15",
  "16 – 30",
  "31 – 50",
  "51 – 100",
  "More than 100",
] as const

const schema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Enter a valid work email."),
  phone: z.string().min(7, "Enter a valid contact number."),
  company: z.string().min(2, "Which company?"),
  role: z.string().min(2, "Your role or title."),
  program: z.enum(PROGRAMS, { message: "Pick the closest programme." }),
  attendees: z.enum(ATTENDEE_BANDS, { message: "Roughly how many people?" }),
  targetDate: z.string().min(2, "Even a rough month helps us hold a date."),
  venue: z.string().min(2, "Where would this run?"),
  context: z.string().optional(),
  consent: z.literal(true, { message: "You need to agree to continue." }),
  alsoInterested: z.array(z.enum(SPEC_TITLES)).optional(),
})

type FormValues = z.infer<typeof schema>

const STEPS: { title: string; fields: (keyof FormValues)[] }[] = [
  { title: "Your details", fields: ["fullName", "email", "phone"] },
  { title: "Your company", fields: ["company", "role"] },
  {
    title: "Your programme",
    fields: ["program", "alsoInterested", "attendees", "targetDate", "venue"],
  },
  { title: "Confirm", fields: ["consent"] },
]

export function CorporateInquiryForm() {
  const router = useRouter()
  const reduce = useReducedMotionSafe()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const paneRef = useRef<HTMLDivElement>(null)

  // Date capture has two modes. Most inquiries have a real date or a bracket in
  // mind, so the calendar is the default; "Not fixed yet" falls back to free
  // text for "sometime in Q1" or "after the audit finishes", which a date input
  // physically cannot express. Either way the schema field stays one string —
  // the picker composes into it — so nothing downstream has to branch.
  const [dateMode, setDateMode] = useState<"pick" | "text">("pick")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const formRef = useRef<HTMLFormElement>(null)
  const [prefilled, setPrefilled] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { alsoInterested: [] },
  })

  const primary = watch("program")
  const also = watch("alsoInterested") ?? []

  const toggleAlso = (title: string) => {
    setValue(
      "alsoInterested",
      also.includes(title) ? also.filter((t) => t !== title) : [...also, title],
      { shouldDirty: true }
    )
  }

  /** Finds the specialization for a carousel key and prefills the programme
   *  select. Unknown keys are ignored silently — a stale or hand-edited URL
   *  must not error, it just leaves the form as-is. */
  const applyProgram = (key: string, focus: boolean) => {
    const spec = CORPORATE_PROGRAMMES.find((s) => s.key === key)
    if (!spec) return
    setValue("program", spec.title as FormValues["program"], {
      shouldValidate: false,
      shouldDirty: true,
    })
    const current = getValues("alsoInterested") ?? []
    if (current.includes(spec.title)) {
      setValue(
        "alsoInterested",
        current.filter((t) => t !== spec.title),
        { shouldDirty: true }
      )
    }
    setPrefilled(spec.title)
    if (focus) {
      requestAnimationFrame(() =>
        formRef.current?.focus({ preventScroll: true })
      )
    }
  }

  // Deep link: `/corporate-training?program=<key>#inquiry`.
  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get("program")
    if (key) applyProgram(key, false)
    // Only ever read on mount — the event handler below covers later changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Second entry point: a click on an Inquire button already on this page,
  // which may not change the URL if the visitor picked the same programme
  // twice, or is already on this page.
  useEffect(() => {
    const onInquire = (e: Event) => {
      const key = (e as CustomEvent<{ key?: unknown }>).detail?.key
      if (typeof key === "string") applyProgram(key, true)
    }
    window.addEventListener(PROGRAM_INQUIRE_EVENT, onInquire)
    return () => window.removeEventListener(PROGRAM_INQUIRE_EVENT, onInquire)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cold-load landing correction (2026-09-24) — see the file doc-comment.
  // The browser's native `#inquiry` fragment jump fires before layout has
  // settled, so it lands short. Re-land ourselves once both settle signals
  // `ScrollRefresh` uses (webfonts ready, window load) have fired — unless
  // the visitor has already started scrolling by hand, which we treat as
  // "let them be".
  useEffect(() => {
    if (window.location.hash !== "#inquiry") return

    let interacted = false
    const markInteracted = () => {
      interacted = true
    }
    const interactionEvents = [
      "wheel",
      "touchstart",
      "keydown",
      "pointerdown",
    ] as const
    interactionEvents.forEach((type) =>
      window.addEventListener(type, markInteracted, { passive: true })
    )

    let settled = false
    let frame = 0
    const land = () => {
      if (settled || interacted) return
      settled = true
      const target = document.getElementById("inquiry")
      if (!target) return
      if (reduce) target.scrollIntoView({ block: "start", behavior: "instant" })
      else smoothScrollToElement(target)
    }
    const queueLand = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(land)
    }

    let fontsReady = !document.fonts
    let pageLoaded = document.readyState === "complete"
    const tryLand = () => {
      if (fontsReady && pageLoaded) queueLand()
    }
    document.fonts?.ready.then(() => {
      fontsReady = true
      tryLand()
    })
    const onLoad = () => {
      pageLoaded = true
      tryLand()
    }
    if (pageLoaded) tryLand()
    else window.addEventListener("load", onLoad)

    // Catch-all for late shifts the two signals above miss (lazy sections
    // expanding, a marquee measuring itself) — same reasoning as
    // `ScrollRefresh`.
    const ro = new ResizeObserver(tryLand)
    ro.observe(document.body)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("load", onLoad)
      interactionEvents.forEach((type) =>
        window.removeEventListener(type, markInteracted)
      )
      ro.disconnect()
    }
  }, [reduce])

  // The primary programme can never also be an extra.
  useEffect(() => {
    const current = getValues("alsoInterested") ?? []
    if (primary && current.includes(primary)) {
      setValue(
        "alsoInterested",
        current.filter((t) => t !== primary),
        { shouldDirty: true }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primary])

  // If the visitor changes the select away from the prefilled programme by
  // hand, the confirmation line is no longer accurate — drop it.
  useEffect(() => {
    if (prefilled && primary !== prefilled) setPrefilled(null)
  }, [primary, prefilled])

  /**
   * Demo shortcut — see `_components/demo-fill.tsx`. The date picker keeps its
   * own local state alongside the form value, so the sample fill has to set
   * both or the inputs would render empty while the review step showed a date.
   */
  const fillSample = () => {
    const from = "2026-11-10"
    const to = "2026-11-12"
    setDateMode("pick")
    setDateFrom(from)
    setDateTo(to)
    reset({
      fullName: "Maria Santos",
      email: "maria.santos@acme.com.ph",
      phone: "0917 555 0132",
      company: "Acme Manufacturing",
      role: "Head of Learning & Development",
      program: CORPORATE_PROGRAMMES[0].title as FormValues["program"],
      attendees: "16 – 30",
      targetDate: composeDateRange(from, to),
      venue: "Our head office in Cebu City",
      context:
        "New supervisors promoted from the floor this year — we need them leading, not just scheduling.",
      consent: true,
      alsoInterested: [CORPORATE_PROGRAMMES[3].title],
    })
  }

  const applyPickedDates = (from: string, to: string) => {
    setValue("targetDate", composeDateRange(from, to), {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const switchDateMode = (mode: "pick" | "text") => {
    setDateMode(mode)
    // Clear the other mode's value so a stale entry can't be submitted.
    if (mode === "text") {
      setDateFrom("")
      setDateTo("")
      setValue("targetDate", "", { shouldDirty: true })
    } else {
      setValue("targetDate", "", { shouldDirty: true })
    }
  }

  useGSAP(
    () => {
      const el = paneRef.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          el,
          { opacity: 0, x: 24 },
          { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
        )
      })
      return () => mm.revert()
    },
    { dependencies: [step], scope: paneRef }
  )

  const next = async () => {
    const ok = await trigger(STEPS[step].fields)
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const onSubmit = (v: FormValues) => {
    setSubmitting(true)
    saveHandoff({
      kind: "corporate",
      fullName: v.fullName,
      email: v.email,
      company: v.company,
      program: v.program,
      attendees: v.attendees,
      targetDate: v.targetDate,
      venue: v.venue,
      alsoInterested: v.alsoInterested ?? [],
    })
    router.push("/corporate-training/inquiry-received")
  }

  const current = STEPS[step]

  return (
    <form
      ref={formRef}
      tabIndex={-1}
      onSubmit={handleSubmit(onSubmit)}
      className="bg-background text-foreground rounded-xl p-6 shadow-2xl outline-none sm:p-10"
    >
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= step ? "bg-brand" : "bg-border"
            )}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs tracking-[0.1em] uppercase">
          Step {step + 1} of {STEPS.length} · {current.title}
        </p>
        <DemoFillButton onFill={fillSample} />
      </div>
      {prefilled && step < 2 && (
        <p className="text-muted-foreground mt-3 text-sm">
          Enquiring about{" "}
          <span className="text-foreground font-medium">{prefilled}</span> — you
          can change this on step 3.
        </p>
      )}

      <div ref={paneRef} className="mt-6 space-y-5">
        {step === 0 && (
          <>
            <Field label="Full name" error={errors.fullName?.message}>
              <Input
                className="h-12 text-base"
                autoComplete="name"
                {...register("fullName")}
              />
            </Field>
            <Field label="Work email" error={errors.email?.message}>
              <Input
                type="email"
                className="h-12 text-base"
                autoComplete="email"
                {...register("email")}
              />
            </Field>
            <Field label="Contact number" error={errors.phone?.message}>
              <Input
                type="tel"
                className="h-12 text-base"
                autoComplete="tel"
                placeholder="0917 000 0000"
                {...register("phone")}
              />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Company" error={errors.company?.message}>
              <Input className="h-12 text-base" {...register("company")} />
            </Field>
            <Field label="Your role" error={errors.role?.message}>
              <Input
                className="h-12 text-base"
                placeholder="e.g. Head of L&D"
                {...register("role")}
              />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Preferred programme" error={errors.program?.message}>
              <SelectField defaultValue="" {...register("program")}>
                <option value="" disabled>
                  Select a programme
                </option>
                {PROGRAMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </SelectField>
            </Field>
            <fieldset className="space-y-1.5">
              <legend className="text-sm leading-none font-medium">
                Also interested in (optional)
              </legend>
              <p
                id="also-interested-help"
                className="text-muted-foreground mt-2 mb-3 text-xs"
              >
                Tick any others you&rsquo;d like the proposal to cover.
              </p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {CORPORATE_PROGRAMMES.filter((p) => p.title !== primary).map(
                  (p) => {
                    const on = also.includes(p.title)
                    const Icon = p.icon
                    return (
                      <label
                        key={p.key}
                        className={cn(TILE_BASE, on ? TILE_ON : TILE_OFF)}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={on}
                          onChange={() => toggleAlso(p.title)}
                          aria-describedby="also-interested-help"
                        />
                        <span
                          className={cn(
                            TILE_ICON_BASE,
                            on ? TILE_ICON_ON : TILE_ICON_OFF
                          )}
                        >
                          <Icon className="size-[1.125rem]" aria-hidden />
                        </span>
                        <span className="flex-1 leading-snug">{p.title}</span>
                        <span
                          aria-hidden
                          className={cn(
                            TILE_CHECK_BASE,
                            on ? TILE_CHECK_ON : TILE_CHECK_OFF
                          )}
                        >
                          <Check className="size-3.5" strokeWidth={3} />
                        </span>
                      </label>
                    )
                  }
                )}
              </div>
            </fieldset>
            <Field
              label="Number of attendees"
              error={errors.attendees?.message}
            >
              <SelectField defaultValue="" {...register("attendees")}>
                <option value="" disabled>
                  Select a range
                </option>
                {ATTENDEE_BANDS.map((a) => (
                  <option key={a} value={a}>
                    {a} people
                  </option>
                ))}
              </SelectField>
            </Field>
            <Field label="Possible date" error={errors.targetDate?.message}>
              <Tabs
                value={dateMode}
                onValueChange={(v) => switchDateMode(v as "pick" | "text")}
                className="mb-3"
              >
                <TabsList>
                  <TabsTrigger value="pick">Pick dates</TabsTrigger>
                  <TabsTrigger value="text">Not fixed yet</TabsTrigger>
                </TabsList>
              </Tabs>

              {dateMode === "pick" ? (
                <>
                  {/* Leave `to` blank for a single day; fill it for a range. */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <span className="text-muted-foreground mb-1.5 block text-xs">
                        From
                      </span>
                      <Input
                        type="date"
                        className="h-12 text-base"
                        value={dateFrom}
                        min={todayIso()}
                        onChange={(e) => {
                          setDateFrom(e.target.value)
                          applyPickedDates(e.target.value, dateTo)
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground mb-1.5 block text-xs">
                        To{" "}
                        <span className="text-muted-foreground/70">
                          (optional)
                        </span>
                      </span>
                      <Input
                        type="date"
                        className="h-12 text-base"
                        value={dateTo}
                        min={dateFrom || todayIso()}
                        onChange={(e) => {
                          setDateTo(e.target.value)
                          applyPickedDates(dateFrom, e.target.value)
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs">
                    One date for a single session, or add an end date for a
                    range.
                  </p>
                </>
              ) : (
                <Input
                  className="h-12 text-base"
                  placeholder="e.g. Second week of November, or Q1 2027"
                  {...register("targetDate")}
                />
              )}
            </Field>
            <Field label="Possible venue" error={errors.venue?.message}>
              <Input
                className="h-12 text-base"
                placeholder="e.g. Our Cebu office, or a hotel you arrange"
                {...register("venue")}
              />
            </Field>
            <Field
              label="Anything else we should know? (optional)"
              error={errors.context?.message}
            >
              <Textarea
                rows={3}
                className="text-base"
                placeholder="What prompted this, what good would look like…"
                {...register("context")}
              />
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <dl className="bg-muted/40 space-y-2 rounded-sm p-4 text-sm">
              <Row k="Name" v={getValues("fullName") || "—"} />
              <Row k="Email" v={getValues("email") || "—"} />
              <Row k="Company" v={getValues("company") || "—"} />
              <Row k="Role" v={getValues("role") || "—"} />
              <Row k="Programme" v={getValues("program") || "—"} />
              <Row
                k="Also interested in"
                v={(getValues("alsoInterested") ?? []).join(", ") || "—"}
              />
              <Row k="Attendees" v={getValues("attendees") || "—"} />
              <Row k="Target date" v={getValues("targetDate") || "—"} />
              <Row k="Venue" v={getValues("venue") || "—"} />
            </dl>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="accent-brand mt-1 size-4"
                {...register("consent")}
              />
              <span className="text-muted-foreground text-sm leading-relaxed">
                I agree to Maximum Impact PH collecting and processing the
                information above to respond to this inquiry, in line with the
                Philippine Data Privacy Act.
              </span>
            </label>
            {errors.consent?.message && (
              <p className="text-destructive text-sm">
                {errors.consent.message}
              </p>
            )}
          </>
        )}
      </div>

      {/* The "call us instead" line shares the action row and sits opposite the
          primary button, so the alternative to filling the form is offered at
          the exact moment someone is deciding whether to continue with it.
          Back and Continue group together on the right; the row wraps on narrow
          widths, putting the phone line above the buttons rather than crushing
          both. The sentence is one text node so the flex `gap` can't open a
          space in front of the number. */}
      <div className="mt-8 flex flex-wrap-reverse items-center justify-between gap-x-6 gap-y-4">
        <p className="text-muted-foreground/70 flex items-center gap-2 text-xs">
          <Phone className="size-3.5 shrink-0" />
          <span>
            Rather talk it through? Call or text{" "}
            <a
              href="tel:+639209007709"
              className="hover:text-foreground font-medium whitespace-nowrap underline"
            >
              0920 900 7709
            </a>
          </span>
        </p>

        <div className="ml-auto flex items-center gap-2">
          {step > 0 && (
            <Button type="button" variant="ghost" onClick={back}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
          )}
          {/* Distinct `key`s so React can't reuse this <button> DOM node
              across branches — see the identical comment in the workshop
              form's registration-form.tsx for the failure mode this avoids. */}
          {step < STEPS.length - 1 ? (
            <Button key="continue" type="button" variant="brand" onClick={next}>
              Continue
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              key="submit"
              type="submit"
              variant="brand"
              disabled={submitting}
            >
              {submitting ? "Sending…" : "Send inquiry"}
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}

/** `YYYY-MM-DD` for today, so the pickers can't offer a date in the past. */
function todayIso() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/**
 * Turns the two `<input type="date">` values into the single human-readable
 * string the rest of the flow carries (review step, handoff, confirmation page).
 *
 * Formats from the raw `YYYY-MM-DD` parts rather than `new Date(iso)` — that
 * parses as UTC midnight, which renders as the *previous* day for anyone west
 * of Greenwich, and this is a Philippine audience picking Philippine dates.
 */
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

function formatIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return ""
  return `${d} ${MONTHS[m - 1]} ${y}`
}

function composeDateRange(from: string, to: string) {
  const a = from ? formatIso(from) : ""
  const b = to ? formatIso(to) : ""
  if (a && b && a !== b) return `${a} – ${b}`
  return a || b || ""
}

/** Native select styled to match `Input` — same treatment as the workshop form. */
const SelectField = ({
  children,
  ...props
}: React.ComponentPropsWithRef<"select">) => (
  <div className="relative">
    <select
      className="border-input bg-background focus-visible:ring-ring h-12 w-full appearance-none rounded-md border py-3 pr-10 pl-3 text-base shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
  </div>
)

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-foreground text-right font-medium">{v}</dd>
    </div>
  )
}
