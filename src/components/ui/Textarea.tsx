import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoCapitalizeWords?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onChange, autoCapitalizeWords, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      let val = e.target.value;
      if (!props.disabled && !props.readOnly && autoCapitalizeWords !== false) {
        const nameLower = (props.name || "").toLowerCase();
        const placeholderLower = (props.placeholder || "").toLowerCase();
        const isSearch = nameLower.includes("search") || placeholderLower.includes("search");
        const isEmail = nameLower.includes("email");
        
        if (!isSearch && !isEmail) {
          val = val.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
          e.target.value = val;
        }
      }
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <textarea
        onChange={handleChange}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
