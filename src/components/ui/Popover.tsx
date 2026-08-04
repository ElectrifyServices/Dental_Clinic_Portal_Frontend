import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & { usePortal?: boolean }
>(({ className, align = "center", sideOffset = 4, usePortal = true, children, ...props }, ref) => {
  const content = (
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-xl border border-border/70 bg-card/95 backdrop-blur-lg p-4 text-foreground shadow-xl outline-none",
        className
      )}
      {...props}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.2, bounce: 0.1 }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </PopoverPrimitive.Content>
  );

  return usePortal ? <PopoverPrimitive.Portal>{content}</PopoverPrimitive.Portal> : content;
})
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
