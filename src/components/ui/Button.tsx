import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base — 12px radius (rounded-md → var(--radius-md) = 0.75rem), 40px default height
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-200 ease-out outline-none select-none focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:border-primary active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:shadow-md hover:shadow-primary/15 hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "border-border bg-card text-foreground shadow-sm hover:bg-muted hover:border-border/80 hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:-translate-y-0.5 active:translate-y-0",
        ghost:
          "hover:bg-accent hover:text-primary hover:scale-[1.01] active:scale-[0.98]",
        destructive:
          "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 hover:border-destructive/30 hover:-translate-y-0.5 active:translate-y-0",
        link:
          "text-primary underline-offset-4 hover:underline hover:scale-[1.01]",
      },
      size: {
        default: "h-10 gap-2 px-4",
        xs:      "h-6 gap-1 rounded-sm px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm:      "h-8 gap-1.5 px-3 text-xs",
        lg:      "h-11 gap-2 px-5 text-base",
        icon:    "size-10",
        "icon-xs":"size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":"size-8",
        "icon-lg":"size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & { asChild?: boolean }
>(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      ref={ref}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
