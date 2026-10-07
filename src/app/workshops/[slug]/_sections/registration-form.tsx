"use client"

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
} from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, ArrowRight, ChevronDown, Phone, Check } from "lucide-react"
import { gsap, useGSAP } from "@/app/_lib/gsap"
import { saveHandoff } from "@/app/_lib/handoff"
import { DemoFillButton } from "@/app/_components/demo-fill"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { WorkshopAvailability } from "@/lib/workshop-availability"
import { cn } from "@/lib/utils"

/**
 * Workshop registration — multi-step, progressive disclosure (PRD UX direction).
 * Frontend only: nothing is sent anywhere.
 *
 * On submit this hands the entered details to `sessionStorage` and routes to
 * `/workshops/<slug>/registered`. It deliberately does NOT show an in-dialog
 * "done" state any more: the dialog is uncontrolled, so closing it threw the
 * confirmation away, and the client's whole point was that a submission has to
 * land somewhere that keeps selling (payment urgency, primer, what to expect).
 */

const SALARY_RANGES = [
  "Under ₱30,000",
  "₱30,000 – ₱50,000",
  "₱50,000 – ₱80,000",
  "₱80,000 – ₱120,000",
  "Over ₱120,000",
  "Prefer not to say",
] as const

const schema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().min(7, "Enter a valid mobile number."),
  occupation: z.string().min(2, "Tell us what you do."),
  salaryRange: z.enum(SALARY_RANGES, {
    message: "Select a range.",
  }),
  city: z.string().optional(),
  consent: z.literal(true, {
    message: "You need to agree to continue.",
  }),
})

type FormValues = z.infer<typeof schema>

const STEPS: { title: string; fields: (keyof FormValues)[] }[] = [
  { title: "Who's registering", fields: ["fullName", "email", "phone"] },
  { title: "About you", fields: ["occupation", "salaryRange", "city"] },
  { title: "Confirm", fields: ["consent"] },
]

type Props = {
  slug: string
  workshopTitle: string
  schedule: string
  venue: string
  availability: WorkshopAvailability
}

export function RegistrationForm({
  slug,
  workshopTitle,
  schedule,
  venue,
  availability,
}: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const paneRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  })

  const consent = watch("consent") === true
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
    headingRef.current
      ?.closest("[role=dialog]")
      ?.scrollTo({ top: 0, behavior: "instant" })
  }, [step])

  /**
   * Demo shortcut — see `_components/demo-fill.tsx`. `reset()` writes every
   * field at once and clears any errors already on screen, so the form lands in
   * a clean valid state rather than a half-touched one. The step is left where
   * it is: the multi-step reveal is part of what the client is reviewing, and
   * skipping to the end would hide it.
   */
  const fillSample = () => {
    reset({
      fullName: "Juan Dela Cruz",
      email: "juan.delacruz@email.com",
      phone: "0917 555 0148",
      occupation: "Insurance advisor",
      salaryRange: "₱50,000 – ₱80,000",
      city: "Cebu City",
      consent: true,
    })
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
    if (!availability.canRegister) return
    setSubmitting(true)
    saveHandoff({
      kind: "workshop",
      slug,
      fullName: v.fullName,
      email: v.email,
      phone: v.phone,
    })
    router.push(`/workshops/${slug}/registered`)
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
        <DemoFillButton onFill={fillSample} />
      </div>

      {step < 2 && (
        <p className="text-muted-foreground mt-4 text-xs">
          Fields are required unless marked optional.
        </p>
      )}
      <div ref={paneRef} className="mt-10 space-y-5">
        {step === 0 && (
          <>
            <Field label="Full name" error={errors.fullName?.message}>
              <Input
                className="placeholder:text-muted-foreground/50 h-12 text-base"
                autoComplete="name"
                placeholder="Juan Dela Cruz"
                {...register("fullName")}
              />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <Input
                type="email"
                className="placeholder:text-muted-foreground/50 h-12 text-base"
                autoComplete="email"
                placeholder="juan@email.com"
                {...register("email")}
              />
            </Field>
            <Field label="Mobile number" error={errors.phone?.message}>
              <Input
                type="tel"
                className="placeholder:text-muted-foreground/50 h-12 text-base"
                autoComplete="tel"
                placeholder="0917 000 0000"
                {...register("phone")}
              />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Occupation / role" error={errors.occupation?.message}>
              <Input
                className="placeholder:text-muted-foreground/50 h-12 text-base"
                placeholder="e.g. Insurance advisor"
                {...register("occupation")}
              />
            </Field>
            <Field label="Salary range" error={errors.salaryRange?.message}>
              <div className="relative">
                <select
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
            </Field>
            <Field label="City (optional)" error={errors.city?.message}>
              <Input
                className="placeholder:text-muted-foreground/50 h-12 text-base"
                autoComplete="address-level2"
                placeholder="Cebu City"
                {...register("city")}
              />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <dl className="bg-muted/40 grid grid-cols-1 gap-x-4 gap-y-2 rounded-sm p-4 text-sm sm:grid-cols-[auto_1fr]">
              <Row k="Workshop" v={workshopTitle} />
              <Row k="Schedule" v={schedule} />
              <Row k="Venue" v={venue} />
              <Row k="Name" v={getValues("fullName") || "—"} />
              <Row k="Email" v={getValues("email") || "—"} />
            </dl>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
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
              aria-live="polite"
              className="text-destructive -mt-3 min-h-5 text-sm"
            >
              {errors.consent?.message}
            </p>
          </>
        )}
      </div>

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
            Rather ask first? Call or text{" "}
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
              className="min-w-0 flex-1 sm:flex-none"
              type="button"
              variant="ghost"
              onClick={back}
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
              validation resolves fast (confirmed via the demo-fill button,
              whose data is valid immediately) and is a real risk for a fast
              real click too, not just automation. */}
          {step < STEPS.length - 1 ? (
            <Button
              className="min-w-0 flex-1 sm:flex-none"
              key="continue"
              type="button"
              variant="brand"
              onClick={next}
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
              disabled={submitting || !consent || !availability.canRegister}
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

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  const id = useId()
  const control = isValidElement<HTMLAttributes<HTMLElement>>(children)
    ? cloneElement(children, { "aria-labelledby": id })
    : children
  return (
    <div className="min-w-0 space-y-1.5">
      <Label id={id}>{label}</Label>
      {control}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-muted-foreground sm:text-right">{k}</dt>
      <dd className="text-foreground min-w-0 text-left font-medium [overflow-wrap:anywhere]">
        {v}
      </dd>
    </>
  )
}
