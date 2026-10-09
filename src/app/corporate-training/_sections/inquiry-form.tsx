"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useInquiryLanding } from "./use-inquiry-landing"
import { AlsoInterested } from "./also-interested"
import { CorporateInquiryReview } from "./inquiry-review"
import {
  PROGRAM_INQUIRE_EVENT,
  type ProgramInquiryDetail,
} from "@/app/_lib/program-inquiry"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  PROGRAMS,
  ATTENDEE_BANDS,
  schema,
  STEPS,
  type FormValues,
} from "./inquiry-model"
import { FormField as Field } from "@/app/_components/form-field"
import { useStepNavigation } from "@/app/_lib/use-step-navigation"
import { ArrowLeft, ArrowRight, ChevronDown, Phone } from "lucide-react"
import { gsap, useGSAP } from "@/app/_lib/gsap"
import { saveHandoff } from "@/app/_lib/handoff"
import { smoothScrollToElement } from "@/app/_lib/smooth-scroll-to"
import { DemoFillButton } from "@/app/_components/demo-fill"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InquiryDatePicker } from "./inquiry-date-picker"
import { composeDateRange } from "./inquiry-dates"
import { Textarea } from "@/components/ui/textarea"
import { CORPORATE_PROGRAMMES } from "@/lib/specializations"
import { cn } from "@/lib/utils"

/** Progressive inquiry keeps one RHF owner and a string date handoff.
 * Programme URL/event prefill survives reload and repeated carousel activation.
 * Hash landing waits for settled layout unless the visitor has interacted.
 */

