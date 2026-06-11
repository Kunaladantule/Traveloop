// components/ui/popover.tsx
"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────
// 🎈 Popover Root + Trigger
// ─────────────────────────────────────────────────────────────
function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

// ─────────────────────────────────────────────────────────────
// 📦 Popover Content (Light Theme Card + Smooth Animation)
// ─────────────────────────────────────────────────────────────
function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 8,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="z-50 outline-none"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            // Light theme card
            "w-72 rounded-xl bg-white border border-slate-200 shadow-lg shadow-slate-200/50 p-4",
            
            // Smooth animation
            "transition-all duration-200",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            
            // Scrollable if content overflows
            "max-h-[var(--radix-popover-content-available-height)] overflow-y-auto",
            
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

// ─────────────────────────────────────────────────────────────
// 📋 Popover Header
// ─────────────────────────────────────────────────────────────
function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn(
        "flex flex-col gap-1.5 pb-3 border-b border-slate-100",
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 🏷️ Popover Title (Clash Display + Larger)
// ─────────────────────────────────────────────────────────────
function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn(
        "font-heading font-bold text-base text-slate-900 leading-snug",
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 📝 Popover Description (Inter + Readable)
// ─────────────────────────────────────────────────────────────
function PopoverDescription({
  className,
  ...props
}: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn(
        "font-sans text-sm text-slate-600 leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}