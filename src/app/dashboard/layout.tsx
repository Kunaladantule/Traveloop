'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Compass, 
  Sparkles, 
  Globe, 
  Map, 
  LogOut, 
  User,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface SidebarLinkProps {
  href: string
  icon: React.ReactNode
  label: string
  active: boolean
}

function SidebarLink({ href, icon, label, active }: SidebarLinkProps) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
        active 
          ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-white border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)] font-semibold' 
          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40 hover:border-zinc-800/50 border border-transparent'
      }`}
    >
      <div className={`transition-transform duration-300 group-hover:scale-110 ${active ? 'text-indigo-400' : 'text-zinc-400 group-hover:text-indigo-300'}`}>
        {icon}
      </div>
      <span className="text-sm tracking-wide">{label}</span>
    </Link>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

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

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: '/dashboard/trips', label: 'My Trip', icon: <Map className="h-5 w-5" /> },
    { href: '/dashboard/explore', label: 'Explore Activities', icon: <Compass className="h-5 w-5" /> },
    { href: '/dashboard/discover', label: 'Discover Destination', icon: <Globe className="h-5 w-5" /> },
  ]

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <div className="relative h-screen w-screen flex bg-[#030712] text-zinc-100 font-sans overflow-hidden">
      
      {/* Background ambiance */}
      <div className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none z-0" style={{ backgroundImage: `url('/dashboard-bg.png')` }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* MOBILE HEADER BAR */}
      <div className="md:hidden absolute top-0 inset-x-0 h-16 bg-zinc-950/80 border-b border-zinc-900 flex justify-between items-center px-6 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
            <Compass className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-heading font-extrabold text-lg tracking-wider">Traveloop</span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-zinc-400 hover:text-zinc-100 focus:outline-none"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* GLOBAL LEFT PANEL (SIDEBAR) */}
      <aside className={`fixed md:relative top-0 left-0 h-screen w-72 bg-zinc-950/95 md:bg-zinc-950/70 border-r border-zinc-900/80 flex flex-col justify-between py-6 px-4 z-40 backdrop-blur-2xl transition-transform duration-300 md:transform-none flex-shrink-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        
        <div className="flex flex-col gap-8">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <span className="font-heading font-extrabold text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-indigo-200">
              Traveloop
            </span>
          </div>

          {/* Primary Navigation links */}
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <SidebarLink 
                key={link.href}
                href={link.href}
                icon={link.icon}
                label={link.label}
                active={pathname === link.href}
              />
            ))}
          </nav>

          {/* Divider */}
          <div className="h-[1px] bg-zinc-800/40 my-1 mx-2" />

          {/* Intelligent Feature section */}
          <div className="flex flex-col gap-2.5 px-2">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-400/90 flex items-center gap-1.5">
              ✨ INTELLIGENT SUITE
            </span>
            <Link 
              href="/dashboard/ai-planner"
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group border ${
                pathname === '/dashboard/ai-planner'
                  ? 'bg-gradient-to-r from-violet-600/45 to-fuchsia-600/45 text-white border-violet-400/60 shadow-[0_0_20px_rgba(139,92,246,0.25)] font-semibold'
                  : 'bg-indigo-500/5 hover:bg-indigo-500/10 text-violet-300 hover:text-white border-indigo-500/10 hover:border-indigo-500/20'
              }`}
            >
              <div className="relative">
                <Sparkles className="h-5 w-5 text-violet-300 group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-violet-400/30 blur-sm rounded-full scale-150 animate-ping duration-1000" />
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-sm font-semibold flex items-center gap-1">🤖 AI (TripO) Planner</span>
                <span className="text-[9px] text-zinc-300 font-normal mt-0.5">Instant Smart Itineraries ⚡</span>
              </div>
            </Link>
          </div>
        </div>

        {/* User Profile Footer snippet */}
        <div className="flex flex-col gap-4 border-t border-zinc-900/80 pt-4 px-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-indigo-500/20 bg-indigo-950/40 text-indigo-200">
                <AvatarFallback className="text-xs font-bold">{userInitial}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 max-w-[140px]">
                <span className="text-xs font-semibold truncate text-zinc-200">{user?.name || 'Guest Pilot'}</span>
                <span className="text-[10px] text-zinc-500 truncate">{user?.email || 'offline@traveloop.ai'}</span>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-lg h-8 w-8"
              title="Logout"
            >
              <LogOut className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>

      </aside>

      {/* Main content body panel */}
      <main className="flex-1 h-screen flex flex-col pt-16 md:pt-0 relative z-10 overflow-y-auto">
        <div className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile background shade overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
        />
      )}

    </div>
  )
}
