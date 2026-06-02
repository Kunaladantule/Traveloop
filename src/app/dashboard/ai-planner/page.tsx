// app/dashboard/ai-planner/page.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Sparkles, MapPin, Calendar, ArrowRight, ArrowLeft, Compass,
  Star, DollarSign, Users, Activity, Utensils, Clock, Check,
  Search, Briefcase, Flower2, Landmark, Leaf, Moon, User,
  Heart, Home, Wine, Loader2
} from 'lucide-react'
import { generateGeminiItinerary } from '@/app/actions/gemini'
import { getGooglePlaceSuggestions, getGoogleMapsApiKey, PlacePrediction } from '@/app/actions/googlePlaces'
import { GoogleMapWidget } from '@/components/GoogleMapWidget'

// ─────────────────────────────────────────────────────────────
// Shared Neumorphic tokens
// ─────────────────────────────────────────────────────────────
const NEU = {
  BG:     '#EAEFF5',
  raised: '8px 8px 16px rgba(163,177,198,.45), -8px -8px 16px rgba(255,255,255,.85)',
  hover:  '12px 12px 24px rgba(163,177,198,.35), -12px -12px 24px rgba(255,255,255,.9)',
  pressed:'inset 4px 4px 8px rgba(163,177,198,.45), inset -4px -4px 8px rgba(255,255,255,.85)',
  input:  'inset 3px 3px 8px rgba(163,177,198,.35), inset -3px -3px 8px rgba(255,255,255,.85)',
}

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────
const VIBES = [
  { id: 'Adventure',   label: 'Adventure',   icon: Compass,   desc: 'Thrilling treks & outdoor action' },
  { id: 'Relaxation',  label: 'Relaxation',  icon: Flower2,   desc: 'Resorts, spas & peaceful stays' },
  { id: 'Culture',     label: 'Culture',     icon: Landmark,  desc: 'Museums, heritage & historic tours' },
  { id: 'Food',        label: 'Foodie',      icon: Utensils,  desc: 'Fine dining, street markets & tasting' },
  { id: 'Nature',      label: 'Nature',      icon: Leaf,      desc: 'Parks, mountains & wildlife' },
  { id: 'Night Life',  label: 'Nightlife',   icon: Moon,      desc: 'Clubs, bars & evening entertainment' },
  { id: 'Family',      label: 'Family',      icon: Users,     desc: 'Kid-friendly places & group fun' },
]

const COMPANIONS = [
  { id: 'Solo',    label: 'Solo Traveler',   icon: User  },
  { id: 'Couple',  label: 'Romantic Couple', icon: Heart },
  { id: 'Family',  label: 'Family Trip',     icon: Home  },
  { id: 'Friends', label: 'Friends Getaway', icon: Wine  },
]

