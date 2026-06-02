// app/dashboard/trips/page.tsx
'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Plus, MapPin, Calendar, Compass, Search, Trash2, Share2, Edit3,
  TrendingUp, AlertTriangle, ArrowLeft, DollarSign, Coffee, FileText,
  Clock, Star, Check, ChevronRight, Utensils, Sparkles, PieChart as PieChartIcon
} from 'lucide-react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from 'recharts'
import { getUserTrips, deleteTrip, updateTripBudget } from '@/app/actions/trip'

// ─────────────────────────────────────────────────────────────
// Shared Neumorphic tokens
// ─────────────────────────────────────────────────────────────
const NEU = {
  BG:      '#EAEFF5',
  raised:  '8px 8px 16px rgba(163,177,198,.45), -8px -8px 16px rgba(255,255,255,.85)',
  hover:   '12px 12px 24px rgba(163,177,198,.35), -12px -12px 24px rgba(255,255,255,.9)',
  pressed: 'inset 4px 4px 8px rgba(163,177,198,.45), inset -4px -4px 8px rgba(255,255,255,.85)',
  input:   'inset 3px 3px 8px rgba(163,177,198,.35), inset -3px -3px 8px rgba(255,255,255,.85)',
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface TripStop   { id: string; cityName: string; country: string }
interface TripExpense{ id: string; amount: number; category: string }
interface Trip {
  id: string; title: string; description?: string | null
  startDate: string; endDate: string; totalBudget?: number | null
  coverImage?: string | null; stops?: TripStop[]; expenses?: TripExpense[]
  itineraryDays?: Array<{ day: number; totalSpent: number; activities: Array<{ name: string; time: string; rating?: string; city?: string; expense: number; isMeal?: boolean; description?: string }> }>
  smartRecommendations?: Array<{ name: string; desc: string; rating: string; type?: string }>
}

// ─────────────────────────────────────────────────────────────
// Neumorphic Tab Button
// ─────────────────────────────────────────────────────────────
const TabButton = ({ active, onClick, children, icon: Icon }: {
  active: boolean; onClick: () => void; children: React.ReactNode; icon?: React.ElementType
}) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 20px', borderRadius: 16, border: 'none', cursor: 'pointer',
      fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.875rem',
      background: NEU.BG,
      boxShadow: active ? NEU.pressed : NEU.raised,
      color: active ? '#6C63FF' : '#64748B',
      transition: 'all .3s ease', transform: active ? 'scale(.97)' : 'scale(1)',
    }}
  >
    {Icon && <Icon size={17} />}
    {children}
  </button>
)

