'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Compass, 
  Search, 
  Trash2, 
  Share2, 
  Edit3, 
  TrendingUp, 
  AlertTriangle,
  ArrowLeft,
  DollarSign,
  Coffee,
  FileText,
  Clock,
  Star,
  Check,
  ChevronRight,
  Utensils
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from 'recharts'
import { getUserTrips, deleteTrip, updateTripBudget } from '@/app/actions/trip'

interface TripStop {
  id: string
  cityName: string
  country: string
}

interface TripExpense {
  id: string
  amount: number
  category: string
}

interface Trip {
  id: string
  title: string
  description?: string | null
  startDate: string
  endDate: string
  totalBudget?: number | null
  coverImage?: string | null
  stops?: TripStop[]
  expenses?: TripExpense[]
  itineraryDays?: Array<{
    day: number
    totalSpent: number
    activities: Array<{
      name: string
      time: string
      rating?: string
      city?: string
      expense: number
      isMeal?: boolean
    }>
  }>
  smartRecommendations?: Array<{
    name: string
    desc: string
    rating: string
  }>
}

const DEFAULT_MOCK_TRIPS: Trip[] = []



function TripsPageInner() {
  const searchParams = useSearchParams()
  const activeId = searchParams.get('id')

  const [trips, setTrips] = useState<Trip[]>([])
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // Detailed View Tab State
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'gems' | 'notes'>('itinerary')
  
  // Currency symbol
  const [currencySymbol, setCurrencySymbol] = useState('$')

  // Notes state
  const [notes, setNotes] = useState<Array<{ id: string; content: string }>>([])
  const [newNoteText, setNewNoteText] = useState('')

  // Load User & Trips
  useEffect(() => {
    const userStr = localStorage.getItem('traveloop_user')
    if (!userStr) {
      window.location.href = '/'
      return
    }
    const parsedUser = JSON.parse(userStr)
    setUser(parsedUser)

    // Currency determine
    if (parsedUser.country) {
      const c = parsedUser.country.toLowerCase()
      if (c.includes('india')) setCurrencySymbol('₹')
      else if (c.includes('united kingdom') || c.includes('uk')) setCurrencySymbol('£')
      else if (c.includes('france') || c.includes('germany') || c.includes('italy') || c.includes('spain') || c.includes('europe') || c.includes('switzerland')) setCurrencySymbol('€')
      else setCurrencySymbol('$')
    }

    const loadAllData = async () => {
      try {
        const res = await getUserTrips(parsedUser.id)
        let loadedTrips: Trip[] = []
        if (res.success && res.trips && res.trips.length > 0) {
          loadedTrips = res.trips as unknown as Trip[]
        } else {
          const localTripsKey = `traveloop_trips_${parsedUser.id}`
          const stored = localStorage.getItem(localTripsKey)
          if (stored) {
            loadedTrips = JSON.parse(stored)
          } else {
            localStorage.setItem(localTripsKey, JSON.stringify(DEFAULT_MOCK_TRIPS))
            loadedTrips = DEFAULT_MOCK_TRIPS
          }
        }

        setTrips(loadedTrips)

        // Find active trip if applicable
        if (activeId) {
          const found = loadedTrips.find(t => t.id === activeId)
          if (found) {
            setActiveTrip(found)
            
            // Load notes from localStorage
            const notesKey = `traveloop_notes_${found.id}`
            const storedNotes = localStorage.getItem(notesKey)
            if (storedNotes) {
              setNotes(JSON.parse(storedNotes))
            } else {
              setNotes([
                { id: 'n1', content: 'Remember to pack comfortable walking shoes.' },
                { id: 'n2', content: 'Pick up pocket Wi-Fi at the terminal arrival lounge.' }
              ])
            }
          }
        }
      } catch (err) {
        console.warn('Error loading trips database:', err)
        const localTripsKey = `traveloop_trips_${parsedUser.id}`
        const stored = localStorage.getItem(localTripsKey)
        const loadedTrips: Trip[] = stored ? JSON.parse(stored) : DEFAULT_MOCK_TRIPS
        setTrips(loadedTrips)
        if (activeId) {
          const found = loadedTrips.find(t => t.id === activeId)
          if (found) {
            setActiveTrip(found)
            const notesKey = `traveloop_notes_${found.id}`
            const storedNotes = localStorage.getItem(notesKey)
            setNotes(storedNotes ? JSON.parse(storedNotes) : [
              { id: 'n1', content: 'Remember to pack comfortable walking shoes.' }
            ])
          }
        }
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [activeId])

  // Delete trip
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trip plan?')) return
    try {
      await deleteTrip(id)
    } catch(e){}

    const updated = trips.filter(t => t.id !== id)
    setTrips(updated)
    if (user) {
      localStorage.setItem(`traveloop_trips_${user.id}`, JSON.stringify(updated))
    }
    
    // Clear active parameter
    window.location.href = '/dashboard/trips'
  }

  // Handle Edit Breakdown In-place
  const handleExpenseChange = (category: string, value: number) => {
    if (!activeTrip) return

    const currentExpenses = activeTrip.expenses ? [...activeTrip.expenses] : []
    const matchIdx = currentExpenses.findIndex(e => e.category === category)

    if (matchIdx >= 0) {
      currentExpenses[matchIdx].amount = value
    } else {
      currentExpenses.push({ id: 'exp_' + Math.random().toString(), amount: value, category })
    }

    // Recalculate total spent
    const newTotalSpent = currentExpenses.reduce((sum, e) => sum + e.amount, 0)

    const updatedTrip = {
      ...activeTrip,
      expenses: currentExpenses,
      // Automatically keep totalBudget updated or editable
      totalBudget: activeTrip.totalBudget || newTotalSpent + 1000
    }

    // Save state
    setActiveTrip(updatedTrip)
    
    const updatedTrips = trips.map(t => t.id === activeTrip.id ? updatedTrip : t)
    setTrips(updatedTrips)
    
    if (user) {
      localStorage.setItem(`traveloop_trips_${user.id}`, JSON.stringify(updatedTrips))
    }

    // Update database
    try {
      updateTripBudget(activeTrip.id, updatedTrip.totalBudget)
    } catch(e){}
  }

  // Handle Total Budget Update directly
  const handleBudgetLimitChange = (val: number) => {
    if (!activeTrip) return
    const updatedTrip = { ...activeTrip, totalBudget: val }
    setActiveTrip(updatedTrip)
    const updatedTrips = trips.map(t => t.id === activeTrip.id ? updatedTrip : t)
    setTrips(updatedTrips)
    if (user) {
      localStorage.setItem(`traveloop_trips_${user.id}`, JSON.stringify(updatedTrips))
      updateTripBudget(activeTrip.id, val)
    }
  }

  // Notes Manager
  const handleAddNote = () => {
    if (!newNoteText.trim() || !activeTrip) return
    const newNote = {
      id: 'note_' + Math.random().toString(36).substring(2, 11),
      content: newNoteText.trim()
    }
    const updatedNotes = [...notes, newNote]
    setNotes(updatedNotes)
    setNewNoteText('')
    localStorage.setItem(`traveloop_notes_${activeTrip.id}`, JSON.stringify(updatedNotes))
  }

  const handleDeleteNote = (noteId: string) => {
    if (!activeTrip) return
    const updatedNotes = notes.filter(n => n.id !== noteId)
    setNotes(updatedNotes)
    localStorage.setItem(`traveloop_notes_${activeTrip.id}`, JSON.stringify(updatedNotes))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    )
  }

  // ==========================================
  // RENDER DETAILED TRIP VIEW STATE
  // ==========================================
  if (activeTrip) {
    // Dynamic Date Calculation
    const daysDiff = (() => {
      const start = new Date(activeTrip.startDate)
      const end = new Date(activeTrip.endDate)
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      return diff > 0 ? diff : 1
    })()

    // Budget Calculations
    const totalBudget = activeTrip.totalBudget || 15000
    const expensesList = activeTrip.expenses || []
    
    const transportVal = expensesList.find(e => e.category === 'Transport')?.amount || 0
    const hotelVal = expensesList.find(e => e.category === 'Hotel')?.amount || 0
    const foodVal = expensesList.find(e => e.category === 'Food')?.amount || 0
    const activitiesVal = expensesList.find(e => e.category === 'Activities')?.amount || 0
    const miscVal = expensesList.find(e => e.category === 'Misc')?.amount || 0

    const totalSpent = transportVal + hotelVal + foodVal + activitiesVal + miscVal
    const dailyAverage = Math.round(totalSpent / daysDiff)

    // Activity limit validation (Warning if activity spend exceeds 40% of total budget limit)
    const activityBudgetLimit = totalBudget * 0.40
    const activitiesExceeded = activitiesVal > activityBudgetLimit

    // Chart Data
    const chartData = [
      { name: 'Transport', value: transportVal, color: '#6366f1' }, // Indigo
      { name: 'Hotel', value: hotelVal, color: '#8b5cf6' },      // Violet
      { name: 'Food', value: foodVal, color: '#10b981' },       // Emerald
      { name: 'Activities', value: activitiesVal, color: '#f59e0b' }, // Amber
      { name: 'Misc', value: miscVal, color: '#f43f5e' }          // Rose
    ].filter(item => item.value > 0)

    // Use dynamic recommendations for Hidden Gems
    const hiddenGemsList = activeTrip.smartRecommendations || []

    return (
      <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-10">
        
        {/* BACK NAVIGATION ROW & TOP ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-5">
          <button 
            onClick={() => window.location.href = '/dashboard/trips'}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 text-xs font-bold transition-all px-3 py-2 rounded-xl bg-zinc-900/30 border border-zinc-850 hover:bg-zinc-900/60"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Journeys List
          </button>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => alert(`Share link generated! Copying to clipboard:\nhttp://traveloop.ai/share/${activeTrip.id}`)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 font-semibold text-xs flex items-center gap-2 rounded-xl"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              onClick={() => alert('Itinerary edit mode activated! Drag and drop activities to reorder.')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            >
              <Edit3 className="h-4 w-4" />
              Edit Itinerary
            </Button>
            <button 
              onClick={() => handleDelete(activeTrip.id)}
              className="p-3 rounded-xl border border-zinc-900/80 bg-zinc-950 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Delete Trip"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* CINEMATIC DESTINATION COVER HERO */}
        <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-900 shadow-2xl">
          {activeTrip.coverImage ? (
            <img 
              src={activeTrip.coverImage} 
              alt={activeTrip.title}
              className="w-full h-full object-cover opacity-70"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-zinc-950 via-indigo-950/20 to-zinc-900 flex items-center justify-center">
              <Compass className="h-16 w-16 text-indigo-500/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
          
          <div className="absolute bottom-6 left-6 md:left-8 flex flex-col gap-2 z-10 max-w-xl">
            <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {activeTrip.stops && activeTrip.stops.length > 0 
                ? `${activeTrip.stops[0].cityName}, ${activeTrip.stops[0].country}`
                : 'Custom Location'}
            </span>
            <h1 className="font-heading font-black text-3xl md:text-4xl text-zinc-500 tracking-wide bg-clip-text text-transparent bg-gradient-to-b from-zinc-50 to-indigo-100">
              {activeTrip.title}
            </h1>
            <p className="text-zinc-400 text-xs md:text-sm line-clamp-2 leading-relaxed">
              {activeTrip.description || 'No description provided.'}
            </p>
          </div>

          <div className="absolute bottom-6 right-6 md:right-8 bg-zinc-950/80 border border-zinc-900/60 backdrop-blur-md px-4 py-2.5 rounded-2xl text-[10px] font-bold tracking-wider text-zinc-300 flex items-center gap-2 shadow-md">
            <Calendar className="h-4 w-4 text-indigo-400" />
            {new Date(activeTrip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(activeTrip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* INTERACTIVE NAVIGATION SUB-TABS */}
        <div className="flex items-center gap-1 border-b border-zinc-900 pb-2">
          {[
            { id: 'itinerary', label: 'Itinerary' },
            { id: 'budget', label: 'Budget Dashboard' },
            { id: 'gems', label: 'Hidden Gems' },
            { id: 'notes', label: 'Notes' }
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 text-xs font-bold tracking-wide transition-all border-b-2 ${
                  isActive 
                    ? 'border-indigo-500 text-indigo-400 font-extrabold' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ==========================
            TAB 1: ITINERARY DETAILS
            ========================== */}
        {activeTab === 'itinerary' && (
          <div className="flex flex-col gap-6">
            {activeTrip.itineraryDays && activeTrip.itineraryDays.length > 0 ? (
              <div className="flex flex-col gap-6">
                {activeTrip.itineraryDays.map((d: any) => (
                  <div key={d.day} className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                      <span className="text-sm font-extrabold text-indigo-300">Day {d.day} Activities</span>
                      <span className="text-xs text-zinc-400">Total Spent: <span className="font-extrabold text-zinc-200">{currencySymbol}{d.totalSpent}</span></span>
                    </div>

                    <div className="flex flex-col gap-4 pl-3 relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-indigo-950/50">
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
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 border border-zinc-900 rounded-3xl bg-zinc-950/20">
                <Compass className="h-10 w-10 text-zinc-600 mb-3 animate-pulse" />
                <h4 className="text-sm font-bold text-zinc-400">Itinerary schedule empty</h4>
                <p className="text-zinc-500 text-xs mt-1">Configure transport, accommodation, and attractions below.</p>
              </div>
            )}

            {/* Smart Recommendations */}
            {activeTrip.smartRecommendations && activeTrip.smartRecommendations.length > 0 && (
              <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 flex flex-col gap-4 mt-4">
                <h4 className="text-sm font-black text-indigo-300 flex items-center gap-2">
                  Smart Recommendations Beyond Days
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeTrip.smartRecommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl flex flex-col justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-zinc-500 uppercase">Alternative Spot</span>
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
            )}
          </div>
        )}

        {/* ==========================
            TAB 2: BUDGET DASHBOARD
            ========================== */}
        {activeTab === 'budget' && (
          <div className="flex flex-col gap-8">
            
            {/* ALERT WARNING IF ACTIVITIES BUDGET EXCEEDED */}
            {activitiesExceeded && (
              <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl text-rose-300 backdrop-blur-md">
                <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5 animate-bounce" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-black uppercase tracking-wider">Budget Exceeded Alert</span>
                  <p className="text-[11px] text-rose-300/80 leading-relaxed">
                    Activity cost ({currencySymbol}{activitiesVal.toLocaleString()}) exceeds your allocated activity budget ({currencySymbol}{activityBudgetLimit.toLocaleString()}). Consider optimizing event entry tickets.
                  </p>
                </div>
              </div>
            )}

            {/* BUDGET STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Total Budget Card */}
              <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-950/40 p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Budget</span>
                  <div className="p-2 rounded-lg bg-zinc-900 text-zinc-400">
                    <DollarSign className="h-4.5 w-4.5" />
                  </div>
                </div>
                
                {/* Editable Total Budget Limit */}
                <div className="mt-4 flex items-center gap-1.5">
                  <span className="text-2xl font-black text-indigo-400">{currencySymbol}</span>
                  <Input 
                    type="number"
                    value={totalBudget}
                    onChange={(e) => handleBudgetLimitChange(parseFloat(e.target.value) || 0)}
                    className="h-10 text-xl font-extrabold bg-transparent border-0 border-b border-dashed border-zinc-800 hover:border-zinc-500 focus:border-indigo-500 focus:ring-0 p-0 text-zinc-100 max-w-[150px]"
                  />
                </div>
                <span className="text-[9px] text-zinc-500 mt-2 block">Dashed text is editable</span>
              </div>

              {/* Daily Average Spent Card */}
              <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-950/40 p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Daily average spent</span>
                  <div className="p-2 rounded-lg bg-zinc-900 text-zinc-400">
                    <TrendingUp className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-zinc-100">{currencySymbol}{dailyAverage.toLocaleString()}</span>
                  <span className="text-[10px] text-zinc-500">/ Day</span>
                </div>
                <span className="text-[9px] text-zinc-500 mt-2 block">Calculated over {daysDiff} days</span>
              </div>

              {/* Activity Spend Card */}
              <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-950/40 p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Activity Spend</span>
                  <div className="p-2 rounded-lg bg-zinc-900 text-zinc-400">
                    <Star className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-amber-400">{currencySymbol}{activitiesVal.toLocaleString()}</span>
                  <span className="text-[10px] text-zinc-500">Total Spent</span>
                </div>
                <span className="text-[9px] text-zinc-500 mt-2 block">Limit portion: 40% ({currencySymbol}{activityBudgetLimit.toLocaleString()})</span>
              </div>

            </div>

            {/* EXPENSE BREAKDOWN & CHART GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Side: Editable Breakdown Inputs */}
              <div className="lg:col-span-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 flex flex-col gap-5">
                <div>
                  <h3 className="text-sm font-black text-zinc-200">Expense Breakdown</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Edit category values to simulate plan fluctuations.</p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Transport */}
                  <div className="flex items-center justify-between gap-4 border-b border-zinc-900/60 pb-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-300">Transport</span>
                      <span className="text-[9px] text-zinc-500">Flights, trains, car rental</span>
                    </div>
                    <div className="flex items-center gap-1.5 relative">
                      <span className="text-xs font-bold text-zinc-500 absolute left-2.5">{currencySymbol}</span>
                      <Input 
                        type="number"
                        value={transportVal}
                        onChange={(e) => handleExpenseChange('Transport', parseFloat(e.target.value) || 0)}
                        className="h-8 w-28 bg-zinc-950 pl-6 pr-2 border-zinc-800 text-xs font-bold text-zinc-200"
                      />
                    </div>
                  </div>

                  {/* Hotel */}
                  <div className="flex items-center justify-between gap-4 border-b border-zinc-900/60 pb-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-300">Hotel</span>
                      <span className="text-[9px] text-zinc-500">Resorts, lodges, homestays</span>
                    </div>
                    <div className="flex items-center gap-1.5 relative">
                      <span className="text-xs font-bold text-zinc-500 absolute left-2.5">{currencySymbol}</span>
                      <Input 
                        type="number"
                        value={hotelVal}
                        onChange={(e) => handleExpenseChange('Hotel', parseFloat(e.target.value) || 0)}
                        className="h-8 w-28 bg-zinc-950 pl-6 pr-2 border-zinc-800 text-xs font-bold text-zinc-200"
                      />
                    </div>
                  </div>

                  {/* Food */}
                  <div className="flex items-center justify-between gap-4 border-b border-zinc-900/60 pb-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-300">Food</span>
                      <span className="text-[9px] text-zinc-500">Dining, street stalls, bars</span>
                    </div>
                    <div className="flex items-center gap-1.5 relative">
                      <span className="text-xs font-bold text-zinc-500 absolute left-2.5">{currencySymbol}</span>
                      <Input 
                        type="number"
                        value={foodVal}
                        onChange={(e) => handleExpenseChange('Food', parseFloat(e.target.value) || 0)}
                        className="h-8 w-28 bg-zinc-950 pl-6 pr-2 border-zinc-800 text-xs font-bold text-zinc-200"
                      />
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="flex items-center justify-between gap-4 border-b border-zinc-900/60 pb-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-300">Activities</span>
                      <span className="text-[9px] text-zinc-500">Events, ticket entries, tours</span>
                    </div>
                    <div className="flex items-center gap-1.5 relative">
                      <span className="text-xs font-bold text-zinc-500 absolute left-2.5">{currencySymbol}</span>
                      <Input 
                        type="number"
                        value={activitiesVal}
                        onChange={(e) => handleExpenseChange('Activities', parseFloat(e.target.value) || 0)}
                        className="h-8 w-28 bg-zinc-950 pl-6 pr-2 border-zinc-800 text-xs font-bold text-zinc-200"
                      />
                    </div>
                  </div>

                  {/* Misc */}
                  <div className="flex items-center justify-between gap-4 pb-1">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-300">Misc</span>
                      <span className="text-[9px] text-zinc-500">Souvenirs, emergencies, tips</span>
                    </div>
                    <div className="flex items-center gap-1.5 relative">
                      <span className="text-xs font-bold text-zinc-500 absolute left-2.5">{currencySymbol}</span>
                      <Input 
                        type="number"
                        value={miscVal}
                        onChange={(e) => handleExpenseChange('Misc', parseFloat(e.target.value) || 0)}
                        className="h-8 w-28 bg-zinc-950 pl-6 pr-2 border-zinc-800 text-xs font-bold text-zinc-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-xl flex items-center justify-between mt-2 text-xs">
                  <span className="font-bold text-zinc-400">Total Calculated:</span>
                  <span className="font-black text-indigo-400 text-sm">
                    {currencySymbol}{totalSpent.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Right Side: Recharts Pie Distribution */}
              <div className="lg:col-span-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 min-h-[350px] flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-zinc-200">Distribution Chart</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Visual representation of active budget categories.</p>
                </div>

                <div className="w-full h-56 flex items-center justify-center relative">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                          fill="#8884d8"
                          innerRadius={45}
                          paddingAngle={3}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ background: '#09090b', border: '1px solid #1f1f23', borderRadius: '12px' }}
                          itemStyle={{ fontSize: '10px', color: '#e4e4e7' }}
                          formatter={(value) => `${currencySymbol}${value}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-xs text-zinc-500">Insert values to render breakdown chart</span>
                  )}
                </div>

                {/* Legend indicator list */}
                <div className="flex flex-wrap items-center justify-center gap-3 text-[10px]">
                  {chartData.map((item, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-zinc-400">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==========================
            TAB 3: HIDDEN GEMS
            ========================== */}
        {activeTab === 'gems' && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-heading font-bold text-lg text-zinc-100 flex items-center gap-2">
                <Coffee className="h-5 w-5 text-indigo-400 animate-pulse" />
                Hidden Gems near {activeTrip.stops && activeTrip.stops.length > 0 ? activeTrip.stops[0].cityName : 'Destination'}
              </h2>
              <p className="text-zinc-500 text-xs mt-1">Gems and off-beat local suggestions popular in their localities (cafes, viewpoints, lounges).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hiddenGemsList.map((gem, index) => (
                <Card 
                  key={index} 
                  className="bg-zinc-950/40 border border-zinc-900 rounded-2xl relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300"
                >
                  <CardContent className="p-5 flex flex-col gap-4 justify-between h-full min-h-[190px]">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                          {gem.type || 'Gem'}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-400 text-[10px]">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="font-bold">{gem.rating}</span>
                        </div>
                      </div>
                      <h4 className="text-sm font-black text-zinc-200 group-hover:text-indigo-300 transition-colors mt-2">{gem.name}</h4>
                      <p className="text-zinc-500 text-[10px] leading-relaxed">{gem.desc}</p>
                    </div>
                    
                    <button 
                      onClick={() => alert(`Details/Coordinates for ${gem.name} saved!`)}
                      className="text-[9px] font-bold text-zinc-500 group-hover:text-indigo-400 flex items-center gap-1 transition-colors self-start"
                    >
                      More details
                      <ChevronRight className="h-2.5 w-2.5" />
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ==========================
            TAB 4: NOTES MANAGER
            ========================== */}
        {activeTab === 'notes' && (
          <div className="flex flex-col gap-6 max-w-2xl">
            <div>
              <h2 className="font-heading font-bold text-lg text-zinc-100 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-400" />
                Trip Notes
              </h2>
              <p className="text-zinc-500 text-xs mt-1">Jot down checklist items, contact logs, or ticket numbers for reference.</p>
            </div>

            {/* Note Input field */}
            <div className="flex items-center gap-3">
              <Input 
                placeholder="Write down some notes..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="bg-zinc-950/60 border-zinc-900 rounded-xl text-xs py-5"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddNote()
                }}
              />
              <Button 
                onClick={handleAddNote}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 rounded-xl h-10 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
              >
                Add Note
              </Button>
            </div>

            {/* Notes List */}
            <div className="flex flex-col gap-3 mt-2">
              {notes.length > 0 ? (
                notes.map((note) => (
                  <div 
                    key={note.id} 
                    className="flex items-start justify-between gap-4 p-4 rounded-xl border border-zinc-900 bg-zinc-950/30 hover:border-zinc-800 transition-colors"
                  >
                    <p className="text-xs text-zinc-300 leading-relaxed font-medium">{note.content}</p>
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-xs text-zinc-500 italic block mt-2">No notes added. Click above to save first note.</span>
              )}
            </div>
          </div>
        )}

      </div>
    )
  }

  // ==========================================
  // RENDER JOURNEYS LISTING VIEW STATE
  // ==========================================
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-zinc-100">My Trips</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage and edit your travel itineraries, manually added plans, and AI schedules.</p>
        </div>
        <Button 
          onClick={() => {
            const tempId = 'man_trip_' + Math.random().toString(36).substring(2, 11)
            const mockTitle = prompt('Enter Trip Destination City:', 'London')
            if (!mockTitle) return
            
            const newTrip = {
              id: tempId,
              title: `Trip to ${mockTitle}`,
              description: 'Manually customized travel outline.',
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 5*24*60*60*1000).toISOString(),
              totalBudget: 8000,
              coverImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=600',
              stops: [{ id: 's_m_1', cityName: mockTitle, country: 'United Kingdom' }],
              expenses: [
                { id: 'e_t1', amount: 1500, category: 'Transport' },
                { id: 'e_t2', amount: 3000, category: 'Hotel' }
              ]
            }
            const updated = [newTrip, ...trips]
            setTrips(updated)
            if (user) {
              localStorage.setItem(`traveloop_trips_${user.id}`, JSON.stringify(updated))
            }
            window.location.href = `/dashboard/trips?id=${tempId}`
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2 rounded-xl"
        >
          <Plus className="h-4.5 w-4.5" />
          Create New Plan
        </Button>
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/20 px-6">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
            <Compass className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-zinc-300">No trips planned yet</h3>
          <p className="text-zinc-500 text-sm max-w-sm mt-2">Start planning your dream adventure by using our automated AI planner or creating a custom manual outline.</p>
          <div className="flex gap-4 mt-6">
            <Button onClick={() => window.location.href = '/dashboard/ai-planner'} className="bg-indigo-600 hover:bg-indigo-500">
              Use AI Planner
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((trip) => {
            const startFormatted = new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            const endFormatted = new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

            return (
              <Card 
                key={trip.id} 
                onClick={() => window.location.href = `/dashboard/trips?id=${trip.id}`}
                className="bg-zinc-950/40 border-zinc-900 overflow-hidden relative group hover:border-indigo-500/20 transition-all duration-300 cursor-pointer"
              >
                <CardContent className="p-0">
                  <div className="h-32 bg-zinc-900 relative">
                    {trip.coverImage && (
                      <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover opacity-60" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(trip.id)
                      }}
                      className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-zinc-500 hover:text-red-400 hover:bg-red-500/15 transition-all z-20"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">{trip.title}</h3>
                    <p className="text-zinc-400 text-xs mt-2 line-clamp-2 leading-relaxed">{trip.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-6 text-zinc-500 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                        <span>{startFormatted} - {endFormatted}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                        <span>
                          {trip.stops && trip.stops.length > 0 
                            ? `${trip.stops[0].cityName}, ${trip.stops[0].country}`
                            : 'No destinations'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function MyTripsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <TripsPageInner />
    </Suspense>
  )
}
