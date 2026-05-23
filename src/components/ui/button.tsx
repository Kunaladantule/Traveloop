// components/ui/button.tsx
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────
// 🎨 Button Variants (Light Theme Optimized)
// ─────────────────────────────────────────────────────────────
const buttonVariants = cva(
  // Base styles: flex center, rounded, transition, accessible focus
  "group/button inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: Indigo gradient for main actions
        default: 
          "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-200/50 hover:shadow-lg hover:shadow-indigo-300/50 active:scale-[0.98]",
        
        // Outline: Strong contrast outline buttons
        outline: 
          "bg-white border-2 border-slate-300 text-slate-950 hover:border-slate-400 hover:bg-slate-100",
        
        // Secondary: Soft but readable neutral actions
        secondary: 
          "bg-slate-100 text-slate-950 hover:bg-slate-200 hover:text-slate-950",
        
        // Ghost: Minimal tertiary actions with better legibility
        ghost: 
          "bg-transparent text-slate-950 hover:bg-slate-100 hover:text-slate-950",
        
        // Destructive: Red for dangerous actions
        destructive: 
          "bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-200/50 hover:shadow-lg",
        
        // Link: Text-only for navigation
        link: 
          "text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline bg-transparent p-0 h-auto",
      },
      size: {
        // Default: Balanced for most use cases
        default: "h-11 px-5 text-base",
        
        // XS: Compact for dense interfaces
        xs: "h-8 px-3 text-sm rounded-lg [&_svg]:size-3.5",
        
        // SM: Small for toolbars
        sm: "h-9 px-4 text-sm rounded-lg [&_svg]:size-4",
        
        // LG: Prominent for CTAs
        lg: "h-12 px-6 text-lg rounded-xl [&_svg]:size-5",
        
        // Icon: Square for icon-only buttons
        icon: "size-11 rounded-xl",
        
        "icon-xs": "size-8 rounded-lg [&_svg]:size-3.5",
        "icon-sm": "size-9 rounded-lg [&_svg]:size-4",
        "icon-lg": "size-12 rounded-xl [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// ─────────────────────────────────────────────────────────────
// 🚀 Button Component
// ─────────────────────────────────────────────────────────────
function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }