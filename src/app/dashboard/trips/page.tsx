// app/dashboard/trips/page.tsx
'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Plus, MapPin, Calendar, Compass, Search, Trash2, Share2, Edit3,
  TrendingUp, AlertTriangle, ArrowLeft, DollarSign, Coffee, FileText,
  Clock, Star, Check, ChevronRight, Utensils, Sparkles, PieChart as PieChartIcon,
  Navigation, X, Map, Heart as HeartIcon, Sun, CloudSun, CloudRain
} from 'lucide-react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from 'recharts'
import { getUserTrips, deleteTrip, updateTripBudget } from '@/app/actions/trip'
import { getGoogleMapsApiKey, getPlaceDetails } from '@/app/actions/googlePlaces'
import { GoogleMapWidget, Activity as MapActivity } from '@/components/GoogleMapWidget'

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
  input:   'inset 3px 3px 6px rgba(139,120,112,.15), inset -3px -3px 6px rgba(255,255,255,.9)',
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
  itineraryDays?: Array<{ day: number; area?: string; totalSpent: number; activities: Array<{ name: string; time: string; rating?: string; city?: string; expense: number; isMeal?: boolean; description?: string; lat?: number; lng?: number; placeId?: string; exactArea?: string }> }>
  smartRecommendations?: Array<{ name: string; desc: string; rating: string; type?: string }>
}

const TabButton = ({ active, onClick, children, icon: Icon }: any) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 16, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.875rem',
    background: active ? NEU.PAGE : NEU.CARD, boxShadow: active ? NEU.pressed : NEU.raised, color: active ? '#810100' : '#6B5E5C', transition: 'all .3s ease', transform: active ? 'scale(.97)' : 'scale(1)',
  }}>
    {Icon && <Icon size={17} />} {children}
  </button>
)

const ExpenseRow = ({ label, description, value, onChange, currency }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderBottom: '1px solid rgba(139,120,112,.15)' }}>
    <div>
      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1B1716' }}>{label}</span>
      <span style={{ display: 'block', fontSize: '0.78rem', color: '#9B8E8C', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>{description}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontWeight: 700, color: '#6B5E5C', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>{currency}</span>
      <input type="number" value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)}
        style={{ width: 120, padding: '8px 14px', borderRadius: 12, border: 'none', outline: 'none', background: NEU.PAGE, boxShadow: NEU.input, fontWeight: 700, fontSize: '0.9rem', color: '#1B1716', fontFamily: 'Inter, sans-serif', transition: 'box-shadow .25s ease' }}
        onFocus={e => { e.currentTarget.style.boxShadow = `${NEU.input}, 0 0 0 2px rgba(129,1,0,.2)` }} onBlur={e => { e.currentTarget.style.boxShadow = NEU.input }} />
    </div>
  </div>
)

const HiddenGemCard = ({ gem }: { gem: any }) => (
  <div style={{ background: NEU.CARD, borderRadius: 24, boxShadow: NEU.raised, border: 'none', padding: '1.25rem 1.5rem', transition: 'all .3s ease' }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.hover }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.raised }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', color: '#810100', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{gem.type || 'Hidden Gem'}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Star size={13} color="#F59E0B" style={{ fill: '#F59E0B' }} />
        <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1B1716', fontFamily: 'Inter, sans-serif' }}>{gem.rating}</span>
      </div>
    </div>
    <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#1B1716', margin: '0 0 6px', fontSize: '0.95rem' }}>{gem.name}</h4>
    <p style={{ fontSize: '0.82rem', color: '#9B8E8C', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, margin: 0 }}>{gem.desc}</p>
  </div>
)

const NoteItem = ({ note, onDelete }: any) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, padding: '16px 18px', borderRadius: 20, background: NEU.CARD, boxShadow: NEU.raised, border: 'none' }}>
    <p style={{ fontSize: '0.9rem', color: '#1B1716', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, margin: 0 }}>{note.content}</p>
    <button onClick={() => onDelete(note.id)} style={{ padding: 8, borderRadius: 12, border: 'none', cursor: 'pointer', background: NEU.CARD, boxShadow: NEU.raised, color: '#9B8E8C', transition: 'color .2s ease', flexShrink: 0 }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EF4444' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9B8E8C' }}><Trash2 size={14} /></button>
  </div>
)

const TripCard = ({ trip, onClick, onDelete, currency }: any) => {
  const startF = new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const endF   = new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const dest   = trip.stops?.[0] ? `${trip.stops[0].cityName}, ${trip.stops[0].country}` : 'No destination'

  return (
    <div onClick={onClick} style={{ background: NEU.CARD, borderRadius: 28, boxShadow: NEU.raised, border: 'none', overflow: 'hidden', cursor: 'pointer', transition: 'all .3s ease' }}
      onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-6px)'; el.style.boxShadow = NEU.hover }}
      onMouseLeave={e => { const el = e.currentTarget; el.style.transform = 'translateY(0)'; el.style.boxShadow = NEU.raised }}>
      <div style={{ position: 'relative', height: 160, padding: 10 }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden', boxShadow: NEU.pressed, position: 'relative' }}>
          {trip.coverImage ? <img src={trip.coverImage} alt={trip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DDE4EE' }}><Compass size={32} color="#9B8E8C" /></div>}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.4) 0%, transparent 50%)' }} />
        </div>
        <button onClick={onDelete} style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: 12, border: 'none', cursor: 'pointer', background: 'rgba(248,250,252,.8)', backdropFilter: 'blur(8px)', boxShadow: '4px 4px 10px rgba(139,120,112,.2), -4px -4px 10px rgba(255,255,255,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B8E8C', transition: 'color .2s ease', zIndex: 10 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EF4444' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9B8E8C' }}><Trash2 size={14} /></button>
      </div>
      <div style={{ padding: '6px 18px 18px' }}>
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#1B1716', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.title}</h3>
        <p style={{ fontSize: '0.82rem', color: '#9B8E8C', fontFamily: 'Inter, sans-serif', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '6px 0 12px' }}>{trip.description || 'No description yet.'}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, paddingTop: 12, borderTop: '1px solid rgba(139,120,112,.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#6B5E5C', fontFamily: 'Inter, sans-serif' }}><Calendar size={13} color="#810100" /> {startF} – {endF}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#6B5E5C', fontFamily: 'Inter, sans-serif' }}><MapPin size={13} color="#810100" /> <span style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dest}</span></div>
          {trip.totalBudget && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', fontWeight: 700, color: '#1B1716', fontFamily: 'Inter, sans-serif' }}><DollarSign size={13} color="#22C55E" /> {currency}{trip.totalBudget.toLocaleString()}</div>}
        </div>
      </div>
    </div>
  )
}

