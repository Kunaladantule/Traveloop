// app/dashboard/trips/page.tsx
'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Plus, MapPin, Calendar, Compass, Search, Trash2, Share2, Edit3, 
  TrendingUp, AlertTriangle, ArrowLeft, DollarSign, Coffee, FileText, 
  Clock, Star, Check, ChevronRight, Utensils, Sparkles, PieChart as PieChartIcon
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend 
} from 'recharts'
import { getUserTrips, deleteTrip, updateTripBudget } from '@/app/actions/trip'

// ─────────────────────────────────────────────────────────────
// 📦 Type Definitions
// ─────────────────────────────────────────────────────────────
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
    type?: string
  }>
}

// ─────────────────────────────────────────────────────────────
// 🧩 Reusable Components (Light Theme + Larger Text)
// ─────────────────────────────────────────────────────────────

const TabButton = ({ 
  active, onClick, children, icon: Icon 
}: { 
  active: boolean; onClick: () => void; children: React.ReactNode; icon?: React.ElementType 
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 text-base font-bold rounded-xl transition-all ${
      active 
        ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300 shadow-sm' 
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-2 border-transparent'
    }`}
  >
    {Icon && <Icon className="h-5 w-5" />}
    {children}
  </button>
)

const ExpenseRow = ({ 
  label, description, value, onChange, currency, color 
}: { 
  label: string; description: string; value: number; onChange: (val: number) => void; currency: string; color: string 
}) => (
  <div className="flex items-center justify-between gap-4 py-4 border-b border-slate-100 last:border-0">
    <div className="flex flex-col">
      <span className="text-base font-bold text-slate-950">{label}</span>
      <span className="text-sm text-slate-500">{description}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-base font-bold text-slate-600">{currency}</span>
      <Input 
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-32 h-10 text-base font-bold text-slate-955 border-slate-350 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white"
      />
    </div>
  </div>
)

const ActivityItem = ({ activity, currency }: { activity: any; currency: string }) => {
  if (activity.isMeal) {
    return (
      <div className="flex items-center gap-4 bg-amber-50 px-5 py-4 rounded-xl border border-amber-250 shadow-sm">
        <Utensils className="h-5 w-5 text-amber-700 shrink-0" />
        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <span className="text-base font-semibold text-slate-900">{activity.name}</span>
          <span className="text-sm font-bold text-amber-800">
            Est: {currency}{activity.expense}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative flex items-start gap-4 pl-2">
      {/* Timeline dot */}
      <div className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-white absolute left-[-22px] top-3 shadow-sm" />
      
      <div className="flex-1 flex flex-col md:flex-row md:items-start justify-between gap-4 bg-slate-50 hover:bg-indigo-50/50 p-4 rounded-xl border border-transparent hover:border-indigo-200 transition-all">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-600 font-mono">{activity.time}</span>
            {activity.city && (
              <span className="text-sm font-semibold text-slate-905 bg-white px-2.5 py-0.5 rounded border border-slate-350">
                {activity.city}
              </span>
            )}
          </div>
          <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
            {activity.name}
          </h4>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {activity.rating && (
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-bold text-slate-700">{activity.rating}</span>
            </div>
          )}
          <span className="text-slate-600">
            Cost: <span className="font-bold text-slate-950">
              {activity.expense > 0 ? `${currency}${activity.expense}` : 'Free'}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

const HiddenGemCard = ({ gem }: { gem: any }) => (
  <Card className="group overflow-hidden border-slate-350 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 bg-white">
    <CardContent className="p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-705 text-xs font-bold uppercase tracking-wide">
          {gem.type || 'Hidden Gem'}
        </span>
        <div className="flex items-center gap-1 text-amber-500">
          <Star className="h-4 w-4 fill-current" />
          <span className="font-bold text-slate-700 text-sm">{gem.rating}</span>
        </div>
      </div>
      
      <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
        {gem.name}
      </h4>
      
      <p className="text-base text-slate-600 leading-relaxed">{gem.desc}</p>
      
      <button className="text-sm font-bold text-indigo-650 hover:text-indigo-700 flex items-center gap-1 mt-auto">
        View Details
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </CardContent>
  </Card>
)

const NoteItem = ({ note, onDelete }: { note: { id: string; content: string }; onDelete: (id: string) => void }) => (
  <div className="flex items-start justify-between gap-4 p-5 rounded-xl border border-slate-300 bg-white hover:border-indigo-200 transition-colors">
    <p className="text-base text-slate-950 leading-relaxed font-medium">{note.content}</p>
    <button 
      onClick={() => onDelete(note.id)}
      className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
      aria-label="Delete note"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  </div>
)

const TripCard = ({ 
  trip, onClick, onDelete, currency 
}: { 
  trip: Trip; onClick: () => void; onDelete: (e: React.MouseEvent) => void; currency: string 
}) => {
  const startFormatted = new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const endFormatted = new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const destination = trip.stops?.[0] ? `${trip.stops[0].cityName}, ${trip.stops[0].country}` : 'No destination'

  return (
    <Card 
      onClick={onClick}
      className="group cursor-pointer overflow-hidden border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white"
    >
      {/* Cover Image */}
      <div className="relative h-36 overflow-hidden bg-slate-100">
        {trip.coverImage ? (
          <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
            <Compass className="h-10 w-10 text-indigo-200" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
        
        {/* Delete Button */}
        <button 
          onClick={onDelete}
          className="absolute top-3 right-3 p-2 rounded-lg bg-white/90 backdrop-blur-sm border border-slate-300 text-slate-650 hover:text-red-600 hover:bg-red-50 transition-all z-10"
          aria-label="Delete trip"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <CardContent className="p-5">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1">
          {trip.title}
        </h3>
        <p className="text-base text-slate-600 line-clamp-2 mt-2 leading-relaxed">
          {trip.description || 'No description added yet.'}
        </p>
        
        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
            <span>{startFormatted} - {endFormatted}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <MapPin className="h-4 w-4 text-indigo-500 shrink-0" />
            <span className="truncate max-w-[150px]">{destination}</span>
          </div>
          {trip.totalBudget && (
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-950">
              <DollarSign className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{currency}{trip.totalBudget.toLocaleString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────
// 🚀 Inner Trips Page Component (with useSearchParams)
// ─────────────────────────────────────────────────────────────

function TripsPageInner() {
  const searchParams = useSearchParams()
  const activeId = searchParams.get('id')

  const [trips, setTrips] = useState<Trip[]>([])
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // Tab state for detailed view
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'gems' | 'notes'>('itinerary')
  
  // Currency symbol
  const [currencySymbol, setCurrencySymbol] = useState('$')

  // Notes state
  const [notes, setNotes] = useState<Array<{ id: string; content: string }>>([])
  const [newNoteText, setNewNoteText] = useState('')

  const handleCreateManualTrip = () => {
    const mockTitle = prompt('Enter Trip Destination:', 'Paris')
    if (!mockTitle) return
    const tempId = `man_trip_${Date.now()}`
    const newTrip: Trip = {
      id: tempId,
      title: `Trip to ${mockTitle}`,
      description: 'Custom travel plan',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 5*24*60*60*1000).toISOString(),
      totalBudget: 8000,
      coverImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=600',
      stops: [{ id: 's_1', cityName: mockTitle, country: 'Unknown' }],
      expenses: [
        { id: 'e_1', amount: 1500, category: 'Transport' },
        { id: 'e_2', amount: 3000, category: 'Hotel' }
      ]
    }
    const updated = [newTrip, ...trips]
    setTrips(updated)
    if (user) localStorage.setItem(`traveloop_trips_${user.id}`, JSON.stringify(updated))
    window.location.href = `/dashboard/trips?id=${tempId}`
  }

  // Load User & Trips
  useEffect(() => {
    const loadUserData = async () => {
      const userStr = localStorage.getItem('traveloop_user')
      if (!userStr) {
        window.location.href = '/'
        return
      }
      const parsedUser = JSON.parse(userStr)
      setUser(parsedUser)

      // Set currency based on country
      if (parsedUser.country) {
        const c = parsedUser.country.toLowerCase()
        if (c.includes('india')) setCurrencySymbol('₹')
        else if (c.includes('united kingdom') || c.includes('uk')) setCurrencySymbol('£')
        else if (c.includes('france') || c.includes('germany') || c.includes('italy') || c.includes('spain') || c.includes('europe') || c.includes('switzerland')) setCurrencySymbol('€')
        else if (c.includes('united arab emirates') || c.includes('uae') || c.includes('dubai')) setCurrencySymbol('AED')
        else setCurrencySymbol('$')
      }

      try {
        const res = await getUserTrips(parsedUser.id)
        let loadedTrips: Trip[] = []
        
        if (res.success && res.trips?.length > 0) {
          loadedTrips = res.trips as unknown as Trip[]
        } else {
          const localKey = `traveloop_trips_${parsedUser.id}`
          const stored = localStorage.getItem(localKey)
          loadedTrips = stored ? JSON.parse(stored) : []
        }

        setTrips(loadedTrips)

        // Load active trip if ID present
        if (activeId) {
          const found = loadedTrips.find(t => t.id === activeId)
          if (found) {
            setActiveTrip(found)
            // Load notes
            const notesKey = `traveloop_notes_${found.id}`
            const storedNotes = localStorage.getItem(notesKey)
            setNotes(storedNotes ? JSON.parse(storedNotes) : [])
          }
        }
      } catch (err) {
        console.warn('Error loading trips:', err)
        const localKey = `traveloop_trips_${parsedUser.id}`
        const stored = localStorage.getItem(localKey)
        const loadedTrips: Trip[] = stored ? JSON.parse(stored) : []
        setTrips(loadedTrips)
        
        if (activeId) {
          const found = loadedTrips.find(t => t.id === activeId)
          if (found) {
            setActiveTrip(found)
            const notesKey = `traveloop_notes_${found.id}`
            const storedNotes = localStorage.getItem(notesKey)
            setNotes(storedNotes ? JSON.parse(storedNotes) : [])
          }
        }
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [activeId])

  // Delete trip handler
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return
    try { await deleteTrip(id) } catch(e) {}
    
    const updated = trips.filter(t => t.id !== id)
    setTrips(updated)
    if (user) localStorage.setItem(`traveloop_trips_${user.id}`, JSON.stringify(updated))
    window.location.href = '/dashboard/trips'
  }

  // Budget handlers
  const handleExpenseChange = (category: string, value: number) => {
    if (!activeTrip) return
    const currentExpenses = [...(activeTrip.expenses || [])]
    const idx = currentExpenses.findIndex(e => e.category === category)
    
    if (idx >= 0) currentExpenses[idx].amount = value
    else currentExpenses.push({ id: `exp_${Date.now()}`, amount: value, category })

    const totalSpent = currentExpenses.reduce((sum, e) => sum + e.amount, 0)
    const updatedTrip = { ...activeTrip, expenses: currentExpenses, totalBudget: activeTrip.totalBudget || totalSpent + 1000 }
    
    setActiveTrip(updatedTrip)
    const updatedTrips = trips.map(t => t.id === activeTrip.id ? updatedTrip : t)
    setTrips(updatedTrips)
    if (user) {
      localStorage.setItem(`traveloop_trips_${user.id}`, JSON.stringify(updatedTrips))
      updateTripBudget(activeTrip.id, updatedTrip.totalBudget)
    }
  }

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

  // Notes handlers
  const handleAddNote = () => {
    if (!newNoteText.trim() || !activeTrip) return
    const newNote = { id: `note_${Date.now()}`, content: newNoteText.trim() }
    const updated = [...notes, newNote]
    setNotes(updated)
    setNewNoteText('')
    localStorage.setItem(`traveloop_notes_${activeTrip.id}`, JSON.stringify(updated))
  }

  const handleDeleteNote = (noteId: string) => {
    if (!activeTrip) return
    const updated = notes.filter(n => n.id !== noteId)
    setNotes(updated)
    localStorage.setItem(`traveloop_notes_${activeTrip.id}`, JSON.stringify(updated))
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <span className="text-base text-slate-900 font-bold">Loading your trips...</span>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // 🎯 DETAILED TRIP VIEW
  // ─────────────────────────────────────────────────────────────
  if (activeTrip) {
    const daysDiff = Math.max(1, Math.ceil((new Date(activeTrip.endDate).getTime() - new Date(activeTrip.startDate).getTime()) / (1000 * 60 * 60 * 24)))
    const totalBudget = activeTrip.totalBudget || 15000
    const expensesList = activeTrip.expenses || []
    
    const transportVal = expensesList.find(e => e.category === 'Transport')?.amount || 0
    const hotelVal = expensesList.find(e => e.category === 'Hotel')?.amount || 0
    const foodVal = expensesList.find(e => e.category === 'Food')?.amount || 0
    const activitiesVal = expensesList.find(e => e.category === 'Activities')?.amount || 0
    const miscVal = expensesList.find(e => e.category === 'Misc')?.amount || 0

    const totalSpent = transportVal + hotelVal + foodVal + activitiesVal + miscVal
    const dailyAverage = Math.round(totalSpent / daysDiff)
    const activityBudgetLimit = totalBudget * 0.40
    const activitiesExceeded = activitiesVal > activityBudgetLimit

    const chartData = [
      { name: 'Transport', value: transportVal, color: '#6366f1' },
      { name: 'Hotel', value: hotelVal, color: '#8b5cf6' },
      { name: 'Food', value: foodVal, color: '#10b981' },
      { name: 'Activities', value: activitiesVal, color: '#f59e0b' },
      { name: 'Misc', value: miscVal, color: '#f43f5e' }
    ].filter(item => item.value > 0)

    const hiddenGemsList = activeTrip.smartRecommendations || []
    const destination = activeTrip.stops?.[0] ? `${activeTrip.stops[0].cityName}, ${activeTrip.stops[0].country}` : 'Custom Location'

    return (
      <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-12">
        
        {/* 🔙 Back Navigation + Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/dashboard/trips'}
            className="text-slate-900 hover:text-slate-950 hover:bg-slate-100 font-bold"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Trips
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => alert(`Share link: http://traveloop.ai/share/${activeTrip.id}`)}
              className="border-slate-400 text-slate-900 hover:bg-slate-50 font-bold"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={() => alert('Edit mode activated!')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Itinerary
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(activeTrip.id)}
              className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              aria-label="Delete trip"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* 🖼️ Hero Cover Section */}
        <Card className="relative overflow-hidden border-slate-200 shadow-lg">
          <div className="relative h-56 md:h-72">
            {activeTrip.coverImage ? (
              <img src={activeTrip.coverImage} alt={activeTrip.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <Compass className="h-16 w-16 text-indigo-300" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
            
            {/* Hero Content */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 text-indigo-700 text-sm font-semibold mb-3">
                  <MapPin className="h-4 w-4" />
                  {destination}
                </span>
                <h1 className="font-heading font-bold text-3xl md:text-4xl text-white drop-shadow-sm">
                  {activeTrip.title}
                </h1>
                {activeTrip.description && (
                  <p className="text-base text-slate-200 mt-2 line-clamp-2 leading-relaxed">
                    {activeTrip.description}
                  </p>
                )}
              </div>
              
              {/* Date Badge */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/95 backdrop-blur-sm border border-slate-200 shadow-sm">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-semibold text-slate-900">
                  {new Date(activeTrip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(activeTrip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* 🧭 Tab Navigation */}
        <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-slate-200">
          <TabButton active={activeTab === 'itinerary'} onClick={() => setActiveTab('itinerary')} icon={Calendar}>
            Itinerary
          </TabButton>
          <TabButton active={activeTab === 'budget'} onClick={() => setActiveTab('budget')} icon={DollarSign}>
            Budget
          </TabButton>
          <TabButton active={activeTab === 'gems'} onClick={() => setActiveTab('gems')} icon={Coffee}>
            Hidden Gems
          </TabButton>
          <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={FileText}>
            Notes
          </TabButton>
        </div>

        {/* ─────────────────────────────────────────────────────
            📅 TAB 1: ITINERARY
            ───────────────────────────────────────────────────── */}
        {activeTab === 'itinerary' && (
          <div className="flex flex-col gap-8">
            {activeTrip.itineraryDays && activeTrip.itineraryDays.length > 0 ? (
              <div className="flex flex-col gap-6">
                {activeTrip.itineraryDays.map((day: any) => (
                  <Card key={day.day} className="border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                      {/* Day Header */}
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-xl bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center text-base font-bold text-indigo-700">
                            {day.day}
                          </span>
                          <span className="text-lg font-semibold text-slate-900">Day {day.day} Schedule</span>
                        </div>
                        <span className="text-sm font-bold text-slate-850">
                          Daily Spend: <span className="font-bold text-indigo-700">{currencySymbol}{day.totalSpent}</span>
                        </span>
                      </div>

                      {/* Activities Timeline */}
                      <div className="flex flex-col gap-4 relative pl-2">
                        {day.activities.map((act: any, idx: number) => (
                          <ActivityItem key={idx} activity={act} currency={currencySymbol} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-50 border-slate-200 rounded-2xl p-10 text-center">
                <Compass className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-xl text-slate-900 mb-2">No itinerary yet</h3>
                <p className="text-base text-slate-850 mb-4 font-semibold">Add activities to build your day-by-day travel plan.</p>
                <Button className="bg-indigo-600 hover:bg-indigo-500">Add First Activity</Button>
              </Card>
            )}

            {/* Smart Recommendations */}
            {hiddenGemsList.length > 0 && (
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                <CardContent className="p-6">
                  <h4 className="font-heading font-bold text-xl text-slate-900 flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    AI-Powered Recommendations
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hiddenGemsList.map((gem: any, idx: number) => (
                      <Card key={idx} className="bg-white border-slate-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">{gem.type || 'Hidden Gem'}</span>
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="font-bold text-slate-700 text-sm">{gem.rating}</span>
                          </div>
                        </div>
                        <h5 className="text-base font-bold text-slate-900 mb-2">{gem.name}</h5>
                        <p className="text-sm text-slate-850 leading-relaxed font-medium">{gem.desc}</p>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────
            💰 TAB 2: BUDGET DASHBOARD
            ───────────────────────────────────────────────────── */}
        {activeTab === 'budget' && (
          <div className="flex flex-col gap-8">
            
            {/* Budget Alert */}
            {activitiesExceeded && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-bold text-red-800 uppercase tracking-wide">Budget Alert</span>
                    <p className="text-sm text-red-700 mt-1">
                      Activity spending ({currencySymbol}{activitiesVal.toLocaleString()}) exceeds 40% of your total budget ({currencySymbol}{activityBudgetLimit.toLocaleString()}). Consider adjusting other categories.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Budget</span>
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-slate-900">{currencySymbol}</span>
                    <Input 
                      type="number"
                      value={totalBudget}
                      onChange={(e) => handleBudgetLimitChange(parseFloat(e.target.value) || 0)}
                      className="h-8 w-32 text-xl font-bold text-slate-950 border-0 border-b border-dashed border-slate-350 focus:border-indigo-500 focus:ring-0 p-0 bg-transparent"
                    />
                  </div>
                  <span className="text-xs text-slate-500 mt-2 block">Editable budget limit</span>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Daily Average</span>
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{currencySymbol}{dailyAverage.toLocaleString()}</span>
                    <span className="text-sm text-slate-500">/ day</span>
                  </div>
                  <span className="text-xs text-slate-500 mt-2 block">Over {daysDiff} days</span>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Activities Spent</span>
                    <Star className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${activitiesExceeded ? 'text-red-600' : 'text-slate-900'}`}>
                      {currencySymbol}{activitiesVal.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 mt-2 block">Limit: {currencySymbol}{activityBudgetLimit.toLocaleString()} (40%)</span>
                </CardContent>
              </Card>
            </div>

            {/* Budget Breakdown + Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Editable Expense Inputs */}
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-heading font-bold text-xl text-slate-900 mb-1">Expense Breakdown</h3>
                  <p className="text-base text-slate-600 mb-6">Edit category values to adjust your budget plan.</p>
                  
                  <div className="flex flex-col">
                    <ExpenseRow label="Transport" description="Flights, trains, car rental" value={transportVal} onChange={(v) => handleExpenseChange('Transport', v)} currency={currencySymbol} color="indigo" />
                    <ExpenseRow label="Accommodation" description="Hotels, resorts, homestays" value={hotelVal} onChange={(v) => handleExpenseChange('Hotel', v)} currency={currencySymbol} color="violet" />
                    <ExpenseRow label="Food & Dining" description="Restaurants, cafes, street food" value={foodVal} onChange={(v) => handleExpenseChange('Food', v)} currency={currencySymbol} color="emerald" />
                    <ExpenseRow label="Activities" description="Tours, tickets, experiences" value={activitiesVal} onChange={(v) => handleExpenseChange('Activities', v)} currency={currencySymbol} color="amber" />
                    <ExpenseRow label="Miscellaneous" description="Shopping, tips, emergencies" value={miscVal} onChange={(v) => handleExpenseChange('Misc', v)} currency={currencySymbol} color="rose" />
                  </div>

                  {/* Total Summary */}
                  <div className="mt-6 p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900">Total Calculated:</span>
                    <span className="text-xl font-bold text-indigo-700">{currencySymbol}{totalSpent.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Pie Chart Visualization */}
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-heading font-bold text-xl text-slate-900 mb-1">Budget Distribution</h3>
                  <p className="text-base text-slate-850 mb-6 font-medium">Visual breakdown of your spending categories.</p>
                  
                  <div className="h-64 flex items-center justify-center">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={50}
                            paddingAngle={2}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            itemStyle={{ fontSize: '14px', color: '#1e293b' }}
                            formatter={(value: any) => `${currencySymbol}${value?.toLocaleString() || ''}`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center text-slate-500">
                        <PieChartIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-base">Add expenses to see the distribution chart</p>
                      </div>
                    )}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-slate-100">
                    {chartData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-slate-805 font-bold">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────
            💎 TAB 3: HIDDEN GEMS
            ───────────────────────────────────────────────────── */}
        {activeTab === 'gems' && (
          <div className="flex flex-col gap-6">
            <div className="mb-2">
              <h2 className="font-heading font-bold text-2xl text-slate-900 flex items-center gap-2">
                <Coffee className="h-6 w-6 text-indigo-600" />
                Hidden Gems in {activeTrip.stops?.[0]?.cityName || 'Your Destination'}
              </h2>
              <p className="text-base text-slate-850 mt-2 font-medium">Off-the-beaten-path recommendations from locals and travelers.</p>
            </div>

            {hiddenGemsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hiddenGemsList.map((gem: any, index: number) => (
                  <HiddenGemCard key={index} gem={gem} />
                ))}
              </div>
            ) : (
              <Card className="bg-slate-50 border-slate-200 rounded-2xl p-10 text-center">
                <Coffee className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-xl text-slate-900 mb-2">No hidden gems yet</h3>
                <p className="text-base text-slate-600">Our AI will suggest local favorites once your itinerary is more detailed.</p>
              </Card>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────
            📝 TAB 4: NOTES
            ───────────────────────────────────────────────────── */}
        {activeTab === 'notes' && (
          <div className="flex flex-col gap-6 max-w-3xl">
            <div className="mb-2">
              <h2 className="font-heading font-bold text-2xl text-slate-900 flex items-center gap-2">
                <FileText className="h-6 w-6 text-indigo-600" />
                Trip Notes
              </h2>
              <p className="text-base text-slate-600 mt-2">Jot down reminders, contacts, ticket numbers, or packing lists.</p>
            </div>

            {/* Add Note Input */}
            <div className="flex items-center gap-3">
              <Input 
                placeholder="Type a new note and press Enter..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                className="flex-1 text-base py-3 h-12 border-slate-350 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white"
              />
              <Button onClick={handleAddNote} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6">
                Add
              </Button>
            </div>

            {/* Notes List */}
            <div className="flex flex-col gap-3">
              {notes.length > 0 ? (
                notes.map((note) => (
                  <NoteItem key={note.id} note={note} onDelete={handleDeleteNote} />
                ))
              ) : (
                <Card className="bg-slate-50 border-slate-200 rounded-xl p-8 text-center">
                  <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-base text-slate-600">No notes yet. Start by adding your first reminder above!</p>
                </Card>
              )}
            </div>
          </div>
        )}

      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // 🎯 TRIPS LISTING VIEW
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-12">
      
      {/* 🧭 Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="font-heading font-bold text-4xl text-slate-900 tracking-tight">My Trips ✈️</h1>
          <p className="text-lg text-slate-600 mt-2">Manage your travel itineraries, AI-generated plans, and custom adventures.</p>
        </div>
        <Button 
          onClick={handleCreateManualTrip}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-indigo-200/50"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create New Trip
        </Button>
      </section>

      {/* 📋 Trips Grid or Empty State */}
      {trips.length === 0 ? (
        <Card className="bg-slate-50 border-slate-200 border-dashed rounded-3xl p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-100 flex items-center justify-center mb-5">
            <Compass className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="font-heading font-bold text-2xl text-slate-900 mb-3">No trips planned yet</h3>
          <p className="text-lg text-slate-600 max-w-md mx-auto mb-6">
            Start your travel planning journey by creating an AI-powered itinerary or building a custom trip from scratch.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={() => window.location.href = '/dashboard/ai-planner'} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3">
              <Sparkles className="h-5 w-5 mr-2" />
              Use AI Planner
            </Button>
            <Button variant="outline" onClick={handleCreateManualTrip} className="border-slate-400 text-slate-900 hover:bg-slate-50 font-bold px-6 py-3">
              Create Manual Trip
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((trip) => (
            <TripCard 
              key={trip.id} 
              trip={trip} 
              onClick={() => window.location.href = `/dashboard/trips?id=${trip.id}`}
              onDelete={(e) => { e.stopPropagation(); handleDelete(trip.id) }}
              currency={currencySymbol}
            />
          ))}
        </div>
      )}

      {/* 💡 Quick Tips Card */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">Pro Tip</h4>
            <p className="text-base text-slate-600">
              Use the <span className="font-bold text-indigo-750">Budget</span> tab to adjust spending categories in real-time, and the <span className="font-bold text-indigo-750">Notes</span> tab to keep important travel details handy!
            </p>
          </div>
        </div>
      </Card>

    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 🚀 Main Export with Suspense Boundary
// ─────────────────────────────────────────────────────────────

export default function MyTripsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-24 min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <span className="text-base text-slate-900 font-bold">Loading trips...</span>
        </div>
      </div>
    }>
      <TripsPageInner />
    </Suspense>
  )
}