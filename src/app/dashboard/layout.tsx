'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Compass, Sparkles, Globe, Map,
  LogOut, Menu, X, Sun, Moon, UserCircle
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// 3-Level Elevation Tokens
// ─────────────────────────────────────────────────────────────
const NEU = {
  PAGE:    '#EDEBDE',
  SECTION: '#E5E2D3',
  CARD:    '#F5F3EA',
  raised:  '8px 8px 18px rgba(139,120,112,.18), -8px -8px 18px rgba(255,255,255,.9)',
  hover:   '10px 10px 22px rgba(139,120,112,.15), -10px -10px 22px rgba(255,255,255,.95)',
  pressed: 'inset 4px 4px 8px rgba(139,120,112,.2), inset -4px -4px 8px rgba(255,255,255,.9)',
  soft:    '4px 4px 8px rgba(139,120,112,.12), -4px -4px 8px rgba(255,255,255,.9)',
}

type NavItem = { href: string; label: string; icon: React.ReactNode; badge?: string }

const SidebarNavItem = ({ href, icon, label, active, badge }: NavItem & { active: boolean }) => (
  <Link
    href={href}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '11px 14px', borderRadius: 14, border: 'none',
      background: active ? 'var(--neu-page)' : 'transparent',
      boxShadow: active ? 'var(--neu-pressed)' : 'none',
      color: active ? '#810100' : 'var(--neu-text-2)',
      fontFamily: 'Inter, sans-serif', fontWeight: active ? 700 : 500, fontSize: '0.85rem',
      textDecoration: 'none', transition: 'all .25s ease', marginBottom: 2,
    }}
    onMouseEnter={e => { if (!active) { const el = e.currentTarget; el.style.background = 'var(--neu-card)'; el.style.color = 'var(--neu-text)' } }}
    onMouseLeave={e => { if (!active) { const el = e.currentTarget; el.style.background = 'transparent'; el.style.color = 'var(--neu-text-2)' } }}
  >
    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ color: active ? '#810100' : 'var(--neu-text-3)', display: 'flex' }}>{icon}</span>
      <span>{label}</span>
    </span>
    {badge && (
      <span style={{
        fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 999,
        background: 'var(--neu-page)', boxShadow: NEU.soft, color: '#810100', letterSpacing: '0.05em',
      }}>{badge}</span>
    )}
  </Link>
)

