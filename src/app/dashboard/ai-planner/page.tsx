// app/dashboard/ai-planner/page.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Sparkles, MapPin, Calendar, ArrowRight, ArrowLeft, Compass,
  Star, DollarSign, Users, Utensils, Clock, Check, X,
  Search, Briefcase, Flower2, Landmark, Leaf, Moon, User,
  Heart, Home, Wine, Loader2, Navigation, CloudSun, Map, Share2, Heart as HeartIcon, CloudRain, Sun
} from 'lucide-react'
import { generateGeminiItinerary } from '@/app/actions/gemini'
import { getGooglePlaceSuggestions, getGoogleMapsApiKey, PlacePrediction } from '@/app/actions/googlePlaces'
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
// Stepper & Simple Components
// ─────────────────────────────────────────────────────────────
const Stepper = ({ current }: { current: number }) => {
  const steps = ['Destination', 'Preferences', 'Generate']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 999, background: NEU.PAGE, boxShadow: NEU.raised }}>
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
                background: isActive ? 'linear-gradient(135deg, #810100, #810100)' : NEU.PAGE,
                color: isActive ? '#fff' : isComplete ? '#810100' : '#9B8E8C',
                boxShadow: isActive ? '4px 4px 10px rgba(129,1,0,.35), -2px -2px 6px rgba(255,255,255,.5)' : NEU.pressed,
                transition: 'all .3s ease',
              }}>
                {isComplete ? <Check size={14} /> : idx}
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: isActive ? 700 : 500, fontSize: '0.85rem', color: isActive ? '#1B1716' : isComplete ? '#810100' : '#9B8E8C' }}>{label}</span>
            </div>
            {i < steps.length - 1 && <div style={{ width: 28, height: 2, borderRadius: 2, background: NEU.PAGE, boxShadow: NEU.pressed, margin: '0 4px' }} />}
          </React.Fragment>
        )
      })}
    </div>
  )
}

const VibeButton = ({ vibe, selected, onSelect }: { vibe: typeof VIBES[0]; selected: boolean; onSelect: () => void }) => {
  const Icon = vibe.icon
  return (
    <button type="button" onClick={onSelect} style={{
      padding: '18px 12px', borderRadius: 24, border: 'none', cursor: 'pointer',
      background: selected ? NEU.PAGE : NEU.CARD, minHeight: 110, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center', fontFamily: 'Inter, sans-serif', transition: 'all .25s ease',
      boxShadow: selected ? NEU.pressed : NEU.raised, transform: selected ? 'scale(.98)' : 'scale(1)',
      position: 'relative',
    }}
      onMouseEnter={e => { if (!selected) { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.hover } }}
      onMouseLeave={e => { if (!selected) { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.raised } }}
    >
      {/* Multi-select checkmark badge */}
      {selected && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          width: 20, height: 20, borderRadius: '50%',
          background: '#810100', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '2px 2px 6px rgba(129,1,0,.4)',
        }}>
          <Check size={11} color="#fff" />
        </div>
      )}
      <div style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: NEU.PAGE, boxShadow: selected ? NEU.raised : NEU.pressed, color: selected ? '#810100' : '#9B8E8C', transition: 'all .3s ease' }}>
        <Icon size={22} />
      </div>
      <span style={{ fontWeight: 700, fontSize: '0.8rem', color: selected ? '#810100' : '#2E2523', lineHeight: 1.2 }}>{vibe.label}</span>
    </button>
  )
}

