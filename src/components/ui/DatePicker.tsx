import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Calendar, type CalendarProps } from "./Calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./Popover"
import { cn } from "@/lib/utils"

export interface DatePickerProps {
  /** Date value as "yyyy-MM-dd", matching native <input type="date"> format. */
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  /** Earliest selectable date, as "yyyy-MM-dd". */
  min?: string
  /** Latest selectable date, as "yyyy-MM-dd". */
  max?: string
  className?: string
  name?: string
  id?: string
  /**
   * "dropdown" swaps the month/year caption for select dropdowns — use for
   * long-range pickers like date of birth where paging month-by-month is impractical.
   */
  captionLayout?: CalendarProps["captionLayout"]
}

function parseDateString(value?: string): Date | undefined {
  if (!value) return undefined
  const [y, m, d] = value.split("-").map(Number)
  if (!y || !m || !d) return undefined
  return new Date(y, m - 1, d)
}

function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function formatDisplay(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  ({ value, onChange, placeholder = "Select date", disabled, min, max, className, name, id, captionLayout }, ref) => {
    const [open, setOpen] = React.useState(false)
    const selected = parseDateString(value)
    const minDate = parseDateString(min)
    const maxDate = parseDateString(max)

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            id={id}
            name={name}
            disabled={disabled}
            className={cn(
              "flex h-12 w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground",
              "hover:border-border/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200 ease-out",
              !selected && "text-muted-foreground",
              className,
            )}
          >
            <span className="truncate">{selected ? formatDisplay(selected) : placeholder}</span>
            <CalendarIcon className="w-4 h-4 text-muted-foreground/60 shrink-0 ml-2" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <Calendar
            mode="single"
            captionLayout={captionLayout}
            selected={selected}
            defaultMonth={selected}
            onSelect={(date) => {
              if (date) {
                onChange?.(toDateString(date))
                setOpen(false)
              }
            }}
            disabled={(date) => {
              if (minDate && date < minDate) return true
              if (maxDate && date > maxDate) return true
              return false
            }}
          />
        </PopoverContent>
      </Popover>
    )
  }
)
DatePicker.displayName = "DatePicker"

export { DatePicker }