const FeatureCard = ({ href, icon, title, description, active }: {
  href: string; icon: React.ReactNode; title: string; description: string; active: boolean
}) => (
  <Link
    href={href}
    style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px', borderRadius: 18, border: 'none',
      background: active ? 'var(--neu-page)' : 'var(--neu-card)',
      boxShadow: active ? 'var(--neu-pressed)' : 'var(--neu-raised)',
      textDecoration: 'none', color: active ? '#810100' : 'var(--neu-text)',
      fontFamily: 'Inter, sans-serif', transition: 'all .25s ease',
    }}
    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
  >
    <div style={{
      width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--neu-page)', boxShadow: active ? NEU.raised : NEU.pressed,
      color: active ? '#810100' : 'var(--neu-text-3)', flexShrink: 0,
    }}>{icon}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'inherit' }}>{title}</span>
      <span style={{ display: 'block', fontSize: 10, color: 'var(--neu-text-3)', marginTop: 1 }}>{description}</span>
    </div>
  </Link>
)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    try {
      const u = localStorage.getItem('traveloop_user')
      if (u) setUser(JSON.parse(u))

      // Restore theme
      const savedTheme = localStorage.getItem('traveloop_theme')
      if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark')
        setIsDark(true)
      } else {
        document.documentElement.removeAttribute('data-theme')
        setIsDark(false)
      }
    } catch { /* */ }
  }, [])

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    if (newDark) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('traveloop_theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('traveloop_theme', 'light')
    }
  }

  const handleLogout = () => { localStorage.removeItem('traveloop_user'); window.location.href = '/' }

  const mainNav: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/dashboard/trips', label: 'My Trips', icon: <Map size={18} /> },
    { href: '/dashboard/explore', label: 'Explore', icon: <Compass size={18} /> },
    { href: '/dashboard/discover', label: 'Destinations', icon: <Globe size={18} /> },
  ]

  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U'

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.75rem 1rem' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36, paddingLeft: 4 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--neu-card)', boxShadow: 'var(--neu-raised)',
        }}>
          <Compass size={18} color="#810100" />
        </div>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'var(--neu-text)' }}>Traveloop</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {mainNav.map(link => <SidebarNavItem key={link.href} {...link} active={pathname === link.href} />)}
      </nav>

      {/* AI Feature */}
      <div style={{ marginBottom: 12 }}>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--neu-text-3)', padding: '0 6px', marginBottom: 10,
        }}>
          <Sparkles size={11} color="#06B6D4" /> AI Suite
        </span>
        <FeatureCard
          href="/dashboard/ai-planner"
          icon={<Sparkles size={16} />}
          title="AI Trip Planner"
          description="Smart itineraries"
          active={pathname === '/dashboard/ai-planner'}
        />
      </div>

      {/* ─── Dark / Light Mode Toggle ─── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderRadius: 16,
        background: 'var(--neu-card)', boxShadow: 'var(--neu-raised)',
        marginBottom: 12,
      }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--neu-text-2)', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 7 }}>
          {isDark ? <Moon size={14} color="#810100" /> : <Sun size={14} color="#810100" />}
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          style={{
            width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: isDark ? '#810100' : 'var(--neu-page)',
            boxShadow: isDark ? '2px 2px 6px rgba(0,0,0,.4)' : 'var(--neu-pressed)',
            position: 'relative', transition: 'background .3s ease', flexShrink: 0,
          }}
        >
          <div style={{
            position: 'absolute', top: 3, left: isDark ? 23 : 3,
            width: 18, height: 18, borderRadius: '50%',
            background: isDark ? '#fff' : '#810100',
            transition: 'left .3s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isDark
              ? <Moon size={10} color="#810100" />
              : <Sun size={10} color="#fff" />
            }
          </div>
        </button>
      </div>

      {/* User */}
      <Link
        href="/dashboard/profile"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          padding: '12px 14px', borderRadius: 20, background: 'var(--neu-card)', boxShadow: 'var(--neu-raised)',
          textDecoration: 'none', transition: 'all .25s ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--neu-page)', boxShadow: 'var(--neu-pressed)', flexShrink: 0,
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '0.85rem', color: '#810100',
          }}>{userInitial}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--neu-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>
              {user?.name || 'Guest'}
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#810100', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 3, marginTop: 1 }}>
              <UserCircle size={9} /> View Profile
            </div>
          </div>
        </div>
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); handleLogout() }}
          title="Sign out"
          style={{
            width: 32, height: 32, borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'var(--neu-page)', boxShadow: 'var(--neu-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--neu-text-3)', flexShrink: 0, transition: 'all .2s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EF4444' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--neu-text-3)' }}
        ><LogOut size={14} /></button>
      </Link>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--neu-page)', color: 'var(--neu-text)', fontFamily: 'Inter, sans-serif', position: 'relative' }}>

      {/* Desktop Sidebar — 240px */}
      <aside
        className="hidden md:flex"
        style={{
          width: 240, flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
          background: 'var(--neu-section)',
          boxShadow: '2px 0 16px rgba(139,120,112,.12)',
          flexDirection: 'column',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile menu button (fixed, minimal) */}
      <button
        className="md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 50,
          width: 44, height: 44, borderRadius: 14, border: 'none', cursor: 'pointer',
          background: 'var(--neu-card)', boxShadow: 'var(--neu-raised)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neu-text-2)',
        }}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(232,237,244,.6)', backdropFilter: 'blur(4px)', zIndex: 40 }} onClick={() => setMobileOpen(false)} />
          <aside
            className="md:hidden"
            style={{
              position: 'fixed', top: 0, left: 0, width: 240, height: '100vh', zIndex: 50,
              background: 'var(--neu-section)', boxShadow: '8px 0 24px rgba(139,120,112,.15)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main Content */}
      <main style={{ flex: 1, minHeight: '100vh' }}>
        <div style={{ padding: '2.5rem 2rem', maxWidth: 1280, margin: '0 auto' }}>
          <div className="pt-[60px] md:pt-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}