const CompanionButton = ({ item, selected, onSelect }: { item: typeof COMPANIONS[0]; selected: boolean; onSelect: () => void }) => {
  const Icon = item.icon
  return (
    <button type="button" onClick={onSelect} style={{
      padding: '20px 16px', borderRadius: 24, border: 'none', cursor: 'pointer',
      background: selected ? NEU.PAGE : NEU.CARD, minHeight: 120, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center', fontFamily: 'Inter, sans-serif', transition: 'all .25s ease',
      boxShadow: selected ? NEU.pressed : NEU.raised, transform: selected ? 'scale(.98)' : 'scale(1)',
    }}
      onMouseEnter={e => { if (!selected) { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.hover } }}
      onMouseLeave={e => { if (!selected) { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.raised } }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: NEU.PAGE, boxShadow: selected ? NEU.raised : NEU.pressed, color: selected ? '#810100' : '#9B8E8C', transition: 'all .3s ease' }}>
        <Icon size={24} />
      </div>
      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: selected ? '#810100' : '#2E2523' }}>{item.label}</span>
    </button>
  )
}

const NeuInput = ({ placeholder, value, onChange, type = 'text', icon: Icon, prefix, style: extraStyle = {}, ...rest }: any) => (
  <div style={{ position: 'relative', ...extraStyle }}>
    {Icon && <Icon size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#810100', pointerEvents: 'none', zIndex: 1 }} />}
    {prefix && <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#810100', fontWeight: 800, fontSize: '1rem', pointerEvents: 'none' }}>{prefix}</span>}
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ width: '100%', paddingLeft: (Icon || prefix) ? 48 : 18, paddingRight: 18, paddingTop: 16, paddingBottom: 16, background: NEU.PAGE, borderRadius: 16, border: 'none', outline: 'none', fontSize: '1rem', color: '#1B1716', fontFamily: 'Inter, sans-serif', boxShadow: NEU.input, transition: 'box-shadow .25s ease' }}
      onFocus={e => { e.currentTarget.style.boxShadow = `${NEU.input}, 0 0 0 2px rgba(129,1,0,.2)` }}
      onBlur={e => { e.currentTarget.style.boxShadow = NEU.input }}
      {...rest}
    />
  </div>
)

