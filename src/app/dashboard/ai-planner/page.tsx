'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  Compass, 
  Star, 
  DollarSign, 
  Coins, 
  Users, 
  Activity, 
  Utensils, 
  Clock, 
  Check, 
  Search,
  Briefcase,
  Flower2,
  Landmark,
  Leaf,
  Moon,
  User,
  Heart,
  Home,
  Wine
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { generateGeminiItinerary } from '@/app/actions/gemini'
import { getGooglePlaceSuggestions, getGoogleMapsApiKey, PlacePrediction } from '@/app/actions/googlePlaces'
import { GoogleMapWidget } from '@/components/GoogleMapWidget'


const VIBES = [
  { id: 'Adventure', label: 'Adventure', desc: 'Thrilling treks and outdoor action' },
  { id: 'Relaxation', label: 'Relaxation', desc: 'Resorts, spas, and peaceful getaways' },
  { id: 'Culture', label: 'Culture', desc: 'Museums, historic tours, and heritage' },
  { id: 'Food', label: 'Food', desc: 'Fine dining, street markets, and tasting' },
  { id: 'Nature', label: 'Nature', desc: 'Parks, mountains, and wildlife scenic tours' },
  { id: 'Night Life', label: 'Night Life', desc: 'Clubs, bars, and evening entertainment' },
  { id: 'Family', label: 'Family', desc: 'Kid-friendly places and group activities' }
]

const VIBE_ICONS: Record<string, React.ComponentType<any>> = {
  Adventure: Compass,
  Relaxation: Flower2,
  Culture: Landmark,
  Food: Utensils,
  Nature: Leaf,
  'Night Life': Moon,
  Family: Users
}

const COMPANIONS = [
  { id: 'Solo', label: 'Solo' },
  { id: 'Couple', label: 'Couple' },
  { id: 'Family', label: 'Family' },
  { id: 'Friends', label: 'Friends' }
]

const COMPANION_ICONS: Record<string, React.ComponentType<any>> = {
  Solo: User,
  Couple: Heart,
  Family: Home,
  Friends: Wine
}

