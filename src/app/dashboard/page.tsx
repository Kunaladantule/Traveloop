// app/dashboard/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { 
  Sparkles, Plus, ArrowRight, MapPin, Calendar, 
  Globe, DollarSign, Compass, Briefcase, TrendingUp 
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getUserTrips } from '@/app/actions/trip'

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
  startDate: Date | string
  endDate: Date | string
  totalBudget?: number | null
  coverImage?: string | null
  stops?: TripStop[]
  expenses?: TripExpense[]
}

// ─────────────────────────────────────────────────────────────
// 🎨 Light Theme Mock Data (Fallback)
// ─────────────────────────────────────────────────────────────
const DEFAULT_MOCK_TRIPS: Trip[] = [
  {
    id: 'mock_trip_1',
    title: 'Tokyo Sakura Dream',
    description: 'Spring getaway to witness cherry blossoms and explore futuristic electronics hubs.',
    startDate: '2026-04-10',
    endDate: '2026-04-18',
    totalBudget: 3500,
    coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=600',
    stops: [{ id: 's1', cityName: 'Tokyo', country: 'Japan' }],
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
    startDate: '2026-07-05',
    endDate: '2026-07-12',
    totalBudget: 5000,
    coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600',
    stops: [{ id: 's2', cityName: 'Paris', country: 'France' }],
    expenses: [
      { id: 'e4', amount: 1200, category: 'Flights' },
      { id: 'e5', amount: 1500, category: 'Accommodation' }
    ]
  },
  {
    id: 'mock_trip_3',
    title: 'Swiss Alps Wanderer',
    description: 'Hiking majestic peaks and tasting world-class chocolates in scenic valleys.',
    startDate: '2026-09-20',
    endDate: '2026-09-30',
    totalBudget: 4200,
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=600',
    stops: [{ id: 's3', cityName: 'Zurich', country: 'Switzerland' }],
    expenses: [{ id: 'e6', amount: 300, category: 'Transport' }]
  }
]

// ─────────────────────────────────────────────────────────────
// 🧩 Reusable Components (Light Theme Optimized)
// ─────────────────────────────────────────────────────────────

