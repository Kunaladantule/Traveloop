// components/ui/input.tsx
import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────
// 📝 Input Component (Light Theme + Larger + Accessible)
// ─────────────────────────────────────────────────────────────
function Input({ 
  className, 
  type = "text", 
  size = "default",
  ...props 
}: Omit<React.ComponentProps<"input">, "size"> & {
  size?: "sm" | "default" | "lg"
}) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      data-size={size}
      className={cn(
        // Base: flex, full width, rounded, transition
        "flex w-full min-w-0 rounded-xl border bg-white transition-all duration-200 outline-none",
        
        // Light theme colors
        "border-slate-300 text-slate-900 placeholder:text-slate-400",
        "hover:border-slate-400",
        
        // Focus state: indigo ring + border
        "focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        
        // Disabled state
        "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200",
        
        // Error state (via aria-invalid)
        "aria-invalid:border-red-400 aria-invalid:ring-2 aria-invalid:ring-red-200 aria-invalid:focus-visible:ring-red-300",
        
        // File input styling
        "file:inline-flex file:h-full file:border-0 file:bg-transparent file:px-3 file:text-sm file:font-medium file:text-slate-700 file:hover:text-slate-900",
        
        // Size variants (larger defaults)
        "h-11 px-4 text-base",
        "data-[size=sm]:h-9 data-[size=sm]:px-3 data-[size=sm]:text-sm",
        "data-[size=lg]:h-12 data-[size=lg]:px-5 data-[size=lg]:text-lg",
        
        className
      )}
      {...props}
    />
  )
}

export { Input }