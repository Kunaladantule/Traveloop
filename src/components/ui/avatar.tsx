// components/ui/avatar.tsx
"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────
// 🎨 Avatar Root (Light Theme + Size Variants)
// ─────────────────────────────────────────────────────────────
function Avatar({
  className,
  size = "default",
  ...props
}: AvatarPrimitive.Root.Props & {
  size?: "sm" | "default" | "lg" | "xl"
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        // Base styles: circular, flex center, no select
        "group/avatar relative flex shrink-0 select-none rounded-full bg-white",
        
        // Border & shadow for depth
        "border-2 border-white shadow-sm shadow-slate-200/50",
        
        // Focus ring for accessibility
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        
        // Size variants with larger defaults
        "size-10",
        "data-[size=sm]:size-8",
        "data-[size=lg]:size-12",
        "data-[size=xl]:size-16",
        
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 🖼️ Avatar Image (Optimized Loading + Fallback)
// ─────────────────────────────────────────────────────────────
function AvatarImage({ 
  className, 
  alt,
  ...props 
}: AvatarPrimitive.Image.Props & { alt?: string }) {
  const [error, setError] = React.useState(false)

  if (error) {
    return null // Let Fallback render
  }

  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      alt={alt || "Avatar"}
      className={cn(
        // Full size, circular, object cover
        "aspect-square size-full rounded-full object-cover",
        
        // Smooth loading transition
        "transition-opacity duration-200",
        
        // Hide when loading/error
        "data-[loading=true]:opacity-0",
        
        className
      )}
      onError={() => setError(true)}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 🔤 Avatar Fallback (Larger Text + Better Styling)
// ─────────────────────────────────────────────────────────────
function AvatarFallback({
  className,
  children,
  ...props
}: AvatarPrimitive.Fallback.Props) {
  // Generate initials from name if children is a string
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  const displayText = typeof children === "string" ? getInitials(children) : children

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        // Flex center, circular bg
        "flex size-full items-center justify-center rounded-full",
        
        // Light theme background + text
        "bg-gradient-to-br from-indigo-100 to-purple-100",
        "text-slate-700 font-semibold",
        
        // Larger, readable text sizes
        "text-base",
        "group-data-[size=sm]/avatar:text-sm",
        "group-data-[size=lg]/avatar:text-lg",
        "group-data-[size=xl]/avatar:text-xl",
        
        // Subtle border for definition
        "border border-indigo-200/50",
        
        className
      )}
      {...props}
    >
      {displayText}
    </AvatarPrimitive.Fallback>
  )
}

// ─────────────────────────────────────────────────────────────
// 🎯 Avatar Badge (Status Indicator - Light Theme)
// ─────────────────────────────────────────────────────────────
function AvatarBadge({ 
  className, 
  variant = "online",
  ...props 
}: React.ComponentProps<"span"> & {
  variant?: "online" | "offline" | "busy" | "away"
}) {
  const variantStyles: Record<string, string> = {
    online: "bg-emerald-500 border-emerald-600",
    offline: "bg-slate-400 border-slate-500",
    busy: "bg-red-500 border-red-600",
    away: "bg-amber-500 border-amber-600"
  }

  return (
    <span
      data-slot="avatar-badge"
      data-variant={variant}
      className={cn(
        // Positioning
        "absolute right-0.5 bottom-0.5 z-10 inline-flex items-center justify-center rounded-full",
        
        // Size variants
        "size-3",
        "group-data-[size=sm]/avatar:size-2",
        "group-data-[size=lg]/avatar:size-3.5",
        "group-data-[size=xl]/avatar:size-4",
        
        // Color & border
        "border-2 border-white shadow-sm",
        variantStyles[variant],
        
        // Animation for online status
        variant === "online" && "animate-pulse",
        
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 👥 Avatar Group (Stacked Avatars - Light Theme)
// ─────────────────────────────────────────────────────────────
function AvatarGroup({ 
  className, 
  max = 4,
  total,
  ...props 
}: React.ComponentProps<"div"> & {
  max?: number
  total?: number
}) {
  const childrenArray = React.Children.toArray(props.children)
  const displayed = childrenArray.slice(0, max)
  const remaining = total ? total - max : childrenArray.length - max

  return (
    <div
      data-slot="avatar-group"
      data-has-overflow={remaining > 0}
      className={cn(
        // Flex row with negative spacing for overlap
        "group/avatar-group flex items-center -space-x-3",
        
        // Ensure children have proper ring
        "*:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-white",
        
        className
      )}
      {...props}
    >
      {displayed}
      {remaining > 0 && (
        <AvatarGroupCount count={remaining} className="ml-1" />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 🔢 Avatar Group Count (Overflow Badge)
// ─────────────────────────────────────────────────────────────
function AvatarGroupCount({ 
  className, 
  count,
  ...props 
}: React.ComponentProps<"div"> & {
  count: number
}) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        // Circular badge styling
        "flex size-10 items-center justify-center rounded-full",
        
        // Light theme colors
        "bg-slate-100 border-2 border-white shadow-sm",
        "text-sm font-semibold text-slate-700",
        
        // Size variants
        "group-has-data-[size=sm]/avatar-group:size-8 group-has-data-[size=sm]/avatar-group:text-xs",
        "group-has-data-[size=lg]/avatar-group:size-12 group-has-data-[size=lg]/avatar-group:text-base",
        
        className
      )}
      {...props}
    >
      +{count}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 🎨 Avatar with Name Label (Bonus Component)
// ─────────────────────────────────────────────────────────────
function AvatarWithLabel({
  avatarProps,
  name,
  subtitle,
  className,
  align = "left"
}: {
  avatarProps: React.ComponentProps<typeof Avatar>
  name: string
  subtitle?: string
  className?: string
  align?: "left" | "right" | "center"
}) {
  const alignmentClasses = {
    left: "flex-row",
    right: "flex-row-reverse",
    center: "flex-col text-center"
  }

  return (
    <div className={cn("flex items-center gap-3", alignmentClasses[align], className)}>
      <Avatar {...avatarProps}>
        <AvatarImage src={avatarProps.children as string} alt={name} />
        <AvatarFallback>{name}</AvatarFallback>
      </Avatar>
      
      {(align !== "center" || subtitle) && (
        <div className={cn("flex flex-col", align === "center" && "items-center mt-2")}>
          <span className="font-heading font-semibold text-base text-slate-900 leading-tight">
            {name}
          </span>
          {subtitle && (
            <span className="text-sm text-slate-500 mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 🚀 Exports
// ─────────────────────────────────────────────────────────────
export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
  AvatarWithLabel
}