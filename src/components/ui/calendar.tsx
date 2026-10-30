"use client"

import { DayPicker } from "react-day-picker"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Calendar({
  className,
  classNames,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays
      className={cn("p-3", className)}
      classNames={{
        months: "relative",
        month_caption:
          "flex h-9 items-center justify-center text-sm font-medium",
        nav: "absolute inset-x-0 top-0 flex justify-between",
        button_previous: cn(buttonVariants({ variant: "ghost", size: "icon" })),
        button_next: cn(buttonVariants({ variant: "ghost", size: "icon" })),
        chevron: "size-4 fill-current",
        month_grid: "mt-2 border-collapse",
        weekdays: "flex",
        weekday: "text-muted-foreground w-9 text-center text-xs font-normal",
        week: "mt-1 flex",
        day: "size-9 p-0 text-center text-sm",
        day_button: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "rounded-md font-normal"
        ),
        selected: "[&>button]:bg-brand [&>button]:text-brand-foreground",
        today: "[&>button]:ring-border [&>button]:ring-1",
        outside: "text-muted-foreground",
        disabled: "opacity-35",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}
