'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, CalendarIcon, Map, Wallet, Briefcase, StickyNote } from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { getTripDetails } from '@/app/actions/itinerary'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AddStopModal } from '@/components/itinerary/AddStopModal'
import { StopList } from '@/components/itinerary/StopList'
import { BudgetOverview } from '@/components/budget/BudgetOverview'
import { PackingList } from '@/components/packing/PackingList'
import { NotesBoard } from '@/components/notes/NotesBoard'
import { ShareTripModal } from '@/components/itinerary/ShareTripModal'

export default function TripItineraryPage() {
  const [user, setUser] = useState<any>(null)
  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  const router = useRouter()
  const params = useParams()
  const tripId = params.tripId as string

  const refreshData = () => setRefreshTrigger(prev => prev + 1)

  useEffect(() => {
    const fetchAuthAndTrip = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)

      const res = await getTripDetails(tripId)
      if (res.success && res.trip) {
        if (res.trip.userId !== session.user.id) {
          // Unauthorised access to someone else's trip
          router.push('/dashboard')
          return
        }
        setTrip(res.trip)
      } else {
        router.push('/dashboard') // Trip not found
      }
      
      setLoading(false)
    }

    fetchAuthAndTrip()
  }, [router, tripId, refreshTrigger])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading Itinerary...</div>
  }

  if (!trip) {
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header section with cover image */}
      <div 
        className="relative h-64 w-full bg-zinc-200 dark:bg-zinc-800 bg-cover bg-center"
        style={{ backgroundImage: trip.coverImage ? `url(${trip.coverImage})` : 'none' }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 p-8 flex flex-col justify-between max-w-5xl mx-auto">
          <div className="flex justify-between items-start">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="bg-white/10 text-white hover:bg-white/20 border-white/20">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
              </Button>
            </Link>
            <ShareTripModal tripId={trip.id} initialIsPublic={trip.isPublic} initialShareSlug={trip.shareSlug} />
          </div>
          <div className="text-white space-y-2">
            <h1 className="text-4xl font-bold tracking-tight shadow-sm font-heading">{trip.title}</h1>
            <div className="flex items-center gap-4 text-sm font-medium opacity-90">
              <span className="flex items-center"><CalendarIcon className="mr-1 h-4 w-4" /> {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}</span>
              {trip.totalBudget && <span className="flex items-center"><Wallet className="mr-1 h-4 w-4" /> ${trip.totalBudget.toLocaleString()}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl p-8">
        <Tabs defaultValue="itinerary" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 max-w-[800px] mb-8 h-auto p-1">
            <TabsTrigger value="itinerary" className="py-2">Itinerary</TabsTrigger>
            <TabsTrigger value="budget" className="py-2">Budget Tracker</TabsTrigger>
            <TabsTrigger value="packing" className="py-2">Packing List</TabsTrigger>
            <TabsTrigger value="notes" className="py-2">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="itinerary" className="mt-0">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold flex items-center gap-2 font-heading">
                  <Map className="h-6 w-6 text-indigo-500" /> Itinerary Builder
                </h2>
                <p className="text-zinc-500 text-sm mt-1">
                  Add cities and activities to your trip. Drag and drop cities to reorder them.
                </p>
              </div>
              <AddStopModal tripId={tripId} nextOrder={trip.stops?.length || 0} onSuccess={refreshData} />
            </div>

            <StopList initialStops={trip.stops || []} tripId={tripId} onRefresh={refreshData} />
          </TabsContent>

          <TabsContent value="budget" className="mt-0">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold flex items-center gap-2 font-heading">
                <Wallet className="h-6 w-6 text-indigo-500" /> Budget Tracker
              </h2>
              <p className="text-zinc-500 text-sm mt-1">
                Monitor your spending and manual expenses.
              </p>
            </div>
            
            <BudgetOverview tripId={tripId} />
          </TabsContent>

          <TabsContent value="packing" className="mt-0">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold flex items-center gap-2 font-heading">
                <Briefcase className="h-6 w-6 text-indigo-500" /> Packing List
              </h2>
              <p className="text-zinc-500 text-sm mt-1">
                Keep track of everything you need to bring.
              </p>
            </div>
            
            <PackingList tripId={tripId} />
          </TabsContent>

          <TabsContent value="notes" className="mt-0">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold flex items-center gap-2 font-heading">
                <StickyNote className="h-6 w-6 text-indigo-500" /> Trip Notes
              </h2>
              <p className="text-zinc-500 text-sm mt-1">
                Save important details, ideas, and reminders.
              </p>
            </div>
            
            <NotesBoard tripId={tripId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
