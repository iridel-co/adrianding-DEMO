"use client"

import type { ComponentPropsWithRef } from "react"
import {
  Controller,
  type UseFormReturn,
  type FieldErrors,
} from "react-hook-form"
import { ChevronDown } from "lucide-react"
import type { PublicProgram } from "@/lib/public-content"
import { FormField as Field } from "@/app/_components/form-field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlsoInterested } from "./also-interested"
import { InquiryDatePicker } from "./inquiry-date-picker"
import {
  ATTENDEE_BANDS,
  UNSURE_PROGRAM,
  type FormValues,
} from "./inquiry-model"

type Props = Pick<UseFormReturn<FormValues>, "control" | "register"> & {
  programs: PublicProgram[]
  errors: FieldErrors<FormValues>
  primary: string
  also: string[]
  toggleAlso: (slug: string) => void
  dateMode: "pick" | "text"
  dateFrom: string
  dateTo: string
  onModeChange: (mode: "pick" | "text") => void
  onDatesChange: (from: string, to: string) => void
}

export function InquiryScheduleFields({
  control,
  register,
  programs,
  errors,
  primary,
  also,
  toggleAlso,
  dateMode,
  dateFrom,
  dateTo,
  onModeChange,
  onDatesChange,
}: Props) {
  return (
    <>
      <Field label="Preferred programme" error={errors.program?.message}>
        {(control) => (
          <SelectField {...control} defaultValue="" {...register("program")}>
            <option value="" disabled>
              Select a programme
            </option>
            <option value={UNSURE_PROGRAM}>{UNSURE_PROGRAM}</option>
            {programs.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title}
              </option>
            ))}
          </SelectField>
        )}
      </Field>
      <AlsoInterested
        programs={programs}
        primary={primary}
        selected={also}
        onToggle={toggleAlso}
      />
      <Field label="Number of attendees" error={errors.attendees?.message}>
        {(control) => (
          <SelectField {...control} defaultValue="" {...register("attendees")}>
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
            onModeChange={onModeChange}
            onDatesChange={onDatesChange}
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
  )
}

/** Native select styled to match `Input` — same treatment as the workshop form. */
const SelectField = ({
  children,
  ...props
}: ComponentPropsWithRef<"select">) => (
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
