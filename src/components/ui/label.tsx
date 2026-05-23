// components/ui/label.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────
// 🏷️ Label Component (Larger + Accessible + Light Theme)
// ─────────────────────────────────────────────────────────────
function Label({ 
  className, 
  required = false,
  ...props 
}: React.ComponentProps<"label"> & {
  required?: boolean
}) {
  return (
    <label
      data-slot="label"
      className={cn(
        // Base: flex, gap for icon/required indicator
        "flex items-center gap-1.5",
        
        // Typography: larger, readable, bold
        "text-sm font-semibold text-slate-700",
        
        // Cursor for clickable labels
        "cursor-default",
        
        // Disabled state
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        
        // Required indicator styling
        "[&>[data-required]]:text-red-500 [&>[data-required]]:font-bold",
        
        className
      )}
      {...props}
    >
      {props.children}
      {required && (
        <span 
          data-required 
          className="text-red-500 font-bold"
          aria-label="required"
        >
          *
        </span>
      )}
    </label>
  )
}

export { Label }