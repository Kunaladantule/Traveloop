// components/ui/checkbox.tsx
"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

// ─────────────────────────────────────────────────────────────
// ☑️ Checkbox Component (Light Theme + Larger)
// ─────────────────────────────────────────────────────────────
function Checkbox({ 
  className, 
  size = "default",
  ...props 
}: CheckboxPrimitive.Root.Props & {
  size?: "sm" | "default" | "lg"
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-size={size}
      className={cn(
        // Base: flex center, rounded, border
        "peer relative flex shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200",
        
        // Light theme colors
        "bg-white border-slate-300 hover:border-indigo-400",
        
        // Checked state: indigo bg + white check
        "data-[checked=true]:bg-indigo-600 data-[checked=true]:border-indigo-600 data-[checked=true]:hover:bg-indigo-500",
        
        // Focus: accessible ring
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        
        // Disabled: faded
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-300",
        
        // Size variants (larger defaults)
        "size-5",
        "data-[size=sm]:size-4",
        "data-[size=lg]:size-6",
        
        // Check icon sizing
        "[&>svg]:text-white [&>svg]:transition-transform [&>svg]:duration-200",
        "data-[size=sm]:[&>svg]:size-3",
        "data-[size=default]:[&>svg]:size-4",
        "data-[size=lg]:[&>svg]:size-5",
        
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center"
      >
        <Check className="stroke-[3] data-[checked=false]:scale-0 data-[checked=true]:scale-100 transition-transform" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }