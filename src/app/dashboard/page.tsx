// app/dashboard/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import {
  Sparkles, Plus, ArrowRight, MapPin, Calendar,
  Globe, DollarSign, Compass, Briefcase, Cloud, Star, TrendingUp
} from 'lucide-react'
import { getUserTrips } from '@/app/actions/trip'

// ─────────────────────────────────────────────────────────────
// 3-Level Elevation Tokens (reduced opacity)
// ─────────────────────────────────────────────────────────────
const NEU = {
  PAGE:    '#E8EDF4',
  SECTION: '#EEF2F7',
  CARD:    '#F8FAFC',
  raised:  '8px 8px 18px rgba(163,177,198,.18), -8px -8px 18px rgba(255,255,255,.9)',
  hover:   '10px 10px 22px rgba(163,177,198,.15), -10px -10px 22px rgba(255,255,255,.95)',
  pressed: 'inset 4px 4px 8px rgba(163,177,198,.2), inset -4px -4px 8px rgba(255,255,255,.9)',
  input:   'inset 3px 3px 6px rgba(163,177,198,.15), inset -3px -3px 6px rgba(255,255,255,.9)',
}

interface TripStop   { id: string; cityName: string; country: string }
interface TripExpense{ id: string; amount: number; category: string }
interface Trip {
  id: string; title: string; description?: string | null
  startDate: Date | string; endDate: Date | string
  totalBudget?: number | null; coverImage?: string | null
  stops?: TripStop[]; expenses?: TripExpense[]
}

const DEFAULT_MOCK_TRIPS: Trip[] = [
  { id: 'mock_trip_1', title: 'Tokyo Sakura Dream', description: 'Spring getaway to witness cherry blossoms and explore futuristic electronics hubs.', startDate: '2026-04-10', endDate: '2026-04-18', totalBudget: 3500, coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=600', stops: [{ id: 's1', cityName: 'Tokyo', country: 'Japan' }], expenses: [{ id: 'e1', amount: 450, category: 'Food' }, { id: 'e2', amount: 1200, category: 'Accommodation' }, { id: 'e3', amount: 800, category: 'Activities' }] },
  { id: 'mock_trip_2', title: 'Parisian Summer Escape', description: 'Strolling through museum halls, cafe terraces, and watching sunset by the Eiffel Tower.', startDate: '2026-07-05', endDate: '2026-07-12', totalBudget: 5000, coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600', stops: [{ id: 's2', cityName: 'Paris', country: 'France' }], expenses: [{ id: 'e4', amount: 1200, category: 'Flights' }, { id: 'e5', amount: 1500, category: 'Accommodation' }] },
  { id: 'mock_trip_3', title: 'Swiss Alps Wanderer', description: 'Hiking majestic peaks and tasting world-class chocolates in scenic valleys.', startDate: '2026-09-20', endDate: '2026-09-30', totalBudget: 4200, coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=600', stops: [{ id: 's3', cityName: 'Zurich', country: 'Switzerland' }], expenses: [{ id: 'e6', amount: 300, category: 'Transport' }] },
]

// ─────────────────────────────────────────────────────────────
// Stat Tile — with accent left border
// ─────────────────────────────────────────────────────────────
const StatTile = ({ label, value, sublabel, icon: Icon, accent }: {
  label: string; value: string | number; sublabel: string; icon: React.ElementType; accent: string
}) => (
  <div
    style={{
      background: NEU.CARD, borderRadius: 24, boxShadow: NEU.raised, border: 'none',
      borderLeft: `4px solid ${accent}`,
      padding: '1.25rem 1.5rem', minHeight: 120, display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', transition: 'all .25s ease', cursor: 'default',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.hover }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.raised }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{label}</span>
      <div style={{
        width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: NEU.PAGE, boxShadow: NEU.pressed, color: accent,
      }}><Icon size={16} /></div>
    </div>
    <div>
      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.75rem', color: '#1E293B', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', marginTop: 4, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{sublabel}</div>
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────
// Trip Card
// ─────────────────────────────────────────────────────────────
const TripCard = ({ trip }: { trip: Trip }) => {
  const startDate = new Date(trip.startDate)
  const endDate   = new Date(trip.endDate)
  const dateRange = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  const budget    = trip.totalBudget || 0
  const spent     = (trip.expenses || []).reduce((s, e) => s + e.amount, 0)
  const pct       = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0
  const dest      = trip.stops?.[0] ? `${trip.stops[0].cityName}, ${trip.stops[0].country}` : 'Destination TBD'

  return (
    <div
      style={{
        background: NEU.CARD, borderRadius: 28, boxShadow: NEU.raised, border: 'none',
        overflow: 'hidden', cursor: 'pointer', transition: 'all .25s ease',
      }}
      onClick={() => { window.location.href = `/dashboard/trips?id=${trip.id}` }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.hover }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.raised }}
    >
      <div style={{ position: 'relative', height: 190, padding: 10 }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden', boxShadow: NEU.pressed, position: 'relative' }}>
          {trip.coverImage
            ? <img src={trip.coverImage} alt={trip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: NEU.SECTION }}><Compass size={28} color="#94A3B8" /></div>
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.35) 0%, transparent 55%)' }} />
        </div>
        <div style={{
          position: 'absolute', top: 18, right: 18, padding: '5px 12px', borderRadius: 10,
          background: 'rgba(248,250,252,.8)', backdropFilter: 'blur(8px)',
          boxShadow: NEU.soft, display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <Calendar size={10} color="#6C63FF" />
          <span style={{ fontSize: 9, fontWeight: 700, color: '#1E293B', fontFamily: 'Inter, sans-serif' }}>{dateRange}</span>
        </div>
      </div>
      <div style={{ padding: '6px 18px 18px' }}>
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#1E293B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.title}</h3>
        <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 6, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {trip.description || 'No description yet.'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
          <MapPin size={13} color="#6C63FF" />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', fontFamily: 'Inter, sans-serif' }}>{dest}</span>
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, marginBottom: 5, fontFamily: 'Inter, sans-serif' }}>
            <span style={{ color: '#94A3B8' }}>Budget ${budget.toLocaleString()}</span>
            <span style={{ color: pct > 85 ? '#EF4444' : '#6C63FF' }}>${spent.toLocaleString()} ({pct}%)</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: NEU.PAGE, boxShadow: NEU.pressed, overflow: 'hidden', padding: 2 }}>
            <div style={{ height: '100%', borderRadius: 999, width: `${pct}%`, transition: 'width .5s ease', background: pct > 85 ? '#EF4444' : 'linear-gradient(90deg, #6C63FF, #8B5CF6)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Bento Widget
// ─────────────────────────────────────────────────────────────
const BentoWidget = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: NEU.CARD, borderRadius: 20, boxShadow: NEU.raised, border: 'none', padding: '1rem 1.1rem', transition: 'all .25s ease', ...style }}>
    {children}
  </div>
)

// ─────────────────────────────────────────────────────────────
// Main Dashboard
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
        if (res.success && res.trips?.length > 0) setTrips(res.trips as unknown as Trip[])
        else {
          const key = `traveloop_trips_${u.id}`; const stored = localStorage.getItem(key)
          if (stored) setTrips(JSON.parse(stored))
          else { localStorage.setItem(key, JSON.stringify(DEFAULT_MOCK_TRIPS)); setTrips(DEFAULT_MOCK_TRIPS) }
        }
      } catch {
        const key = `traveloop_trips_${u?.id || 'guest'}`; const stored = localStorage.getItem(key)
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 56, height: 56, borderRadius: 20, background: NEU.CARD, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Compass size={24} color="#6C63FF" style={{ animation: 'spin 1.5s linear infinite' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Loading Journeys...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  const firstName = user?.name?.split(' ')[0] || 'Traveler'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, maxWidth: 1100, margin: '0 auto' }}>

      {/* ── HERO ── */}
      <section>
        <div style={{
          background: NEU.CARD, borderRadius: 32, boxShadow: NEU.raised, border: 'none',
          padding: '2.25rem 2.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              {/* Badge — no emoji */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '5px 14px', borderRadius: 999,
                background: NEU.PAGE, boxShadow: NEU.pressed,
                fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6C63FF',
                marginBottom: 16,
              }}>
                <Sparkles size={12} /> Smart Journey Builder
              </div>

              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', color: '#1E293B', margin: '0 0 6px', lineHeight: 1.15 }}>
                {greeting}, {firstName}
              </h1>
              <p style={{ fontSize: '0.9rem', color: '#64748B', fontFamily: 'Inter, sans-serif', marginBottom: 24, lineHeight: 1.6 }}>
                Plan your next journey. Create personalized trips with AI-powered itineraries, budget tracking, and local insights.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="neu-btn-primary" onClick={() => { window.location.href = '/dashboard/ai-planner' }} style={{ padding: '12px 24px' }}>
                  <Sparkles size={15} /> Generate with AI
                </button>
                <button className="neu-btn" onClick={() => { window.location.href = '/dashboard/trips' }} style={{ padding: '12px 24px', color: '#334155' }}>
                  <Plus size={15} /> Create Trip
                </button>
              </div>
            </div>

            {/* Bento widgets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 200, maxWidth: 250, flex: '0 0 auto' }}>
              <BentoWidget>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: NEU.PAGE, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Cloud size={15} color="#06B6D4" />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif' }}>Today</div>
                    <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#1E293B' }}>24°C</div>
                  </div>
                </div>
              </BentoWidget>
              <BentoWidget>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif', marginBottom: 6 }}>Next Trip</div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>{trips[0]?.title || 'No trips planned'}</div>
                {trips[0] && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
                    <MapPin size={10} color="#6C63FF" />
                    <span style={{ fontSize: 10, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{trips[0].stops?.[0]?.cityName || '—'}</span>
                  </div>
                )}
              </BentoWidget>
              <BentoWidget>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 9, background: NEU.PAGE, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Star size={13} color="#F59E0B" />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
                    AI suggests <strong style={{ color: '#6C63FF' }}>Barcelona</strong> for your next adventure
                  </span>
                </div>
              </BentoWidget>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI BANNER ── */}
      <section>
        <div style={{
          background: NEU.CARD, borderRadius: 28, boxShadow: NEU.raised, border: 'none',
          padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 220 }}>
            <div style={{ width: 46, height: 46, borderRadius: 16, background: NEU.PAGE, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={20} color="#6C63FF" />
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6C63FF', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>Powered by TripO AI</div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#1E293B', margin: 0 }}>Instant AI Itineraries</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 4, fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
                Enter your destination and travel style — get a full plan in seconds.
              </p>
            </div>
          </div>
          <button className="neu-btn-primary" onClick={() => { window.location.href = '/dashboard/ai-planner' }} style={{ padding: '12px 24px', flexShrink: 0 }}>
            Try AI Planner <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* ── STATS ── */}
      <section>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1E293B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={16} color="#6C63FF" /> Your Stats
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <StatTile label="Total Trips"  value={stats.totalTrips} sublabel="Planned"     icon={Briefcase} accent="#6C63FF" />
          <StatTile label="Upcoming"     value={stats.upcoming}   sublabel="In Queue"    icon={Calendar}  accent="#3B82F6" />
          <StatTile label="Countries"    value={stats.countries}  sublabel="Explored"    icon={Globe}     accent="#22C55E" />
          <StatTile label="Total Spent"  value={`$${stats.spent.toLocaleString()}`} sublabel="Accumulated" icon={DollarSign} accent="#F59E0B" />
        </div>
      </section>

      {/* ── JOURNEYS ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#1E293B', margin: 0 }}>Your Journeys</h2>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>Trips you've created or recently explored</p>
          </div>
          <button className="neu-btn" onClick={() => { window.location.href = '/dashboard/trips' }} style={{ padding: '9px 18px', color: '#6C63FF', fontSize: '0.8rem' }}>
            View All <ArrowRight size={14} />
          </button>
        </div>

        {trips.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {trips.map(trip => <TripCard key={trip.id} trip={trip} />)}
          </div>
        ) : (
          <div style={{
            background: NEU.CARD, borderRadius: 32, boxShadow: NEU.raised, border: 'none',
            padding: '3.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
          }}>
            <div style={{ width: 64, height: 64, borderRadius: 22, background: NEU.PAGE, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Compass size={28} color="#94A3B8" />
            </div>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#1E293B', margin: '0 0 6px' }}>No trips yet</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>Start planning your first adventure</p>
            <button className="neu-btn-primary" onClick={() => { window.location.href = '/dashboard/ai-planner' }}>
              <Sparkles size={14} /> Create with AI
            </button>
          </div>
        )}
      </section>
    </div>
  )
}