// components/ui/textarea.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────
// 📝 Textarea Component (Light Theme + Larger + Resizable)
// ─────────────────────────────────────────────────────────────
function Textarea({ 
  className, 
  size = "default",
  ...props 
}: React.ComponentProps<"textarea"> & {
  size?: "sm" | "default" | "lg"
}) {
  return (
    <textarea
      data-slot="textarea"
      data-size={size}
      className={cn(
        // Base: flex, full width, rounded, transition, font-sans
        "flex w-full min-h-20 rounded-xl border bg-white px-4 py-3 text-base font-sans transition-all duration-200 outline-none resize-y",
        
        // Light theme colors
        "border-slate-300 text-slate-900 placeholder:text-slate-400",
        "hover:border-slate-400",
        
        // Focus state: indigo ring + border
        "focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        
        // Disabled state
        "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200",
        
        // Error state
        "aria-invalid:border-red-400 aria-invalid:ring-2 aria-invalid:ring-red-200 aria-invalid:focus-visible:ring-red-300",
        
        // Size variants
        "data-[size=sm]:min-h-16 data-[size=sm]:p-3 data-[size=sm]:text-sm",
        "data-[size=lg]:min-h-32 data-[size=lg]:p-4 data-[size=lg]:text-lg",
        
        className
      )}
      {...props}
    />
  )
}

export { Textarea }