// ─────────────────────────────────────────────────────────────
// Stepper
// ─────────────────────────────────────────────────────────────
const Stepper = ({ current }: { current: number }) => {
  const steps = ['Destination', 'Preferences', 'Generate']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 999, background: NEU.BG, boxShadow: NEU.raised }}>
      {steps.map((label, i) => {
        const idx = i + 1
        const isActive   = idx === current
        const isComplete = idx < current
        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '0.8rem',
                background: isActive ? 'linear-gradient(135deg, #6C63FF, #8B5CF6)' : NEU.BG,
                color: isActive ? '#fff' : isComplete ? '#6C63FF' : '#94A3B8',
                boxShadow: isActive
                  ? '4px 4px 10px rgba(108,99,255,.35), -2px -2px 6px rgba(255,255,255,.5)'
                  : NEU.pressed,
                transition: 'all .3s ease',
              }}>
                {isComplete ? <Check size={14} /> : idx}
              </div>
              <span style={{
                fontFamily: 'Inter, sans-serif', fontWeight: isActive ? 700 : 500,
                fontSize: '0.85rem',
                color: isActive ? '#1E293B' : isComplete ? '#6C63FF' : '#94A3B8',
              }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 28, height: 2, borderRadius: 2, background: NEU.BG, boxShadow: NEU.pressed, margin: '0 4px' }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Vibe Button (neumorphic selection toggle)
// ─────────────────────────────────────────────────────────────
const VibeButton = ({ vibe, selected, onSelect }: { vibe: typeof VIBES[0]; selected: boolean; onSelect: () => void }) => {
  const Icon = vibe.icon
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        padding: '18px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
        background: NEU.BG, minHeight: 110, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center',
        fontFamily: 'Inter, sans-serif', transition: 'all .3s ease',
        boxShadow: selected
          ? `inset 4px 4px 10px rgba(108,99,255,.2), inset -4px -4px 10px rgba(255,255,255,.8), 0 0 0 2px rgba(108,99,255,.4)`
          : NEU.raised,
        transform: selected ? 'scale(.97)' : 'scale(1)',
      }}
      onMouseEnter={e => {
        if (!selected) (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'
      }}
      onMouseLeave={e => {
        if (!selected) (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: NEU.BG, boxShadow: selected ? NEU.raised : NEU.pressed,
        color: selected ? '#6C63FF' : '#94A3B8', transition: 'all .3s ease',
      }}>
        <Icon size={22} />
      </div>
      <span style={{ fontWeight: 700, fontSize: '0.8rem', color: selected ? '#6C63FF' : '#334155', lineHeight: 1.2 }}>
        {vibe.label}
      </span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// Companion Button
// ─────────────────────────────────────────────────────────────
const CompanionButton = ({ item, selected, onSelect }: { item: typeof COMPANIONS[0]; selected: boolean; onSelect: () => void }) => {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        padding: '20px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
        background: NEU.BG, minHeight: 120, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center',
        fontFamily: 'Inter, sans-serif', transition: 'all .3s ease',
        boxShadow: selected
          ? `inset 4px 4px 10px rgba(108,99,255,.2), inset -4px -4px 10px rgba(255,255,255,.8), 0 0 0 2px rgba(108,99,255,.4)`
          : NEU.raised,
        transform: selected ? 'scale(.97)' : 'scale(1)',
      }}
      onMouseEnter={e => {
        if (!selected) (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'
      }}
      onMouseLeave={e => {
        if (!selected) (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: NEU.BG, boxShadow: selected ? NEU.raised : NEU.pressed,
        color: selected ? '#6C63FF' : '#94A3B8', transition: 'all .3s ease',
      }}>
        <Icon size={24} />
      </div>
      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: selected ? '#6C63FF' : '#334155' }}>
        {item.label}
      </span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// Neu Input
// ─────────────────────────────────────────────────────────────
const NeuInput = ({ placeholder, value, onChange, type = 'text', icon: Icon, prefix, style: extraStyle = {}, ...rest }: {
  placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string; icon?: React.ElementType; prefix?: string; style?: React.CSSProperties; [key: string]: any
}) => (
  <div style={{ position: 'relative', ...extraStyle }}>
    {Icon && <Icon size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6C63FF', pointerEvents: 'none', zIndex: 1 }} />}
    {prefix && <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6C63FF', fontWeight: 800, fontSize: '1rem', pointerEvents: 'none' }}>{prefix}</span>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%',
        paddingLeft: (Icon || prefix) ? 48 : 18, paddingRight: 18, paddingTop: 16, paddingBottom: 16,
        background: NEU.BG, borderRadius: 16, border: 'none', outline: 'none',
        fontSize: '1rem', color: '#1E293B', fontFamily: 'Inter, sans-serif',
        boxShadow: NEU.input, transition: 'box-shadow .25s ease',
      }}
      onFocus={e => { e.currentTarget.style.boxShadow = `${NEU.input}, 0 0 0 2px rgba(108,99,255,.25)` }}
      onBlur={e => { e.currentTarget.style.boxShadow = NEU.input }}
      {...rest}
    />
  </div>
)

// ─────────────────────────────────────────────────────────────
// Section Card
// ─────────────────────────────────────────────────────────────
const NeuCard = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: NEU.BG, borderRadius: 28, boxShadow: NEU.raised, border: 'none', padding: '2rem 2.25rem', ...style }}>
    {children}
  </div>
)

