import { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { CalendarIcon, Map, MapPin, User, ArrowRight } from 'lucide-react'
import { getPublicTripDetails } from '@/app/actions/share'
import { Button } from '@/components/ui/button'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params
  const res = await getPublicTripDetails(slug)
  
  if (!res.success || !res.trip) {
    return { title: 'Trip Not Found' }
  }

  return {
    title: `${res.trip.title} - Traveloop`,
    description: `A trip itinerary by ${res.trip.user?.name || 'a Traveloop user'}`,
  }
}

export default async function PublicTripPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const res = await getPublicTripDetails(slug)

  if (!res.success || !res.trip) {
    notFound()
  }

  const trip = res.trip

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-950 border-b">
        <Link href="/" className="flex items-center gap-2">
          <Map className="h-6 w-6 text-indigo-600" />
          <span className="text-xl font-bold tracking-tight">Traveloop</span>
        </Link>
        <Link href="/signup">
          <Button>Create Your Own Trip</Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <div 
        className="relative h-80 w-full bg-zinc-200 dark:bg-zinc-800 bg-cover bg-center"
        style={{ backgroundImage: trip.coverImage ? `url(${trip.coverImage})` : 'none' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 p-8 flex flex-col justify-end max-w-4xl mx-auto text-center md:text-left">
          <div className="text-white space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight shadow-sm font-heading">{trip.title}</h1>
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm font-medium opacity-90 justify-center md:justify-start">
              <span className="flex items-center bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <CalendarIcon className="mr-2 h-4 w-4" /> 
                {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
              </span>
              <span className="flex items-center bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                {trip.user?.avatarUrl ? (
                  <img src={trip.user.avatarUrl} alt="" className="h-5 w-5 rounded-full mr-2 object-cover" />
                ) : (
                  <User className="mr-2 h-4 w-4" />
                )}
                Curated by {trip.user?.name || 'Traveler'}
              </span>
            </div>
            {trip.description && (
              <p className="max-w-2xl text-zinc-200 text-lg mx-auto md:mx-0 mt-4">
                {trip.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Itinerary Content */}
      <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-12 py-12">
        <div className="text-center md:text-left space-y-2 border-b pb-6">
          <h2 className="text-2xl font-bold font-heading">Trip Itinerary</h2>
          <p className="text-zinc-500">Explore the stops and activities planned for this adventure.</p>
        </div>

        {trip.stops.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 bg-white dark:bg-zinc-900 rounded-xl border">
            This trip doesn't have any stops planned yet.
          </div>
        ) : (
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-300 dark:before:via-zinc-700 before:to-transparent">
            {trip.stops.map((stop: any, index: number) => (
              <div key={stop.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Timeline dot */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-zinc-50 dark:border-zinc-950 bg-indigo-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <MapPin className="h-4 w-4" />
                </div>
                
                {/* Content Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-zinc-900 p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-xl text-zinc-900 dark:text-zinc-100 font-heading">{stop.cityName}</h3>
                  </div>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-4 flex items-center">
                    {format(new Date(stop.startDate), 'MMM d')} - {format(new Date(stop.endDate), 'MMM d')}
                    <span className="mx-2 text-zinc-300">•</span>
                    {stop.country}
                  </p>
                  
                  {stop.activities && stop.activities.length > 0 ? (
                    <div className="space-y-3 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <h4 className="text-xs uppercase font-semibold tracking-wider text-zinc-500">Activities</h4>
                      <ul className="space-y-3">
                        {stop.activities.map((activity: any) => (
                          <li key={activity.id} className="text-sm flex flex-col">
                            <span className="font-medium text-zinc-800 dark:text-zinc-200">{activity.title}</span>
                            {activity.notes && <span className="text-zinc-500 text-xs mt-0.5 line-clamp-2">{activity.notes}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400 italic mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">No specific activities planned.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Footer */}
        <div className="mt-16 pt-12 border-t text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight font-heading">Inspired by this trip?</h2>
          <p className="text-zinc-500 max-w-md mx-auto">
            Create your own account on Traveloop to start planning your next adventure, track budgets, and share itineraries with friends.
          </p>
          <Link href="/signup">
            <Button size="lg" className="rounded-full px-8">
              Start Planning for Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