const StatCard = ({ 
  label, value, sublabel, icon: Icon, iconColor, hoverColor 
}: {
  label: string
  value: string | number
  sublabel: string
  icon: React.ElementType
  iconColor: string
  hoverColor: string
}) => (
  <Card className="group hover:shadow-lg transition-all duration-200 border-slate-200 hover:border-slate-300">
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
        <div className={`p-2 rounded-lg bg-slate-100 ${iconColor} group-hover:${hoverColor} transition-colors duration-200`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-900 tracking-tight">{value}</span>
        <span className="text-[11px] text-slate-500 font-medium">{sublabel}</span>
      </div>
    </CardContent>
  </Card>
)

const TripCard = ({ trip }: { trip: Trip }) => {
  const startDate = new Date(trip.startDate)
  const endDate = new Date(trip.endDate)
  
  const dateRange = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  
  const budget = trip.totalBudget || 0
  const spent = (trip.expenses || []).reduce((sum, exp) => sum + exp.amount, 0)
  const pctSpent = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0
  const isOverBudget = pctSpent > 85

  const destination = trip.stops?.[0] 
    ? `${trip.stops[0].cityName}, ${trip.stops[0].country}` 
    : 'Destination TBD'

  return (
    <Card 
      className="group cursor-pointer overflow-hidden border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
      onClick={() => window.location.href = `/dashboard/trips?id=${trip.id}`}
    >
      {/* Cover Image */}
      <div className="relative h-40 overflow-hidden bg-slate-100">
        {trip.coverImage ? (
          <img 
            src={trip.coverImage} 
            alt={trip.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
            <Compass className="h-8 w-8 text-indigo-200" />
          </div>
        )}
        
        {/* Date Badge */}
        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm border border-slate-200 shadow-sm">
          <span className="text-[10px] font-semibold text-slate-700 flex items-center gap-1">
            <Calendar className="h-3 w-3 text-indigo-500" />
            {dateRange}
          </span>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
      </div>

      {/* Content */}
      <CardContent className="p-5 flex flex-col gap-4">
        <div>
          <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1">
            {trip.title}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-2 mt-1">
            {trip.description || 'No description added yet.'}
          </p>
        </div>

        {/* Destination */}
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <MapPin className="h-4 w-4 text-indigo-500 shrink-0" />
          <span className="font-medium truncate">{destination}</span>
        </div>

        {/* Budget Progress */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Budget: ${budget.toLocaleString()}</span>
            <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-indigo-600'}`}>
              ${spent.toLocaleString()} ({pctSpent}%)
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget 
                  ? 'bg-gradient-to-r from-red-500 to-rose-500' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
              style={{ width: `${pctSpent}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────
// 🚀 Main Dashboard Page Component
// ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: string; name?: string; email?: string } | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  // Load user and trips
  useEffect(() => {
    const loadUserData = async () => {
      const userStr = localStorage.getItem('traveloop_user')
      
      if (!userStr) {
        window.location.href = '/'
        return
      }

      try {
        const parsedUser = JSON.parse(userStr)
        setUser(parsedUser)

        // Try to fetch from API first
        const res = await getUserTrips(parsedUser.id)
        
        if (res.success && res.trips?.length > 0) {
          setTrips(res.trips as unknown as Trip[])
        } else {
          // Fallback to localStorage or mock data
          const localKey = `traveloop_trips_${parsedUser.id}`
          const stored = localStorage.getItem(localKey)
          
          if (stored) {
            setTrips(JSON.parse(stored))
          } else {
            localStorage.setItem(localKey, JSON.stringify(DEFAULT_MOCK_TRIPS))
            setTrips(DEFAULT_MOCK_TRIPS)
          }
        }
      } catch (err) {
        console.warn('Failed to load trips, using offline data:', err)
        const localKey = `traveloop_trips_${parsedUser?.id || 'guest'}`
        const stored = localStorage.getItem(localKey)
        
        if (stored) {
          setTrips(JSON.parse(stored))
        } else {
          localStorage.setItem(localKey, JSON.stringify(DEFAULT_MOCK_TRIPS))
          setTrips(DEFAULT_MOCK_TRIPS)
        }
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  // Calculate stats
  const stats = {
    totalTrips: trips.length,
    upcomingTrips: trips.filter(t => new Date(t.startDate) > new Date()).length,
    countriesVisited: Array.from(new Set(
      trips.flatMap(t => t.stops?.map(s => s.country) || [])
    )).filter(Boolean).length,
    totalSpent: trips.reduce((acc, trip) => 
      acc + (trip.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0), 0
    )
  }

  // Loading State
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin" />
          <span className="text-sm text-slate-500 font-medium">Loading your journeys...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto">
      
      {/* 🎯 HERO SECTION */}
      <section className="text-center py-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wide mb-5">
          <Sparkles className="h-3.5 w-3.5" />
          Intelligent Travel Assistant
        </div>
        
        {/* Title */}
        <h1 className="font-heading font-bold text-4xl md:text-5xl text-slate-900 tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'Traveler'}! ✈️
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg text-slate-600 mt-3 max-w-2xl mx-auto">
          Plan smarter, travel better. Create personalized trips with AI-powered itineraries, budget tracking, and local insights.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Button 
            onClick={() => window.location.href = '/dashboard/ai-planner'}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50 transition-all duration-200"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate with AI
          </Button>

          <Button 
            onClick={() => window.location.href = '/dashboard/trips'}
            variant="outline"
            className="px-6 py-3 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Manual Trip
          </Button>
        </div>
      </section>

      {/* ✨ AI PLANNER PROMOTION CARD */}
      <section>
        <Card className="relative overflow-hidden border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            {/* Icon + Text */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-indigo-700">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Powered by TripO AI</span>
              </div>
              
              <h3 className="text-xl font-heading font-bold text-slate-900">
                🤖 AI Trip Planner
              </h3>
              
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                Enter your destination and travel style. We'll instantly craft a personalized itinerary with nearby attractions, activities, and real-time budget insights.
              </p>
            </div>

            {/* CTA Button */}
            <Button
              onClick={() => window.location.href = '/dashboard/ai-planner'}
              size="lg"
              className="shrink-0 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-200/50 hover:shadow-lg transition-all duration-200"
            >
              Try AI Planner
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
          
          {/* Decorative Background Elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-100/50 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-100/50 rounded-full blur-2xl pointer-events-none" />
        </Card>
      </section>

      {/* 📊 STATISTICS GRID */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Trips"
          value={stats.totalTrips}
          sublabel="Planned"
          icon={Briefcase}
          iconColor="text-slate-600"
          hoverColor="text-indigo-600 bg-indigo-50"
        />
        <StatCard
          label="Upcoming"
          value={stats.upcomingTrips}
          sublabel="In Queue"
          icon={Calendar}
          iconColor="text-slate-600"
          hoverColor="text-amber-600 bg-amber-50"
        />
        <StatCard
          label="Countries"
          value={stats.countriesVisited}
          sublabel="Explored"
          icon={Globe}
          iconColor="text-slate-600"
          hoverColor="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          label="Total Spent"
          value={`$${stats.totalSpent.toLocaleString()}`}
          sublabel="Accumulated"
          icon={DollarSign}
          iconColor="text-slate-600"
          hoverColor="text-purple-600 bg-purple-50"
        />
      </section>

      {/* 🗺️ YOUR JOURNEYS SECTION */}
      <section className="flex flex-col gap-6">
        {/* Section Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-heading font-bold text-slate-900">Your Journeys</h2>
            <p className="text-sm text-slate-600 mt-1">Trips you've created or recently explored</p>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/dashboard/trips'}
            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-semibold"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Trips Grid */}
        {trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="border-dashed border-slate-300 bg-slate-50/50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
                <Compass className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">No trips yet</h3>
              <p className="text-sm text-slate-600 mb-4">Start planning your first adventure!</p>
              <Button 
                onClick={() => window.location.href = '/dashboard/ai-planner'}
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Create with AI
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

    </div>
  )
}