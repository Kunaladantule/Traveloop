// app/dashboard/layout.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Compass, Sparkles, Globe, Map, 
  LogOut, Menu, X 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// ─────────────────────────────────────────────────────────────
// 🧩 Reusable Components (Light Theme Optimized)
// ─────────────────────────────────────────────────────────────

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  badge?: string
}

const SidebarNavItem = ({ href, icon, label, active, badge }: NavItem & { active: boolean }) => (
  <Link
    href={href}
    className={`group flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active
        ? 'bg-primary/10 text-primary border border-primary/20 font-semibold shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
    }`}
  >
    <span className="flex items-center gap-3">
      <span className={`transition-transform group-hover:scale-110 ${active ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`}>
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </span>
    {badge && (
      <span className="text-[10px] font-bold px-2 py-0.5 bg-primary text-primary-foreground rounded-full">
        {badge}
      </span>
    )}
  </Link>
)

const FeatureCard = ({ href, icon, title, description, active }: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  active: boolean
}) => (
  <Link
    href={href}
    className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 ${
      active
        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-indigo-900 shadow-sm'
        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
    }`}
  >
    <div className="relative">
      <div className={`p-2 rounded-lg ${active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-500'} transition-colors`}>
        {icon}
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <span className="text-sm font-semibold block truncate">{title}</span>
      <span className="text-[11px] text-slate-500 block truncate mt-0.5">{description}</span>
    </div>
  </Link>
)

// ─────────────────────────────────────────────────────────────
// 🚀 Main Dashboard Layout Component
// ─────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Load user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('traveloop_user')
    if (userStr) {
      try {
        setUser(JSON.parse(userStr))
      } catch (e) {
        console.error('Error parsing stored user:', e)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('traveloop_user')
    window.location.href = '/'
  }

  // Navigation configuration
  const mainNav: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: '/dashboard/trips', label: 'My Trips', icon: <Map className="h-5 w-5" /> },
    { href: '/dashboard/explore', label: 'Explore', icon: <Compass className="h-5 w-5" /> },
    { href: '/dashboard/discover', label: 'Destinations', icon: <Globe className="h-5 w-5" /> },
  ]

  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="relative min-h-screen flex bg-background text-foreground font-sans">
      
      {/* 🌤️ Light Theme Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/light-pattern.svg')] bg-repeat opacity-[0.02] pointer-events-none" />

      {/* 📱 Mobile Header */}
      <header className="md:hidden fixed top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-lg border-b border-slate-200 flex justify-between items-center px-4 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <Compass className="h-4 w-4 text-white" />
          </div>
          <span className="font-heading font-bold text-lg text-slate-900">Traveloop</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* 🧭 Sidebar Navigation */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-white/90 backdrop-blur-xl border-r border-slate-200 flex flex-col justify-between py-5 px-4 z-40 transition-transform duration-300 md:translate-x-0 ${
        mobileOpen ? 'translate-x-0 shadow-2xl md:shadow-none' : '-translate-x-full'
      }`}>
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200/50">
            <Compass className="h-5 w-5 text-white" />
          </div>
          <span className="font-heading font-bold text-xl text-slate-900 tracking-tight">
            Traveloop
          </span>
        </div>

        {/* Main Navigation */}
        <nav className="flex flex-col gap-1 py-4">
          {mainNav.map((link) => (
            <SidebarNavItem
              key={link.href}
              {...link}
              active={pathname === link.href}
            />
          ))}
        </nav>

        {/* AI Feature Section */}
        <div className="px-2 py-3 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5 px-2 mb-2">
            <Sparkles className="h-3 w-3" />
            AI Suite
          </span>
          <FeatureCard
            href="/dashboard/ai-planner"
            icon={<Sparkles className="h-4 w-4" />}
            title="AI Trip Planner"
            description="Smart itineraries in seconds"
            active={pathname === '/dashboard/ai-planner'}
          />
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center justify-between gap-3 px-2 py-3 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9 border-2 border-white shadow-sm bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-semibold">
              <AvatarFallback className="text-xs">{userInitial}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-900 truncate">
                {user?.name || 'Guest'}
              </span>
              <span className="text-[11px] text-slate-500 truncate">
                {user?.email || 'offline@traveloop.com'}
              </span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg h-8 w-8 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* 🎯 Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen pt-16 md:pt-0">
        {/* Content wrapper with max-width constraint */}
        <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

      {/* 📱 Mobile Overlay */}
      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
          aria-label="Close menu"
        />
      )}
    </div>
  )
}