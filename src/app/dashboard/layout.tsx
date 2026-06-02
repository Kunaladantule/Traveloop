'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Compass, Sparkles, Globe, Map,
  LogOut, Menu, X
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// Shared shadow tokens (inline for full control)
// ─────────────────────────────────────────────────────────────
const NEU = {
  BG: '#EAEFF5',
  raised: '8px 8px 16px rgba(163,177,198,.45), -8px -8px 16px rgba(255,255,255,.85)',
  pressed: 'inset 4px 4px 8px rgba(163,177,198,.45), inset -4px -4px 8px rgba(255,255,255,.85)',
  soft: '4px 4px 8px rgba(163,177,198,.3), -4px -4px 8px rgba(255,255,255,.8)',
  glass: 'rgba(255,255,255,.55)',
}

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  badge?: string
}

// ─────────────────────────────────────────────────────────────
// Sidebar nav item
// ─────────────────────────────────────────────────────────────
const SidebarNavItem = ({ href, icon, label, active, badge }: NavItem & { active: boolean }) => (
  <Link
    href={href}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderRadius: 16, border: 'none',
      background: active ? NEU.BG : 'transparent',
      boxShadow: active ? NEU.pressed : 'none',
      color: active ? '#6C63FF' : '#64748B',
      fontFamily: 'Inter, sans-serif', fontWeight: active ? 700 : 500, fontSize: '0.9rem',
      textDecoration: 'none', transition: 'all .3s ease',
      marginBottom: 4,
    }}
    onMouseEnter={e => {
      if (!active) {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = NEU.soft
        el.style.color = '#1E293B'
      }
    }}
    onMouseLeave={e => {
      if (!active) {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = 'none'
        el.style.color = '#64748B'
      }
    }}
  >
    <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ color: active ? '#6C63FF' : '#94A3B8', display: 'flex' }}>{icon}</span>
      <span>{label}</span>
    </span>
    {badge && (
      <span style={{
        fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999,
        background: NEU.BG, boxShadow: NEU.soft, color: '#6C63FF',
        letterSpacing: '0.05em',
      }}>{badge}</span>
    )}
  </Link>
)

// ─────────────────────────────────────────────────────────────
// AI Feature card
// ─────────────────────────────────────────────────────────────
const FeatureCard = ({ href, icon, title, description, active }: {
  href: string; icon: React.ReactNode; title: string; description: string; active: boolean
}) => (
  <Link
    href={href}
    style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', borderRadius: 20, border: 'none',
      background: NEU.BG,
      boxShadow: active ? NEU.pressed : NEU.raised,
      textDecoration: 'none', color: active ? '#6C63FF' : '#334155',
      fontFamily: 'Inter, sans-serif', transition: 'all .3s ease',
    }}
    onMouseEnter={e => {
      if (!active) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
    }}
    onMouseLeave={e => {
      if (!active) (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
    }}
  >
    <div style={{
      width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: NEU.BG, boxShadow: active ? NEU.raised : NEU.pressed,
      color: active ? '#6C63FF' : '#94A3B8', flexShrink: 0,
    }}>{icon}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'inherit' }}>{title}</span>
      <span style={{ display: 'block', fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{description}</span>
    </div>
  </Link>
)

// ─────────────────────────────────────────────────────────────
// Dashboard Layout
// ─────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    try {
      const u = localStorage.getItem('traveloop_user')
      if (u) setUser(JSON.parse(u))
    } catch { /* no-op */ }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('traveloop_user')
    window.location.href = '/'
  }

  const mainNav: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { href: '/dashboard/trips', label: 'My Trips', icon: <Map size={20} /> },
    { href: '/dashboard/explore', label: 'Explore', icon: <Compass size={20} /> },
    { href: '/dashboard/discover', label: 'Destinations', icon: <Globe size={20} /> },
  ]

  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U'

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '2rem 1.25rem' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: NEU.BG, boxShadow: NEU.raised,
        }}>
          <Compass size={22} color="#6C63FF" />
        </div>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#1E293B' }}>Traveloop</span>
      </div>

      {/* Main nav */}
      <nav style={{ flex: 1 }}>
        {mainNav.map(link => (
          <SidebarNavItem key={link.href} {...link} active={pathname === link.href} />
        ))}
      </nav>

      {/* AI Feature */}
      <div style={{ marginBottom: 24 }}>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase',
          color: '#94A3B8', padding: '0 8px', marginBottom: 12
        }}>
          <Sparkles size={13} color="#06B6D4" />
          AI Suite
        </span>
        <FeatureCard
          href="/dashboard/ai-planner"
          icon={<Sparkles size={18} />}
          title="AI Trip Planner"
          description="Smart itineraries in seconds"
          active={pathname === '/dashboard/ai-planner'}
        />
      </div>

      {/* User profile */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        padding: '14px 16px', borderRadius: 24, background: NEU.BG, boxShadow: NEU.raised,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: NEU.BG, boxShadow: NEU.pressed, flexShrink: 0,
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#6C63FF',
          }}>{userInitial}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>
              {user?.name || 'Guest'}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>
              {user?.email || 'offline@traveloop.com'}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          style={{
            width: 36, height: 36, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: NEU.BG, boxShadow: NEU.raised, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#94A3B8', flexShrink: 0, transition: 'all .25s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EF4444' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94A3B8' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: NEU.BG, color: '#1E293B', fontFamily: 'Inter, sans-serif', position: 'relative' }}>

      {/* Mobile Glass Header */}
      <header className="md:hidden" style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 72, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem',
        background: NEU.glass, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 4px 16px rgba(163,177,198,.35)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: NEU.BG, boxShadow: NEU.raised }}>
            <Compass size={18} color="#6C63FF" />
          </div>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#1E293B' }}>Traveloop</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ width: 40, height: 40, borderRadius: 14, border: 'none', cursor: 'pointer', background: NEU.BG, boxShadow: NEU.raised, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex"
        style={{
          width: 288, flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
          background: NEU.glass, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '4px 0 24px rgba(163,177,198,.25)',
          flexDirection: 'column',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(234,239,245,.6)', backdropFilter: 'blur(6px)', zIndex: 40 }}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="md:hidden"
            style={{
              position: 'fixed', top: 0, left: 0, width: 288, height: '100vh', zIndex: 50,
              background: NEU.BG, boxShadow: '8px 0 32px rgba(163,177,198,.4)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main Content */}
      <main style={{ flex: 1, minHeight: '100vh', paddingTop: 0 }}>
        <div style={{ padding: '3rem 2.5rem', maxWidth: 1400, margin: '0 auto' }}>
          <div className="pt-[72px] md:pt-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}