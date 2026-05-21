'use client'

import React, { useEffect, useState } from 'react'
import { 
  Sparkles, 
  Plus, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  Globe, 
  DollarSign, 
  Compass, 
  Briefcase,
  TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getUserTrips } from '@/app/actions/trip'

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
  startDate: Date | string
  endDate: Date | string
  totalBudget?: number | null
  coverImage?: string | null
  stops?: TripStop[]
  expenses?: TripExpense[]
}

const DEFAULT_MOCK_TRIPS: Trip[] = [
  {
    id: 'mock_trip_1',
    title: 'Tokyo Sakura Dream',
    description: 'Spring getaway to witness cherry blossoms and explore futuristic electronics hubs.',
    startDate: '2026-04-10T00:00:00.000Z',
    endDate: '2026-04-18T00:00:00.000Z',
    totalBudget: 3500,
    coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=600',
    stops: [
      { id: 's1', cityName: 'Tokyo', country: 'Japan' }
    ],
    expenses: [
      { id: 'e1', amount: 450, category: 'Food' },
      { id: 'e2', amount: 1200, category: 'Accommodation' },
      { id: 'e3', amount: 800, category: 'Activities' }
    ]
  },
  {
    id: 'mock_trip_2',
    title: 'Parisian Summer Escape',
    description: 'Strolling through museum halls, café terraces, and watching sunset by the Eiffel Tower.',
    startDate: '2026-07-05T00:00:00.000Z',
    endDate: '2026-07-12T00:00:00.000Z',
    totalBudget: 5000,
    coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600',
    stops: [
      { id: 's2', cityName: 'Paris', country: 'France' }
    ],
    expenses: [
      { id: 'e4', amount: 1200, category: 'Flights' },
      { id: 'e5', amount: 1500, category: 'Accommodation' }
    ]
  },
  {
    id: 'mock_trip_3',
    title: 'Swiss Alps Wanderer',
    description: 'Hiking majestic peaks and tasting world-class chocolates in scenic valleys.',
    startDate: '2026-09-20T00:00:00.000Z',
    endDate: '2026-09-30T00:00:00.000Z',
    totalBudget: 4200,
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=600',
    stops: [
      { id: 's3', cityName: 'Zurich', country: 'Switzerland' }
    ],
    expenses: [
      { id: 'e6', amount: 300, category: 'Transport' }
    ]
  }
]

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: string; name?: string; email?: string } | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch or load trips
  useEffect(() => {
    const userStr = localStorage.getItem('traveloop_user')
    if (!userStr) {
      window.location.href = '/'
      return
    }

    const parsedUser = JSON.parse(userStr)
    setUser(parsedUser)

    const fetchTripsData = async () => {
      try {
        const res = await getUserTrips(parsedUser.id)
        if (res.success && res.trips && res.trips.length > 0) {
          setTrips(res.trips as unknown as Trip[])
        } else {
          // Check local storage or set default mock data
          const localTripsKey = `traveloop_trips_${parsedUser.id}`
          const storedTrips = localStorage.getItem(localTripsKey)
          if (storedTrips) {
            setTrips(JSON.parse(storedTrips))
          } else {
            // Populate localStorage with defaults
            localStorage.setItem(localTripsKey, JSON.stringify(DEFAULT_MOCK_TRIPS))
            setTrips(DEFAULT_MOCK_TRIPS)
          }
        }
      } catch (err) {
        console.warn('Error reading trips from db, loading offline backup:', err)
        const localTripsKey = `traveloop_trips_${parsedUser.id}`
        const storedTrips = localStorage.getItem(localTripsKey)
        if (storedTrips) {
          setTrips(JSON.parse(storedTrips))
        } else {
          localStorage.setItem(localTripsKey, JSON.stringify(DEFAULT_MOCK_TRIPS))
          setTrips(DEFAULT_MOCK_TRIPS)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchTripsData()
  }, [])

  // Calculations for stats
  const totalTripsCount = trips.length

  const upcomingTripsCount = trips.filter(trip => {
    const tripStart = new Date(trip.startDate)
    return tripStart > new Date()
  }).length

  const uniqueCountries = Array.from(new Set(
    trips.flatMap(trip => (trip.stops || []).map(stop => stop.country))
  )).filter(Boolean)
  const countriesExploredCount = uniqueCountries.length

  const totalBudgetSpent = trips.reduce((acc, trip) => {
    const expenseSum = (trip.expenses || []).reduce((sum, exp) => sum + exp.amount, 0)
    return acc + expenseSum
  }, 0)

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <span className="text-zinc-500 text-sm tracking-wider font-medium">Navigating telemetry...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      
      {/* 1. HERO HEADER AREA */}
      <section className="flex flex-col items-center text-center max-w-3xl mx-auto mt-6 mb-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/35 text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-4 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          Intelligent Travel Assistant
        </div>
        
        <h1 className="font-heading font-extrabold text-5xl md:text-6xl tracking-wide bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-100 to-indigo-300 leading-tight">
          Traveloop
        </h1>
        
        <p className="text-lg md:text-xl font-bold tracking-wider text-indigo-300 mt-2">
          Plan Smarter, Travel Better
        </p>
        
        <p className="text-zinc-200 text-sm md:text-base mt-4 leading-relaxed max-w-2xl font-medium">
          From budget to bucket list—Traveloop creates personalized trips with nearby activities and cost insights.
        </p>

        {/* Action Button Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Button 
            onClick={() => window.location.href = '/dashboard/ai-planner'}
            className="px-6 py-5.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(99,102,241,0.35)] hover:shadow-[0_0_35px_rgba(99,102,241,0.55)] border border-indigo-400/30 transition-all duration-300 transform hover:scale-[1.02] flex items-center gap-2"
          >
            <Sparkles className="h-4.5 w-4.5 animate-pulse" />
            Generate with AI 🚀
          </Button>

          <Button 
            onClick={() => window.location.href = '/dashboard/trips'}
            className="px-6 py-5.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-700/60 hover:border-zinc-500 text-zinc-100 font-bold text-sm transition-all duration-300 backdrop-blur-md flex items-center gap-2"
          >
            <Plus className="h-4.5 w-4.5 text-zinc-200" />
            + Manual Plan 🗺️
          </Button>
        </div>
      </section>

      {/* 2. DYNAMIC AI TRIP PLANNER HERO CARD */}
      <section className="w-full">
        <div className="relative group rounded-3xl overflow-hidden border border-indigo-500/25 bg-gradient-to-br from-zinc-900/90 via-indigo-950/40 to-purple-950/40 backdrop-blur-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-indigo-400/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]">
          {/* Animated decorative blur backdrops */}
          <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none group-hover:bg-indigo-500/15 transition-colors duration-500" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-purple-500/10 blur-[80px] pointer-events-none group-hover:bg-purple-500/15 transition-colors duration-500" />
          
          <div className="flex-1 flex flex-col gap-3 relative z-10">
            <div className="flex items-center gap-2.5 text-violet-300">
              <div className="w-8 h-8 rounded-lg bg-violet-500/25 flex items-center justify-center border border-violet-400/40">
                <Sparkles className="h-4.5 w-4.5 text-violet-300 animate-pulse" />
              </div>
              <span className="font-extrabold text-sm tracking-widest text-violet-300">⚡ POWERED BY AI (TRIPO)</span>
            </div>
            
            <h3 className="text-xl font-heading font-bold text-zinc-100 flex items-center gap-2">
              🤖 AI Trip Planner
            </h3>
            
            <p className="text-zinc-200 text-sm md:text-base leading-relaxed max-w-3xl font-medium">
              Enter your 📍 destination and travel vibe. We'll instantly craft a personalized itinerary with nearby attractions, activities, and budget insights using real-time Google Places data. 🌟
            </p>
          </div>

          <div className="relative z-10">
            <Button
              onClick={() => window.location.href = '/dashboard/ai-planner'}
              size="icon"
              className="w-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] border border-indigo-400/20 flex items-center justify-center transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-[360deg] duration-700"
            >
              <ArrowRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </section>

      {/* 3. FUNCTIONAL STATISTICS CARDS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Stat Card 1: Total Trips */}
        <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-950/40 p-5 backdrop-blur-md transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Trips</span>
            <div className="p-2 rounded-lg bg-zinc-900 text-zinc-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors duration-300">
              <Briefcase className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-zinc-100">{totalTripsCount}</span>
            <span className="text-[10px] text-zinc-500 font-medium">Planned</span>
          </div>
        </div>

        {/* Stat Card 2: Upcoming Trips */}
        <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-950/40 p-5 backdrop-blur-md transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Upcoming Trips</span>
            <div className="p-2 rounded-lg bg-zinc-900 text-zinc-400 group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-colors duration-300">
              <Calendar className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-zinc-100">{upcomingTripsCount}</span>
            <span className="text-[10px] text-zinc-500 font-medium">In Queue</span>
          </div>
        </div>

        {/* Stat Card 3: Countries Explored */}
        <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-950/40 p-5 backdrop-blur-md transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Countries</span>
            <div className="p-2 rounded-lg bg-zinc-900 text-zinc-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors duration-300">
              <Globe className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-zinc-100">{countriesExploredCount}</span>
            <span className="text-[10px] text-zinc-500 font-medium">Explored</span>
          </div>
        </div>

        {/* Stat Card 4: Total Budget Spent */}
        <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-950/40 p-5 backdrop-blur-md transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Spent</span>
            <div className="p-2 rounded-lg bg-zinc-900 text-zinc-400 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-colors duration-300">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-zinc-100">
              ${totalBudgetSpent.toLocaleString('en-US')}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium group-hover:text-purple-300 flex items-center gap-0.5 transition-colors">
              <TrendingUp className="h-3 w-3" />
              Accumulated
            </span>
          </div>
        </div>

      </section>

      {/* 4 & 5. YOUR JOURNEYS SECTION */}
      <section className="flex flex-col gap-6">
        
        {/* Header - Aligned */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl md:text-2xl font-extrabold tracking-wide text-zinc-100">Your Journeys</h2>
            <p className="text-zinc-500 text-xs">Trips you started or recently explored on Traveloop</p>
          </div>
          
          <Button 
            onClick={() => window.location.href = '/dashboard/trips'}
            variant="ghost" 
            className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5 transition-all text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/10 hover:border-indigo-500/25"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Grid of Journey Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const startDateFormatted = new Date(trip.startDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })
            const endDateFormatted = new Date(trip.endDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })

            const budgetLimit = trip.totalBudget || 1
            const spent = (trip.expenses || []).reduce((sum, exp) => sum + exp.amount, 0)
            const pctSpent = Math.min(Math.round((spent / budgetLimit) * 100), 100)

            return (
              <div 
                key={trip.id}
                onClick={() => window.location.href = `/dashboard/trips?id=${trip.id}`}
                className="group relative cursor-pointer rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950/60 transition-all duration-300 hover:border-indigo-500/20 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1 flex flex-col min-h-[360px]"
              >
                
                {/* Cover Image Background overlay with gradient */}
                <div className="relative h-44 w-full overflow-hidden bg-zinc-900">
                  {trip.coverImage ? (
                    <img 
                      src={trip.coverImage} 
                      alt={trip.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-zinc-950 via-indigo-950/40 to-zinc-900 flex items-center justify-center">
                      <Compass className="h-10 w-10 text-indigo-500/20" />
                    </div>
                  )}
                  {/* Glassmorphic Date stamp top right */}
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-900/60 backdrop-blur-md text-[10px] font-bold tracking-wider text-zinc-300 flex items-center gap-1.5 shadow-md">
                    <Calendar className="h-3 w-3 text-indigo-400" />
                    {startDateFormatted} - {endDateFormatted}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                </div>

                {/* Card Content */}
                <div className="flex-1 p-5 flex flex-col justify-between gap-4 relative z-10 bg-zinc-950/20">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-bold text-base text-zinc-100 group-hover:text-indigo-300 transition-colors leading-tight">
                      {trip.title}
                    </h3>
                    <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                      {trip.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Destination Info & Cost Progress bar */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                      <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="font-semibold text-zinc-300">
                        {trip.stops && trip.stops.length > 0 
                          ? `${trip.stops[0].cityName}, ${trip.stops[0].country}` 
                          : 'No destination set'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500">Budget Limit: ${budgetLimit.toLocaleString()}</span>
                        <span className={`font-semibold ${pctSpent > 85 ? 'text-red-400' : 'text-indigo-400'}`}>
                          ${spent.toLocaleString()} spent ({pctSpent}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-900">
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${
                            pctSpent > 85 
                              ? 'from-red-500 to-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' 
                              : 'from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                          }`}
                          style={{ width: `${pctSpent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      </section>

    </div>
  )
}
