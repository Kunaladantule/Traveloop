// components/ui/card.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────
// 🎴 Card Root (Light Theme + Size Variants)
// ─────────────────────────────────────────────────────────────
function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "sm" | "default" | "lg" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        // Base: white bg, rounded, subtle shadow
        "bg-white rounded-2xl border border-slate-200 shadow-sm shadow-slate-200/50",
        
        // Layout: flex column, gap for content spacing
        "flex flex-col",
        
        // Padding: comfortable spacing
        "p-6",
        "data-[size=sm]:p-4",
        "data-[size=lg]:p-8",
        
        // Content gap
        "gap-4",
        "data-[size=sm]:gap-3",
        
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 📋 Card Header
// ─────────────────────────────────────────────────────────────
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        // Layout: flex column, gap for title/description
        "flex flex-col gap-2",
        
        // Optional: border bottom for separation
        "border-b border-slate-100 pb-4",
        
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 🏷️ Card Title (Clash Display + Larger)
// ─────────────────────────────────────────────────────────────
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        // Font: Clash Display for headings
        "font-heading font-bold text-xl text-slate-900",
        
        // Line height for readability
        "leading-snug",
        
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 📝 Card Description (Inter + Readable)
// ─────────────────────────────────────────────────────────────
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        // Font: Inter for body text
        "font-sans text-base text-slate-600",
        
        // Line height for comfortable reading
        "leading-relaxed",
        
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// ⚙️ Card Action (For buttons/icons in header)
// ─────────────────────────────────────────────────────────────
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        // Position: top-right of header
        "self-start justify-self-end",
        
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 📦 Card Content (Main body area)
// ─────────────────────────────────────────────────────────────
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        // Layout: flex column, gap for items
        "flex flex-col gap-4",
        
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 👣 Card Footer (Actions, metadata)
// ─────────────────────────────────────────────────────────────
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        // Layout: flex row, centered items
        "flex items-center justify-between",
        
        // Visual: top border, subtle bg
        "border-t border-slate-100 pt-4 mt-2",
        "bg-slate-50/50 rounded-b-2xl -mx-6 -mb-6 px-6 pb-6",
        "data-[size=sm]/card:-mx-4 data-[size=sm]/card:-mb-4 data-[size=sm]/card:px-4 data-[size=sm]/card:pb-4",
        
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}