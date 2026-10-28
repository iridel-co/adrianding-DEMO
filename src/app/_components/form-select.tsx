"use client"

import { forwardRef } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FormControlProps } from "./form-field"

type Props = FormControlProps & {
  name: string
  value?: string
  onValueChange: (value: string) => void
  onBlur: () => void
  placeholder: string
  options: { value: string; label: string }[]
  "aria-label"?: string
  disabled?: boolean
}

export const FormSelect = forwardRef<HTMLButtonElement, Props>(
  function FormSelect(
    {
      name,
      value,
      onValueChange,
      onBlur,
      placeholder,
      options,
      disabled,
      ...control
    },
    ref
  ) {
    return (
      <Select
        name={name}
        value={value ?? ""}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          {...control}
          ref={ref}
          onBlur={onBlur}
          className="h-12 text-base [&>span]:min-w-0 [&>span]:truncate"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="z-[110] max-h-[min(20rem,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)]">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="py-2.5 whitespace-normal"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }
)
