"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useIntake } from "@/app/_lib/use-intake"
import { Turnstile } from "@/app/_components/turnstile"
import { saveReceipt } from "@/app/_lib/handoff"
import { registrationAcceptedSchema } from "@/lib/registration"
import type { IntakeConfig } from "@/lib/intake"
import { RegistrationReview } from "./registration-review"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  SALARY_RANGES,
  schema,
  STEPS,
  type FormValues,
} from "./registration-model"
import { FormField as Field } from "@/app/_components/form-field"
import { useStepNavigation } from "@/app/_lib/use-step-navigation"
import { ArrowLeft, ArrowRight, ChevronDown, Phone, Check } from "lucide-react"
import { gsap, useGSAP } from "@/app/_lib/gsap"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { WorkshopAvailability } from "@/lib/workshop-availability"
import { cn } from "@/lib/utils"

/** Progressive registration hands details to the dedicated confirmation route. */

type Props = {
  slug: string
  price: string
  workshopSessionId?: string
  intake?: IntakeConfig
  workshopTitle: string
  schedule: string
  venue: string
  phone?: string
  availability: WorkshopAvailability
}

export function RegistrationForm({
  slug,
  price,
  workshopSessionId,
  intake,
  workshopTitle,
  schedule,
  venue,
  availability,
  phone,
}: Props) {
  const consentId = useId()
  const router = useRouter()
  const enabled = Boolean(
    intake?.enabled && workshopSessionId && availability.canRegister
  )
  const config: IntakeConfig = {
    origin: intake?.origin ?? "",
    siteKey: intake?.siteKey ?? "",
    enabled,
  }
  const attempt = useIntake("registration", config, workshopSessionId ?? slug)
  const { submitting, locked } = attempt
  const [token, setToken] = useState<string | null>(null)
  const [resetKey, setResetKey] = useState(0)

  const {
    step: navigationStep,
    pending,
    next: advance,
    back,
  } = useStepNavigation(STEPS.length, submitting)
  const step = locked && attempt.answers ? STEPS.length - 1 : navigationStep
  const paneRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const previousStep = useRef(step)

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    reset,
    setError,

    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  })

  useEffect(() => {
    if (previousStep.current === step) return
    previousStep.current = step
    headingRef.current?.focus({ preventScroll: true })
    headingRef.current
      ?.closest("[role=dialog]")
      ?.scrollTo({ top: 0, behavior: "instant" })
  }, [step])

  useEffect(() => {
    if (!attempt.answers) return
    const values = Object.fromEntries(
      Object.entries(attempt.answers).filter(
        ([key]) => key !== "workshopSessionId"
      )
    )
    const recovered = schema.safeParse(values)
    if (recovered.success) reset(recovered.data)
  }, [attempt.answers, reset])

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

  const onSubmit = async (values: FormValues) => {
    if (!enabled || !workshopSessionId) {
      setError("root", {
        message:
          "Online registration is currently unavailable. Please contact the team directly.",
      })
      return
    }
    if (!token || submitting) return
    try {
      const result = await attempt.submit(
        { ...values, workshopSessionId },
        token,
        ""
      )
      const accepted = registrationAcceptedSchema.safeParse(result)
      if (!accepted.success) return
      saveReceipt({
        kind: "workshop",
        accepted: true,
        slug,
        workshopSessionId,
        workshopTitle,
        schedule,
        venue,
        price,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        result: accepted.data,
      })
      router.push(`/workshops/${encodeURIComponent(slug)}/registered`)
    } finally {
      setToken(null)
      setResetKey((value) => value + 1)
    }
  }
  const current = STEPS[step]

  return (
    <form className="min-w-0" onSubmit={handleSubmit(onSubmit)}>
      {/* Progress */}
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
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-muted-foreground text-xs tracking-[0.1em] uppercase outline-none"
        >
          Step {step + 1} of {STEPS.length} · {current.title}
        </h2>
      </div>

      {step < 2 && (
        <p className="text-muted-foreground mt-4 text-xs">
          Fields are required unless marked optional.
        </p>
      )}
      <fieldset
        disabled={locked || submitting}
        className="m-0 min-w-0 border-0 p-0"
      >
        <div ref={paneRef} className="mt-10 space-y-5">
          {step === 0 && (
            <>
              <Field label="Full name" error={errors.fullName?.message}>
                {(control) => (
                  <Input
                    {...control}
                    className="placeholder:text-muted-foreground/50 h-12 text-base"
                    autoComplete="name"
                    placeholder="Juan Dela Cruz"
                    {...register("fullName")}
                  />
                )}
              </Field>
              <Field label="Email" error={errors.email?.message}>
                {(control) => (
                  <Input
                    {...control}
                    type="email"
                    className="placeholder:text-muted-foreground/50 h-12 text-base"
                    autoComplete="email"
                    placeholder="juan@email.com"
                    {...register("email")}
                  />
                )}
              </Field>
              <Field label="Mobile number" error={errors.phone?.message}>
                {(control) => (
                  <Input
                    {...control}
                    type="tel"
                    className="placeholder:text-muted-foreground/50 h-12 text-base"
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
              <Field
                label="Occupation / role"
                error={errors.occupation?.message}
              >
                {(control) => (
                  <Input
                    {...control}
                    className="placeholder:text-muted-foreground/50 h-12 text-base"
                    placeholder="e.g. Insurance advisor"
                    {...register("occupation")}
                  />
                )}
              </Field>
              <Field label="Salary range" error={errors.salaryRange?.message}>
                {(control) => (
                  <div className="relative">
                    <select
                      {...control}
                      aria-label="Salary range (required)"
                      className="border-input bg-background focus-visible:ring-ring h-12 w-full appearance-none rounded-md border py-3 pr-10 pl-3 text-base shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
                      defaultValue=""
                      {...register("salaryRange")}
                    >
                      <option value="" disabled>
                        Select a range
                      </option>
                      {SALARY_RANGES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
                  </div>
                )}
              </Field>
              <Field label="City (optional)" error={errors.city?.message}>
                {(control) => (
                  <Input
                    {...control}
                    className="placeholder:text-muted-foreground/50 h-12 text-base"
                    autoComplete="address-level2"
                    placeholder="Cebu City"
                    {...register("city")}
                  />
                )}
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <RegistrationReview
                values={getValues}
                workshopTitle={workshopTitle}
                schedule={schedule}
                venue={venue}
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
                  information above to manage my workshop registration, in line
                  with the Philippine Data Privacy Act.
                </span>
              </label>
              {/* Reserve error space so checkbox blur cannot move Back during a click. */}
              <p
                id={`${consentId}-error`}
                aria-live="polite"
                className="text-destructive -mt-3 min-h-5 text-sm"
              >
                {errors.consent?.message}
              </p>
            </>
          )}
        </div>
      </fieldset>
      {step === 2 && enabled && intake?.siteKey && (
        <Turnstile
          siteKey={intake.siteKey}
          action="workshop-registration"
          onToken={setToken}
          resetKey={resetKey}
        />
      )}
      {attempt.error && (
        <p role="alert" className="text-destructive mt-6 text-sm">
          {attempt.error}
        </p>
      )}
      {locked && (
        <p className="text-muted-foreground mt-3 text-sm">
          Your submitted answers are kept for a safe retry. Complete
          verification again to retry this attempt.
        </p>
      )}
      {errors.root?.message && (
        <p role="alert" className="text-destructive mt-6 text-sm">
          {errors.root.message}
        </p>
      )}
      {!availability.canRegister && (
        <p role="alert" className="text-destructive mt-6 text-sm">
          {availability.label}. Your entered details have been kept;
          registration cannot be completed for this date.
        </p>
      )}
      {/* Keep the contact alternative separate from full-width mobile actions. */}
      <div className="mt-3 flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:flex-wrap-reverse sm:items-center sm:justify-between sm:gap-x-6">
        <p className="text-muted-foreground/70 flex items-center gap-2 text-xs">
          <Phone className="size-3.5 shrink-0" />
          <span>
            Rather ask first?{" "}
            {phone ? "Call or text " : "See the contact details below."}
            {phone && (
              <a
                href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                className="hover:text-foreground font-medium whitespace-nowrap underline"
              >
                {phone}
              </a>
            )}
          </span>
        </p>

        <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
          {step > 0 && (
            <Button
              className="min-w-0 flex-1 sm:flex-none"
              type="button"
              variant="ghost"
              onClick={back}
              disabled={pending || submitting || locked}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          )}
          {/* Distinct `key`s force React to unmount/remount rather than reuse
              the same <button> DOM node across the two branches. Without them,
              a click that lands right as validation resolves can catch React
              mid-swap: it flips this node's `type` from "button" to "submit"
              between the click's mousedown and mouseup, and the browser
              submits on mouseup even though nothing clicked the submit
              button — the click that was meant to advance one step silently
              fires the final submit instead. Reproduces reliably whenever
              validation resolves fast with already-valid values and is a risk for a fast
              real click too, not just automation. */}
          {step < STEPS.length - 1 ? (
            <Button
              className="min-w-0 flex-1 sm:flex-none"
              key="continue"
              type="button"
              variant="brand"
              onClick={(event) => {
                if (event.detail < 2) void next()
              }}
              disabled={pending || submitting || locked}
              aria-busy={pending}
            >
              Continue
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              className="min-w-0 flex-1 whitespace-nowrap sm:flex-none"
              key="submit"
              type="submit"
              variant="brand"
              disabled={!enabled || !token || submitting}
            >
              {submitting ? "Submitting…" : "Finish"}
              <Check className="size-4 shrink-0" aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
