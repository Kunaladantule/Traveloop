// components/ui/skeleton.tsx
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────
// 💀 Skeleton Loader (Light Theme + Smooth Animation)
// ─────────────────────────────────────────────────────────────
function Skeleton({ 
  className, 
  variant = "default",
  ...props 
}: React.ComponentProps<"div"> & {
  variant?: "default" | "circle" | "text"
}) {
  return (
    <div
      data-slot="skeleton"
      data-variant={variant}
      className={cn(
        // Base: animate pulse, rounded
        "animate-pulse rounded-lg",
        
        // Light theme background gradient for shimmer effect
        "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100",
        "bg-[length:200%_100%]",
        "animate-[shimmer_1.5s_ease-in-out_infinite]",
        
        // Variant: circle for avatars
        "data-[variant=circle]:rounded-full",
        
        // Variant: text lines
        "data-[variant=text]:h-4 data-[variant=text]:w-full data-[variant=text]:max-w-[200px]",
        
        // Default size
        "h-4 w-full",
        
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 🎨 Add shimmer keyframes to globals.css (if not present)
// ─────────────────────────────────────────────────────────────
// @keyframes shimmer {
//   0% { background-position: -200% 0; }
//   100% { background-position: 200% 0; }
// }

export { Skeleton }