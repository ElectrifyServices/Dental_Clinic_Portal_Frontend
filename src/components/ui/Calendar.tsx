import type { ChangeEvent } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DayPickerProps, type DropdownProps } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "./Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select"

export type CalendarProps = DayPickerProps

// Swap react-day-picker's native <select> dropdown for the app's own Select,
// so month/year navigation looks like the rest of the UI instead of the browser's native list.
function CalendarDropdown({ options, value, onChange, disabled, "aria-label": ariaLabel }: DropdownProps) {
  const selected = options?.find((o) => String(o.value) === String(value))
  return (
    <Select
      value={value !== undefined ? String(value) : undefined}
      onValueChange={(val) => onChange?.({ target: { value: val } } as ChangeEvent<HTMLSelectElement>)}
      disabled={disabled}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className="h-8 w-auto gap-1 rounded-md border-none bg-transparent px-2 py-1 text-sm font-semibold text-foreground shadow-none hover:bg-muted focus:ring-0 [&>svg]:size-3.5 [&>svg]:opacity-60"
      >
        <SelectValue>{selected?.label}</SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {options?.map((o) => (
          <SelectItem key={o.value} value={String(o.value)} disabled={o.disabled}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Dropdown nav needs explicit bounds — react-day-picker's own default range
// (100 years back, but only to the END OF THE CURRENT YEAR) would make
// next-year appointment/due dates unreachable, so default further out.
const currentYear = new Date().getFullYear()
const DEFAULT_START_MONTH = new Date(currentYear - 100, 0, 1)
const DEFAULT_END_MONTH = new Date(currentYear + 10, 11, 31)

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown",
  startMonth = DEFAULT_START_MONTH,
  endMonth = DEFAULT_END_MONTH,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      startMonth={startMonth}
      endMonth={endMonth}
      className={cn("p-1", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-3",
        month_caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-semibold text-foreground",
        dropdowns: "flex items-center gap-1.5",
        nav: "flex items-center justify-between absolute inset-x-0 top-0.5 z-10",
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "size-7 bg-transparent p-0 text-muted-foreground hover:text-foreground"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "size-7 bg-transparent p-0 text-muted-foreground hover:text-foreground"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-9 font-semibold text-[11px] uppercase tracking-wide",
        week: "flex w-full mt-1",
        day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button: cn(
          "size-9 rounded-md p-0 font-medium text-foreground transition-colors duration-150",
          "hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:border-primary"
        ),
        selected: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:shadow-sm",
        today: "[&>button]:border [&>button]:border-primary/50 [&>button]:font-bold",
        outside: "[&>button]:text-muted-foreground/40",
        disabled: "[&>button]:text-muted-foreground/30 [&>button]:line-through [&>button]:hover:bg-transparent [&>button]:cursor-not-allowed",
        range_start: "[&>button]:bg-primary [&>button]:text-primary-foreground",
        range_middle: "[&>button]:bg-primary/10 [&>button]:text-foreground [&>button]:rounded-none",
        range_end: "[&>button]:bg-primary [&>button]:text-primary-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Dropdown: CalendarDropdown,
        Chevron: ({ orientation, ...rest }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" {...rest} />
          ) : (
            <ChevronRight className="size-4" {...rest} />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