// ─────────────────────────────────────────────────────────────
// Result Stat Card
// ─────────────────────────────────────────────────────────────
const ResultStat = ({ label, value, icon: Icon, accent }: { label: string; value: string; icon: React.ElementType; accent: string }) => (
  <div style={{ background: NEU.BG, borderRadius: 20, boxShadow: NEU.raised, border: 'none', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 32, height: 32, borderRadius: 11, background: NEU.BG, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>
        <Icon size={15} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{label}</span>
    </div>
    <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1E293B' }}>{value}</div>
  </div>
)

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function AiPlannerPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [userCountry, setUserCountry] = useState('United States')
  const [currencySymbol, setCurrencySymbol] = useState('$')

  const [destination, setDestination] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [numberOfDays, setNumberOfDays] = useState('')
  const [budget, setBudget] = useState('')
  const [selectedVibe, setSelectedVibe] = useState('')
  const [companion, setCompanion] = useState('')

  const [googleSuggestions, setGoogleSuggestions] = useState<PlacePrediction[]>([])
  const [googleMapsKey, setGoogleMapsKey] = useState('')

  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState<any | null>(null)

  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getGoogleMapsApiKey().then(k => setGoogleMapsKey(k)).catch(console.error)
  }, [])

  useEffect(() => {
    const raw = localStorage.getItem('traveloop_user')
    if (raw) {
      try {
        const u = JSON.parse(raw)
        if (u.country) {
          setUserCountry(u.country)
          const c = u.country.toLowerCase()
          if (c.includes('india')) setCurrencySymbol('₹')
          else if (c.includes('united kingdom') || c.includes('uk')) setCurrencySymbol('£')
          else if (c.includes('france') || c.includes('germany') || c.includes('italy') || c.includes('spain') || c.includes('europe') || c.includes('switzerland')) setCurrencySymbol('€')
          else if (c.includes('united arab emirates') || c.includes('uae') || c.includes('dubai')) setCurrencySymbol('AED')
          else setCurrencySymbol('$')
        }
      } catch { /* no-op */ }
    }
    const handleClick = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) setShowSuggestions(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleDestinationChange = async (val: string) => {
    setDestination(val)
    setShowSuggestions(true)
    if (val.trim().length > 1) {
      try {
        const res = await getGooglePlaceSuggestions(val)
        setGoogleSuggestions(res.success ? res.predictions : [])
      } catch { setGoogleSuggestions([]) }
    } else setGoogleSuggestions([])
  }

  const handleGenerate = async () => {
    if (!destination) { alert('Please enter a destination.'); return }
    const daysNum = parseInt(numberOfDays) || 5
    if (!selectedVibe) { alert('Please select a travel mood.'); return }
    if (!companion)    { alert('Please select who you are traveling with.'); return }

    setStep(2); setLoading(true); setItinerary(null)
    const numBudget = parseFloat(budget) || 15000
    const start = Date.now()
    try {
      const res = await generateGeminiItinerary({ destination, vibe: selectedVibe, companion, days: daysNum, budget: numBudget, currencySymbol })
      const wait = Math.max(0, 2200 - (Date.now() - start))
      setTimeout(() => {
        if (res?.success && res.itinerary) setItinerary(res.itinerary)
        else { alert('Generation failed. Please try again.'); setStep(1) }
        setLoading(false)
      }, wait)
    } catch { alert('Network error. Please try again.'); setStep(1); setLoading(false) }
  }

  const handleSaveTrip = () => {
    if (!itinerary) return
    const raw = localStorage.getItem('traveloop_user')
    if (!raw) return
    const u = JSON.parse(raw)
    const key = `traveloop_trips_${u.id}`
    const current = JSON.parse(localStorage.getItem(key) || '[]')
    const totalSpent = itinerary.dailyItinerary.reduce((s: number, d: any) => s + d.totalSpent, 0)
    const sDate = new Date(), eDate = new Date()
    eDate.setDate(sDate.getDate() + (parseInt(numberOfDays) || 5))
    const newTrip = {
      id: 'ai_trip_' + Math.random().toString(36).substring(2, 11),
      title: `${itinerary.destination} ${itinerary.vibe} Escape`,
      description: `A ${itinerary.days}-day ${itinerary.vibe.toLowerCase()} itinerary for ${itinerary.companion.toLowerCase()} travelers.`,
      startDate: sDate.toISOString(), endDate: eDate.toISOString(),
      totalBudget: parseFloat(budget) || 15000, coverImage: itinerary.coverImage,
      stops: [{ id: 's1', cityName: itinerary.destination, country: itinerary.country }],
      expenses: [
        { id: 'e1', amount: Math.round(totalSpent * .2), category: 'Transport' },
        { id: 'e2', amount: Math.round(totalSpent * .4), category: 'Hotel' },
        { id: 'e3', amount: Math.round(totalSpent * .2), category: 'Food' },
        { id: 'e4', amount: Math.round(totalSpent * .15), category: 'Activities' },
        { id: 'e5', amount: Math.round(totalSpent * .05), category: 'Misc' },
      ],
      itineraryDays: itinerary.dailyItinerary,
      smartRecommendations: itinerary.smartRecommendations,
    }
    current.unshift(newTrip)
    localStorage.setItem(key, JSON.stringify(current))
    alert('✅ AI Trip saved successfully!')
    window.location.href = `/dashboard/trips?id=${newTrip.id}`
  }

  // ── STEP 1 ──────────────────────────────────────────────────
  if (step === 1) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 900, margin: '0 auto', paddingBottom: 48 }}>

      {/* Brand + Stepper */}
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, paddingTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: NEU.BG, boxShadow: NEU.raised, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Compass size={22} color="#6C63FF" />
          </div>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#1E293B' }}>Traveloop AI ✨</span>
        </div>
        <Stepper current={1} />
      </section>

      {/* Card 1: Destination & Budget */}
      <NeuCard>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 6px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: NEU.BG, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={18} color="#6C63FF" /></div>
          Where would you like to go?
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', marginBottom: 28 }}>
          Search for a city, country, or landmark — autocompleted via Google Places.
        </p>

        {/* Destination search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', marginBottom: 24 }} ref={suggestionsRef}>
          <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Inter, sans-serif', marginLeft: 4 }}>Destination *</label>
          <NeuInput
            placeholder="Search city or country..."
            value={destination}
            onChange={e => handleDestinationChange(e.target.value)}
            icon={Search}
            onFocus={() => setShowSuggestions(true)}
          />
          {/* Suggestions */}
          {showSuggestions && googleSuggestions.length > 0 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 50, background: NEU.BG, borderRadius: 20, boxShadow: NEU.hover, border: 'none', overflow: 'hidden', maxHeight: 280, overflowY: 'auto' }} className="custom-scrollbar">
              {googleSuggestions.map(item => (
                <button
                  key={item.placeId}
                  type="button"
                  onClick={() => { setDestination(item.description); setShowSuggestions(false) }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '12px 18px', background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12, transition: 'background .15s ease',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(108,99,255,.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <MapPin size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9rem' }}>{item.mainText}</div>
                    {item.secondaryText && <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{item.secondaryText}</div>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Days & Budget */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Inter, sans-serif', marginLeft: 4 }}>Number of Days *</label>
            <NeuInput type="number" placeholder="e.g. 7" value={numberOfDays} onChange={e => setNumberOfDays(e.target.value)} min="1" max="30" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Total Budget *</label>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6C63FF', fontFamily: 'Inter, sans-serif' }}>Currency: {currencySymbol}</span>
            </div>
            <NeuInput type="number" placeholder="Enter your budget..." value={budget} onChange={e => setBudget(e.target.value)} prefix={currencySymbol} />
            {/* Quick chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {['5000', '15000', '25000', '50000'].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBudget(val)}
                  style={{
                    padding: '6px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.78rem',
                    background: NEU.BG, transition: 'all .25s ease',
                    boxShadow: budget === val ? NEU.pressed : NEU.raised,
                    color: budget === val ? '#6C63FF' : '#64748B',
                    transform: budget === val ? 'scale(.97)' : 'scale(1)',
                  }}
                >
                  {currencySymbol}{parseInt(val) / 1000}K
                </button>
              ))}
            </div>
          </div>
        </div>
      </NeuCard>

      {/* Card 2: Travel Vibe */}
      <NeuCard>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 6px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: NEU.BG, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={18} color="#6C63FF" /></div>
          What's your travel vibe?
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', marginBottom: 24 }}>
          Choose the mood that best matches your dream trip.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 14 }}>
          {VIBES.map(v => <VibeButton key={v.id} vibe={v} selected={selectedVibe === v.id} onSelect={() => setSelectedVibe(v.id)} />)}
        </div>
      </NeuCard>

      {/* Card 3: Companion */}
      <NeuCard>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 6px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: NEU.BG, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={18} color="#6C63FF" /></div>
          Who are you traveling with?
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', marginBottom: 24 }}>
          This helps us tailor recommendations to your group.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {COMPANIONS.map(c => <CompanionButton key={c.id} item={c} selected={companion === c.id} onSelect={() => setCompanion(c.id)} />)}
        </div>
      </NeuCard>

      {/* Generate button */}
      <div>
        <button
          onClick={handleGenerate}
          disabled={!destination || !numberOfDays || !budget || !selectedVibe || !companion}
          style={{
            width: '100%', padding: '1.1rem', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #6C63FF, #8B5CF6)',
            color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.05rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            boxShadow: '8px 8px 16px rgba(163,177,198,.4), -8px -8px 16px rgba(255,255,255,.8)',
            transition: 'all .3s ease', opacity: (!destination || !numberOfDays || !budget || !selectedVibe || !companion) ? .5 : 1,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
          onMouseDown={e => {
            const el = e.currentTarget as HTMLElement
            el.style.boxShadow = 'inset 4px 4px 8px rgba(0,0,0,.18), inset -4px -4px 8px rgba(255,255,255,.25)'
          }}
          onMouseUp={e => {
            const el = e.currentTarget as HTMLElement
            el.style.boxShadow = '8px 8px 16px rgba(163,177,198,.4), -8px -8px 16px rgba(255,255,255,.8)'
          }}
        >
          <Sparkles size={22} style={{ animation: 'pulse 2s ease-in-out infinite' }} />
          Generate My AI Itinerary ✨
          <ArrowRight size={20} />
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94A3B8', marginTop: 12, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
          Takes ~30 seconds · Powered by Google Places + Gemini AI
        </p>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.6} }
      `}</style>
    </div>
  )

  // ── STEP 2 ──────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1100, margin: '0 auto', paddingBottom: 48 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <button
          onClick={() => { setStep(1); setLoading(false) }}
          className="neu-btn"
          style={{ padding: '10px 20px', color: '#334155', fontSize: '0.875rem' }}
        >
          <ArrowLeft size={16} /> Edit Preferences
        </button>
        <Stepper current={3} />
      </div>

      {/* Loading */}
      {loading && (
        <NeuCard style={{ minHeight: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 24 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 80, height: 80, borderRadius: 28, background: NEU.BG, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={36} color="#6C63FF" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <div style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '#8B5CF6', animation: 'ping 1s cubic-bezier(0,0,.2,1) infinite' }} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.4rem', color: '#1E293B', margin: '0 0 10px' }}>
              Crafting your perfect itinerary... ✨
            </h3>
            <p style={{ color: '#94A3B8', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', maxWidth: 400, lineHeight: 1.7 }}>
              Our AI is analyzing {destination}, finding top-rated attractions, calculating optimal routes, and building a personalized day-by-day plan just for you.
            </p>
          </div>
          {/* Progress bar */}
          <div style={{ width: 240, height: 10, borderRadius: 999, background: NEU.BG, boxShadow: NEU.pressed, overflow: 'hidden', padding: 2 }}>
            <div style={{ height: '100%', borderRadius: 999, width: '75%', background: 'linear-gradient(90deg, #6C63FF, #8B5CF6)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes ping { 75%,100% { transform: scale(2); opacity: 0; } }
            @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.5} }
          `}</style>
        </NeuCard>
      )}

      {/* Results */}
      {!loading && itinerary && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Summary Banner */}
          <NeuCard>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: 22, background: NEU.BG, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={28} color="#6C63FF" />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6C63FF', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>📍 Destination</div>
                  <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.75rem', color: '#1E293B', margin: 0 }}>{itinerary.destination}</h2>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
                <ResultStat label="Vibe"     value={itinerary.vibe}                        icon={Sparkles}   accent="#6C63FF" />
                <ResultStat label="Travelers" value={itinerary.companion}                   icon={Users}      accent="#8B5CF6" />
                <ResultStat label="Duration" value={`${itinerary.days} Days`}               icon={Calendar}   accent="#22C55E" />
                <ResultStat label="Budget"   value={`${currencySymbol}${itinerary.budget?.toLocaleString()}`} icon={DollarSign} accent="#F59E0B" />
              </div>
            </div>
          </NeuCard>

          {/* Insights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { label: '💵 Budget Tier',  value: itinerary.category,       sub: 'Cost level per person' },
              { label: '💸 Daily Avg',    value: `${currencySymbol}${Math.round(itinerary.budget / itinerary.days).toLocaleString()}`, sub: 'Per day allocation' },
              { label: '⚡ Trip Pace',    value: itinerary.tripIntensity,   sub: 'Energy level' },
              { label: '🎯 Attractions',  value: `${itinerary.attractionsCount}+`, sub: 'Google verified' },
            ].map(item => (
              <div key={item.label} style={{ background: NEU.BG, borderRadius: 20, boxShadow: NEU.raised, border: 'none', padding: '1.1rem 1.25rem' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif' }}>{item.label}</div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#6C63FF', margin: '8px 0 4px' }}>{item.value}</div>
                <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{item.sub}</div>
              </div>
            ))}
          </div>

          {/* Map */}
          <NeuCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <MapPin size={18} color="#6C63FF" /> Route Map
              </h3>
              <div style={{ padding: '5px 14px', borderRadius: 999, background: NEU.BG, boxShadow: NEU.pressed, fontSize: 11, fontWeight: 700, color: '#6C63FF', fontFamily: 'Inter, sans-serif' }}>
                Live Coordinates
              </div>
            </div>
            <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: NEU.pressed }}>
              <GoogleMapWidget activities={itinerary.dailyItinerary.flatMap((d: any) => d.activities)} apiKey={googleMapsKey} />
            </div>
          </NeuCard>

          {/* Day-by-day */}
          <div>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Briefcase size={20} color="#6C63FF" /> Your Day-by-Day Plan
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {itinerary.dailyItinerary.map((day: any) => (
                <NeuCard key={day.day}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(163,177,198,.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 14, background: NEU.BG, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#6C63FF' }}>
                        {day.day}
                      </div>
                      <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1E293B' }}>Day {day.day} Schedule</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', color: '#94A3B8' }}>
                      Daily: <strong style={{ color: '#6C63FF' }}>{currencySymbol}{day.totalSpent}</strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {day.activities.map((act: any, i: number) => {
                      if (act.isMeal) return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 14, background: NEU.BG, boxShadow: NEU.pressed }}>
                          <Utensils size={16} color="#F59E0B" style={{ flexShrink: 0 }} />
                          <span style={{ flex: 1, fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#334155' }}>{act.name}</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F59E0B', fontFamily: 'Inter, sans-serif' }}>{currencySymbol}{act.expense}</span>
                        </div>
                      )
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', borderRadius: 16, background: NEU.BG, boxShadow: NEU.raised, transition: 'all .25s ease' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.hover }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.raised }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                              <Clock size={13} color="#94A3B8" />
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{act.time}</span>
                              <div style={{ padding: '2px 10px', borderRadius: 999, background: NEU.BG, boxShadow: NEU.pressed, fontSize: 11, color: '#64748B', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{act.city}</div>
                            </div>
                            <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#1E293B', margin: '0 0 4px', fontSize: '0.95rem' }}>{act.name}</h4>
                            {act.description && <p style={{ fontSize: '0.82rem', color: '#94A3B8', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, margin: 0 }}>{act.description}</p>}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                            {act.rating && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Star size={13} color="#F59E0B" style={{ fill: '#F59E0B' }} />
                                <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1E293B', fontFamily: 'Inter, sans-serif' }}>{act.rating}</span>
                              </div>
                            )}
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6C63FF', fontFamily: 'Inter, sans-serif' }}>
                              {act.expense > 0 ? `${currencySymbol}${act.expense}` : 'Free'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </NeuCard>
              ))}
            </div>
          </div>

          {/* Smart recommendations */}
          <NeuCard>
            <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 18px' }}>
              <Sparkles size={18} color="#6C63FF" /> AI-Powered Recommendations
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
              {itinerary.smartRecommendations.map((rec: any, i: number) => (
                <div key={i} style={{ background: NEU.BG, borderRadius: 20, boxShadow: NEU.raised, border: 'none', padding: '1.1rem 1.25rem', transition: 'all .3s ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.hover }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.raised }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', color: '#6C63FF', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>Hidden Gem</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={13} color="#F59E0B" style={{ fill: '#F59E0B' }} />
                      <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1E293B', fontFamily: 'Inter, sans-serif' }}>{rec.rating}</span>
                    </div>
                  </div>
                  <h5 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#1E293B', margin: '0 0 6px', fontSize: '0.95rem' }}>{rec.name}</h5>
                  <p style={{ fontSize: '0.82rem', color: '#94A3B8', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, margin: 0 }}>{rec.desc}</p>
                </div>
              ))}
            </div>
          </NeuCard>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <button
              onClick={() => { setStep(1); setLoading(false) }}
              className="neu-btn"
              style={{ flex: 1, minWidth: 160, padding: '14px 24px', color: '#334155' }}
            >
              <ArrowLeft size={18} /> Regenerate Plan
            </button>
            <button
              onClick={handleSaveTrip}
              style={{
                flex: 2, minWidth: 220, padding: '14px 24px', borderRadius: 16, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #22C55E, #06B6D4)',
                color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '8px 8px 16px rgba(163,177,198,.4), -8px -8px 16px rgba(255,255,255,.8)',
                transition: 'all .3s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
            >
              <Check size={20} /> Save Trip to Dashboard ✨
            </button>
          </div>
        </div>
      )}
    </div>
  )
}