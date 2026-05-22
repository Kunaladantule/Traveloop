// app/dashboard/ai-planner/page.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Sparkles, MapPin, Calendar, ArrowRight, ArrowLeft, Compass, 
  Star, DollarSign, Users, Activity, Utensils, Clock, Check, 
  Search, Briefcase, Flower2, Landmark, Leaf, Moon, User, 
  Heart, Home, Wine, Loader2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { generateGeminiItinerary } from '@/app/actions/gemini'
import { getGooglePlaceSuggestions, getGoogleMapsApiKey, PlacePrediction } from '@/app/actions/googlePlaces'
import { GoogleMapWidget } from '@/components/GoogleMapWidget'

// ─────────────────────────────────────────────────────────────
// 🎨 Travel Vibes & Companions (With Icons)
// ─────────────────────────────────────────────────────────────
const VIBES = [
  { id: 'Adventure', label: 'Adventure', desc: 'Thrilling treks and outdoor action' },
  { id: 'Relaxation', label: 'Relaxation', desc: 'Resorts, spas, and peaceful getaways' },
  { id: 'Culture', label: 'Culture', desc: 'Museums, historic tours, and heritage' },
  { id: 'Food', label: 'Foodie', desc: 'Fine dining, street markets, and tasting' },
  { id: 'Nature', label: 'Nature', desc: 'Parks, mountains, and wildlife scenic tours' },
  { id: 'Night Life', label: 'Nightlife', desc: 'Clubs, bars, and evening entertainment' },
  { id: 'Family', label: 'Family', desc: 'Kid-friendly places and group activities' }
]

const VIBE_ICONS: Record<string, React.ComponentType<any>> = {
  Adventure: Compass, Relaxation: Flower2, Culture: Landmark,
  Food: Utensils, Nature: Leaf, 'Night Life': Moon, Family: Users
}

const COMPANIONS = [
  { id: 'Solo', label: 'Solo Traveler' },
  { id: 'Couple', label: 'Romantic Couple' },
  { id: 'Family', label: 'Family Trip' },
  { id: 'Friends', label: 'Friends Getaway' }
]

const COMPANION_ICONS: Record<string, React.ComponentType<any>> = {
  Solo: User, Couple: Heart, Family: Home, Friends: Wine
}

// ─────────────────────────────────────────────────────────────
// 🧩 Reusable Components (Light Theme + Larger Text)
// ─────────────────────────────────────────────────────────────

const StepBadge = ({ step, current, label }: { step: number; current: number; label: string }) => {
  const isActive = current >= step
  const isCurrent = current === step
  
  return (
    <div className={`flex items-center gap-2 transition-colors ${isActive ? 'text-indigo-700' : 'text-slate-400'}`}>
      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
        isCurrent 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
          : isActive 
            ? 'bg-indigo-100 text-indigo-700' 
            : 'bg-slate-100 text-slate-500'
      }`}>
        {isActive && !isCurrent ? <Check className="h-4 w-4" /> : step}
      </span>
      <span className={`text-base font-semibold ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
        {label}
      </span>
    </div>
  )
}

