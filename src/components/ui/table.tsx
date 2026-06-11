// components/ui/table.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────
// 📊 Table Component (Light Theme + Scrollable + Readable)
// ─────────────────────────────────────────────────────────────
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <table
        data-slot="table"
        className={cn(
          "w-full caption-bottom text-base", // Increased from text-sm to text-base
          className
        )}
        {...props}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 📋 Table Header
// ─────────────────────────────────────────────────────────────
function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        // Light background for header, sticky if needed
        "[&_tr]:border-b [&_tr]:border-slate-200",
        "bg-slate-50/50",
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 📦 Table Body
// ─────────────────────────────────────────────────────────────
function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 👣 Table Footer
// ─────────────────────────────────────────────────────────────
function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-slate-200 bg-slate-50 font-medium",
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
//  Table Row
// ─────────────────────────────────────────────────────────────
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        // Subtle border between rows, hover effect for interactivity
        "border-b border-slate-100 transition-colors hover:bg-indigo-50/40 data-[state=selected]:bg-indigo-100",
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 🧢 Table Head Cell (Headers)
// ─────────────────────────────────────────────────────────────
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        // Taller, bold, dark text, left aligned
        "h-12 px-4 text-left align-middle font-bold text-slate-700 whitespace-nowrap",
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
//  Table Body Cell
// ────────────────────────────────────────────────────────────
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        // Comfortable padding, readable text, vertical alignment
        "p-4 align-middle whitespace-nowrap text-slate-600",
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 📝 Table Caption
// ─────────────────────────────────────────────────────────────
function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-slate-500 text-center", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}