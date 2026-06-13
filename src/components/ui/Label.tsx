import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  // Replace muted/blurred classes to make the label highlighted
  const highlightedClassName = className
    ? className
        .replace(/\btext-muted-foreground\b/g, "text-slate-800 dark:text-slate-200 font-semibold")
        .replace(/\btext-gray-\d+\b/g, "text-slate-800 dark:text-slate-200 font-semibold")
    : className;

  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        "text-sm font-semibold text-slate-800 dark:text-slate-200 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        highlightedClassName
      )}
      {...props}
    />
  );
})
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
