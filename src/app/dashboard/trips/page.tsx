'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { CalendarIcon, MapPin, Trash2, Wallet } from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateTripModal } from '@/components/trip/CreateTripModal'
import { getUserTrips, deleteTrip } from '@/app/actions/trip'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const router = useRouter()

  const refreshData = () => setRefreshTrigger(prev => prev + 1)

  useEffect(() => {
    const checkUserAndFetchTrips = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      
      setUser(session.user)
      
      // Fetch trips via Server Action
      const res = await getUserTrips(session.user.id)
      if (res.success && res.trips) {
        setTrips(res.trips)
      }
      
      setLoading(false)
    }

    checkUserAndFetchTrips()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        getUserTrips(session.user.id).then(res => {
          if (res.success && res.trips) setTrips(res.trips)
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [router, refreshTrigger])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleDeleteTrip = async (tripId: string) => {
    if (confirm('Are you sure you want to delete this trip?')) {
      const res = await deleteTrip(tripId)
      if (res.success) {
        setTrips(trips.filter(t => t.id !== tripId))
      } else {
        alert('Failed to delete trip.')
      }
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-heading">My Trips</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Manage your upcoming adventures and itineraries.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <CreateTripModal userId={user.id} onSuccess={refreshData} />
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
        
        {/* Trips Grid */}
        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-24 text-center">
            <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
              <MapPin className="h-6 w-6 text-zinc-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold font-heading">No trips found</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              You haven't planned any trips yet. Create one to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <Card key={trip.id} className="flex flex-col overflow-hidden transition-all hover:shadow-md">
                {trip.coverImage ? (
                  <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${trip.coverImage})` }} />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                    <MapPin className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-1">{trip.title}</CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[40px]">
                    {trip.description || 'No description provided.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-2 text-sm">
                  <div className="flex items-center text-zinc-500">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(new Date(trip.startDate), 'MMM d, yyyy')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                  </div>
                  {trip.totalBudget && (
                    <div className="flex items-center text-zinc-500">
                      <Wallet className="mr-2 h-4 w-4" />
                      ${trip.totalBudget.toLocaleString()} Budget
                    </div>
                  )}
                  <div className="flex items-center text-zinc-500">
                    <MapPin className="mr-2 h-4 w-4" />
                    {trip._count?.stops || 0} Stops
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t bg-zinc-50 px-6 py-3 dark:bg-zinc-900/50">
                  <Button variant="ghost" size="sm" onClick={() => router.push(`/trips/${trip.id}`)}>
                    View Itinerary
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteTrip(trip.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
  )
}
