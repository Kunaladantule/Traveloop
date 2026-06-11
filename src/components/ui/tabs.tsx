// components/ui/tabs.tsx
"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────
// 🗂️ Tabs Component (Pill Style + Light Theme)
// ─────────────────────────────────────────────────────────────
function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-4",
        orientation === "horizontal" ? "flex-col" : "flex-row",
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 📋 Tabs List (Pill Container)
// ─────────────────────────────────────────────────────────────
function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & { variant?: "default" | "line" }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        // Base: flex, gap, padding
        "inline-flex items-center justify-center gap-1 rounded-xl p-1.5",
        
        // Variant: Default (Pill style)
        variant === "default" && "bg-slate-100 text-slate-600",
        
        // Variant: Line (Underline style)
        variant === "line" && "bg-transparent border-b border-slate-200 p-0 gap-4 rounded-none",
        
        // Vertical support
        "group-data-vertical/tabs:flex-col group-data-vertical/tabs:items-start",
        
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 🎯 Tabs Trigger (Interactive Button)
// ─────────────────────────────────────────────────────────────
function TabsTrigger({
  className,
  ...props
}: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        // Base: flex, rounded, padding, transition
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none",
        
        // Inactive state
        "text-slate-500 hover:text-slate-900 hover:bg-white/50",
        
        // Active state (White card + shadow)
        "data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:font-semibold data-[state=active]:shadow-sm",
        
        // Line variant overrides
        "group-data-[variant=line]/tabs:data-[state=active]:bg-transparent group-data-[variant=line]/tabs:data-[state=active]:shadow-none group-data-[variant=line]/tabs:data-[state=active]:border-b-2 group-data-[variant=line]/tabs:data-[state=active]:border-indigo-600 group-data-[variant=line]/tabs:data-[state=active]:text-indigo-700 group-data-[variant=line]/tabs:data-[state=active]:rounded-none group-data-[variant=line]/tabs:data-[state=active]:py-3",
        
        // Focus ring for accessibility
        "focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100",
        
        // Disabled state
        "disabled:pointer-events-none disabled:opacity-50",
        
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 📦 Tabs Content
// ─────────────────────────────────────────────────────────────
function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn(
        // Smooth entrance animation
        "animate-in fade-in-0 zoom-in-95 duration-200",
        // Text sizing
        "text-slate-700 text-base",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }