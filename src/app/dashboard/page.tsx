// app/dashboard/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import {
  Sparkles, Plus, ArrowRight, MapPin, Calendar,
  Globe, DollarSign, Compass, Briefcase, Cloud, Star, TrendingUp
} from 'lucide-react'
import { getUserTrips } from '@/app/actions/trip'

// ─────────────────────────────────────────────────────────────
// Shared Neumorphic tokens
// ─────────────────────────────────────────────────────────────
const NEU = {
  BG: '#EAEFF5',
  raised: '8px 8px 16px rgba(163,177,198,.45), -8px -8px 16px rgba(255,255,255,.85)',
  hover:  '12px 12px 24px rgba(163,177,198,.35), -12px -12px 24px rgba(255,255,255,.9)',
  pressed:'inset 4px 4px 8px rgba(163,177,198,.45), inset -4px -4px 8px rgba(255,255,255,.85)',
  input:  'inset 3px 3px 8px rgba(163,177,198,.35), inset -3px -3px 8px rgba(255,255,255,.85)',
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface TripStop   { id: string; cityName: string; country: string }
interface TripExpense{ id: string; amount: number; category: string }
interface Trip {
  id: string; title: string; description?: string | null
  startDate: Date | string; endDate: Date | string
  totalBudget?: number | null; coverImage?: string | null
  stops?: TripStop[]; expenses?: TripExpense[]
}

// ─────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────
const DEFAULT_MOCK_TRIPS: Trip[] = [
  {
    id: 'mock_trip_1', title: 'Tokyo Sakura Dream',
    description: 'Spring getaway to witness cherry blossoms and explore futuristic electronics hubs.',
    startDate: '2026-04-10', endDate: '2026-04-18', totalBudget: 3500,
    coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=600',
    stops: [{ id: 's1', cityName: 'Tokyo', country: 'Japan' }],
    expenses: [{ id: 'e1', amount: 450, category: 'Food' }, { id: 'e2', amount: 1200, category: 'Accommodation' }, { id: 'e3', amount: 800, category: 'Activities' }]
  },
  {
    id: 'mock_trip_2', title: 'Parisian Summer Escape',
    description: 'Strolling through museum halls, café terraces, and watching sunset by the Eiffel Tower.',
    startDate: '2026-07-05', endDate: '2026-07-12', totalBudget: 5000,
    coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600',
    stops: [{ id: 's2', cityName: 'Paris', country: 'France' }],
    expenses: [{ id: 'e4', amount: 1200, category: 'Flights' }, { id: 'e5', amount: 1500, category: 'Accommodation' }]
  },
  {
    id: 'mock_trip_3', title: 'Swiss Alps Wanderer',
    description: 'Hiking majestic peaks and tasting world-class chocolates in scenic valleys.',
    startDate: '2026-09-20', endDate: '2026-09-30', totalBudget: 4200,
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=600',
    stops: [{ id: 's3', cityName: 'Zurich', country: 'Switzerland' }],
    expenses: [{ id: 'e6', amount: 300, category: 'Transport' }]
  }
]

// ─────────────────────────────────────────────────────────────
// Stat Tile — each inside a neumorphic container (120px height)
// ─────────────────────────────────────────────────────────────
const StatTile = ({ label, value, sublabel, icon: Icon, accent }: {
  label: string; value: string | number; sublabel: string
  icon: React.ElementType; accent: string
}) => (
  <div
    style={{
      background: NEU.BG, borderRadius: 24, boxShadow: NEU.raised, border: 'none',
      padding: '1.25rem 1.5rem', minHeight: 120, display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', transition: 'all .3s ease', cursor: 'default',
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLElement
      el.style.transform = 'translateY(-4px)'
      el.style.boxShadow = NEU.hover
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLElement
      el.style.transform = 'translateY(0)'
      el.style.boxShadow = NEU.raised
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{label}</span>
      <div style={{
        width: 38, height: 38, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: NEU.BG, boxShadow: NEU.pressed, color: accent,
      }}>
        <Icon size={18} />
      </div>
    </div>
    <div>
      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.9rem', color: '#1E293B', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', marginTop: 4, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{sublabel}</div>
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────
// Trip Card — raised, floats on hover
// ─────────────────────────────────────────────────────────────
const TripCard = ({ trip }: { trip: Trip }) => {
  const startDate = new Date(trip.startDate)
  const endDate   = new Date(trip.endDate)
  const dateRange = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  const budget    = trip.totalBudget || 0
  const spent     = (trip.expenses || []).reduce((s, e) => s + e.amount, 0)
  const pct       = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0
  const overBudget= pct > 85
  const dest      = trip.stops?.[0] ? `${trip.stops[0].cityName}, ${trip.stops[0].country}` : 'Destination TBD'

  return (
    <div
      style={{
        background: NEU.BG, borderRadius: 24, boxShadow: NEU.raised, border: 'none',
        overflow: 'hidden', cursor: 'pointer', transition: 'all .3s ease',
      }}
      onClick={() => { window.location.href = `/dashboard/trips?id=${trip.id}` }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(-6px)'
        el.style.boxShadow = NEU.hover
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = NEU.raised
      }}
    >
      {/* Cover image */}
      <div style={{ position: 'relative', height: 200, padding: 10 }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 18, overflow: 'hidden', boxShadow: NEU.pressed, position: 'relative' }}>
          {trip.coverImage
            ? <img src={trip.coverImage} alt={trip.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .6s ease' }} loading="lazy" />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DDE4EE' }}><Compass size={32} color="#94A3B8" /></div>
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.4) 0%, transparent 60%)' }} />
        </div>

        {/* Date badge */}
        <div style={{
          position: 'absolute', top: 20, right: 20, padding: '6px 12px', borderRadius: 12,
          background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(10px)',
          boxShadow: '4px 4px 10px rgba(163,177,198,.35), -4px -4px 10px rgba(255,255,255,.8)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Calendar size={11} color="#6C63FF" />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#1E293B', fontFamily: 'Inter, sans-serif' }}>{dateRange}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '4px 18px 18px' }}>
        <h3 style={{
          fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem',
          color: '#1E293B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>{trip.title}</h3>
        <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: 6, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {trip.description || 'No description yet.'}
        </p>

        {/* Destination */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
          <MapPin size={14} color="#6C63FF" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', fontFamily: 'Inter, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dest}</span>
        </div>

        {/* Budget progress */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>
            <span style={{ color: '#94A3B8' }}>Budget ${budget.toLocaleString()}</span>
            <span style={{ color: overBudget ? '#EF4444' : '#6C63FF' }}>${spent.toLocaleString()} ({pct}%)</span>
          </div>
          {/* progress bar track — inset */}
          <div style={{ height: 10, borderRadius: 999, background: NEU.BG, boxShadow: NEU.pressed, overflow: 'hidden', padding: 2 }}>
            <div style={{
              height: '100%', borderRadius: 999, width: `${pct}%`, transition: 'width .5s ease',
              background: overBudget ? '#EF4444' : 'linear-gradient(90deg, #6C63FF, #8B5CF6)'
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Bento Widget — floating neumorphic widget for hero section
// ─────────────────────────────────────────────────────────────
const BentoWidget = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: NEU.BG, borderRadius: 20, boxShadow: NEU.raised, border: 'none',
    padding: '1.1rem 1.25rem', transition: 'all .3s ease', ...style
  }}>
    {children}
  </div>
)

// ─────────────────────────────────────────────────────────────
// Main Dashboard Page
// ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [user, setUser] = useState<{ id: string; name?: string; email?: string } | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const raw = localStorage.getItem('traveloop_user')
      if (!raw) { window.location.href = '/'; return }
      let u: any = null
      try {
        u = JSON.parse(raw); setUser(u)
        const res = await getUserTrips(u.id)
        if (res.success && res.trips?.length > 0) {
          setTrips(res.trips as unknown as Trip[])
        } else {
          const key = `traveloop_trips_${u.id}`
          const stored = localStorage.getItem(key)
          if (stored) setTrips(JSON.parse(stored))
          else { localStorage.setItem(key, JSON.stringify(DEFAULT_MOCK_TRIPS)); setTrips(DEFAULT_MOCK_TRIPS) }
        }
      } catch {
        const key = `traveloop_trips_${u?.id || 'guest'}`
        const stored = localStorage.getItem(key)
        if (stored) setTrips(JSON.parse(stored))
        else { localStorage.setItem(key, JSON.stringify(DEFAULT_MOCK_TRIPS)); setTrips(DEFAULT_MOCK_TRIPS) }
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const stats = {
    totalTrips: trips.length,
    upcoming:   trips.filter(t => new Date(t.startDate) > new Date()).length,
    countries:  Array.from(new Set(trips.flatMap(t => t.stops?.map(s => s.country) || []))).filter(Boolean).length,
    spent:      trips.reduce((a, t) => a + (t.expenses?.reduce((s, e) => s + e.amount, 0) || 0), 0)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 20 }}>
      <div style={{ width: 64, height: 64, borderRadius: 24, background: NEU.BG, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Compass size={28} color="#6C63FF" style={{ animation: 'spin 1.5s linear infinite' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Loading Journeys...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  const firstName = user?.name?.split(' ')[0] || 'Traveler'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48, maxWidth: 1200, margin: '0 auto' }}>

      {/* ── HERO SECTION: Bento Grid ── */}
      <section>
        {/* Main greeting card */}
        <div style={{
          background: NEU.BG, borderRadius: 32, boxShadow: NEU.raised, border: 'none',
          padding: '2.5rem 3rem', marginBottom: 20, animation: 'floatHero 5s ease-in-out infinite',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 16px', borderRadius: 999,
                background: NEU.BG, boxShadow: NEU.raised,
                fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6C63FF',
                marginBottom: 18,
              }}>
                <Sparkles size={13} />
                Intelligent Travel Assistant
              </div>

              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#1E293B', margin: '0 0 12px', lineHeight: 1.15 }}>
                Welcome back, {firstName}! ✈️
              </h1>
              <p style={{ fontSize: '1rem', color: '#64748B', fontFamily: 'Inter, sans-serif', marginBottom: 28, lineHeight: 1.7 }}>
                Plan smarter, travel better. Create personalized trips with AI-powered itineraries, budget tracking, and local insights.
              </p>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <button
                  className="neu-btn-primary"
                  onClick={() => { window.location.href = '/dashboard/ai-planner' }}
                  style={{ padding: '14px 28px' }}
                >
                  <Sparkles size={17} />
                  Generate with AI
                </button>
                <button
                  className="neu-btn"
                  onClick={() => { window.location.href = '/dashboard/trips' }}
                  style={{ padding: '14px 28px', color: '#334155' }}
                >
                  <Plus size={17} />
                  Create Trip
                </button>
              </div>
            </div>

            {/* Bento widgets — right side */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 220, maxWidth: 280, flex: '0 0 auto' }}>
              {/* Weather widget */}
              <BentoWidget>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: NEU.BG, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Cloud size={18} color="#06B6D4" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif' }}>Today</div>
                    <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#1E293B' }}>24°C ☀️</div>
                  </div>
                </div>
              </BentoWidget>

              {/* Upcoming trip widget */}
              <BentoWidget>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>Next Trip</div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#1E293B' }}>
                  {trips[0]?.title || 'No trips planned'}
                </div>
                {trips[0] && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                    <MapPin size={11} color="#6C63FF" />
                    <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
                      {trips[0].stops?.[0]?.cityName || '—'}
                    </span>
                  </div>
                )}
              </BentoWidget>

              {/* AI tip widget */}
              <BentoWidget>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 11, background: NEU.BG, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Star size={15} color="#F59E0B" />
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
                    AI suggests <strong style={{ color: '#6C63FF' }}>Barcelona</strong> for your next adventure
                  </span>
                </div>
              </BentoWidget>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI PROMO BANNER ── */}
      <section>
        <div style={{
          background: NEU.BG, borderRadius: 28, boxShadow: NEU.raised, border: 'none',
          padding: '1.75rem 2.25rem', display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 240 }}>
            <div style={{ width: 52, height: 52, borderRadius: 18, background: NEU.BG, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={22} color="#6C63FF" />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6C63FF', marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>Powered by TripO AI</div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#1E293B', margin: 0 }}>🤖 Instant AI Itineraries</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: 6, fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                Enter your destination and travel style — get a full day-by-day plan in seconds.
              </p>
            </div>
          </div>
          <button
            className="neu-btn-primary"
            onClick={() => { window.location.href = '/dashboard/ai-planner' }}
            style={{ padding: '14px 28px', flexShrink: 0 }}
          >
            Try AI Planner
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* ── STATS GRID ── */}
      <section>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#1E293B', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={18} color="#6C63FF" />
          Your Stats
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          <StatTile label="Total Trips"  value={stats.totalTrips} sublabel="Planned"     icon={Briefcase} accent="#6C63FF" />
          <StatTile label="Upcoming"     value={stats.upcoming}   sublabel="In Queue"    icon={Calendar}  accent="#F59E0B" />
          <StatTile label="Countries"    value={stats.countries}  sublabel="Explored"    icon={Globe}     accent="#22C55E" />
          <StatTile label="Total Spent"  value={`$${stats.spent.toLocaleString()}`} sublabel="Accumulated" icon={DollarSign} accent="#A78BFA" />
        </div>
      </section>

      {/* ── JOURNEYS SECTION ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.4rem', color: '#1E293B', margin: 0 }}>Your Journeys</h2>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: 6, fontFamily: 'Inter, sans-serif' }}>Trips you've created or recently explored</p>
          </div>
          <button
            className="neu-btn"
            onClick={() => { window.location.href = '/dashboard/trips' }}
            style={{ padding: '10px 20px', color: '#6C63FF', fontSize: '0.85rem' }}
          >
            View All <ArrowRight size={15} />
          </button>
        </div>

        {trips.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {trips.map(trip => <TripCard key={trip.id} trip={trip} />)}
          </div>
        ) : (
          <div style={{
            background: NEU.BG, borderRadius: 28, boxShadow: NEU.raised, border: 'none',
            padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
          }}>
            <div style={{ width: 72, height: 72, borderRadius: 24, background: NEU.BG, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Compass size={32} color="#94A3B8" />
            </div>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#1E293B', margin: '0 0 8px' }}>No trips yet</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: 24, fontFamily: 'Inter, sans-serif' }}>Start planning your first adventure!</p>
            <button className="neu-btn-primary" onClick={() => { window.location.href = '/dashboard/ai-planner' }}>
              <Sparkles size={16} /> Create with AI
            </button>
          </div>
        )}
      </section>

      <style>{`
        @keyframes floatHero {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}