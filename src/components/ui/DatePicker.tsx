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
  startMonth?: Date
  endMonth?: Date
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
  ({ value, onChange, placeholder = "Select date", disabled, min, max, className, name, id, captionLayout, startMonth, endMonth }, ref) => {
    const [open, setOpen] = React.useState(false)
    const selected = parseDateString(value)
    const minDate = parseDateString(min)
    const maxDate = parseDateString(max)

    const calStartMonth = React.useMemo(() => {
      if (startMonth) return startMonth
      if (!minDate) return undefined
      if (selected && selected < minDate) {
        return new Date(selected.getFullYear(), selected.getMonth(), 1)
      }
      return new Date(minDate.getFullYear(), minDate.getMonth(), 1)
    }, [startMonth, minDate, selected])

    const calEndMonth = React.useMemo(() => {
      if (endMonth) return endMonth
      if (!maxDate) return undefined
      if (selected && selected > maxDate) {
        return new Date(selected.getFullYear(), selected.getMonth(), 1)
      }
      return new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
    }, [endMonth, maxDate, selected])

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
            defaultMonth={selected || (minDate && (!selected || selected < minDate) ? minDate : undefined)}
            startMonth={calStartMonth}
            endMonth={calEndMonth}
            onSelect={(date) => {
              if (date) {
                onChange?.(toDateString(date))
                setOpen(false)
              } else {
                onChange?.("")
              }
            }}
            disabled={(date) => {
              const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
              if (minDate) {
                const minD = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()).getTime()
                if (d < minD) return true
              }
              if (maxDate) {
                const maxD = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()).getTime()
                if (d > maxD) return true
              }
              return false
            }}
          />
          {selected && (
            <div className="pt-2 mt-1 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onChange?.("")
                  setOpen(false)
                }}
                className="text-xs text-muted-foreground hover:text-foreground font-medium px-2 py-1 rounded hover:bg-muted transition-colors"
              >
                Clear date
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    )
  }
)
DatePicker.displayName = "DatePicker"

export { DatePicker }
