'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, LayoutDashboard, Plane, Compass, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export function Sidebar() {
  const pathname = usePathname()

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Trips', href: '/dashboard/trips', icon: Plane },
    { name: 'Explore', href: '/dashboard/explore', icon: Compass },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-sidebar px-4 py-6">
      <Link href="/dashboard" className="flex items-center gap-2 mb-8 px-2 text-sidebar-foreground">
        <Map className="h-6 w-6" />
        <span className="text-xl font-bold tracking-tight">Traveloop</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.name}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </div>
  )
}
