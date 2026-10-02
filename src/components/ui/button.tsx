import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button Component
 * @see README.md#design-system (repository-root overview)
 *
 * UDS specs:
 * - Base: rounded-full (pill), text-sm, font-medium, transition-all
 * - Hover: a `::before` layer wipes in from the left (`scale-x-0` ->
 *   `hover:scale-x-100`, `origin-left`) and the label inverts color once
 *   covered — "ghost"/"outline" wipe into a solid fill, filled variants wipe
 *   into their inverted (foreground/background) pair. The button also lifts
 *   (-translate-y-px) and gains shadow — never scales, since scale grows the
 *   box on all sides and clips inside the rounded/overflow-hidden cards
 *   buttons commonly sit in. A lift only needs headroom above, which callers
 *   reliably have.
 * - The wipe needs `relative isolate overflow-hidden` on the button: `isolate`
 *   scopes the pseudo's `-z-10` to this element's own stacking context (so it
 *   never escapes behind page content), `overflow-hidden` clips the sweep to
 *   the pill/circle shape, and plain in-flow label text paints above a
 *   negative-z-index sibling by normal stacking rules — no extra wrapper span
 *   needed to keep the label above the fill.
 * - Active: subtle press (translate back to rest + slight scale-down) for
 *   tactile feedback on click/tap.
 * - Focus: focus-visible:ring-2 focus-visible:ring-ring, offset from the fill
 * - Variants: default, secondary, outline, ghost, link, destructive, brand
 * - Sizes: sm (h-8), default (h-9), lg (h-10), icon (h-9 w-9), icon-sm, icon-lg
 */
const buttonVariants = cva(
  "focus-visible:ring-ring focus-visible:ring-offset-background relative isolate inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full text-sm font-medium whitespace-nowrap transition-[color,box-shadow,transform] duration-300 ease-out before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:transition-transform before:duration-300 before:ease-out before:content-[''] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-0 active:scale-[0.97] active:duration-75 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground before:bg-foreground hover:text-background shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:before:scale-x-100",
        secondary:
          "bg-secondary text-secondary-foreground before:bg-foreground hover:text-background hover:-translate-y-0.5 hover:shadow-sm hover:before:scale-x-100",
        outline:
          "border-input bg-background text-foreground before:bg-foreground hover:border-foreground hover:text-background border hover:-translate-y-0.5 hover:shadow-sm hover:before:scale-x-100",
        ghost:
          "text-foreground before:bg-accent hover:text-accent-foreground hover:before:scale-x-100",
        link: "text-primary underline-offset-4 hover:underline",
        destructive:
          "bg-destructive text-destructive-foreground before:bg-foreground focus-visible:ring-destructive/30 hover:text-background shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:before:scale-x-100",
        brand:
          "bg-brand text-brand-foreground before:bg-foreground shadow-brand/30 hover:text-background hover:shadow-foreground/30 shadow-lg hover:-translate-y-0.5 hover:shadow-xl hover:before:scale-x-100",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-9 px-4",
        lg: "h-10 px-6",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
