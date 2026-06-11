// components/ui/sonner.tsx
"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheck, Info, TriangleAlert, OctagonX, Loader2 } from "lucide-react"

// ─────────────────────────────────────────────────────────────
// 🔔 Toaster Component (Light Theme + Larger + Accessible)
// ─────────────────────────────────────────────────────────────
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      
      // Light theme icons with proper sizing
      icons={{
        success: <CircleCheck className="h-5 w-5 text-emerald-600" />,
        info: <Info className="h-5 w-5 text-indigo-600" />,
        warning: <TriangleAlert className="h-5 w-5 text-amber-600" />,
        error: <OctagonX className="h-5 w-5 text-red-600" />,
        loading: <Loader2 className="h-5 w-5 text-slate-500 animate-spin" />,
      }}
      
      // Light theme toast styles via CSS variables
      style={
        {
          "--normal-bg": "#FFFFFF",
          "--normal-text": "#1B1716",
          "--normal-border": "#CBD5E1",
          "--success-bg": "#ECFDF5",
          "--success-text": "#065F46",
          "--success-border": "#6EE7B7",
          "--error-bg": "#FEF2F2",
          "--error-text": "#991B1B",
          "--error-border": "#FCA5A5",
          "--warning-bg": "#FFFBEB",
          "--warning-text": "#92400E",
          "--warning-border": "#FCD34D",
          "--info-bg": "#EFF6FF",
          "--info-text": "#1E40AF",
          "--info-border": "#93C5FD",
          "--border-radius": "0.75rem",
        } as React.CSSProperties
      }
      
      // Global toast options for consistency
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg group-[.toaster]:shadow-slate-200/50",
          description: "group-[.toast]:text-slate-600 group-[.toast]:text-base",
          actionButton: "group-[.toast]:bg-indigo-600 group-[.toast]:text-white group-[.toast]:hover:bg-indigo-500 group-[.toast]:font-semibold",
          cancelButton: "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-700 group-[.toast]:hover:bg-slate-200 group-[.toast]:font-semibold",
          title: "group-[.toast]:font-heading group-[.toast]:font-bold group-[.toast]:text-base",
          icon: "group-[.toast]:[&>svg]:h-5 group-[.toast]:[&>svg]:w-5",
        },
      }}
      
      // Position and behavior
      position="top-right"
      expand
      closeButton
      {...props}
    />
  )
}

export { Toaster }