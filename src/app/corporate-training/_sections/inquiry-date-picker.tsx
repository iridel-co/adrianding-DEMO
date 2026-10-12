"use client"
import { useId } from "react"
import type { ControllerRenderProps } from "react-hook-form"
import type { FormValues } from "./inquiry-model"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { todayIso } from "./inquiry-dates"
export function InquiryDatePicker({
  dateMode,
  dateFrom,
  dateTo,
  onModeChange,
  onDatesChange,
  textControl,
  error,
}: {
  dateMode: "pick" | "text"
  dateFrom: string
  dateTo: string
  onModeChange: (mode: "pick" | "text") => void
  onDatesChange: (from: string, to: string) => void
  textControl: ControllerRenderProps<FormValues, "targetDate">
  error?: string
}) {
  const id = useId()
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-sm leading-none font-medium">
        Possible date
      </legend>
      <Tabs
        value={dateMode}
        onValueChange={(v) => onModeChange(v as "pick" | "text")}
        className="mb-3"
      >
        <TabsList className="grid w-full grid-cols-2 sm:inline-flex sm:w-auto">
          <TabsTrigger value="pick">Pick dates</TabsTrigger>
          <TabsTrigger value="text">Not fixed yet</TabsTrigger>
        </TabsList>
      </Tabs>

      {dateMode === "pick" ? (
        <>
          {/* Leave `to` blank for a single day; fill it for a range. */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`${id}-from`}
                className="text-muted-foreground mb-1.5 block text-xs"
              >
                From
              </label>
              <Input
                type="date"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                className="h-12 text-base"
                ref={textControl.ref}
                name={textControl.name}
                onBlur={textControl.onBlur}
                id={`${id}-from`}
                value={dateFrom}
                min={todayIso()}
                onChange={(e) => {
                  onDatesChange(e.target.value, dateTo)
                }}
              />
            </div>
            <div>
              <label
                htmlFor={`${id}-to`}
                className="text-muted-foreground mb-1.5 block text-xs"
              >
                To <span className="text-muted-foreground/70">(optional)</span>
              </label>
              <Input
                type="date"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                className="h-12 text-base"
                id={`${id}-to`}
                value={dateTo}
                min={dateFrom || todayIso()}
                onChange={(e) => {
                  onDatesChange(dateFrom, e.target.value)
                }}
              />
            </div>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            One date for a single session, or add an end date for a range.
          </p>
        </>
      ) : (
        <Input
          id={`${id}-text`}
          aria-label="Possible date"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-12 text-base"
          placeholder="e.g. Second week of November, or Q1 2027"
          {...textControl}
        />
      )}
      {error && (
        <p id={`${id}-error`} className="text-destructive text-sm">
          {error}
        </p>
      )}
    </fieldset>
  )
}
