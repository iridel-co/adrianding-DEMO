"use client"

import { forwardRef, useState, type ComponentPropsWithoutRef } from "react"
import { CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

type Props = Omit<ComponentPropsWithoutRef<"button">, "value" | "onChange"> & {
  value: string
  min: string
  onChange: (value: string) => void
}

export const DatePicker = forwardRef<HTMLButtonElement, Props>(
  function DatePicker({ value, min, onChange, className, ...props }, ref) {
    const [open, setOpen] = useState(false)
    const selected = value ? parseDate(value) : undefined
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            {...props}
            ref={ref}
            type="button"
            variant="outline"
            className={cn(
              "hover:text-foreground aria-invalid:border-destructive h-12 w-full justify-between rounded-md px-3 text-left text-base font-normal before:hidden hover:translate-y-0 hover:shadow-sm",
              !value && "text-muted-foreground",
              className
            )}
          >
            {selected
              ? selected.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Pick a date"}
            <CalendarDays aria-hidden className="size-4 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          aria-label="Choose a date"
          align="start"
          collisionPadding={12}
          className="z-[110] w-auto p-0"
        >
          <Calendar
            mode="single"
            required
            selected={selected}
            defaultMonth={selected ?? parseDate(min)}
            disabled={{ before: parseDate(min) }}
            autoFocus
            onSelect={(date) => {
              if (!date) return
              const pad = (part: number) => String(part).padStart(2, "0")
              onChange(
                `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
              )
              setOpen(false)
            }}
          />
          {value && (
            <div className="border-t p-2">
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  onChange("")
                  setOpen(false)
                }}
              >
                Clear date
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    )
  }
)