const VibeButton = ({ 
  vibe, selected, onSelect 
}: { 
  vibe: typeof VIBES[0]; selected: boolean; onSelect: () => void 
}) => {
  const Icon = VIBE_ICONS[vibe.id] || Compass
  
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`py-4 px-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center min-h-[100px] ${
        selected 
          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-md shadow-indigo-100' 
          : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50'
      }`}
    >
      <Icon className={`h-7 w-7 transition-colors ${selected ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
      <span className={`text-base font-bold leading-tight ${selected ? 'text-indigo-900' : 'text-slate-700'}`}>
        {vibe.label}
      </span>
    </button>
  )
}

const CompanionButton = ({ 
  item, selected, onSelect 
}: { 
  item: typeof COMPANIONS[0]; selected: boolean; onSelect: () => void 
}) => {
  const Icon = COMPANION_ICONS[item.id] || User
  
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`py-4 px-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 text-center min-h-[110px] ${
        selected 
          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-md shadow-indigo-100' 
          : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50'
      }`}
    >
      <Icon className={`h-8 w-8 transition-colors ${selected ? 'text-indigo-600' : 'text-slate-400'}`} />
      <span className={`text-base font-bold leading-tight ${selected ? 'text-indigo-900' : 'text-slate-700'}`}>
        {item.label}
      </span>
    </button>
  )
}

const StatCard = ({ label, value, sublabel, icon: Icon, color }: {
  label: string; value: string; sublabel: string; icon: React.ElementType; color: string
}) => (
  <div className={`flex flex-col bg-white px-5 py-3.5 rounded-xl border border-slate-200 min-w-[120px] shadow-sm`}>
    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
      <Icon className={`h-3.5 w-3.5 ${color}`} />
      {label}
    </span>
    <span className="text-lg font-bold text-slate-900 mt-1">{value}</span>
    {sublabel && <span className="text-[11px] text-slate-400 mt-0.5">{sublabel}</span>}
  </div>
)

// ─────────────────────────────────────────────────────────────
// 🚀 Main AI Planner Page Component
// ─────────────────────────────────────────────────────────────

export default function AiPlannerPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [userCountry, setUserCountry] = useState('United States')
  const [currencySymbol, setCurrencySymbol] = useState('$')
  
  // Form states
  const [destination, setDestination] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [numberOfDays, setNumberOfDays] = useState('')
  const [budget, setBudget] = useState('')
  const [selectedVibe, setSelectedVibe] = useState('')
  const [companion, setCompanion] = useState('')

  // Google places autocomplete
  const [googleSuggestions, setGoogleSuggestions] = useState<PlacePrediction[]>([])
  const [googleMapsKey, setGoogleMapsKey] = useState('')

  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState<any | null>(null)

  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Load Google Maps API key
  useEffect(() => {
    getGoogleMapsApiKey().then(key => setGoogleMapsKey(key)).catch(err => console.error(err))
  }, [])
  
  // Load user preferences & setup outside click handler
  useEffect(() => {
    const userStr = localStorage.getItem('traveloop_user')
    if (userStr) {
      try {
        const u = JSON.parse(userStr)
        if (u.country) {
          setUserCountry(u.country)
          const c = u.country.toLowerCase()
          if (c.includes('india')) setCurrencySymbol('₹')
          else if (c.includes('united kingdom') || c.includes('uk')) setCurrencySymbol('£')
          else if (c.includes('france') || c.includes('germany') || c.includes('italy') || c.includes('spain') || c.includes('europe') || c.includes('switzerland')) setCurrencySymbol('€')
          else if (c.includes('united arab emirates') || c.includes('uae') || c.includes('dubai') || c.includes('emirates')) setCurrencySymbol('AED')
          else setCurrencySymbol('$')
        }
      } catch (e) {
        console.error('Error fetching user metadata:', e)
      }
    }

    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDestinationChange = async (val: string) => {
    setDestination(val)
    setShowSuggestions(true)
    if (val.trim().length > 1) {
      try {
        const res = await getGooglePlaceSuggestions(val)
        if (res.success && res.predictions.length > 0) {
          setGoogleSuggestions(res.predictions)
        } else {
          setGoogleSuggestions([])
        }
      } catch (e) {
        console.error(e)
        setGoogleSuggestions([])
      }
    } else {
      setGoogleSuggestions([])
    }
  }

  const handleGoogleSuggestionSelect = (desc: string) => {
    setDestination(desc)
    setShowSuggestions(false)
  }

  const handleGenerate = async () => {
    if (!destination) { alert('Please enter a destination.'); return }
    const daysNum = parseInt(numberOfDays) || 5
    if (daysNum <= 0) { alert('Please enter a valid number of days.'); return }
    if (!selectedVibe) { alert('Please select a travel mood.'); return }
    if (!companion) { alert('Please select who you are traveling with.'); return }

    setStep(2)
    setLoading(true)
    setItinerary(null)

    const numBudget = parseFloat(budget) || 15000
    const startTime = Date.now()

    try {
      const res = await generateGeminiItinerary({
        destination, vibe: selectedVibe, companion, days: daysNum, budget: numBudget, currencySymbol
      })

      const elapsed = Date.now() - startTime
      const remainingDelay = Math.max(0, 2200 - elapsed)

      setTimeout(() => {
        if (res && res.success && res.itinerary) {
          setItinerary(res.itinerary)
        } else {
          alert('Itinerary generation encountered an error. Please try again.')
          setStep(1)
        }
        setLoading(false)
      }, remainingDelay)
    } catch (error) {
      console.error('Error generating itinerary:', error)
      alert('Network error while generating itinerary. Please try again.')
      setStep(1)
      setLoading(false)
    }
  }

  const handleSaveTrip = () => {
    if (!itinerary) return
    const userStr = localStorage.getItem('traveloop_user')
    if (!userStr) return

    const u = JSON.parse(userStr)
    const localTripsKey = `traveloop_trips_${u.id}`
    const stored = localStorage.getItem(localTripsKey)
    const currentTrips = stored ? JSON.parse(stored) : []

    const totalSpentSum = itinerary.dailyItinerary.reduce((sum: number, d: any) => sum + d.totalSpent, 0)
    const sDate = new Date()
    const eDate = new Date()
    eDate.setDate(sDate.getDate() + (parseInt(numberOfDays) || 5))

    const newTrip = {
      id: 'ai_trip_' + Math.random().toString(36).substring(2, 11),
      title: `${itinerary.destination} ${itinerary.vibe} Escape`,
      description: `A customized ${itinerary.days}-day ${itinerary.vibe.toLowerCase()} itinerary for ${itinerary.companion.toLowerCase()} travelers in ${itinerary.destination}.`,
      startDate: sDate.toISOString(),
      endDate: eDate.toISOString(),
      totalBudget: parseFloat(budget) || 15000,
      coverImage: itinerary.coverImage,
      stops: [{ id: 's_auto_1', cityName: itinerary.destination, country: itinerary.country }],
      expenses: [
        { id: 'exp_t', amount: Math.round(totalSpentSum * 0.20), category: 'Transport' },
        { id: 'exp_h', amount: Math.round(totalSpentSum * 0.40), category: 'Hotel' },
        { id: 'exp_f', amount: Math.round(totalSpentSum * 0.20), category: 'Food' },
        { id: 'exp_a', amount: Math.round(totalSpentSum * 0.15), category: 'Activities' },
        { id: 'exp_m', amount: Math.round(totalSpentSum * 0.05), category: 'Misc' }
      ],
      itineraryDays: itinerary.dailyItinerary,
      smartRecommendations: itinerary.smartRecommendations
    }

    currentTrips.unshift(newTrip)
    localStorage.setItem(localTripsKey, JSON.stringify(currentTrips))
    alert('✅ AI Trip itinerary saved successfully!')
    window.location.href = `/dashboard/trips?id=${newTrip.id}`
  }

  const handleQuickBudget = (value: string) => setBudget(value)

  // ─────────────────────────────────────────────────────────────
  // 🎯 STEP 1: Trip Configuration Form (Light Theme + Larger Text)
  // ─────────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="flex flex-col gap-10 max-w-5xl mx-auto pb-12">
        
        {/* 🧭 Header: Brand + Progress Steps */}
        <section className="flex flex-col items-center gap-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <span className="font-heading font-bold text-2xl text-slate-900 tracking-tight">Traveloop AI ✨</span>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-6 md:gap-8 text-base font-medium bg-white border border-slate-200 px-6 py-3.5 rounded-full shadow-sm">
            <StepBadge step={1} current={step} label="Destination" />
            <span className="text-slate-300 text-xl">•</span>
            <StepBadge step={2} current={step} label="Preferences" />
            <span className="text-slate-300 text-xl">•</span>
            <StepBadge step={3} current={step} label="Generate" />
          </div>
        </section>

        {/* 📍 Card 1: Destination & Budget */}
        <Card className="bg-white border-slate-200 rounded-3xl p-7 md:p-9 shadow-lg shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col gap-7 relative z-10">
            <div>
              <h2 className="font-heading font-bold text-2xl text-slate-900 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-indigo-600" />
                Where would you like to go?
              </h2>
              <p className="text-lg text-slate-600 mt-2">
                Search for a city, country, or landmark. We'll autocomplete suggestions using Google Places.
              </p>
            </div>

            {/* Destination Search */}
            <div className="flex flex-col gap-3 relative">
              <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Destination *</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
                <Input 
                  placeholder="Search city or country..."
                  value={destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-12 pr-4 bg-white border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 text-lg py-4 h-14 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* Google Places Suggestions Dropdown */}
              {showSuggestions && googleSuggestions.length > 0 && (
                <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xl z-50 max-h-72 overflow-y-auto">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                    <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide flex items-center gap-1.5">
                      <Search className="h-3.5 w-3.5" />
                      Google Places Suggestions
                    </span>
                  </div>
                  {googleSuggestions.map((item) => (
                    <button
                      key={item.placeId}
                      type="button"
                      onClick={() => handleGoogleSuggestionSelect(item.description)}
                      className="w-full text-left px-5 py-3.5 hover:bg-indigo-50 text-slate-800 border-b border-slate-100 last:border-0 transition-colors flex items-center gap-3"
                    >
                      <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 text-base">{item.mainText}</span>
                        {item.secondaryText && <span className="text-sm text-slate-500">{item.secondaryText}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Days & Budget Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Number of Days */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Number of Days *</label>
                <Input 
                  type="number"
                  min="1"
                  max="30"
                  placeholder="e.g., 7"
                  value={numberOfDays}
                  onChange={(e) => setNumberOfDays(e.target.value)}
                  className="bg-white border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 text-lg py-4 h-14 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* Budget */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Total Budget *</label>
                  <span className="text-sm font-semibold text-indigo-700">Currency: {currencySymbol}</span>
                </div>
                
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600 font-bold text-lg pointer-events-none">
                    {currencySymbol}
                  </span>
                  <Input 
                    type="number"
                    placeholder="Enter your budget..."
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="pl-10 bg-white border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 text-lg py-4 h-14 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                {/* Quick Budget Chips */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-slate-500">Quick select:</span>
                  {['5000', '15000', '25000', '50000'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickBudget(val)}
                      className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                        budget === val 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                          : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50'
                      }`}
                    >
                      {currencySymbol}{(parseInt(val) / 1000)}K
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 💜 Card 2: Travel Mood */}
        <Card className="bg-white border-slate-200 rounded-3xl p-7 md:p-9 shadow-lg shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col gap-7 relative z-10">
            <div>
              <h2 className="font-heading font-bold text-2xl text-slate-900 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-indigo-600" />
                What's your travel vibe?
              </h2>
              <p className="text-lg text-slate-600 mt-2">
                Choose the mood that best matches your dream trip.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {VIBES.map((vibe) => (
                <VibeButton
                  key={vibe.id}
                  vibe={vibe}
                  selected={selectedVibe === vibe.id}
                  onSelect={() => setSelectedVibe(vibe.id)}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* 👥 Card 3: Traveling With */}
        <Card className="bg-white border-slate-200 rounded-3xl p-7 md:p-9 shadow-lg shadow-slate-200/50">
          <div className="flex flex-col gap-7">
            <div>
              <h2 className="font-heading font-bold text-2xl text-slate-900 flex items-center gap-2">
                <Users className="h-6 w-6 text-indigo-600" />
                Who are you traveling with?
              </h2>
              <p className="text-lg text-slate-600 mt-2">
                This helps us tailor recommendations to your group.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {COMPANIONS.map((item) => (
                <CompanionButton
                  key={item.id}
                  item={item}
                  selected={companion === item.id}
                  onSelect={() => setCompanion(item.id)}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* 🚀 Generate Button */}
        <div className="pt-2">
          <Button
            onClick={handleGenerate}
            disabled={!destination || !numberOfDays || !budget || !selectedVibe || !companion}
            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <Sparkles className="h-6 w-6 animate-pulse" />
            Generate My AI Itinerary ✨
          </Button>
          <p className="text-center text-sm text-slate-500 mt-3">
            Takes about 30 seconds • Powered by Google Places + Gemini AI
          </p>
        </div>

      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // 🎯 STEP 2: Loading or Results View (Light Theme + Larger Text)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto pb-12">
      
      {/* 🧭 Header: Back Button + Title */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => { setStep(1); setLoading(false) }}
          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Edit Preferences
        </Button>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <StepBadge step={1} current={2} label="" />
          <StepBadge step={2} current={2} label="" />
          <StepBadge step={3} current={2} label="" />
        </div>
      </div>

      {/* ⏳ Loading State */}
      {loading && (
        <Card className="bg-white border-slate-200 rounded-3xl p-12 min-h-[400px] flex flex-col justify-center items-center text-center gap-6 shadow-lg">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full animate-ping" />
          </div>

          <div className="flex flex-col gap-3 max-w-md">
            <h3 className="font-heading font-bold text-2xl text-slate-900">
              Crafting your perfect itinerary... ✨
            </h3>
            <p className="text-lg text-slate-600 leading-relaxed">
              Our AI is analyzing {destination}, finding top-rated attractions, calculating optimal routes, and building a personalized day-by-day plan just for you.
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse w-3/4" />
          </div>
        </Card>
      )}

      {/* ✅ Generated Itinerary Results */}
      {!loading && itinerary && (
        <div className="flex flex-col gap-10">
          
          {/* 🎯 Summary Banner */}
          <Card className="bg-white border-indigo-200 rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-100/50 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              {/* Destination Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">📍 Destination</span>
                  <h2 className="font-heading font-bold text-3xl text-slate-900 leading-tight">
                    {itinerary.destination}
                  </h2>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                <StatCard label="Vibe" value={itinerary.vibe} sublabel="" icon={Sparkles} color="text-indigo-600" />
                <StatCard label="Travelers" value={itinerary.companion} sublabel="" icon={Users} color="text-purple-600" />
                <StatCard label="Duration" value={`${itinerary.days} Days`} sublabel="" icon={Calendar} color="text-emerald-600" />
                <StatCard label="Budget" value={`${currencySymbol}${itinerary.budget.toLocaleString()}`} sublabel="Total" icon={DollarSign} color="text-amber-600" />
              </div>
            </div>
          </Card>

          {/* 📊 Budget & Insights Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white border-slate-200 rounded-2xl p-5 shadow-sm">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">💵 Budget Tier</span>
              <div className="mt-2 text-2xl font-bold text-indigo-700">{itinerary.category}</div>
              <span className="text-sm text-slate-500 mt-1 block">Cost level per person</span>
            </Card>
            
            <Card className="bg-white border-slate-200 rounded-2xl p-5 shadow-sm">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">💸 Daily Average</span>
              <div className="mt-2 text-2xl font-bold text-emerald-700">
                {currencySymbol}{Math.round(itinerary.budget / itinerary.days).toLocaleString()}
              </div>
              <span className="text-sm text-slate-500 mt-1 block">Per day allocation</span>
            </Card>

            <Card className="bg-white border-slate-200 rounded-2xl p-5 shadow-sm">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">⚡ Trip Pace</span>
              <div className="mt-2 text-2xl font-bold text-violet-700">{itinerary.tripIntensity}</div>
              <span className="text-sm text-slate-500 mt-1 block">Energy level</span>
            </Card>

            <Card className="bg-white border-slate-200 rounded-2xl p-5 shadow-sm">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">🎯 Attractions</span>
              <div className="mt-2 text-2xl font-bold text-slate-900">{itinerary.attractionsCount}+</div>
              <span className="text-sm text-slate-500 mt-1 block">Google Places verified</span>
            </Card>
          </div>

          {/* 🗺️ Interactive Map */}
          <Card className="bg-white border-slate-200 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-xl text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-600" />
                Route Map
              </h3>
              <span className="text-sm font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                Live Coordinates
              </span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200">
              <GoogleMapWidget 
                activities={itinerary.dailyItinerary.flatMap((d: any) => d.activities)} 
                apiKey={googleMapsKey} 
              />
            </div>
          </Card>

          {/* 📅 Day-by-Day Itinerary */}
          <div className="flex flex-col gap-6">
            <h3 className="font-heading font-bold text-2xl text-slate-900 flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-indigo-600" />
              Your Day-by-Day Plan
            </h3>

            {itinerary.dailyItinerary.map((day: any) => (
              <Card key={day.day} className="bg-white border-slate-200 rounded-2xl p-6 shadow-sm">
                {/* Day Header */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center text-base font-bold text-indigo-700">
                      {day.day}
                    </span>
                    <span className="text-lg font-semibold text-slate-900">Day {day.day} Schedule</span>
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    Daily Spend: <span className="font-bold text-indigo-700">{currencySymbol}{day.totalSpent}</span>
                  </span>
                </div>

                {/* Activities Timeline */}
                <div className="flex flex-col gap-4 relative pl-2">
                  {day.activities.map((act: any, idx: number) => {
                    if (act.isMeal) {
                      return (
                        <div key={idx} className="flex items-center gap-4 bg-amber-50 px-5 py-3.5 rounded-xl border border-amber-100">
                          <Utensils className="h-5 w-5 text-amber-600 shrink-0" />
                          <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <span className="text-base font-medium text-slate-800">{act.name}</span>
                            <span className="text-sm font-semibold text-amber-700">
                              Est: {currencySymbol}{act.expense}
                            </span>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div key={idx} className="group relative flex items-start gap-4">
                        {/* Timeline dot */}
                        <div className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-white absolute left-[-22px] top-2 shadow-sm" />
                        
                        <div className="flex-1 flex flex-col md:flex-row md:items-start justify-between gap-4 bg-slate-50 hover:bg-indigo-50/50 p-4 rounded-xl border border-transparent hover:border-indigo-100 transition-all">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-slate-400" />
                              <span className="text-sm font-semibold text-slate-600 font-mono">{act.time}</span>
                              <span className="text-sm text-slate-500 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                                {act.city}
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                              {act.name}
                            </h4>
                            {act.description && (
                              <p className="text-sm text-slate-600 leading-relaxed">{act.description}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            {act.rating && (
                              <div className="flex items-center gap-1 text-amber-500">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="font-bold text-slate-700">{act.rating}</span>
                              </div>
                            )}
                            <span className="text-slate-600">
                              Cost: <span className="font-semibold text-slate-900">
                                {act.expense > 0 ? `${currencySymbol}${act.expense}` : 'Free'}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            ))}
          </div>

          {/* 💡 Smart Recommendations */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 rounded-3xl p-6 shadow-sm">
            <h4 className="font-heading font-bold text-xl text-slate-900 flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              AI-Powered Recommendations
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {itinerary.smartRecommendations.map((rec: any, idx: number) => (
                <Card key={idx} className="bg-white border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Hidden Gem</span>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-bold text-slate-700 text-sm">{rec.rating}</span>
                    </div>
                  </div>
                  <h5 className="text-base font-bold text-slate-900 mb-2">{rec.name}</h5>
                  <p className="text-sm text-slate-600 leading-relaxed">{rec.desc}</p>
                </Card>
              ))}
            </div>
          </Card>

          {/* 🎯 Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Button
              onClick={() => { setStep(1); setLoading(false) }}
              variant="outline"
              className="flex-1 py-4 bg-white border-slate-300 hover:bg-slate-50 rounded-xl text-base font-semibold text-slate-700"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Regenerate Plan
            </Button>
            <Button
              onClick={handleSaveTrip}
              className="flex-[2] py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-200/50 hover:shadow-xl flex items-center justify-center gap-3"
            >
              <Check className="h-5 w-5" />
              Save This Trip to My Dashboard ✨
            </Button>
          </div>

        </div>
      )}

    </div>
  )
}