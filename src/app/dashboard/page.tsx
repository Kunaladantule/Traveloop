'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format, differenceInDays } from 'date-fns'
import { MapPin, Calendar, Wallet, Clock, Plus } from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { getUserTrips } from '@/app/actions/trip'
import { getTripDetails } from '@/app/actions/itinerary'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BudgetOverview } from '@/components/budget/BudgetOverview'

export default function DashboardOverviewPage() {
  const [user, setUser] = useState<any>(null)
  const [activeTrip, setActiveTrip] = useState<any>(null)
  const [tripDetails, setTripDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)

      // Fetch user trips
      const res = await getUserTrips(session.user.id)
      if (res.success && res.trips && res.trips.length > 0) {
        // Find the closest upcoming trip
        const sortedTrips = res.trips.sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        const upcoming = sortedTrips.find((t: any) => new Date(t.startDate) >= new Date()) || sortedTrips[sortedTrips.length - 1]
        
        setActiveTrip(upcoming)

        // Fetch details for the upcoming trip
        const detailsRes = await getTripDetails(upcoming.id)
        if (detailsRes.success) {
          setTripDetails(detailsRes.trip)
        }
      }
      
      setLoading(false)
    }

    fetchDashboardData()
  }, [router])

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center">Loading dashboard...</div>
  }

  if (!activeTrip) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 p-12 text-center shadow-sm">
        <MapPin className="h-12 w-12 text-zinc-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Welcome to Traveloop!</h2>
        <p className="text-zinc-500 mb-6 max-w-md">You don&apos;t have any trips planned yet. Start your journey by creating a new trip.</p>
        <Link href="/dashboard/trips">
          <Button>Create your first trip</Button>
        </Link>
      </div>
    )
  }

  const daysRemaining = differenceInDays(new Date(activeTrip.startDate), new Date())
  const statusText = daysRemaining > 0 ? `${daysRemaining} Days Remaining` : daysRemaining === 0 ? 'Starts Today!' : 'Trip Completed'
  
  // Find first stop with activities or just the first stop
  const firstStop = tripDetails?.stops?.[0]
  const activities = firstStop?.activities || []

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-zinc-50">Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Here&apos;s an overview of your upcoming adventure.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Trip Widget */}
        <Card className="flex flex-col border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-500" /> Active Trip
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-zinc-50/50 dark:bg-zinc-900/20 m-6 mt-0 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{activeTrip.title}</h3>
            <div className="flex items-center gap-4 text-zinc-500 mb-6">
              <span className="flex items-center"><Calendar className="mr-1 h-4 w-4" /> {format(new Date(activeTrip.startDate), 'MMM d, yyyy')}</span>
            </div>
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors border-transparent bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-200">
              {statusText}
            </div>
          </CardContent>
        </Card>

        {/* Budget Summary Widget */}
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-500" /> Budget Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Reuse BudgetOverview component - we pass tripId */}
            <div className="h-[250px] overflow-hidden">
               <BudgetOverview tripId={activeTrip.id} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Itinerary Timeline Widget */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
          <div>
            <CardTitle className="text-lg">Itinerary Builder</CardTitle>
            <CardDescription>
              {firstStop ? `Day 1: ${firstStop.cityName}` : 'No stops added yet'}
            </CardDescription>
          </div>
          <Link href={`/trips/${activeTrip.id}`}>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> View Full Trip
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-3 pl-6 space-y-8 py-4">
              {activities.map((activity: any) => (
                <div key={activity.id} className="relative">
                  <span className="absolute -left-[35px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 ring-4 ring-white dark:ring-zinc-950">
                    <Clock className="h-3 w-3 text-zinc-400" />
                  </span>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{activity.title}</h4>
                      {activity.notes && <p className="text-sm text-zinc-500 mt-1">{activity.notes}</p>}
                      {activity.cost && activity.cost > 0 ? (
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-2">
                          Costs: ${activity.cost}
                        </p>
                      ) : null}
                    </div>
                    {activity.category && (
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
                        {activity.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-12 text-zinc-500">
               <p>No activities scheduled for this stop yet.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
