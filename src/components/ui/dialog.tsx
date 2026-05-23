// components/ui/dialog.tsx
"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

// ─────────────────────────────────────────────────────────────
// 🪟 Dialog Root
// ─────────────────────────────────────────────────────────────
function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

// ─────────────────────────────────────────────────────────────
// 🌑 Dialog Overlay (Light Theme Backdrop)
// ─────────────────────────────────────────────────────────────
function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        // Light theme: subtle dark overlay
        "fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm",
        
        // Smooth transitions
        "transition-opacity duration-200",
        "data-[state=open]:animate-in data-[state=open]:fade-in",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out",
        
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 📦 Dialog Content (Light Theme Card)
// ─────────────────────────────────────────────────────────────
function DialogContent({
  className,
  children,
  showCloseButton = true,
  size = "default",
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
  size?: "sm" | "default" | "lg" | "full"
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        data-size={size}
        className={cn(
          // Base: fixed center, white card, rounded
          "fixed left-1/2 top-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl bg-white p-6 shadow-2xl shadow-slate-200/50 border border-slate-200",
          
          // Smooth open/close animation
          "transition-all duration-200",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          
          // Size variants
          "data-[size=sm]:max-w-sm",
          "data-[size=default]:max-w-lg",
          "data-[size=lg]:max-w-2xl",
          "data-[size=full]:max-w-[95vw] data-[size=full]:h-[95vh] data-[size=full]:overflow-y-auto",
          
          // Mobile: full width
          "sm:max-w-[calc(100%-2rem)]",
          
          className
        )}
        {...props}
      >
        {children}
        
        {showCloseButton && (
          <DialogPrimitive.Close
            className="absolute right-4 top-4 h-9 w-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

// ─────────────────────────────────────────────────────────────
// 📋 Dialog Header
// ─────────────────────────────────────────────────────────────
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-2 pb-2 border-b border-slate-100",
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 👣 Dialog Footer
// ─────────────────────────────────────────────────────────────
function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-3 pt-4 border-t border-slate-100 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors">
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 🏷️ Dialog Title (Clash Display + Larger)
// ─────────────────────────────────────────────────────────────
function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading font-bold text-xl text-slate-900 leading-snug",
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 📝 Dialog Description (Inter + Readable)
// ─────────────────────────────────────────────────────────────
function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "font-sans text-base text-slate-600 leading-relaxed",
        "[&_a]:text-indigo-600 [&_a]:hover:text-indigo-700 [&_a]:underline [&_a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}