// ─────────────────────────────────────────────────────────────
// Expense Row
// ─────────────────────────────────────────────────────────────
const ExpenseRow = ({ label, description, value, onChange, currency }: {
  label: string; description: string; value: number; onChange: (v: number) => void; currency: string; color?: string
}) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderBottom: '1px solid rgba(163,177,198,.15)' }}>
    <div>
      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>{label}</span>
      <span style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>{description}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontWeight: 700, color: '#64748B', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>{currency}</span>
      <input
        type="number"
        value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        style={{
          width: 120, padding: '8px 14px', borderRadius: 12, border: 'none', outline: 'none',
          background: NEU.BG, boxShadow: NEU.input, fontWeight: 700, fontSize: '0.9rem',
          color: '#1E293B', fontFamily: 'Inter, sans-serif',
        }}
      />
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────
// Activity Item
// ─────────────────────────────────────────────────────────────
const ActivityItem = ({ activity, currency }: { activity: any; currency: string }) => {
  if (activity.isMeal) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 14, background: NEU.BG, boxShadow: NEU.pressed }}>
      <Utensils size={16} color="#F59E0B" style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#334155' }}>{activity.name}</span>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F59E0B', fontFamily: 'Inter, sans-serif' }}>{currency}{activity.expense}</span>
    </div>
  )
  return (
    <div
      style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', borderRadius: 16, background: NEU.BG, boxShadow: NEU.raised, transition: 'all .25s ease' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.hover }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.raised }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Clock size={13} color="#94A3B8" />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{activity.time}</span>
          {activity.city && <div style={{ padding: '2px 10px', borderRadius: 999, background: NEU.BG, boxShadow: NEU.pressed, fontSize: 11, color: '#64748B', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{activity.city}</div>}
        </div>
        <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#1E293B', margin: 0, fontSize: '0.95rem' }}>{activity.name}</h4>
        {activity.description && <p style={{ fontSize: '0.82rem', color: '#94A3B8', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, margin: '4px 0 0' }}>{activity.description}</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        {activity.rating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={13} color="#F59E0B" style={{ fill: '#F59E0B' }} />
            <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1E293B', fontFamily: 'Inter, sans-serif' }}>{activity.rating}</span>
          </div>
        )}
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6C63FF', fontFamily: 'Inter, sans-serif' }}>
          {activity.expense > 0 ? `${currency}${activity.expense}` : 'Free'}
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Hidden Gem Card
// ─────────────────────────────────────────────────────────────
const HiddenGemCard = ({ gem }: { gem: any }) => (
  <div
    style={{ background: NEU.BG, borderRadius: 20, boxShadow: NEU.raised, border: 'none', padding: '1.1rem 1.25rem', transition: 'all .3s ease' }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.hover }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.raised }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', color: '#6C63FF', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{gem.type || 'Hidden Gem'}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Star size={13} color="#F59E0B" style={{ fill: '#F59E0B' }} />
        <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1E293B', fontFamily: 'Inter, sans-serif' }}>{gem.rating}</span>
      </div>
    </div>
    <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#1E293B', margin: '0 0 6px', fontSize: '0.95rem' }}>{gem.name}</h4>
    <p style={{ fontSize: '0.82rem', color: '#94A3B8', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, margin: 0 }}>{gem.desc}</p>
  </div>
)

// ─────────────────────────────────────────────────────────────
// Note Item
// ─────────────────────────────────────────────────────────────
const NoteItem = ({ note, onDelete }: { note: { id: string; content: string }; onDelete: (id: string) => void }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, padding: '16px 18px', borderRadius: 18, background: NEU.BG, boxShadow: NEU.raised, border: 'none' }}>
    <p style={{ fontSize: '0.9rem', color: '#1E293B', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, margin: 0 }}>{note.content}</p>
    <button onClick={() => onDelete(note.id)} style={{ padding: 8, borderRadius: 12, border: 'none', cursor: 'pointer', background: NEU.BG, boxShadow: NEU.raised, color: '#94A3B8', transition: 'color .2s ease', flexShrink: 0 }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EF4444' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94A3B8' }}
    ><Trash2 size={14} /></button>
  </div>
)

// ─────────────────────────────────────────────────────────────
// Trip Card (Listing)
// ─────────────────────────────────────────────────────────────
const TripCard = ({ trip, onClick, onDelete, currency }: {
  trip: Trip; onClick: () => void; onDelete: (e: React.MouseEvent) => void; currency: string
}) => {
  const startF = new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const endF   = new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const dest   = trip.stops?.[0] ? `${trip.stops[0].cityName}, ${trip.stops[0].country}` : 'No destination'

  return (
    <div
      onClick={onClick}
      style={{ background: NEU.BG, borderRadius: 24, boxShadow: NEU.raised, border: 'none', overflow: 'hidden', cursor: 'pointer', transition: 'all .3s ease' }}
      onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-6px)'; el.style.boxShadow = NEU.hover }}
      onMouseLeave={e => { const el = e.currentTarget; el.style.transform = 'translateY(0)'; el.style.boxShadow = NEU.raised }}
    >
      <div style={{ position: 'relative', height: 160, padding: 10 }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 18, overflow: 'hidden', boxShadow: NEU.pressed, position: 'relative' }}>
          {trip.coverImage
            ? <img src={trip.coverImage} alt={trip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DDE4EE' }}><Compass size={32} color="#94A3B8" /></div>
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.4) 0%, transparent 50%)' }} />
        </div>
        <button
          onClick={onDelete}
          style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: 12, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,.7)', backdropFilter: 'blur(8px)', boxShadow: '4px 4px 10px rgba(163,177,198,.3), -4px -4px 10px rgba(255,255,255,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', transition: 'color .2s ease', zIndex: 10 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EF4444' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94A3B8' }}
        ><Trash2 size={14} /></button>
      </div>
      <div style={{ padding: '6px 18px 18px' }}>
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#1E293B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.title}</h3>
        <p style={{ fontSize: '0.82rem', color: '#94A3B8', fontFamily: 'Inter, sans-serif', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '6px 0 12px' }}>
          {trip.description || 'No description yet.'}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, paddingTop: 12, borderTop: '1px solid rgba(163,177,198,.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
            <Calendar size={13} color="#6C63FF" /> {startF} – {endF}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
            <MapPin size={13} color="#6C63FF" /> <span style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dest}</span>
          </div>
          {trip.totalBudget && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', fontWeight: 700, color: '#1E293B', fontFamily: 'Inter, sans-serif' }}>
              <DollarSign size={13} color="#22C55E" /> {currency}{trip.totalBudget.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// NeuCard helper
// ─────────────────────────────────────────────────────────────
const NeuCard = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: NEU.BG, borderRadius: 24, boxShadow: NEU.raised, border: 'none', padding: '1.75rem 2rem', ...style }}>{children}</div>
)

