import Link from 'next/link'
import { format } from 'date-fns'
import { Map, Calendar, User, Compass } from 'lucide-react'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

async function getPublicTrips() {
  const trips = await prisma.trip.findMany({
    where: { isPublic: true },
    include: {
      user: { select: { name: true, avatarUrl: true } },
      stops: { select: { id: true } } // just to get a count
    },
    orderBy: { startDate: 'desc' },
  })
  return trips
}

export default async function ExplorePage() {
  const trips = await getPublicTrips()

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Compass className="h-8 w-8 text-indigo-500" /> Explore Itineraries
        </h1>
        <p className="text-zinc-500 max-w-2xl">
          Discover trips shared by the Traveloop community. Gain inspiration for your next adventure from these public itineraries.
        </p>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-950 border border-dashed rounded-xl">
          <Compass className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No public trips yet</h3>
          <p className="text-zinc-500 mt-2">Be the first to share your itinerary with the world!</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Card key={trip.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
              <div 
                className="h-40 w-full bg-zinc-200 dark:bg-zinc-800 bg-cover bg-center relative"
                style={{ backgroundImage: trip.coverImage ? `url(${trip.coverImage})` : 'none' }}
              >
                {!trip.coverImage && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Map className="h-10 w-10 text-zinc-400 opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                  <h3 className="text-white font-bold leading-tight truncate drop-shadow-sm">{trip.title}</h3>
                </div>
              </div>
              
              <CardContent className="pt-4 flex-1">
                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-3">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>{format(new Date(trip.startDate), 'MMM d, yyyy')}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-md">
                  {trip.user?.avatarUrl ? (
                    <img src={trip.user.avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {(trip.user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="truncate flex-1">By {trip.user?.name || 'Traveler'}</span>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0 pb-4 flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800 mt-auto bg-zinc-50/50 dark:bg-zinc-900/20">
                <span className="text-xs text-zinc-500 font-medium">
                  {trip.stops.length} stop{trip.stops.length !== 1 ? 's' : ''}
                </span>
                <Link href={`/share/${trip.shareSlug}`}>
                  <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50">
                    View Trip
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