export function CorporateInquiryForm() {
  const router = useRouter()
  const consentId = useId()
  const [hydrated, setHydrated] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const {
    step,
    pending,
    next: advance,
    back,
  } = useStepNavigation(STEPS.length, submitting)
  const paneRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const previousStep = useRef(step)

  useEffect(() => {
    if (previousStep.current === step) return
    previousStep.current = step
    const heading = headingRef.current
    if (!heading) return
    heading.focus({ preventScroll: true })
    return smoothScrollToElement(heading)
  }, [step])

  useEffect(() => setHydrated(true), [])

  // Date capture has two modes. Most inquiries have a real date or a bracket in
  // mind, so the calendar is the default; "Not fixed yet" falls back to free
  // text for "sometime in Q1" or "after the audit finishes", which a date input
  // physically cannot express. Either way the schema field stays one string —
  // the picker composes into it — so nothing downstream has to branch.
  const [dateMode, setDateMode] = useState<"pick" | "text">("pick")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const formRef = useRef<HTMLFormElement>(null)
  const prefillFocusFrame = useRef(0)
  useEffect(() => () => cancelAnimationFrame(prefillFocusFrame.current), [])
  const [prefilled, setPrefilled] = useState<string | null>(null)

  const {
    register,
    control,
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
      cancelAnimationFrame(prefillFocusFrame.current)
      prefillFocusFrame.current = requestAnimationFrame(() =>
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
      const key = (e as CustomEvent<ProgramInquiryDetail>).detail?.key
      if (typeof key === "string") applyProgram(key, true)
    }
    window.addEventListener(PROGRAM_INQUIRE_EVENT, onInquire)
    return () => window.removeEventListener(PROGRAM_INQUIRE_EVENT, onInquire)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useInquiryLanding()

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

  const next = () =>
    advance((captured) =>
      trigger(STEPS[captured].fields, { shouldFocus: true })
    )

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
      inert={!hydrated}
      aria-busy={!hydrated}
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
        <h3
          ref={headingRef}
          tabIndex={-1}
          className="text-muted-foreground scroll-mt-28 text-xs tracking-[0.1em] uppercase outline-none"
        >
          Step {step + 1} of {STEPS.length} · {current.title}
        </h3>
        <DemoFillButton onFill={fillSample} />
      </div>
      {prefilled && step < 2 && (
        <p className="text-muted-foreground mt-3 text-sm">
          Enquiring about{" "}
          <span className="text-foreground font-medium">{prefilled}</span> — you
          can change this on step 3.
        </p>
      )}

      {step < 3 && (
        <p className="text-muted-foreground mt-4 text-xs">
          Fields are required unless marked optional.
        </p>
      )}
      <div ref={paneRef} className="mt-6 space-y-5">
        {step === 0 && (
          <>
            <Field label="Full name" error={errors.fullName?.message}>
              {(control) => (
                <Input
                  {...control}
                  className="h-12 text-base"
                  autoComplete="name"
                  {...register("fullName")}
                />
              )}
            </Field>
            <Field label="Work email" error={errors.email?.message}>
              {(control) => (
                <Input
                  {...control}
                  type="email"
                  className="h-12 text-base"
                  autoComplete="email"
                  {...register("email")}
                />
              )}
            </Field>
            <Field label="Contact number" error={errors.phone?.message}>
              {(control) => (
                <Input
                  {...control}
                  type="tel"
                  className="h-12 text-base"
                  autoComplete="tel"
                  placeholder="0917 000 0000"
                  {...register("phone")}
                />
              )}
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Company" error={errors.company?.message}>
              {(control) => (
                <Input
                  {...control}
                  className="h-12 text-base"
                  {...register("company")}
                />
              )}
            </Field>
            <Field label="Your role" error={errors.role?.message}>
              {(control) => (
                <Input
                  {...control}
                  className="h-12 text-base"
                  placeholder="e.g. Head of L&D"
                  {...register("role")}
                />
              )}
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Preferred programme" error={errors.program?.message}>
              {(control) => (
                <SelectField
                  {...control}
                  defaultValue=""
                  {...register("program")}
                >
                  <option value="" disabled>
                    Select a programme
                  </option>
                  {PROGRAMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </SelectField>
              )}
            </Field>
            <AlsoInterested
              primary={primary}
              selected={also}
              onToggle={toggleAlso}
            />
            <Field
              label="Number of attendees"
              error={errors.attendees?.message}
            >
              {(control) => (
                <SelectField
                  {...control}
                  defaultValue=""
                  {...register("attendees")}
                >
                  <option value="" disabled>
                    Select a range
                  </option>
                  {ATTENDEE_BANDS.map((a) => (
                    <option key={a} value={a}>
                      {a} people
                    </option>
                  ))}
                </SelectField>
              )}
            </Field>
            <Controller
              name="targetDate"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <InquiryDatePicker
                  dateMode={dateMode}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  onModeChange={switchDateMode}
                  onDatesChange={(from, to) => {
                    setDateFrom(from)
                    setDateTo(to)
                    applyPickedDates(from, to)
                  }}
                  textControl={field}
                  error={errors.targetDate?.message}
                />
              )}
            />
            <Field label="Possible venue" error={errors.venue?.message}>
              {(control) => (
                <Input
                  {...control}
                  className="h-12 text-base"
                  placeholder="e.g. Our Cebu office, or a hotel you arrange"
                  {...register("venue")}
                />
              )}
            </Field>
            <Field
              label="Anything else we should know? (optional)"
              error={errors.context?.message}
            >
              {(control) => (
                <Textarea
                  {...control}
                  rows={3}
                  className="text-base"
                  placeholder="What prompted this, what good would look like…"
                  {...register("context")}
                />
              )}
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <CorporateInquiryReview values={getValues} />
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                id={consentId}
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={
                  errors.consent ? `${consentId}-error` : undefined
                }
                className="accent-brand mt-1 size-4 shrink-0"
                {...register("consent")}
              />
              <span className="text-muted-foreground text-sm leading-relaxed">
                I agree to Maximum Impact PH collecting and processing the
                information above to respond to this inquiry, in line with the
                Philippine Data Privacy Act.
              </span>
            </label>
            <p
              id={`${consentId}-error`}
              aria-live="polite"
              className="text-destructive min-h-5 text-sm"
            >
              {errors.consent?.message}
            </p>
          </>
        )}
      </div>

      <div className="mt-8 flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:flex-wrap-reverse sm:items-center sm:justify-between sm:gap-x-6">
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

        <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
          {step > 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={back}
              disabled={pending || submitting}
              className="min-w-0 flex-1 sm:flex-none"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          )}
          {/* Distinct `key`s so React can't reuse this <button> DOM node
              across branches — see the identical comment in the workshop
              form's registration-form.tsx for the failure mode this avoids. */}
          {step < STEPS.length - 1 ? (
            <Button
              key="continue"
              type="button"
              variant="brand"
              onClick={(event) => {
                if (event.detail < 2) void next()
              }}
              disabled={pending || submitting}
              aria-busy={pending}
              className="min-w-0 flex-1 sm:flex-none"
            >
              Continue
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              key="submit"
              type="submit"
              variant="brand"
              disabled={pending || submitting}
              className="min-w-0 flex-1 sm:flex-none"
            >
              {submitting ? "Sending…" : "Send inquiry"}
            </Button>
          )}
        </div>
      </div>
    </form>
  )
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