export default function AiPlannerPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [userCountry, setUserCountry] = useState('United States')
  const [currencySymbol, setCurrencySymbol] = useState('$')
  
  // Form states
  const [destination, setDestination] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [numberOfDays, setNumberOfDays] = useState('5')
  const [budget, setBudget] = useState('15000')
  const [selectedVibe, setSelectedVibe] = useState('Culture')
  const [companion, setCompanion] = useState('Friends')

  // Google places autocomplete predictions
  const [googleSuggestions, setGoogleSuggestions] = useState<PlacePrediction[]>([])
  const [googleMapsKey, setGoogleMapsKey] = useState('')

  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState<any | null>(null)

  useEffect(() => {
    getGoogleMapsApiKey().then(key => setGoogleMapsKey(key)).catch(err => console.error(err))
  }, [])
  
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Determine user resident country & currency symbol
  useEffect(() => {
    const userStr = localStorage.getItem('traveloop_user')
    if (userStr) {
      try {
        const u = JSON.parse(userStr)
        if (u.country) {
          setUserCountry(u.country)
          
          // Set Currency
          const c = u.country.toLowerCase()
          if (c.includes('india')) setCurrencySymbol('₹')
          else if (c.includes('united kingdom') || c.includes('uk')) setCurrencySymbol('£')
          else if (c.includes('france') || c.includes('germany') || c.includes('italy') || c.includes('spain') || c.includes('europe') || c.includes('switzerland')) setCurrencySymbol('€')
          else setCurrencySymbol('$')
        }
      } catch (e) {
        console.error('Error fetching user metadata:', e)
      }
    }

    // Close suggestions on click outside
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
    if (!destination) {
      alert('Please enter a destination.')
      return
    }
    const daysNum = parseInt(numberOfDays) || 5
    if (daysNum <= 0) {
      alert('Please enter a valid number of days.')
      return
    }

    setStep(2)
    setLoading(true)
    setItinerary(null)

    const numBudget = parseFloat(budget) || 15000
    const startTime = Date.now()

    try {
      const res = await generateGeminiItinerary({
        destination,
        vibe: selectedVibe,
        companion,
        days: daysNum,
        budget: numBudget,
        currencySymbol
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
      stops: [
        { id: 's_auto_1', cityName: itinerary.destination, country: itinerary.country }
      ],
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

    alert('AI Trip itinerary saved successfully!')
    window.location.href = `/dashboard/trips?id=${newTrip.id}`
  }

  const handleQuickBudget = (value: string) => {
    setBudget(value)
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-10">
      
      {/* BRAND & PROCESS TIMELINE HEADER */}
      <section className="flex flex-col gap-6 items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Compass className="h-5.5 w-5.5 text-white" />
          </div>
          <span className="font-heading font-extrabold text-2xl tracking-wider">Traveloop AI</span>
        </div>

        {/* Timeline Progress steps */}
        <div className="flex items-center justify-center gap-3 md:gap-5 text-xs text-zinc-500 font-medium bg-zinc-950/40 border border-zinc-900 px-6 py-3 rounded-full backdrop-blur-md">
          <div className={`flex items-center gap-1.5 transition-colors ${step >= 1 ? 'text-indigo-400 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-indigo-650 text-white font-bold`}>1</span>
            Destination
          </div>
          <span className="text-zinc-800">&gt;</span>
          
          <div className={`flex items-center gap-1.5 transition-colors ${step >= 1 ? 'text-indigo-400 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-indigo-650 text-white font-bold`}>2</span>
            Preferences
          </div>
          <span className="text-zinc-800">&gt;</span>
          
          <div className={`flex items-center gap-1.5 transition-colors ${step === 2 ? 'text-indigo-400 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 2 ? 'bg-indigo-600 text-white font-bold' : 'bg-zinc-900 border border-zinc-800'
            }`}>3</span>
            Generate
          </div>
        </div>
      </section>

      {/* STEP 1: UNIFIED SINGLE PAGE CONFIG FORM */}
      {step === 1 && (
        <div className="flex flex-col gap-6">
          
          {/* Card 1: Where to? */}
          <Card className="bg-zinc-900/80 border-zinc-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-3xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="flex flex-col gap-6 relative z-10">
              <div>
                <h2 className="font-heading font-black text-xl text-zinc-100 flex items-center gap-2">📍 Where to?</h2>
                <p className="text-zinc-400 text-xs mt-1">Specify your desired city or country. We will autocomplete using Google Places API.</p>
              </div>

              {/* Destination Search suggestions */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-xs font-black text-zinc-350 uppercase tracking-wider flex items-center gap-1.5">Destination *</label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400" />
                  <Input 
                    placeholder="Search City or Country..."
                    value={destination}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    className="pl-10 pr-4 bg-zinc-950/80 border-zinc-700/60 rounded-xl text-zinc-100 placeholder-zinc-500 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 text-sm py-5.5"
                  />
                </div>

                {/* Suggestions Panel */}
                {showSuggestions && (
                  <div ref={suggestionsRef} className="absolute top-[calc(100%+6px)] inset-x-0 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl z-50 backdrop-blur-3xl max-h-64 overflow-y-auto">
                    {/* Google Autocomplete Predictions */}
                    {googleSuggestions.length > 0 && (
                      <div className="flex flex-col">
                        <div className="px-3 py-2 bg-zinc-900/60 text-[9px] font-black tracking-widest text-indigo-400 uppercase border-b border-zinc-850">📍 Google Places API</div>
                        {googleSuggestions.map((item) => (
                          <button
                            key={item.placeId}
                            type="button"
                            onClick={() => handleGoogleSuggestionSelect(item.description)}
                            className="w-full text-left px-4 py-3 hover:bg-indigo-600/20 text-xs text-zinc-200 border-b border-zinc-900 last:border-0 transition-colors flex items-center gap-2.5"
                          >
                            <MapPin className="h-4 w-4 text-zinc-400" />
                            <div className="flex flex-col">
                              <span className="font-bold text-zinc-100">{item.mainText}</span>
                              {item.secondaryText && <span className="text-[10px] text-zinc-500">{item.secondaryText}</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {googleSuggestions.length === 0 && (
                      <div className="p-4 text-center text-xs text-zinc-400">
                        No matching locations. Press enter or type a custom destination.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Number of Days & Budget Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-zinc-350 uppercase tracking-wider flex items-center gap-1.5">Number of Days *</label>
                  <Input 
                    type="number"
                    placeholder="e.g. 5"
                    value={numberOfDays}
                    onChange={(e) => setNumberOfDays(e.target.value)}
                    className="bg-zinc-950/80 border-zinc-700/60 rounded-xl text-zinc-150 text-sm py-5.5 focus:border-indigo-500/85"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-zinc-350 uppercase tracking-wider flex items-center gap-1.5">Total Budget *</label>
                    <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">Currency: {userCountry}</span>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 font-bold text-base pointer-events-none">
                      {currencySymbol}
                    </div>
                    <Input 
                      type="number"
                      placeholder="Enter budget..."
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="pl-8 bg-zinc-950/80 border-zinc-700/60 rounded-xl text-zinc-100 text-sm py-5.5 focus:border-indigo-500/85"
                    />
                  </div>

                  {/* Pre budget sets */}
                  <div className="flex items-center gap-2 mt-1">
                    {['5000', '15000', '20000', '50000'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleQuickBudget(val)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wide transition-all ${
                          budget === val 
                            ? 'bg-indigo-600/30 border-indigo-500/80 text-indigo-200 shadow-md' 
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                        }`}
                      >
                        {(parseInt(val) / 1000)}K
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Travel Mood */}
          <Card className="bg-zinc-900/80 border-zinc-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-3xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="flex flex-col gap-6 relative z-10">
              <div>
                <h2 className="font-heading font-black text-xl text-zinc-100 flex items-center gap-2">💜 Travel Mood *</h2>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 justify-center">
                {VIBES.map((vibe) => {
                  const isSelected = selectedVibe === vibe.id
                  const IconComp = VIBE_ICONS[vibe.id] || Compass
                  return (
                    <button
                      key={vibe.id}
                      type="button"
                      onClick={() => setSelectedVibe(vibe.id)}
                      className={`py-5 px-2 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 text-center ${
                        isSelected 
                          ? 'bg-indigo-650/30 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] font-bold' 
                          : 'bg-zinc-950/40 border-zinc-850 text-zinc-400 hover:border-zinc-750 hover:bg-zinc-900/60 hover:text-zinc-200'
                      }`}
                    >
                      <IconComp className="h-6 w-6 text-indigo-400" />
                      <span className="text-xs font-bold leading-tight">{vibe.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </Card>

          {/* Card 3: Travelling As */}
          <Card className="bg-zinc-900/80 border-zinc-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-3xl relative overflow-hidden shadow-2xl">
            <div className="flex flex-col gap-6 relative z-10">
              <div>
                <h2 className="font-heading font-black text-xl text-zinc-100 flex items-center gap-2">👥 Travelling As</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {COMPANIONS.map((item) => {
                  const isSelected = companion === item.id
                  const IconComp = COMPANION_ICONS[item.id] || User
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCompanion(item.id)}
                      className={`py-5 px-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2.5 text-center ${
                        isSelected 
                          ? 'bg-violet-600/25 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)] font-bold' 
                          : 'bg-zinc-950/40 border-zinc-850 text-zinc-400 hover:border-zinc-750 hover:bg-zinc-900/60 hover:text-zinc-200'
                      }`}
                    >
                      <IconComp className="h-6 w-6 text-violet-400" />
                      <span className="text-xs font-bold leading-tight">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </Card>

          {/* Action Button */}
          <div className="mt-4">
            <Button
              onClick={handleGenerate}
              className="w-full py-7 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all"
            >
              <Sparkles className="h-5 w-5 animate-pulse" />
              Generate Itinerary 🚀
            </Button>
          </div>

        </div>
      )}

      {/* STEP 2: GENERATOR TELEMETRY OR RESULTS SCREEN */}
      {step === 2 && (
        <div className="w-full flex flex-col gap-8">
          
          {/* A. Loader / Generator State climber */}
          {loading && (
            <div className="border border-zinc-800/80 rounded-3xl bg-zinc-900/80 p-12 min-h-[420px] flex flex-col justify-center items-center text-center gap-6 backdrop-blur-3xl relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/25 border border-indigo-400/40 flex items-center justify-center animate-pulse">
                  <Sparkles className="h-8 w-8 text-indigo-300 animate-spin duration-[4000ms]" />
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-purple-500 rounded-full animate-ping" />
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="font-heading font-extrabold text-2xl text-zinc-100">Consulting TripO Engine...</h3>
                <p className="text-zinc-300 text-sm max-w-md mx-auto leading-relaxed font-medium">Instantly compiling geographic coordinate maps, local cafe ratings, and hotel budget insights using real-time Google Places datasets. 🌍</p>
              </div>
              <div className="w-48 h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-[shimmer_1.5s_infinite] w-3/4" style={{ backgroundSize: '200% 100%' }} />
              </div>
            </div>
          )}

          {/* B. Generated Itinerary view */}
          {!loading && itinerary && (
            <div className="flex flex-col gap-8">
              
              {/* 1. TOP SUMMARY METRICS BANNER */}
              <div className="relative rounded-3xl overflow-hidden border border-indigo-500/20 bg-zinc-900/80 p-6 backdrop-blur-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-650/30 border border-indigo-400/35 flex items-center justify-center">
                    <MapPin className="h-7 w-7 text-indigo-400" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase">📍 Destination</span>
                    <h2 className="text-2xl font-black text-zinc-100 leading-none">{itinerary.destination}</h2>
                  </div>
                </div>

                {/* Grid summary metrics */}
                <div className="grid grid-cols-2 md:flex items-center gap-4 md:gap-8 text-xs w-full md:w-auto">
                  <div className="flex flex-col bg-zinc-950/60 px-4 py-2.5 rounded-xl border border-zinc-800/80 min-w-[100px]">
                    <span className="text-zinc-400 text-[9px] uppercase font-bold tracking-wider">🎭 Vibe</span>
                    <span className="text-zinc-100 font-extrabold mt-0.5">{itinerary.vibe}</span>
                  </div>
                  <div className="flex flex-col bg-zinc-950/60 px-4 py-2.5 rounded-xl border border-zinc-800/80 min-w-[100px]">
                    <span className="text-zinc-400 text-[9px] uppercase font-bold tracking-wider">👥 Travelers</span>
                    <span className="text-zinc-100 font-extrabold mt-0.5">{itinerary.companion}</span>
                  </div>
                  <div className="flex flex-col bg-zinc-950/60 px-4 py-2.5 rounded-xl border border-zinc-800/80 min-w-[100px]">
                    <span className="text-zinc-400 text-[9px] uppercase font-bold tracking-wider">📅 Duration</span>
                    <span className="text-zinc-100 font-extrabold mt-0.5">{itinerary.days} Days</span>
                  </div>
                  <div className="flex flex-col bg-zinc-950/60 px-4 py-2.5 rounded-xl border border-zinc-800/80 min-w-[100px]">
                    <span className="text-zinc-400 text-[9px] uppercase font-bold tracking-wider">💰 Budget Limit</span>
                    <span className="text-emerald-400 font-extrabold mt-0.5">{currencySymbol}{itinerary.budget.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 2. BUDGET CATEGORY & DETAILS PANEL */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">💵 Budget Vibe</span>
                  <div className="mt-2 text-lg font-black text-indigo-300">{itinerary.category} Tier</div>
                  <span className="text-[10px] text-zinc-450 mt-1 block">Relative cost per person</span>
                </div>
                
                <div className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">💸 Daily Average Spent</span>
                  <div className="mt-2 text-lg font-black text-emerald-400">
                    {currencySymbol}{Math.round(itinerary.budget / itinerary.days).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-zinc-450 mt-1 block">Allocated schedule cost</span>
                </div>

                <div className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">⚡ Trip Intensity</span>
                  <div className="mt-2 text-lg font-black text-violet-300">{itinerary.tripIntensity} Pace</div>
                  <span className="text-[10px] text-zinc-450 mt-1 block">Daily energy demand</span>
                </div>

                <div className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">🎯 Mapped Attractions</span>
                  <div className="mt-2 text-lg font-black text-zinc-100">{itinerary.attractionsCount} Hotspots</div>
                  <span className="text-[10px] text-zinc-450 mt-1 block">Google Places synced</span>
                </div>
              </div>

              {/* Interactive Google Map Route Section */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-black text-xl text-zinc-150 flex items-center gap-2">
                    🗺️ Route Visualization Map
                  </h3>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Synced Live Coordinates</span>
                </div>
                <GoogleMapWidget 
                  activities={itinerary.dailyItinerary.flatMap((d: any) => d.activities)} 
                  apiKey={googleMapsKey} 
                />
              </div>

              {/* 3. DAY WISE ITINERARY PANELS */}
              <div className="flex flex-col gap-6">
                <h3 className="font-heading font-black text-2xl text-zinc-100 flex items-center gap-2">
                  <Briefcase className="h-5.5 w-5.5 text-indigo-400" />
                  Your Itinerary
                </h3>

                <div className="flex flex-col gap-6">
                  {itinerary.dailyItinerary.map((d: any) => (
                    <div 
                      key={d.day} 
                      className="rounded-2xl border border-zinc-900 bg-zinc-950/50 p-6 flex flex-col gap-4 relative overflow-hidden"
                    >
                      {/* Day heading bar */}
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-indigo-600/10 border border-indigo-500/25 flex items-center justify-center text-xs font-bold text-indigo-400">D{d.day}</span>
                          <span className="text-sm font-extrabold text-zinc-200">Day {d.day} Overview</span>
                        </div>
                        <span className="text-xs font-medium text-zinc-400">
                          Daily Spent: <span className="font-bold text-indigo-400">{currencySymbol}{d.totalSpent}</span>
                        </span>
                      </div>

                      {/* Activities List */}
                      <div className="flex flex-col gap-4 relative pl-3 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-indigo-950">
                        {d.activities.map((act: any, idx: number) => {
                          if (act.isMeal) {
                            return (
                              <div key={idx} className="flex items-center gap-3 bg-zinc-900/30 px-4 py-2.5 rounded-xl border border-zinc-900/60 my-1">
                                <Utensils className="h-4 w-4 text-violet-400 flex-shrink-0" />
                                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-1">
                                  <span className="text-xs text-zinc-300 font-medium">{act.name}</span>
                                  <span className="text-[10px] text-zinc-500 font-bold">Est: {currencySymbol}{act.expense}</span>
                                </div>
                              </div>
                            )
                          }

                          return (
                            <div key={idx} className="group relative flex items-start gap-4 text-zinc-400">
                              {/* Timing Bullet */}
                              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 border border-indigo-400 absolute left-[-16px] top-1.5 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                              
                              <div className="flex-1 flex flex-col md:flex-row md:items-start justify-between gap-4 bg-zinc-950/20 hover:bg-zinc-900/10 p-3 rounded-xl border border-transparent hover:border-zinc-900 transition-all">
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-zinc-500" />
                                    <span className="text-[10px] font-bold text-zinc-500 font-mono">{act.time}</span>
                                    <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800/80">{act.city}</span>
                                  </div>
                                  <h4 className="text-xs font-bold text-zinc-200 group-hover:text-indigo-300 transition-colors">{act.name}</h4>
                                </div>

                                <div className="flex items-center gap-3 text-[10px]">
                                  {act.rating && (
                                    <div className="flex items-center gap-0.5 text-amber-400">
                                      <Star className="h-3 w-3 fill-current" />
                                      <span className="font-bold">{act.rating}</span>
                                    </div>
                                  )}
                                  <span className="text-zinc-500">
                                    Expense: <span className="font-bold text-zinc-300">{act.expense > 0 ? `${currencySymbol}${act.expense}` : 'Free'}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SMART RECOMMENDATIONS */}
              <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 flex flex-col gap-4">
                <h4 className="text-sm font-black text-indigo-300 flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                  Smart Recommendations
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {itinerary.smartRecommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl flex flex-col justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-zinc-500 uppercase">Hidden Spot</span>
                          <div className="flex items-center gap-0.5 text-amber-400 text-[10px]">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="font-bold">{rec.rating}</span>
                          </div>
                        </div>
                        <h5 className="text-xs font-extrabold text-zinc-200 mt-1">{rec.name}</h5>
                        <p className="text-zinc-500 text-[10px] leading-relaxed mt-1">{rec.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION CONTROLS */}
              <div className="flex items-center gap-4 mt-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="ghost"
                  className="flex-1 py-6 bg-zinc-900/30 border border-zinc-850 hover:bg-zinc-900/60 rounded-xl text-xs font-bold text-zinc-400"
                >
                  Regenerate
                </Button>
                <Button
                  onClick={handleSaveTrip}
                  className="flex-[2] py-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                >
                  <Check className="h-4.5 w-4.5" />
                  Save Trip
                </Button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  )
}
