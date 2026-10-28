"use client"

import {
  Controller,
  type UseFormReturn,
  type FieldErrors,
} from "react-hook-form"
import { FormSelect } from "@/app/_components/form-select"
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
  programs: Pick<PublicProgram, "slug" | "title">[]
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
        {(input) => (
          <Controller
            name="program"
            control={control}
            render={({ field }) => (
              <FormSelect
                {...input}
                ref={field.ref}
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Select a programme"
                options={[
                  { value: UNSURE_PROGRAM, label: UNSURE_PROGRAM },
                  ...programs.map((p) => ({ value: p.slug, label: p.title })),
                ]}
              />
            )}
          />
        )}
      </Field>
      <AlsoInterested
        programs={programs}
        primary={primary}
        selected={also}
        onToggle={toggleAlso}
      />
      <Field label="Number of attendees" error={errors.attendees?.message}>
        {(input) => (
          <Controller
            name="attendees"
            control={control}
            render={({ field }) => (
              <FormSelect
                {...input}
                ref={field.ref}
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Select a range"
                options={ATTENDEE_BANDS.map((value) => ({
                  value,
                  label: value + " people",
                }))}
              />
            )}
          />
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
