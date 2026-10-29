"use client"

import { focusInvalidStep } from "@/app/_lib/focus-invalid-step"
import { FormErrorToast } from "@/app/_components/form-error-toast"

import { useEffect, useId, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import type { IntakeConfig } from "@/lib/intake"
import { useIntake } from "@/app/_lib/use-intake"
import { Turnstile } from "@/app/_components/turnstile"
import { saveReceipt } from "@/app/_lib/handoff"
import { useInquiryLanding } from "./use-inquiry-landing"
import { InquiryScheduleFields } from "./inquiry-schedule-fields"
import { CorporateInquiryReview } from "./inquiry-review"
import {
  PROGRAM_INQUIRE_EVENT,
  type ProgramInquiryDetail,
} from "@/app/_lib/program-inquiry"
import { useForm, type FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  UNSURE_PROGRAM,
  ATTENDEE_BANDS,
  createSchema,
  STEPS,
  type FormValues,
} from "./inquiry-model"
import { FormField as Field } from "@/app/_components/form-field"
import { useStepNavigation } from "@/app/_lib/use-step-navigation"
import { InquiryActions } from "./inquiry-actions"
import { gsap, useGSAP } from "@/app/_lib/gsap"
import { smoothScrollToElement } from "@/app/_lib/smooth-scroll-to"
import { Input } from "@/components/ui/input"
import { composeDateRange } from "./inquiry-dates"
import type { PublicProgram } from "@/lib/public-content"
import {
  corporateInquiryDates,
  corporateInquiryDatesSchema,
  corporateInquiryAnswersSchema,
} from "@/lib/corporate-inquiry"
import { cn } from "@/lib/utils"

export function CorporateInquiryForm({
  programs,
  phone,
  email,
  intake,
}: {
  programs: Pick<PublicProgram, "slug" | "title">[]
  phone: string
  email?: string
  intake: IntakeConfig
}) {
  const consentId = useId()
  const [hydrated, setHydrated] = useState(false)
  const router = useRouter()
  const { submit, submitting, locked, error, answers } = useIntake(
    "corporate",
    intake,
    "corporate"
  )
  const [token, setToken] = useState<string | null>(null)
  const [resetKey, setResetKey] = useState(0)
  const websiteRef = useRef<HTMLInputElement>(null)
  const lockedRef = useRef(locked)
  lockedRef.current = locked
  const {
    step: navigationStep,
    pending,
    next: advance,
    back,
    goTo,
  } = useStepNavigation(STEPS.length, submitting)
  const step = locked && answers ? STEPS.length - 1 : navigationStep
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
  // physically cannot express. Preserve raw picked dates for the portal payload;
  // the composed string is only for review and confirmation.
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
    setError,
    setFocus,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createSchema(programs)),
    mode: "onTouched",
    defaultValues: { alsoInterested: [] },
  })

  const primary = watch("program")
  const also = watch("alsoInterested") ?? []

  useEffect(() => {
    const recovered = corporateInquiryAnswersSchema.safeParse(answers)
    if (!recovered.success) return
    const saved = recovered.data
    const from = saved.targetDateFrom ?? ""
    const to = saved.targetDateTo ?? ""
    setDateMode(saved.targetDateText ? "text" : "pick")
    setDateFrom(from)
    setDateTo(to)
    reset({
      ...saved,
      attendees: ATTENDEE_BANDS.find((band) => band === saved.attendees),
      program:
        programs.find((item) => item.title === saved.program)?.slug ??
        UNSURE_PROGRAM,
      alsoInterested: saved.alsoInterested.flatMap((title) => {
        const item = programs.find((program) => program.title === title)
        return item ? [item.slug] : []
      }),
      targetDate: saved.targetDateText || composeDateRange(from, to),
    })
  }, [answers, programs, reset])

  const toggleAlso = (title: string) => {
    setValue(
      "alsoInterested",
      also.includes(title) ? also.filter((t) => t !== title) : [...also, title],
      { shouldDirty: true }
    )
  }

  const applyProgram = (key: string, focus: boolean) => {
    if (lockedRef.current) return
    const spec = programs.find((s) => s.slug === key)
    if (!spec) return
    setValue("program", spec.slug, {
      shouldValidate: false,
      shouldDirty: true,
    })
    const current = getValues("alsoInterested") ?? []
    if (current.includes(spec.slug)) {
      setValue(
        "alsoInterested",
        current.filter((t) => t !== spec.slug),
        { shouldDirty: true }
      )
    }
    setPrefilled(spec.slug)
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

  const selectedDates = () =>
    dateMode === "pick"
      ? { mode: "pick" as const, from: dateFrom, to: dateTo }
      : { mode: "text" as const, text: getValues("targetDate") }

  const next = () =>
    advance(async (captured) => {
      if (!(await trigger(STEPS[captured].fields, { shouldFocus: true })))
        return false
      if (captured === 2) {
        const dates = corporateInquiryDatesSchema.safeParse(
          corporateInquiryDates(selectedDates())
        )
        if (!dates.success) {
          setError(
            "targetDate",
            { message: dates.error.issues[0].message },
            { shouldFocus: true }
          )
          return false
        }
      }
      return true
    })

  const onInvalid = (fieldErrors: FieldErrors<FormValues>) =>
    focusInvalidStep(fieldErrors, STEPS, goTo, setFocus)

  const onSubmit = async (values: FormValues) => {
    if (!intake.enabled) {
      setError("root", {
        message:
          "Online inquiries are currently unavailable. Please contact the team directly.",
      })
      return
    }
    if ((intake.turnstileEnabled && !token) || submitting) return
    const {
      targetDate: _targetDate,
      program,
      alsoInterested,
      ...fields
    } = values
    const payload = corporateInquiryAnswersSchema.safeParse(
      (locked ? answers : null) ?? {
        ...fields,
        program:
          programs.find((item) => item.slug === program)?.title ??
          (program === UNSURE_PROGRAM ? UNSURE_PROGRAM : ""),
        alsoInterested: (alsoInterested ?? []).flatMap((slug) => {
          const match = programs.find((item) => item.slug === slug)
          return match ? [match.title] : []
        }),
        ...corporateInquiryDates(selectedDates()),
      }
    )
    if (!payload.success) {
      const invalid: FieldErrors<FormValues> = {}
      for (const issue of payload.error.issues) {
        const name = String(issue.path[0])
        const field = (
          name.startsWith("targetDate") ? "targetDate" : name
        ) as keyof FormValues
        if (!STEPS.some((item) => item.fields.includes(field))) continue
        const error = { type: "validate", message: issue.message }
        invalid[field] = error
        setError(field, error)
      }
      onInvalid(invalid)
      return
    }
    try {
      const result = await submit(
        (locked ? answers : null) ?? payload.data,
        token ?? "",
        websiteRef.current?.value ?? ""
      )
      if (!result?.accepted) return
      const saved = corporateInquiryAnswersSchema.parse(
        (locked ? answers : null) ?? payload.data
      )
      saveReceipt({
        kind: "corporate",
        accepted: true,
        result: { accepted: true },
        fullName: saved.fullName,
        email: saved.email,
        company: saved.company,
        program: saved.program,
        attendees: saved.attendees,
        venue: saved.venue,
        targetDate:
          saved.targetDateText ||
          composeDateRange(
            saved.targetDateFrom ?? "",
            saved.targetDateTo ?? ""
          ),
        alsoInterested: saved.alsoInterested,
      })
      router.push("/corporate-training/inquiry-received")
    } finally {
      setToken(null)
      setResetKey((key) => key + 1)
    }
  }

  const current = STEPS[step]

  return (
    <form
      inert={!hydrated}
      aria-busy={!hydrated}
      ref={formRef}
      tabIndex={-1}
      onSubmit={(event) => {
        if (locked && answers) {
          event.preventDefault()
          void onSubmit(getValues())
        } else {
          void handleSubmit(onSubmit, onInvalid)(event)
        }
      }}
      className="bg-background text-foreground rounded-xl p-6 shadow-2xl outline-none sm:p-10"
    >
      {!intake.enabled && (
        <p className="text-muted-foreground mb-5 text-sm" role="status">
          Online inquiries are currently unavailable. Please contact the team
          directly.
          {email && (
            <>
              {" "}
              <a href={`mailto:${email}`} className="underline">
                Email the team
              </a>
              .
            </>
          )}
        </p>
      )}
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
      </div>
      {prefilled && step < 2 && (
        <p className="text-muted-foreground mt-3 text-sm">
          Enquiring about{" "}
          <span className="text-foreground font-medium">
            {programs.find((program) => program.slug === prefilled)?.title}
          </span>{" "}
          — you can change this on step 3.
        </p>
      )}

      {step < 3 && (
        <p className="text-muted-foreground mt-4 text-xs">
          Fields are required unless marked optional.
        </p>
      )}
      <div ref={paneRef} inert={locked} className="mt-6 space-y-5">
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
          <InquiryScheduleFields
            control={control}
            register={register}
            programs={programs}
            errors={errors}
            primary={primary}
            also={also}
            toggleAlso={toggleAlso}
            dateMode={dateMode}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onModeChange={switchDateMode}
            onDatesChange={(from, to) => {
              setDateFrom(from)
              setDateTo(to)
              applyPickedDates(from, to)
            }}
          />
        )}
        {step === 3 && (
          <>
            <CorporateInquiryReview
              values={() => {
                const saved = corporateInquiryAnswersSchema.safeParse(
                  locked ? answers : null
                )
                if (saved.success) {
                  return {
                    ...saved.data,
                    targetDate:
                      saved.data.targetDateText ||
                      composeDateRange(
                        saved.data.targetDateFrom ?? "",
                        saved.data.targetDateTo ?? ""
                      ),
                  }
                }
                const values = getValues()
                return {
                  ...values,
                  program:
                    programs.find((program) => program.slug === values.program)
                      ?.title ?? values.program,
                  alsoInterested: values.alsoInterested?.map(
                    (slug) =>
                      programs.find((program) => program.slug === slug)
                        ?.title ?? slug
                  ),
                }
              }}
            />
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
      <input
        ref={websiteRef}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      {step === 3 && intake.enabled && intake.turnstileEnabled && (
        <Turnstile
          siteKey={intake.siteKey}
          action="corporate-inquiry"
          onToken={setToken}
          resetKey={resetKey}
        />
      )}
      <FormErrorToast message={error || errors.root?.message} />
      <InquiryActions
        phone={phone}
        step={step}
        pending={pending}
        submitting={submitting}
        locked={locked}
        next={() => {
          void next()
        }}
        back={back}
        canSubmit={Boolean(
          intake.enabled && (!intake.turnstileEnabled || token)
        )}
      />
    </form>
  )
}
