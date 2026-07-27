import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  autoCapitalizeWords?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", onChange, autoCapitalizeWords, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      if (type === "text" && !props.disabled && !props.readOnly && autoCapitalizeWords !== false) {
        const nameLower = (props.name || "").toLowerCase();
        const placeholderLower = (props.placeholder || "").toLowerCase();
        const isSearch = nameLower.includes("search") || placeholderLower.includes("search");
        const isEmail = nameLower.includes("email");
        const isPassword = nameLower.includes("password");
        
        if (!isSearch && !isEmail && !isPassword) {
          val = val.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
          e.target.value = val;
        }
      }
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <input
        type={type}
        onChange={handleChange}
        className={cn(
          // 48px height, 12px radius, white bg, clean focus ring
          "flex h-12 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground",
          "placeholder:text-muted-foreground",
          "hover:border-border/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:border-primary",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200 ease-out",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
