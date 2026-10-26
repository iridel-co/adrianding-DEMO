"use client"
import { ArrowLeft, ArrowRight, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { STEPS } from "./inquiry-model"

export function InquiryActions({
  phone,
  step,
  pending,
  submitting,
  locked,
  next,
  back,
  canSubmit,
}: {
  phone: string
  step: number
  pending: boolean
  submitting: boolean
  locked: boolean
  next: () => void
  back: () => void
  canSubmit: boolean
}) {
  return (
    <div className="mt-8 flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:flex-wrap-reverse sm:items-center sm:justify-between sm:gap-x-6">
      {phone && (
        <p className="text-muted-foreground/70 flex items-center gap-2 text-xs">
          <Phone className="size-3.5 shrink-0" />
          <span>
            Rather talk it through? Call or text{" "}
            <a
              href={`tel:${phone}`}
              className="hover:text-foreground font-medium whitespace-nowrap underline"
            >
              {phone}
            </a>
          </span>
        </p>
      )}

      <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
        {step > 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={back}
            disabled={pending || submitting || locked}
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
            disabled={!canSubmit || submitting}
            className="min-w-0 flex-1 sm:flex-none"
          >
            Send inquiry
          </Button>
        )}
      </div>
    </div>
  )
}
