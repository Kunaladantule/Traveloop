// components/ui/dropdown-menu.tsx
"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { cn } from "@/lib/utils"
import { Check, ChevronRight } from "lucide-react"

// ─────────────────────────────────────────────────────────────
// 🧭 Dropdown Menu Root + Trigger
// ─────────────────────────────────────────────────────────────
function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

// ─────────────────────────────────────────────────────────────
// 📋 Dropdown Menu Content (Light Theme Card)
// ─────────────────────────────────────────────────────────────
function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 8,
  className,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<MenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            // Light theme card
            "min-w-48 rounded-xl bg-white border border-slate-200 shadow-lg shadow-slate-200/50 p-1.5",
            
            // Smooth animation
            "transition-all duration-200",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            
            // Scrollable if needed
            "max-h-[var(--radix-menu-content-available-height)] overflow-y-auto",
            
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

// ─────────────────────────────────────────────────────────────
// 📦 Dropdown Menu Group
// ─────────────────────────────────────────────────────────────
function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

// ─────────────────────────────────────────────────────────────
// 🏷️ Dropdown Menu Label (Larger Text)
// ─────────────────────────────────────────────────────────────
function DropdownMenuLabel({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & { inset?: boolean }) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-3 py-2 text-sm font-semibold text-slate-900",
        "data-[inset=true]:pl-9",
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 🎯 Dropdown Menu Item (Light Theme + Readable)
// ─────────────────────────────────────────────────────────────
function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        // Base: flex, rounded, padding
        "group relative flex cursor-default items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none select-none",
        
        // Light theme colors
        "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700",
        
        // Focus state
        "focus:bg-indigo-50 focus:text-indigo-700",
        
        // Destructive variant
        "data-[variant=destructive]:text-red-600 data-[variant=destructive]:hover:bg-red-50 data-[variant=destructive]:hover:text-red-700",
        
        // Inset for nested items
        "data-[inset=true]:pl-9",
        
        // Disabled state
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        
        // Icon sizing
        "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        
        className
      )}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// ➡️ Dropdown Menu Submenu Trigger
// ─────────────────────────────────────────────────────────────
function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & { inset?: boolean }) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none select-none",
        "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700",
        "focus:bg-indigo-50 focus:text-indigo-700",
        "data-[inset=true]:pl-9",
        "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

// ─────────────────────────────────────────────────────────────
// 📋 Dropdown Menu Sub Content
// ─────────────────────────────────────────────────────────────
function DropdownMenuSubContent({
  align = "start",
  alignOffset = -8,
  side = "right",
  sideOffset = 4,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "min-w-48 rounded-xl bg-white border border-slate-200 shadow-lg shadow-slate-200/50 p-1.5",
        "transition-all duration-200",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        className
      )}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  )
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}

// ─────────────────────────────────────────────────────────────
// ☑️ Dropdown Menu Checkbox Item
// ─────────────────────────────────────────────────────────────
function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: MenuPrimitive.CheckboxItem.Props & { inset?: boolean }) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-default items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none select-none",
        "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700",
        "focus:bg-indigo-50 focus:text-indigo-700",
        "data-[inset=true]:pl-9",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      {/* Checkbox indicator */}
      <span className="absolute right-3 flex items-center justify-center">
        <MenuPrimitive.CheckboxItemIndicator>
          <Check className="h-4 w-4 text-indigo-600" />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

// ─────────────────────────────────────────────────────────────
// 🔘 Dropdown Menu Radio Group + Item
// ─────────────────────────────────────────────────────────────
function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: MenuPrimitive.RadioItem.Props & { inset?: boolean }) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-default items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none select-none",
        "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700",
        "focus:bg-indigo-50 focus:text-indigo-700",
        "data-[inset=true]:pl-9",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {/* Radio indicator */}
      <span className="absolute right-3 flex items-center justify-center">
        <MenuPrimitive.RadioItemIndicator>
          <div className="h-2 w-2 rounded-full bg-indigo-600" />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

// ─────────────────────────────────────────────────────────────
// ➖ Dropdown Menu Separator
// ─────────────────────────────────────────────────────────────
function DropdownMenuSeparator({
  className,
  ...props
}: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1.5 my-1.5 h-px bg-slate-200", className)}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// ⌨️ Dropdown Menu Shortcut (Keyboard Hint)
// ─────────────────────────────────────────────────────────────
function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs font-semibold text-slate-400 tracking-wide",
        "group-focus:text-indigo-600",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}