const NeuCard = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: NEU.CARD, borderRadius: 32, boxShadow: NEU.raised, border: 'none', padding: '2rem 2.25rem', ...style }}>{children}</div>
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
  const [selectedVibes, setSelectedVibes] = useState<string[]>([])   // ← multi-select array
  const [companion, setCompanion] = useState('')

  const [googleSuggestions, setGoogleSuggestions] = useState<PlacePrediction[]>([])
  const [googleMapsKey, setGoogleMapsKey] = useState('')

  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState<any | null>(null)

  // Side Drawer & Map State
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null)
  const [mapMode, setMapMode] = useState<'clean'|'day'|'single'|'nearby'>('clean')
  const [focusedActivities, setFocusedActivities] = useState<any[]>([])

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

  const toggleVibe = (vibeId: string) => {
    setSelectedVibes(prev =>
      prev.includes(vibeId) ? prev.filter(v => v !== vibeId) : [...prev, vibeId]
    )
  }

  const handleGenerate = async () => {
    if (!destination) { alert('Please enter a destination.'); return }
    const daysNum = parseInt(numberOfDays) || 5
    if (selectedVibes.length === 0) { alert('Please select at least one travel vibe.'); return }
    if (!companion)    { alert('Please select who you are traveling with.'); return }

    setStep(2); setLoading(true); setItinerary(null)
    const numBudget = parseFloat(budget) || 15000
    const vibeString = selectedVibes.join(' & ')
    const start = Date.now()
    try {
      const res = await generateGeminiItinerary({ destination, vibe: vibeString, companion, days: daysNum, budget: numBudget, currencySymbol })
      const wait = Math.max(0, 2200 - (Date.now() - start))
      setTimeout(() => {
        if (res?.success && res.itinerary) {
          setItinerary(res.itinerary)
          // Default map mode to clean
          setMapMode('clean')
          setFocusedActivities([])
        }
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
    window.location.href = `/dashboard/trips?id=${newTrip.id}`
  }

  const handleDaySelect = (dayActivities: any[]) => {
    setMapMode('day')
    setFocusedActivities(dayActivities)
    setSelectedActivity(null)
  }

  const handleActivitySelect = (act: any) => {
    setSelectedActivity(act)
  }

  // ── STEP 1 ──────────────────────────────────────────────────
  if (step === 1) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 900, margin: '0 auto', paddingBottom: 48 }}>
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, paddingTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: NEU.PAGE, boxShadow: NEU.raised, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={22} color="#810100" />
          </div>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#1B1716' }}>Smart Journey Builder</span>
        </div>
        <Stepper current={1} />
      </section>

      <NeuCard>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#1B1716', display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 6px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: NEU.PAGE, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={18} color="#810100" /></div>
          Where would you like to go?
        </h2>
        <p style={{ color: '#9B8E8C', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', marginBottom: 28 }}>Search for a city, country, or landmark — autocompleted via Google Places.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', marginBottom: 24 }} ref={suggestionsRef}>
          <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9B8E8C', fontFamily: 'Inter, sans-serif', marginLeft: 4 }}>Destination *</label>
          <NeuInput placeholder="Search city or country..." value={destination} onChange={(e:any) => handleDestinationChange(e.target.value)} icon={Search} onFocus={() => setShowSuggestions(true)} />
          {showSuggestions && googleSuggestions.length > 0 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 50, background: NEU.CARD, borderRadius: 20, boxShadow: NEU.hover, border: 'none', overflow: 'hidden', maxHeight: 280, overflowY: 'auto' }} className="custom-scrollbar">
              {googleSuggestions.map(item => (
                <button key={item.placeId} type="button" onClick={() => { setDestination(item.description); setShowSuggestions(false) }} style={{ width: '100%', textAlign: 'left', padding: '12px 18px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'background .15s ease', fontFamily: 'Inter, sans-serif' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(129,1,0,.05)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                  <MapPin size={16} color="#9B8E8C" style={{ flexShrink: 0 }} />
                  <div><div style={{ fontWeight: 700, color: '#1B1716', fontSize: '0.9rem' }}>{item.mainText}</div>{item.secondaryText && <div style={{ fontSize: '0.8rem', color: '#9B8E8C' }}>{item.secondaryText}</div>}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9B8E8C', fontFamily: 'Inter, sans-serif', marginLeft: 4 }}>Number of Days *</label>
            <NeuInput type="number" placeholder="e.g. 7" value={numberOfDays} onChange={(e:any) => setNumberOfDays(e.target.value)} min="1" max="30" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9B8E8C', fontFamily: 'Inter, sans-serif' }}>Total Budget *</label>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#810100', fontFamily: 'Inter, sans-serif' }}>Currency: {currencySymbol}</span>
            </div>
            <NeuInput type="number" placeholder="Enter your budget..." value={budget} onChange={(e:any) => setBudget(e.target.value)} prefix={currencySymbol} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {['5000', '15000', '25000', '50000'].map(val => (
                <button key={val} type="button" onClick={() => setBudget(val)} style={{ padding: '6px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.78rem', background: NEU.PAGE, transition: 'all .25s ease', boxShadow: budget === val ? NEU.pressed : NEU.raised, color: budget === val ? '#810100' : '#6B5E5C', transform: budget === val ? 'scale(.97)' : 'scale(1)' }}>
                  {currencySymbol}{parseInt(val) / 1000}K
                </button>
              ))}
            </div>
          </div>
        </div>
      </NeuCard>

      <NeuCard>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#1B1716', display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: NEU.PAGE, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={18} color="#810100" /></div>
            What's your travel vibe?
          </h2>
          {/* Multi-select badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              padding: '5px 12px', borderRadius: 999, background: NEU.PAGE, boxShadow: NEU.pressed,
              fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: selectedVibes.length > 0 ? '#810100' : '#9B8E8C', fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Check size={10} /> {selectedVibes.length > 0 ? `${selectedVibes.length} selected` : 'Pick multiple'}
            </div>
          </div>
        </div>
        <p style={{ color: '#9B8E8C', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif', marginBottom: 20 }}>
          Select one or more vibes — your AI itinerary blends them all.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 14 }}>
          {VIBES.map(v => <VibeButton key={v.id} vibe={v} selected={selectedVibes.includes(v.id)} onSelect={() => toggleVibe(v.id)} />)}
        </div>
        {selectedVibes.length > 0 && (
          <div style={{ marginTop: 16, padding: '10px 16px', borderRadius: 14, background: NEU.PAGE, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#9B8E8C', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif' }}>Your vibe mix:</span>
            {selectedVibes.map(id => {
              const v = VIBES.find(x => x.id === id)
              return v ? (
                <span key={id} style={{ padding: '4px 12px', borderRadius: 999, background: '#810100', color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                  {v.label}
                </span>
              ) : null
            })}
          </div>
        )}
      </NeuCard>

      <NeuCard>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#1B1716', display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 6px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: NEU.PAGE, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={18} color="#810100" /></div>
          Who are you traveling with?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 24 }}>
          {COMPANIONS.map(c => <CompanionButton key={c.id} item={c} selected={companion === c.id} onSelect={() => setCompanion(c.id)} />)}
        </div>
      </NeuCard>

      <div>
        <button className="neu-btn-primary" onClick={handleGenerate} disabled={!destination || !numberOfDays || !budget || selectedVibes.length === 0 || !companion} style={{ width: '100%', padding: '1.25rem', fontSize: '1.05rem', gap: 12 }}>
          <Sparkles size={22} style={{ animation: 'pulse 2s ease-in-out infinite' }} /> Generate My AI Itinerary <ArrowRight size={20} />
        </button>
        {selectedVibes.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: 11, color: '#9B8E8C', marginTop: 8, fontFamily: 'Inter, sans-serif' }}>Select at least one travel vibe to continue</p>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.6} }`}</style>
    </div>
  )

  // ── STEP 2 ──────────────────────────────────────────────────
  const allActivities = itinerary?.dailyItinerary?.flatMap((d: any) => d.activities) || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1100, margin: '0 auto', paddingBottom: 48, position: 'relative' }}>
      
      {/* Drawer Overlay (clicks outside to close) */}
      {selectedActivity && (
        <div 
          onClick={() => setSelectedActivity(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(2px)' }} 
        />
      )}

      {/* Slide-in Side Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 420, zIndex: 100,
        background: '#EDEBDE', boxShadow: '-10px 0 30px rgba(139,120,112,.3)',
        transform: selectedActivity ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex', flexDirection: 'column'
      }}>
        {selectedActivity && (
          <>
            <div style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedActivity(null)} style={{ background: NEU.PAGE, border: 'none', width: 40, height: 40, borderRadius: '50%', boxShadow: NEU.raised, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B5E5C' }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 24px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Hero Image */}
              <div style={{ width: '100%', height: 200, borderRadius: 24, background: NEU.CARD, boxShadow: NEU.pressed, overflow: 'hidden', position: 'relative' }}>
                <img src={itinerary.coverImage} alt={selectedActivity.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(248,250,252,.85)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 800, color: '#810100', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {selectedActivity.isMeal ? 'Dining' : 'Attraction'}
                </div>
              </div>

              <div>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#1B1716', margin: '0 0 12px', lineHeight: 1.2 }}>
                  {selectedActivity.name}
                </h2>
                
                {/* Quick Facts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: NEU.CARD, padding: '12px', borderRadius: 16, boxShadow: NEU.raised }}>
                    <Star size={16} color="#F59E0B" style={{ fill: '#F59E0B' }} />
                    <div>
                      <div style={{ fontSize: 10, color: '#9B8E8C', fontWeight: 700, textTransform: 'uppercase' }}>Rating</div>
                      <div style={{ fontSize: '0.9rem', color: '#1B1716', fontWeight: 700 }}>{selectedActivity.rating || '4.5'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: NEU.CARD, padding: '12px', borderRadius: 16, boxShadow: NEU.raised }}>
                    <MapPin size={16} color="#3B82F6" />
                    <div>
                      <div style={{ fontSize: 10, color: '#9B8E8C', fontWeight: 700, textTransform: 'uppercase' }}>Location</div>
                      <div style={{ fontSize: '0.9rem', color: '#1B1716', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>{selectedActivity.city}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: NEU.CARD, padding: '12px', borderRadius: 16, boxShadow: NEU.raised }}>
                    <Clock size={16} color="#22C55E" />
                    <div>
                      <div style={{ fontSize: 10, color: '#9B8E8C', fontWeight: 700, textTransform: 'uppercase' }}>Time</div>
                      <div style={{ fontSize: '0.85rem', color: '#1B1716', fontWeight: 700 }}>{selectedActivity.time?.split('-')[0]?.trim() || 'Schedule'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: NEU.CARD, padding: '12px', borderRadius: 16, boxShadow: NEU.raised }}>
                    <DollarSign size={16} color="#EF4444" />
                    <div>
                      <div style={{ fontSize: 10, color: '#9B8E8C', fontWeight: 700, textTransform: 'uppercase' }}>Expense</div>
                      <div style={{ fontSize: '0.9rem', color: '#1B1716', fontWeight: 700 }}>{selectedActivity.expense > 0 ? `${currencySymbol}${selectedActivity.expense}` : 'Free'}</div>
                    </div>
                  </div>
                </div>

                <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#1B1716', marginBottom: 8 }}>Description</h3>
                <p style={{ fontSize: '0.95rem', color: '#6B5E5C', lineHeight: 1.6, margin: '0 0 24px', fontFamily: 'Inter, sans-serif' }}>
                  {selectedActivity.description || `A highly recommended spot to visit in ${selectedActivity.city}. Make sure to bring your camera!`}
                </p>
                
                {/* Weather Mock */}
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#1B1716', marginBottom: 12 }}>Expected Weather</h3>
                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                  <div style={{ flex: 1, background: NEU.PAGE, borderRadius: 16, padding: '12px', boxShadow: NEU.pressed, textAlign: 'center' }}>
                    <Sun size={20} color="#F59E0B" style={{ margin: '0 auto 6px' }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1B1716' }}>Day 1</div>
                    <div style={{ fontSize: '0.8rem', color: '#6B5E5C' }}>32°C</div>
                  </div>
                  <div style={{ flex: 1, background: NEU.PAGE, borderRadius: 16, padding: '12px', boxShadow: NEU.pressed, textAlign: 'center' }}>
                    <CloudSun size={20} color="#3B82F6" style={{ margin: '0 auto 6px' }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1B1716' }}>Day 2</div>
                    <div style={{ fontSize: '0.8rem', color: '#6B5E5C' }}>30°C</div>
                  </div>
                  <div style={{ flex: 1, background: NEU.PAGE, borderRadius: 16, padding: '12px', boxShadow: NEU.pressed, textAlign: 'center' }}>
                    <CloudRain size={20} color="#810100" style={{ margin: '0 auto 6px' }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1B1716' }}>Day 3</div>
                    <div style={{ fontSize: '0.8rem', color: '#6B5E5C' }}>28°C</div>
                  </div>
                </div>

                {/* Actions */}
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#1B1716', marginBottom: 12 }}>Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button onClick={() => { setMapMode('single'); setFocusedActivities([selectedActivity]) }} style={{ width: '100%', padding: '14px', borderRadius: 16, background: '#F5F3EA', border: 'none', boxShadow: NEU.raised, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700, color: '#810100', cursor: 'pointer' }}>
                    <Map size={18} /> Show on Map
                  </button>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedActivity.lat},${selectedActivity.lng}`)} style={{ flex: 1, padding: '14px', borderRadius: 16, background: '#F5F3EA', border: 'none', boxShadow: NEU.raised, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700, color: '#2E2523', cursor: 'pointer' }}>
                      <Navigation size={18} /> Directions
                    </button>
                    <button onClick={() => {
                       setMapMode('nearby'); 
                       // Mock nearby activities with slightly offset coords
                       const mock1 = { name: 'Nearby Cafe', lat: selectedActivity.lat + 0.002, lng: selectedActivity.lng + 0.002, isMeal: true }
                       const mock2 = { name: 'Nearby Station', lat: selectedActivity.lat - 0.003, lng: selectedActivity.lng + 0.001 }
                       setFocusedActivities([selectedActivity, mock1, mock2]) 
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <button onClick={() => { setStep(1); setLoading(false) }} className="neu-btn" style={{ padding: '10px 20px', color: '#2E2523', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Edit Preferences
        </button>
        <Stepper current={3} />
      </div>

      {loading && (
        <NeuCard style={{ minHeight: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 24 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 80, height: 80, borderRadius: 28, background: NEU.PAGE, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={36} color="#810100" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <div style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '#810100', animation: 'ping 1s cubic-bezier(0,0,.2,1) infinite' }} />
          </div>
          <div><h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.4rem', color: '#1B1716', margin: '0 0 10px' }}>Crafting your perfect itinerary...</h3></div>
          <div style={{ width: 240, height: 10, borderRadius: 999, background: NEU.PAGE, boxShadow: NEU.pressed, overflow: 'hidden', padding: 2 }}>
            <div style={{ height: '100%', borderRadius: 999, width: '75%', background: 'linear-gradient(90deg, #810100, #810100)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        </NeuCard>
      )}

      {!loading && itinerary && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 1rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: NEU.PAGE, boxShadow: NEU.raised, fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#810100', fontFamily: 'Inter, sans-serif', alignSelf: 'flex-start' }}>
              <Navigation size={12} /> AI Generated Plan
            </div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '2.5rem', color: '#1B1716', margin: 0, lineHeight: 1.1 }}>{itinerary.destination}</h1>
            <p style={{ fontSize: '1rem', color: '#6B5E5C', fontFamily: 'Inter, sans-serif' }}>{itinerary.days} Days • {itinerary.vibe} • {itinerary.companion}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: 24, alignItems: 'stretch' }}>
            <div style={{ width: '100%', height: '100%', minHeight: 480, borderRadius: 32, overflow: 'hidden', boxShadow: NEU.raised }}>
              <GoogleMapWidget activities={allActivities} apiKey={googleMapsKey} mapMode={mapMode} focusedActivities={focusedActivities} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Budget Tier',  value: itinerary.category,       sub: 'Cost level per person', icon: DollarSign, accent: '#F59E0B' },
                { label: 'Daily Avg',    value: `${currencySymbol}${Math.round(itinerary.budget / itinerary.days).toLocaleString()}`, sub: 'Per day allocation', icon: Clock, accent: '#3B82F6' },
                { label: 'Trip Pace',    value: itinerary.tripIntensity,   sub: 'Energy level', icon: Compass, accent: '#F97316' },
                { label: 'Attractions',  value: `${itinerary.attractionsCount}+`, sub: 'Google verified', icon: MapPin, accent: '#22C55E' },
              ].map(item => (
                <div key={item.label} style={{ background: NEU.CARD, borderRadius: 24, boxShadow: NEU.raised, border: 'none', borderLeft: `4px solid ${item.accent}`, padding: '1.25rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#9B8E8C', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif' }}>{item.label}</div>
                    <item.icon size={14} color={item.accent} />
                  </div>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#1B1716', marginBottom: 2 }}>{item.value}</div>
                  <div style={{ fontSize: 10, color: '#9B8E8C', fontFamily: 'Inter, sans-serif' }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: -8 }}>
            <button className="neu-btn-primary" onClick={handleSaveTrip} style={{ padding: '14px 32px', fontSize: '1rem', borderRadius: 20 }}>
              <Check size={18} /> Save Trip to Dashboard
            </button>
          </div>

          <div>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#1B1716', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Briefcase size={20} color="#810100" /> Day-by-Day Plan
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {itinerary.dailyItinerary.map((day: any) => (
                <NeuCard key={day.day}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(139,120,112,.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 14, background: NEU.PAGE, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#810100' }}>
                        {day.day}
                      </div>
                      <div>
                        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#1B1716', display: 'block' }}>Day {day.day} Schedule</span>
                        {day.area && <span style={{ fontSize: '0.8rem', color: '#6B5E5C', fontFamily: 'Inter, sans-serif' }}>{day.area}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', color: '#9B8E8C' }}>
                        Cost: <strong style={{ color: '#810100' }}>{currencySymbol}{day.totalSpent}</strong>
                      </span>
                      <button onClick={() => handleDaySelect(day.activities)} style={{ background: NEU.PAGE, border: 'none', borderRadius: 12, padding: '8px 12px', fontSize: '0.8rem', fontWeight: 700, color: '#810100', boxShadow: NEU.raised, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Map size={14} /> Focus Map
                      </button>
                    </div>
                  </div>
                  
                  {/* Removed vertical gaps, reduced gap from 20 to 8 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {day.activities.map((act: any, i: number) => {
                      if (act.isMeal) return (
                        <button key={i} onClick={() => handleActivitySelect(act)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderRadius: 16, background: NEU.PAGE, border: 'none', boxShadow: NEU.pressed, cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'transform 0.2s' }} onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')} onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                          <div style={{ width: 32, height: 32, borderRadius: 10, background: NEU.CARD, boxShadow: NEU.raised, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Utensils size={14} color="#F59E0B" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#2E2523' }}>{act.name}</span>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#9B8E8C', marginTop: 2 }}>{act.time}</span>
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F59E0B', fontFamily: 'Inter, sans-serif' }}>{currencySymbol}{act.expense}</span>
                        </button>
                      )
                      return (
                        <button key={i} onClick={() => handleActivitySelect(act)} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '14px 20px', borderRadius: 20, background: NEU.CARD, border: 'none', boxShadow: NEU.raised, transition: 'all .25s ease', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.hover }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.raised }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                              <Clock size={13} color="#9B8E8C" />
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9B8E8C', fontFamily: 'Inter, sans-serif' }}>{act.time}</span>
                            </div>
                            <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#1B1716', margin: '0 0 4px', fontSize: '1rem' }}>{act.name}</h4>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                            {act.rating && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Star size={13} color="#F59E0B" style={{ fill: '#F59E0B' }} />
                                <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1B1716', fontFamily: 'Inter, sans-serif' }}>{act.rating}</span>
                              </div>
                            )}
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#810100', fontFamily: 'Inter, sans-serif' }}>
                              {act.expense > 0 ? `${currencySymbol}${act.expense}` : 'Free'}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </NeuCard>
              ))}
            </div>
          </div>

          <NeuCard>
            <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#1B1716', display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 18px' }}>
              <Sparkles size={18} color="#810100" /> AI-Powered Recommendations
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
              {itinerary.smartRecommendations.map((rec: any, i: number) => (
                <div key={i} style={{ background: NEU.CARD, borderRadius: 24, boxShadow: NEU.raised, border: 'none', padding: '1.25rem 1.5rem', transition: 'all .3s ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.hover }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = NEU.raised }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', color: '#810100', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>Hidden Gem</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={13} color="#F59E0B" style={{ fill: '#F59E0B' }} />
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1B1716', fontFamily: 'Inter, sans-serif' }}>{rec.rating}</span>
                    </div>
                  </div>
                  <h5 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#1B1716', margin: '0 0 8px', fontSize: '1rem' }}>{rec.name}</h5>
                  <p style={{ fontSize: '0.85rem', color: '#9B8E8C', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, margin: 0 }}>{rec.desc}</p>
                </div>
              ))}
            </div>
          </NeuCard>

        </div>
      )}
    </div>
  )
}