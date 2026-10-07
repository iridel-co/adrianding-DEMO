"use client"

import { useId, type ReactNode } from "react"
import { Label } from "@/components/ui/label"

export type FormControlProps = {
  id: string
  "aria-invalid": boolean
  "aria-describedby"?: string
}

export function FormField({
  label,
  error,
  describedBy,
  children,
}: {
  label: string
  error?: string
  describedBy?: string
  children: (control: FormControlProps) => ReactNode
}) {
  const id = useId()
  const errorId = `${id}-error`
  const description =
    [describedBy, error ? errorId : undefined].filter(Boolean).join(" ") ||
    undefined
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": description,
      })}
      {error && (
        <p id={errorId} className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  )
}
