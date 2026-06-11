// components/ui/calendar.tsx
"use client"

import * as React from "react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"

// ─────────────────────────────────────────────────────────────
// 🗓️ Calendar Component (Light Theme + Larger Text)
// ─────────────────────────────────────────────────────────────
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        // Light theme base
        "bg-white p-4 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50",
        "w-full max-w-md",
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-full", defaultClassNames.root),
        months: cn("flex flex-col gap-6", defaultClassNames.months),
        month: cn("flex flex-col gap-4", defaultClassNames.month),
        
        // Navigation
        nav: cn("flex items-center justify-between gap-2 mb-2", defaultClassNames.nav),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant, size: "icon" }),
          "h-9 w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant, size: "icon" }),
          "h-9 w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100",
          defaultClassNames.button_next
        ),
        
        // Caption (Month/Year selector)
        month_caption: cn("flex items-center justify-center", defaultClassNames.month_caption),
        caption_label: cn(
          "font-heading font-bold text-lg text-slate-900",
          (captionLayout as string) === "dropdowns" && "flex items-center gap-2",
          defaultClassNames.caption_label
        ),
        dropdowns: cn("flex items-center gap-2", defaultClassNames.dropdowns),
        
        // Weekdays header
        weekdays: cn("grid grid-cols-7 gap-1 mb-2", defaultClassNames.weekdays),
        weekday: cn(
          "text-center text-sm font-semibold text-slate-500 uppercase tracking-wide",
          defaultClassNames.weekday
        ),
        
        // Days grid
        week: cn("grid grid-cols-7 gap-1", defaultClassNames.week),
        day: cn(
          // Base day cell
          "relative p-0 text-center group",
          // Larger, readable text
          "[&>button]:text-base [&>button]:font-medium",
          // Hover state
          "[&>button]:hover:bg-indigo-50 [&>button]:hover:text-indigo-700",
          // Focus state
          "[&>button]:focus-visible:ring-2 [&>button]:focus-visible:ring-indigo-500 [&>button]:focus-visible:ring-offset-2",
          defaultClassNames.day
        ),
        
        // Selected date
        selected: cn(
          "[&>button]:bg-indigo-600 [&>button]:text-white [&>button]:hover:bg-indigo-500 [&>button]:hover:text-white",
          defaultClassNames.selected
        ),
        
        // Today indicator
        today: cn(
          "[&>button]:relative [&>button]:after:absolute [&>button]:after:bottom-1 [&>button]:after:left-1/2 [&>button]:after:-translate-x-1/2 [&>button]:after:w-1.5 [&>button]:after:h-1.5 [&>button]:after:rounded-full [&>button]:after:bg-indigo-600",
          defaultClassNames.today
        ),
        
        // Outside month days (faded)
        outside: cn(
          "[&>button]:text-slate-400 [&>button]:hover:text-slate-400",
          defaultClassNames.outside
        ),
        
        // Disabled days
        disabled: cn(
          "[&>button]:text-slate-300 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent",
          defaultClassNames.disabled
        ),
        
        // Range selection
        range_start: cn(
          "[&>button]:rounded-l-xl [&>button]:bg-indigo-100 [&>button]:text-indigo-900",
          defaultClassNames.range_start
        ),
        range_end: cn(
          "[&>button]:rounded-r-xl [&>button]:bg-indigo-100 [&>button]:text-indigo-900",
          defaultClassNames.range_end
        ),
        range_middle: cn(
          "[&>button]:rounded-none [&>button]:bg-indigo-50 [&>button]:text-indigo-900",
          defaultClassNames.range_middle
        ),
        
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => (
          <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />
        ),
        Chevron: ({ className, orientation, ...props }) => {
          const Icon = orientation === "left" ? ChevronLeft : orientation === "right" ? ChevronRight : ChevronDown
          return <Icon className={cn("h-4 w-4", className)} {...props} />
        },
        DayButton: (props) => <CalendarDayButton {...props} />,
        ...components,
      }}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 🎯 Calendar Day Button (Enhanced)
// ─────────────────────────────────────────────────────────────
function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const ref = React.useRef<HTMLButtonElement>(null)
  
  // Auto-focus selected/focused day
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected={modifiers.selected}
      data-today={modifiers.today}
      className={cn(
        // Base: square, full width, centered
        "relative w-full aspect-square flex items-center justify-center rounded-xl",
        
        // Text: larger, readable
        "text-base font-medium text-slate-700",
        
        // Hover: subtle background
        "hover:bg-slate-100 hover:text-slate-900",
        
        // Selected: prominent indigo
        "data-[selected=true]:bg-indigo-600 data-[selected=true]:text-white data-[selected=true]:hover:bg-indigo-500",
        
        // Today: indicator dot
        "data-[today=true]:after:absolute data-[today=true]:after:bottom-1.5 data-[today=true]:after:left-1/2 data-[today=true]:after:-translate-x-1/2 data-[today=true]:after:w-2 data-[today=true]:after:h-2 data-[today=true]:after:rounded-full data-[today=true]:after:bg-indigo-600 data-[selected=true]:after:hidden",
        
        // Disabled: faded
        "data-[disabled=true]:text-slate-300 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:hover:bg-transparent",
        
        className
      )}
      {...props}
    >
      {day.date.getDate()}
    </Button>
  )
}

export { Calendar, CalendarDayButton }