// ─────────────────────────────────────────────────────────────
// Inner Trips Page
// ─────────────────────────────────────────────────────────────
function TripsPageInner() {
  const searchParams = useSearchParams()
  const activeId = searchParams.get('id')

  const [trips, setTrips] = useState<Trip[]>([])
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'gems' | 'notes'>('itinerary')
  const [currencySymbol, setCurrencySymbol] = useState('$')
  const [notes, setNotes] = useState<Array<{ id: string; content: string }>>([])
  const [newNoteText, setNewNoteText] = useState('')

  const handleCreateManualTrip = () => {
    const mockTitle = prompt('Enter Trip Destination:', 'Paris')
    if (!mockTitle) return
    const id = `man_trip_${Date.now()}`
    const newTrip: Trip = {
      id, title: `Trip to ${mockTitle}`, description: 'Custom travel plan',
      startDate: new Date().toISOString(), endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      totalBudget: 8000, coverImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=600',
      stops: [{ id: 's1', cityName: mockTitle, country: 'Unknown' }],
      expenses: [{ id: 'e1', amount: 1500, category: 'Transport' }, { id: 'e2', amount: 3000, category: 'Hotel' }]
    }
    const updated = [newTrip, ...trips]; setTrips(updated)
    if (user) localStorage.setItem(`traveloop_trips_${user.id}`, JSON.stringify(updated))
    window.location.href = `/dashboard/trips?id=${id}`
  }

  useEffect(() => {
    const load = async () => {
      const raw = localStorage.getItem('traveloop_user')
      if (!raw) { window.location.href = '/'; return }
      const u = JSON.parse(raw); setUser(u)
      if (u.country) {
        const c = u.country.toLowerCase()
        if (c.includes('india')) setCurrencySymbol('₹')
        else if (c.includes('united kingdom') || c.includes('uk')) setCurrencySymbol('£')
        else if (c.includes('france') || c.includes('germany') || c.includes('italy') || c.includes('spain') || c.includes('europe') || c.includes('switzerland')) setCurrencySymbol('€')
        else if (c.includes('united arab emirates') || c.includes('uae') || c.includes('dubai')) setCurrencySymbol('AED')
        else setCurrencySymbol('$')
      }
      try {
        const res = await getUserTrips(u.id)
        let loaded: Trip[] = []
        if (res.success && res.trips?.length > 0) loaded = res.trips as unknown as Trip[]
        else { const s = localStorage.getItem(`traveloop_trips_${u.id}`); loaded = s ? JSON.parse(s) : [] }
        setTrips(loaded)
        if (activeId) {
          const found = loaded.find(t => t.id === activeId)
          if (found) { setActiveTrip(found); const n = localStorage.getItem(`traveloop_notes_${found.id}`); setNotes(n ? JSON.parse(n) : []) }
        }
      } catch {
        const s = localStorage.getItem(`traveloop_trips_${u.id}`); const loaded: Trip[] = s ? JSON.parse(s) : []; setTrips(loaded)
        if (activeId) { const found = loaded.find(t => t.id === activeId); if (found) { setActiveTrip(found); const n = localStorage.getItem(`traveloop_notes_${found.id}`); setNotes(n ? JSON.parse(n) : []) } }
      } finally { setLoading(false) }
    }
    load()
  }, [activeId])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this trip?')) return
    try { await deleteTrip(id) } catch { /* no-op */ }
    const updated = trips.filter(t => t.id !== id); setTrips(updated)
    if (user) localStorage.setItem(`traveloop_trips_${user.id}`, JSON.stringify(updated))
    window.location.href = '/dashboard/trips'
  }

  const handleExpenseChange = (cat: string, val: number) => {
    if (!activeTrip) return
    const exps = [...(activeTrip.expenses || [])]
    const idx = exps.findIndex(e => e.category === cat)
    if (idx >= 0) exps[idx].amount = val; else exps.push({ id: `exp_${Date.now()}`, amount: val, category: cat })
    const total = exps.reduce((s, e) => s + e.amount, 0)
    const updated = { ...activeTrip, expenses: exps, totalBudget: activeTrip.totalBudget || total + 1000 }
    setActiveTrip(updated)
    const all = trips.map(t => t.id === activeTrip.id ? updated : t); setTrips(all)
    if (user) { localStorage.setItem(`traveloop_trips_${user.id}`, JSON.stringify(all)); updateTripBudget(activeTrip.id, updated.totalBudget!) }
  }

  const handleBudgetLimitChange = (val: number) => {
    if (!activeTrip) return
    const updated = { ...activeTrip, totalBudget: val }; setActiveTrip(updated)
    const all = trips.map(t => t.id === activeTrip.id ? updated : t); setTrips(all)
    if (user) { localStorage.setItem(`traveloop_trips_${user.id}`, JSON.stringify(all)); updateTripBudget(activeTrip.id, val) }
  }

  const handleAddNote = () => {
    if (!newNoteText.trim() || !activeTrip) return
    const updated = [...notes, { id: `note_${Date.now()}`, content: newNoteText.trim() }]; setNotes(updated); setNewNoteText('')
    localStorage.setItem(`traveloop_notes_${activeTrip.id}`, JSON.stringify(updated))
  }
  const handleDeleteNote = (id: string) => {
    if (!activeTrip) return
    const updated = notes.filter(n => n.id !== id); setNotes(updated)
    localStorage.setItem(`traveloop_notes_${activeTrip.id}`, JSON.stringify(updated))
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 56, height: 56, borderRadius: 20, background: NEU.BG, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Compass size={24} color="#6C63FF" style={{ animation: 'spin 1.5s linear infinite' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Loading trips...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  // ── DETAIL VIEW ────────────────────────────────────────────
  if (activeTrip) {
    const daysDiff = Math.max(1, Math.ceil((new Date(activeTrip.endDate).getTime() - new Date(activeTrip.startDate).getTime()) / (1e3 * 60 * 60 * 24)))
    const totalBudget = activeTrip.totalBudget || 15000
    const exps = activeTrip.expenses || []
    const transportVal    = exps.find(e => e.category === 'Transport')?.amount || 0
    const hotelVal        = exps.find(e => e.category === 'Hotel')?.amount || 0
    const foodVal         = exps.find(e => e.category === 'Food')?.amount || 0
    const activitiesVal   = exps.find(e => e.category === 'Activities')?.amount || 0
    const miscVal         = exps.find(e => e.category === 'Misc')?.amount || 0
    const totalSpent      = transportVal + hotelVal + foodVal + activitiesVal + miscVal
    const dailyAvg        = Math.round(totalSpent / daysDiff)
    const actBudgetLimit  = totalBudget * .4
    const actExceeded     = activitiesVal > actBudgetLimit
    const chartData = [
      { name: 'Transport', value: transportVal, color: '#6C63FF' },
      { name: 'Hotel',     value: hotelVal,     color: '#8B5CF6' },
      { name: 'Food',      value: foodVal,      color: '#22C55E' },
      { name: 'Activities',value: activitiesVal, color: '#F59E0B' },
      { name: 'Misc',      value: miscVal,      color: '#EF4444' },
    ].filter(d => d.value > 0)
    const gems = activeTrip.smartRecommendations || []
    const dest = activeTrip.stops?.[0] ? `${activeTrip.stops[0].cityName}, ${activeTrip.stops[0].country}` : 'Custom Location'

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1200, margin: '0 auto', paddingBottom: 48 }}>

        {/* Back + Actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <button className="neu-btn" onClick={() => { window.location.href = '/dashboard/trips' }} style={{ padding: '10px 20px', color: '#334155' }}>
            <ArrowLeft size={16} /> Back to Trips
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="neu-btn" onClick={() => alert(`Share: traveloop.ai/share/${activeTrip.id}`)} style={{ padding: '10px 18px', color: '#334155' }}><Share2 size={15} /> Share</button>
            <button className="neu-btn-primary" onClick={() => alert('Edit mode!')} style={{ padding: '10px 18px' }}><Edit3 size={15} /> Edit</button>
            <button className="neu-btn" onClick={() => handleDelete(activeTrip.id)} style={{ padding: '10px 12px', color: '#94A3B8' }}><Trash2 size={15} /></button>
          </div>
        </div>

        {/* Hero Cover */}
        <NeuCard style={{ padding: 10, overflow: 'hidden' }}>
          <div style={{ position: 'relative', height: 260, borderRadius: 20, overflow: 'hidden', boxShadow: NEU.pressed }}>
            {activeTrip.coverImage
              ? <img src={activeTrip.coverImage} alt={activeTrip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DDE4EE' }}><Compass size={48} color="#94A3B8" /></div>
            }
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, marginBottom: 10,
                  background: 'rgba(255,255,255,.7)', backdropFilter: 'blur(8px)',
                  boxShadow: '4px 4px 10px rgba(163,177,198,.3), -4px -4px 10px rgba(255,255,255,.7)',
                  fontSize: '0.78rem', fontWeight: 700, color: '#6C63FF', fontFamily: 'Inter, sans-serif',
                }}><MapPin size={13} /> {dest}</div>
                <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: '#fff', margin: 0, textShadow: '0 2px 12px rgba(0,0,0,.3)' }}>{activeTrip.title}</h1>
                {activeTrip.description && <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,.8)', marginTop: 6, fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>{activeTrip.description}</p>}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 14,
                background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(10px)',
                boxShadow: '4px 4px 10px rgba(163,177,198,.3), -4px -4px 10px rgba(255,255,255,.7)',
              }}>
                <Calendar size={15} color="#6C63FF" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', fontFamily: 'Inter, sans-serif' }}>
                  {new Date(activeTrip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(activeTrip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </NeuCard>

        {/* Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <TabButton active={activeTab === 'itinerary'} onClick={() => setActiveTab('itinerary')} icon={Calendar}>Itinerary</TabButton>
          <TabButton active={activeTab === 'budget'} onClick={() => setActiveTab('budget')} icon={DollarSign}>Budget</TabButton>
          <TabButton active={activeTab === 'gems'} onClick={() => setActiveTab('gems')} icon={Coffee}>Hidden Gems</TabButton>
          <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={FileText}>Notes</TabButton>
        </div>

        {/* TAB: Itinerary */}
        {activeTab === 'itinerary' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {activeTrip.itineraryDays?.length ? activeTrip.itineraryDays.map(day => (
              <NeuCard key={day.day}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(163,177,198,.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 14, background: NEU.BG, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#6C63FF' }}>{day.day}</div>
                    <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1E293B' }}>Day {day.day} Schedule</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', color: '#94A3B8' }}>Daily: <strong style={{ color: '#6C63FF' }}>{currencySymbol}{day.totalSpent}</strong></span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {day.activities.map((a: any, i: number) => <ActivityItem key={i} activity={a} currency={currencySymbol} />)}
                </div>
              </NeuCard>
            )) : (
              <NeuCard style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <Compass size={40} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#1E293B', margin: '0 0 8px' }}>No itinerary yet</h3>
                <p style={{ color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Add activities to build your plan.</p>
              </NeuCard>
            )}
            {gems.length > 0 && (
              <NeuCard>
                <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 16px' }}>
                  <Sparkles size={18} color="#6C63FF" /> AI Recommendations
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 14 }}>
                  {gems.map((g: any, i: number) => <HiddenGemCard key={i} gem={g} />)}
                </div>
              </NeuCard>
            )}
          </div>
        )}

        {/* TAB: Budget */}
        {activeTab === 'budget' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {actExceeded && (
              <NeuCard style={{ background: NEU.BG, boxShadow: 'inset 4px 4px 10px rgba(239,68,68,.15), inset -4px -4px 10px rgba(255,255,255,.8)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <AlertTriangle size={20} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif' }}>Budget Alert</span>
                    <p style={{ fontSize: '0.85rem', color: '#94A3B8', fontFamily: 'Inter, sans-serif', marginTop: 4 }}>
                      Activities ({currencySymbol}{activitiesVal.toLocaleString()}) exceeds 40% of budget ({currencySymbol}{actBudgetLimit.toLocaleString()}).
                    </p>
                  </div>
                </div>
              </NeuCard>
            )}

            {/* Stat tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { label: 'Total Budget', icon: DollarSign, accent: '#6C63FF', editable: true, value: totalBudget },
                { label: 'Daily Average', icon: TrendingUp, accent: '#22C55E', value: dailyAvg, sub: `Over ${daysDiff} days` },
                { label: 'Activities', icon: Star, accent: '#F59E0B', value: activitiesVal, exceeded: actExceeded, sub: `Limit: ${currencySymbol}${actBudgetLimit.toLocaleString()}` },
              ].map((s, i) => (
                <div key={i} style={{ background: NEU.BG, borderRadius: 24, boxShadow: NEU.raised, border: 'none', padding: '1.25rem 1.5rem', minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{s.label}</span>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: NEU.BG, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.accent }}><s.icon size={17} /></div>
                  </div>
                  <div>
                    {s.editable ? (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#1E293B' }}>{currencySymbol}</span>
                        <input type="number" value={s.value} onChange={e => handleBudgetLimitChange(parseFloat(e.target.value) || 0)}
                          style={{ width: 110, background: 'transparent', border: 'none', borderBottom: '2px dashed rgba(163,177,198,.4)', outline: 'none', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#1E293B', padding: 0 }} />
                      </div>
                    ) : (
                      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: s.exceeded ? '#EF4444' : '#1E293B' }}>{currencySymbol}{s.value.toLocaleString()}</div>
                    )}
                    {s.sub && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>{s.sub}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Expense + Chart */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <NeuCard>
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#1E293B', margin: '0 0 6px' }}>Expense Breakdown</h3>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8', fontFamily: 'Inter, sans-serif', marginBottom: 20 }}>Edit category values below.</p>
                <ExpenseRow label="Transport" description="Flights, trains, car" value={transportVal} onChange={v => handleExpenseChange('Transport', v)} currency={currencySymbol} />
                <ExpenseRow label="Accommodation" description="Hotels, resorts" value={hotelVal} onChange={v => handleExpenseChange('Hotel', v)} currency={currencySymbol} />
                <ExpenseRow label="Food & Dining" description="Restaurants, cafes" value={foodVal} onChange={v => handleExpenseChange('Food', v)} currency={currencySymbol} />
                <ExpenseRow label="Activities" description="Tours, tickets" value={activitiesVal} onChange={v => handleExpenseChange('Activities', v)} currency={currencySymbol} />
                <ExpenseRow label="Miscellaneous" description="Shopping, tips" value={miscVal} onChange={v => handleExpenseChange('Misc', v)} currency={currencySymbol} />
                <div style={{ marginTop: 20, padding: '12px 16px', borderRadius: 16, background: NEU.BG, boxShadow: NEU.pressed, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#1E293B', fontFamily: 'Inter, sans-serif' }}>Total:</span>
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: '#6C63FF' }}>{currencySymbol}{totalSpent.toLocaleString()}</span>
                </div>
              </NeuCard>

              <NeuCard>
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#1E293B', margin: '0 0 6px' }}>Budget Distribution</h3>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8', fontFamily: 'Inter, sans-serif', marginBottom: 20 }}>Visual spending breakdown.</p>
                <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2}>
                          {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: NEU.BG, border: 'none', borderRadius: 16, boxShadow: NEU.raised }} formatter={(v: any) => `${currencySymbol}${v?.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <PieChartIcon size={40} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
                      <p style={{ color: '#94A3B8', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>Add expenses to see chart</p>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(163,177,198,.15)' }}>
                  {chartData.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{d.name}</span>
                    </div>
                  ))}
                </div>
              </NeuCard>
            </div>
          </div>
        )}

        {/* TAB: Gems */}
        {activeTab === 'gems' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div><h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 6px' }}><Coffee size={20} color="#6C63FF" /> Hidden Gems in {activeTrip.stops?.[0]?.cityName || 'Your Destination'}</h2></div>
            {gems.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {gems.map((g: any, i: number) => <HiddenGemCard key={i} gem={g} />)}
              </div>
            ) : (
              <NeuCard style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <Coffee size={40} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#1E293B', margin: '0 0 8px' }}>No hidden gems yet</h3>
                <p style={{ color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>AI will suggest local favorites once your itinerary is detailed.</p>
              </NeuCard>
            )}
          </div>
        )}

        {/* TAB: Notes */}
        {activeTab === 'notes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 700 }}>
            <div><h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 6px' }}><FileText size={20} color="#6C63FF" /> Trip Notes</h2></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                placeholder="Type a note and press Enter..."
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                style={{
                  flex: 1, padding: '12px 18px', borderRadius: 16, border: 'none', outline: 'none',
                  background: NEU.BG, boxShadow: NEU.input, fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#1E293B',
                }}
              />
              <button className="neu-btn-primary" onClick={handleAddNote} style={{ padding: '12px 24px' }}>Add</button>
            </div>
            {notes.length > 0 ? notes.map(n => <NoteItem key={n.id} note={n} onDelete={handleDeleteNote} />) : (
              <NeuCard style={{ textAlign: 'center', padding: '2rem' }}>
                <FileText size={32} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
                <p style={{ color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>No notes yet. Add your first reminder!</p>
              </NeuCard>
            )}
          </div>
        )}
      </div>
    )
  }

  // ── LISTING VIEW ────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1200, margin: '0 auto', paddingBottom: 48 }}>

      {/* Header */}
      <section style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#1E293B', margin: 0 }}>My Trips ✈️</h1>
          <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: 8, fontFamily: 'Inter, sans-serif' }}>Manage your itineraries, AI plans, and custom adventures.</p>
        </div>
        <button className="neu-btn-primary" onClick={handleCreateManualTrip} style={{ padding: '14px 24px' }}>
          <Plus size={17} /> Create New Trip
        </button>
      </section>

      {/* Grid */}
      {trips.length === 0 ? (
        <NeuCard style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div style={{ width: 72, height: 72, borderRadius: 24, background: NEU.BG, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Compass size={32} color="#6C63FF" />
          </div>
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.3rem', color: '#1E293B', margin: '0 0 8px' }}>No trips planned yet</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: 24, fontFamily: 'Inter, sans-serif', maxWidth: 400, margin: '0 auto 24px' }}>
            Create an AI itinerary or build a custom trip from scratch.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
            <button className="neu-btn-primary" onClick={() => { window.location.href = '/dashboard/ai-planner' }} style={{ padding: '12px 24px' }}>
              <Sparkles size={16} /> Use AI Planner
            </button>
            <button className="neu-btn" onClick={handleCreateManualTrip} style={{ padding: '12px 24px', color: '#334155' }}>
              Create Manual Trip
            </button>
          </div>
        </NeuCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {trips.map(t => (
            <TripCard
              key={t.id}
              trip={t}
              onClick={() => { window.location.href = `/dashboard/trips?id=${t.id}` }}
              onDelete={e => { e.stopPropagation(); handleDelete(t.id) }}
              currency={currencySymbol}
            />
          ))}
        </div>
      )}

      {/* Pro tip */}
      <NeuCard style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: NEU.BG, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Sparkles size={20} color="#6C63FF" />
        </div>
        <div>
          <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#1E293B', margin: '0 0 6px', fontSize: '1rem' }}>Pro Tip</h4>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
            Use the <strong style={{ color: '#6C63FF' }}>Budget</strong> tab to adjust spending in real-time, and <strong style={{ color: '#6C63FF' }}>Notes</strong> to keep travel details handy!
          </p>
        </div>
      </NeuCard>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Export with Suspense
// ─────────────────────────────────────────────────────────────
export default function MyTripsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 20, background: '#EAEFF5', boxShadow: 'inset 4px 4px 8px rgba(163,177,198,.45), inset -4px -4px 8px rgba(255,255,255,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Compass size={24} color="#6C63FF" style={{ animation: 'spin 1.5s linear infinite' }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94A3B8' }}>Loading trips...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <TripsPageInner />
    </Suspense>
  )
}