const NeuCard = ({ children, style = {} }: any) => (
  <div style={{ background: NEU.CARD, borderRadius: 32, boxShadow: NEU.raised, border: 'none', padding: '1.75rem 2rem', ...style }}>{children}</div>
)

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

  // Map & Drawer state
  const [googleMapsKey, setGoogleMapsKey] = useState('')
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null)
  const [mapMode, setMapMode] = useState<'clean'|'day'|'single'|'nearby'>('clean')
  const [focusedActivities, setFocusedActivities] = useState<any[]>([])

  const [fetchedPlaceDetails, setFetchedPlaceDetails] = useState<any | null>(null)
  const [isFetchingDetails, setIsFetchingDetails] = useState(false)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)

  useEffect(() => {
    getGoogleMapsApiKey().then(k => setGoogleMapsKey(k)).catch(console.error)
  }, [])

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

  const handleDaySelect = (dayActivities: any[]) => {
    setMapMode('day')
    setFocusedActivities(dayActivities)
    setSelectedActivity(null)
  }
  const handleActivitySelect = async (act: any) => {
    setSelectedActivity(act)
    setFetchedPlaceDetails(null)
    setActivePhotoIndex(0)
    if (act.placeId) {
      setIsFetchingDetails(true)
      const details = await getPlaceDetails(act.placeId)
      setFetchedPlaceDetails(details)
      setIsFetchingDetails(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 56, height: 56, borderRadius: 20, background: NEU.PAGE, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Compass size={24} color="#810100" style={{ animation: 'spin 1.5s linear infinite' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9B8E8C', fontFamily: 'Inter, sans-serif' }}>Loading trips...</span>
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
      { name: 'Transport', value: transportVal, color: '#810100' },
      { name: 'Hotel',     value: hotelVal,     color: '#810100' },
      { name: 'Food',      value: foodVal,      color: '#22C55E' },
      { name: 'Activities',value: activitiesVal, color: '#F59E0B' },
      { name: 'Misc',      value: miscVal,      color: '#EF4444' },
    ].filter(d => d.value > 0)
    const gems = activeTrip.smartRecommendations || []
    const dest = activeTrip.stops?.[0] ? `${activeTrip.stops[0].cityName}, ${activeTrip.stops[0].country}` : 'Custom Location'
    const allActivities = activeTrip.itineraryDays?.flatMap(d => d.activities) || []

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1200, margin: '0 auto', paddingBottom: 48, position: 'relative' }}>

        {/* Drawer Overlay */}
        {selectedActivity && (
          <div onClick={() => setSelectedActivity(null)} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(2px)' }} />
        )}

        {/* Slide-in Side Drawer */}
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 420, zIndex: 100,
          background: '#EDEBDE', boxShadow: '-10px 0 30px rgba(139,120,112,.3)',
          transform: selectedActivity ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', display: 'flex', flexDirection: 'column'
        }}>
          {selectedActivity && (
            <>
              <div style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setSelectedActivity(null)} style={{ background: NEU.PAGE, border: 'none', width: 40, height: 40, borderRadius: '50%', boxShadow: NEU.raised, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B5E5C' }}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 24px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                {isFetchingDetails ? (
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 250, background: NEU.CARD, borderRadius: 24, boxShadow: NEU.pressed }}>
                      <Compass size={24} color="#810100" style={{ animation: 'spin 1.5s linear infinite' }} />
                   </div>
                ) : (
                  <div style={{ width: '100%', height: 250, borderRadius: 24, background: NEU.CARD, boxShadow: NEU.pressed, overflow: 'hidden', position: 'relative' }}>
                    {fetchedPlaceDetails?.photos?.length > 0 ? (
                      <div style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', height: '100%', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                         {fetchedPlaceDetails.photos.map((photo: any, i: number) => (
                           <img key={i} src={photo.photoUrl} alt={selectedActivity.name} style={{ width: '100%', height: '100%', objectFit: 'cover', flexShrink: 0, scrollSnapAlign: 'start' }} />
                         ))}
                      </div>
                    ) : (
                      <img src={activeTrip.coverImage || ''} alt={selectedActivity.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(248,250,252,.9)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 800, color: '#810100', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {selectedActivity.isMeal ? 'Dining' : 'Attraction'}
                    </div>
                    {fetchedPlaceDetails?.photos?.length > 0 && (
                      <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>
                        Swipe photos ➔
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#1B1716', margin: '0 0 8px', lineHeight: 1.2 }}>{fetchedPlaceDetails?.name || selectedActivity.name}</h2>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <MapPin size={14} color="#6B5E5C" />
                    <span style={{ fontSize: '0.9rem', color: '#6B5E5C', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                      {selectedActivity.exactArea ? `${selectedActivity.exactArea}, ${selectedActivity.city || dest}` : (fetchedPlaceDetails?.formatted_address || selectedActivity.city || dest)}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
                    <Star size={16} color="#F59E0B" style={{ fill: '#F59E0B' }} />
                    <span style={{ fontSize: '0.95rem', color: '#1B1716', fontWeight: 700 }}>{fetchedPlaceDetails?.rating || selectedActivity.rating || '4.5'}</span>
                    <span style={{ fontSize: '0.85rem', color: '#9B8E8C', marginLeft: 4 }}>({fetchedPlaceDetails?.reviews?.length || 124} reviews)</span>
                  </div>

                  <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#1B1716', marginBottom: 8 }}>Description</h3>
                  <p style={{ fontSize: '0.95rem', color: '#6B5E5C', lineHeight: 1.6, margin: '0 0 24px', fontFamily: 'Inter, sans-serif' }}>
                    {selectedActivity.description || `A highly recommended spot to visit in ${selectedActivity.exactArea || selectedActivity.city || dest}. Experience the unique atmosphere and create unforgettable memories.`}
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                    <div style={{ background: NEU.CARD, padding: '12px', borderRadius: 16, boxShadow: NEU.raised, textAlign: 'center' }}>
                      <Clock size={18} color="#3B82F6" style={{ margin: '0 auto 6px' }} />
                      <div style={{ fontSize: 10, color: '#9B8E8C', fontWeight: 700, textTransform: 'uppercase' }}>Best Time</div>
                      <div style={{ fontSize: '0.85rem', color: '#1B1716', fontWeight: 700 }}>Morning</div>
                    </div>
                    <div style={{ background: NEU.CARD, padding: '12px', borderRadius: 16, boxShadow: NEU.raised, textAlign: 'center' }}>
                      <Calendar size={18} color="#22C55E" style={{ margin: '0 auto 6px' }} />
                      <div style={{ fontSize: 10, color: '#9B8E8C', fontWeight: 700, textTransform: 'uppercase' }}>Duration</div>
                      <div style={{ fontSize: '0.85rem', color: '#1B1716', fontWeight: 700 }}>1-2 hrs</div>
                    </div>
                    <div style={{ background: NEU.CARD, padding: '12px', borderRadius: 16, boxShadow: NEU.raised, textAlign: 'center' }}>
                      <DollarSign size={18} color="#EF4444" style={{ margin: '0 auto 6px' }} />
                      <div style={{ fontSize: 10, color: '#9B8E8C', fontWeight: 700, textTransform: 'uppercase' }}>Entry Fee</div>
                      <div style={{ fontSize: '0.85rem', color: '#1B1716', fontWeight: 700 }}>{selectedActivity.expense > 0 ? `${currencySymbol}${selectedActivity.expense}` : 'Free'}</div>
                    </div>
                  </div>

                  <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#1B1716', marginBottom: 12 }}>Actions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button onClick={() => { setMapMode('single'); setFocusedActivities([selectedActivity]); setActiveTab('itinerary') }} style={{ width: '100%', padding: '14px', borderRadius: 16, background: '#F5F3EA', border: 'none', boxShadow: NEU.raised, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700, color: '#810100', cursor: 'pointer' }}>
                      <Map size={18} /> Show on Map
                    </button>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button onClick={() => window.open(fetchedPlaceDetails?.url || `https://www.google.com/maps/dir/?api=1&destination=${selectedActivity.lat},${selectedActivity.lng}`)} style={{ flex: 1, padding: '14px', borderRadius: 16, background: '#F5F3EA', border: 'none', boxShadow: NEU.raised, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700, color: '#2E2523', cursor: 'pointer' }}>
                        <Navigation size={18} /> Directions
                      </button>
                      <button onClick={() => {
                         setMapMode('nearby'); 
                         const mock1 = { name: 'Nearby Cafe', lat: selectedActivity.lat + 0.002, lng: selectedActivity.lng + 0.002, isMeal: true }
                         const mock2 = { name: 'Nearby Station', lat: selectedActivity.lat - 0.003, lng: selectedActivity.lng + 0.001 }
                         setFocusedActivities([selectedActivity, mock1, mock2]); setActiveTab('itinerary')
                      }} style={{ flex: 1, padding: '14px', borderRadius: 16, background: '#F5F3EA', border: 'none', boxShadow: NEU.raised, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700, color: '#2E2523', cursor: 'pointer' }}>
                        <MapPin size={18} /> Show Nearby
                      </button>
                    </div>
                    <button onClick={() => alert('Saved to Favorites!')} style={{ width: '100%', padding: '14px', borderRadius: 16, background: NEU.PAGE, border: 'none', boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700, color: '#EF4444', cursor: 'pointer' }}>
                      <HeartIcon size={18} /> Save Place
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Back + Actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <button className="neu-btn" onClick={() => { window.location.href = '/dashboard/trips' }} style={{ padding: '10px 20px', color: '#2E2523' }}>
            <ArrowLeft size={16} /> Back to Trips
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="neu-btn" onClick={() => alert(`Share: traveloop.ai/share/${activeTrip.id}`)} style={{ padding: '10px 18px', color: '#2E2523' }}><Share2 size={15} /> Share</button>
            <button className="neu-btn-primary" onClick={() => alert('Edit mode!')} style={{ padding: '10px 18px' }}><Edit3 size={15} /> Edit</button>
            <button className="neu-btn" onClick={() => handleDelete(activeTrip.id)} style={{ padding: '10px 12px', color: '#9B8E8C' }}><Trash2 size={15} /></button>
          </div>
        </div>

        {/* Hero Cover */}
        <NeuCard style={{ padding: 10, overflow: 'hidden' }}>
          <div style={{ position: 'relative', height: 260, borderRadius: 24, overflow: 'hidden', boxShadow: NEU.pressed }}>
            {activeTrip.coverImage
              ? <img src={activeTrip.coverImage} alt={activeTrip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DDE4EE' }}><Compass size={48} color="#9B8E8C" /></div>
            }
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, marginBottom: 10,
                  background: 'rgba(248,250,252,.8)', backdropFilter: 'blur(8px)',
                  boxShadow: '4px 4px 10px rgba(139,120,112,.2), -4px -4px 10px rgba(255,255,255,.7)',
                  fontSize: '0.78rem', fontWeight: 700, color: '#810100', fontFamily: 'Inter, sans-serif',
                }}><MapPin size={13} /> {dest}</div>
                <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: '#fff', margin: 0, textShadow: '0 2px 12px rgba(0,0,0,.3)' }}>{activeTrip.title}</h1>
                {activeTrip.description && <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,.8)', marginTop: 6, fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>{activeTrip.description}</p>}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 14,
                background: 'rgba(248,250,252,.8)', backdropFilter: 'blur(10px)',
                boxShadow: '4px 4px 10px rgba(139,120,112,.2), -4px -4px 10px rgba(255,255,255,.7)',
              }}>
                <Calendar size={15} color="#810100" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1B1716', fontFamily: 'Inter, sans-serif' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '5fr 5fr', gap: 24, alignItems: 'start' }}>
            
            {/* Left Column: Itinerary Days */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Destination Weather Forecast */}
              <NeuCard style={{ padding: '1.5rem 2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#1B1716', margin: 0 }}>Trip Weather Forecast</h3>
                      <p style={{ fontSize: '0.85rem', color: '#9B8E8C', fontFamily: 'Inter, sans-serif', marginTop: 4 }}>Upcoming conditions for {dest}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1, background: NEU.PAGE, borderRadius: 16, padding: '16px 12px', boxShadow: NEU.pressed, textAlign: 'center' }}>
                      <Sun size={24} color="#F59E0B" style={{ margin: '0 auto 8px' }} /><div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1B1716' }}>Today</div><div style={{ fontSize: '0.85rem', color: '#6B5E5C' }}>32°C</div>
                    </div>
                    <div style={{ flex: 1, background: NEU.PAGE, borderRadius: 16, padding: '16px 12px', boxShadow: NEU.pressed, textAlign: 'center' }}>
                      <CloudSun size={24} color="#3B82F6" style={{ margin: '0 auto 8px' }} /><div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1B1716' }}>Tomorrow</div><div style={{ fontSize: '0.85rem', color: '#6B5E5C' }}>30°C</div>
                    </div>
                    <div style={{ flex: 1, background: NEU.PAGE, borderRadius: 16, padding: '16px 12px', boxShadow: NEU.pressed, textAlign: 'center' }}>
                      <CloudRain size={24} color="#810100" style={{ margin: '0 auto 8px' }} /><div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1B1716' }}>Day 3</div><div style={{ fontSize: '0.85rem', color: '#6B5E5C' }}>28°C</div>
                    </div>
                  </div>
              </NeuCard>

              {activeTrip.itineraryDays?.length ? activeTrip.itineraryDays.map(day => (
                <NeuCard key={day.day}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(139,120,112,.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 14, background: NEU.PAGE, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#810100' }}>{day.day}</div>
                      <div>
                        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#1B1716', display: 'block' }}>Day {day.day} Schedule</span>
                        {day.area && <span style={{ fontSize: '0.8rem', color: '#6B5E5C', fontFamily: 'Inter, sans-serif' }}>{day.area}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', color: '#9B8E8C' }}>Cost: <strong style={{ color: '#810100' }}>{currencySymbol}{day.totalSpent}</strong></span>
                      <button onClick={() => handleDaySelect(day.activities)} style={{ background: NEU.PAGE, border: 'none', borderRadius: 12, padding: '8px 12px', fontSize: '0.8rem', fontWeight: 700, color: '#810100', boxShadow: NEU.raised, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Map size={14} /> Focus Map
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {day.activities.map((act: any, i: number) => {
                      if (act.isMeal) return (
                        <button key={i} onClick={() => handleActivitySelect(act)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderRadius: 16, background: NEU.PAGE, border: 'none', boxShadow: NEU.pressed, cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'transform 0.2s' }} onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')} onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                          <div style={{ width: 32, height: 32, borderRadius: 10, background: NEU.CARD, boxShadow: NEU.raised, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Utensils size={14} color="#F59E0B" /></div>
                          <div style={{ flex: 1 }}><span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#2E2523' }}>{act.name}</span><span style={{ display: 'block', fontSize: '0.75rem', color: '#9B8E8C', marginTop: 2 }}>{act.time}</span></div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F59E0B', fontFamily: 'Inter, sans-serif' }}>{currencySymbol}{act.expense}</span>
                        </button>
                      )
                      return (
                        <button key={i} onClick={() => handleActivitySelect(act)} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '14px 20px', borderRadius: 20, background: NEU.CARD, border: 'none', boxShadow: NEU.raised, transition: 'all .25s ease', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.hover }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.raised }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                              <Clock size={13} color="#9B8E8C" />
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9B8E8C', fontFamily: 'Inter, sans-serif' }}>{act.time}</span>
                            </div>
                            <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#1B1716', margin: '0 0 4px', fontSize: '1rem' }}>{act.name}</h4>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                            {act.rating && <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={13} color="#F59E0B" style={{ fill: '#F59E0B' }} /><span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1B1716', fontFamily: 'Inter, sans-serif' }}>{act.rating}</span></div>}
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#810100', fontFamily: 'Inter, sans-serif' }}>{act.expense > 0 ? `${currencySymbol}${act.expense}` : 'Free'}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </NeuCard>
              )) : (
                <NeuCard style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                  <Compass size={40} color="#9B8E8C" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#1B1716', margin: '0 0 8px' }}>No itinerary yet</h3>
                  <p style={{ color: '#9B8E8C', fontFamily: 'Inter, sans-serif' }}>Add activities to build your plan.</p>
                </NeuCard>
              )}
            </div>

            {/* Right Column: Sticky Map Component */}
            <div style={{ position: 'sticky', top: 24, height: 'calc(100vh - 120px)', minHeight: 600, borderRadius: 32, overflow: 'hidden', boxShadow: NEU.raised }}>
               <GoogleMapWidget activities={allActivities} apiKey={googleMapsKey} mapMode={mapMode} focusedActivities={focusedActivities} />
            </div>

          </div>
        )}

        {/* TAB: Budget */}
        {activeTab === 'budget' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {actExceeded && (
              <NeuCard style={{ background: NEU.CARD, boxShadow: 'inset 4px 4px 10px rgba(239,68,68,.15), inset -4px -4px 10px rgba(255,255,255,.8)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <AlertTriangle size={20} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif' }}>Budget Alert</span>
                    <p style={{ fontSize: '0.85rem', color: '#9B8E8C', fontFamily: 'Inter, sans-serif', marginTop: 4 }}>
                      Activities ({currencySymbol}{activitiesVal.toLocaleString()}) exceeds 40% of budget ({currencySymbol}{actBudgetLimit.toLocaleString()}).
                    </p>
                  </div>
                </div>
              </NeuCard>
            )}

            {/* Stat tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { label: 'Total Budget', icon: DollarSign, accent: '#810100', editable: true, value: totalBudget },
                { label: 'Daily Average', icon: TrendingUp, accent: '#22C55E', value: dailyAvg, sub: `Over ${daysDiff} days` },
                { label: 'Activities', icon: Star, accent: '#F59E0B', value: activitiesVal, exceeded: actExceeded, sub: `Limit: ${currencySymbol}${actBudgetLimit.toLocaleString()}` },
              ].map((s, i) => (
                <div key={i} style={{ background: NEU.CARD, borderRadius: 28, boxShadow: NEU.raised, border: 'none', borderLeft: `4px solid ${s.accent}`, padding: '1.25rem 1.5rem', minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9B8E8C', fontFamily: 'Inter, sans-serif' }}>{s.label}</span>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: NEU.PAGE, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.accent }}><s.icon size={17} /></div>
                  </div>
                  <div>
                    {s.editable ? (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#1B1716' }}>{currencySymbol}</span>
                        <input type="number" value={s.value} onChange={e => handleBudgetLimitChange(parseFloat(e.target.value) || 0)}
                          style={{ width: 110, background: 'transparent', border: 'none', borderBottom: '2px dashed rgba(139,120,112,.4)', outline: 'none', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#1B1716', padding: 0 }} />
                      </div>
                    ) : (
                      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: s.exceeded ? '#EF4444' : '#1B1716' }}>{currencySymbol}{s.value.toLocaleString()}</div>
                    )}
                    {s.sub && <div style={{ fontSize: 11, color: '#9B8E8C', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>{s.sub}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Expense + Chart */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <NeuCard>
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#1B1716', margin: '0 0 6px' }}>Expense Breakdown</h3>
                <p style={{ fontSize: '0.85rem', color: '#9B8E8C', fontFamily: 'Inter, sans-serif', marginBottom: 20 }}>Edit category values below.</p>
                <ExpenseRow label="Transport" description="Flights, trains, car" value={transportVal} onChange={(v:any) => handleExpenseChange('Transport', v)} currency={currencySymbol} />
                <ExpenseRow label="Accommodation" description="Hotels, resorts" value={hotelVal} onChange={(v:any) => handleExpenseChange('Hotel', v)} currency={currencySymbol} />
                <ExpenseRow label="Food & Dining" description="Restaurants, cafes" value={foodVal} onChange={(v:any) => handleExpenseChange('Food', v)} currency={currencySymbol} />
                <ExpenseRow label="Activities" description="Tours, tickets" value={activitiesVal} onChange={(v:any) => handleExpenseChange('Activities', v)} currency={currencySymbol} />
                <ExpenseRow label="Miscellaneous" description="Shopping, tips" value={miscVal} onChange={(v:any) => handleExpenseChange('Misc', v)} currency={currencySymbol} />
                <div style={{ marginTop: 20, padding: '12px 16px', borderRadius: 16, background: NEU.PAGE, boxShadow: NEU.pressed, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#1B1716', fontFamily: 'Inter, sans-serif' }}>Total:</span>
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: '#810100' }}>{currencySymbol}{totalSpent.toLocaleString()}</span>
                </div>
              </NeuCard>

              <NeuCard>
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#1B1716', margin: '0 0 6px' }}>Budget Distribution</h3>
                <p style={{ fontSize: '0.85rem', color: '#9B8E8C', fontFamily: 'Inter, sans-serif', marginBottom: 20 }}>Visual spending breakdown.</p>
                <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2}>
                          {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: NEU.CARD, border: 'none', borderRadius: 16, boxShadow: NEU.raised }} formatter={(v: any) => `${currencySymbol}${v?.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <PieChartIcon size={40} color="#9B8E8C" style={{ margin: '0 auto 8px' }} />
                      <p style={{ color: '#9B8E8C', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>Add expenses to see chart</p>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(139,120,112,.15)' }}>
                  {chartData.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B5E5C', fontFamily: 'Inter, sans-serif' }}>{d.name}</span>
                    </div>
                  ))}
                </div>
              </NeuCard>
            </div>
          </div>
        )}

        {/* TAB: Gems */}
        {activeTab === 'gems' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div><h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#1B1716', display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 6px' }}><Coffee size={20} color="#810100" /> Hidden Gems in {activeTrip.stops?.[0]?.cityName || 'Your Destination'}</h2></div>
            {gems.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {gems.map((g: any, i: number) => <HiddenGemCard key={i} gem={g} />)}
              </div>
            ) : (
              <NeuCard style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <Coffee size={40} color="#9B8E8C" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#1B1716', margin: '0 0 8px' }}>No hidden gems yet</h3>
                <p style={{ color: '#9B8E8C', fontFamily: 'Inter, sans-serif' }}>AI will suggest local favorites once your itinerary is detailed.</p>
              </NeuCard>
            )}
          </div>
        )}

        {/* TAB: Notes */}
        {activeTab === 'notes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 700 }}>
            <div><h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#1B1716', display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 6px' }}><FileText size={20} color="#810100" /> Trip Notes</h2></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                placeholder="Type a note and press Enter..."
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                style={{
                  flex: 1, padding: '12px 18px', borderRadius: 16, border: 'none', outline: 'none',
                  background: NEU.PAGE, boxShadow: NEU.input, fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#1B1716',
                  transition: 'box-shadow .25s ease'
                }}
                onFocus={e => { e.currentTarget.style.boxShadow = `${NEU.input}, 0 0 0 2px rgba(129,1,0,.2)` }}
                onBlur={e => { e.currentTarget.style.boxShadow = NEU.input }}
              />
              <button className="neu-btn-primary" onClick={handleAddNote} style={{ padding: '12px 24px' }}>Add</button>
            </div>
            {notes.length > 0 ? notes.map(n => <NoteItem key={n.id} note={n} onDelete={handleDeleteNote} />) : (
              <NeuCard style={{ textAlign: 'center', padding: '2rem' }}>
                <FileText size={32} color="#9B8E8C" style={{ margin: '0 auto 8px' }} />
                <p style={{ color: '#9B8E8C', fontFamily: 'Inter, sans-serif' }}>No notes yet. Add your first reminder!</p>
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
      <section style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#1B1716', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            My Trips <Navigation size={28} color="#06B6D4" />
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#6B5E5C', marginTop: 8, fontFamily: 'Inter, sans-serif' }}>Manage your itineraries, AI plans, and custom adventures.</p>
        </div>
        <button className="neu-btn-primary" onClick={handleCreateManualTrip} style={{ padding: '14px 24px' }}>
          <Plus size={17} /> Create New Trip
        </button>
      </section>

      {trips.length === 0 ? (
        <NeuCard style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div style={{ width: 72, height: 72, borderRadius: 24, background: NEU.PAGE, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Compass size={32} color="#810100" />
          </div>
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.3rem', color: '#1B1716', margin: '0 0 8px' }}>No trips planned yet</h3>
          <p style={{ color: '#9B8E8C', fontSize: '0.9rem', marginBottom: 24, fontFamily: 'Inter, sans-serif', maxWidth: 400, margin: '0 auto 24px' }}>
            Create an AI itinerary or build a custom trip from scratch.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
            <button className="neu-btn-primary" onClick={() => { window.location.href = '/dashboard/ai-planner' }} style={{ padding: '12px 24px' }}>
              <Sparkles size={16} /> Use AI Planner
            </button>
            <button className="neu-btn" onClick={handleCreateManualTrip} style={{ padding: '12px 24px', color: '#2E2523' }}>
              Create Manual Trip
            </button>
          </div>
        </NeuCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {trips.map(t => (
            <TripCard
              key={t.id} trip={t} onClick={() => { window.location.href = `/dashboard/trips?id=${t.id}` }}
              onDelete={(e:any) => { e.stopPropagation(); handleDelete(t.id) }} currency={currencySymbol}
            />
          ))}
        </div>
      )}

      <NeuCard style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: NEU.PAGE, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Sparkles size={20} color="#810100" />
        </div>
        <div>
          <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#1B1716', margin: '0 0 6px', fontSize: '1rem' }}>Pro Tip</h4>
          <p style={{ color: '#9B8E8C', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
            Use the <strong style={{ color: '#810100' }}>Budget</strong> tab to adjust spending in real-time, and <strong style={{ color: '#810100' }}>Notes</strong> to keep travel details handy!
          </p>
        </div>
      </NeuCard>
    </div>
  )
}

export default function MyTripsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 20, background: '#EAEFF5', boxShadow: 'inset 4px 4px 8px rgba(139,120,112,.45), inset -4px -4px 8px rgba(255,255,255,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Compass size={24} color="#810100" style={{ animation: 'spin 1.5s linear infinite' }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9B8E8C' }}>Loading trips...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <TripsPageInner />
    </Suspense>
  )
}