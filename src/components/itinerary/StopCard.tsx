'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format } from 'date-fns'
import { GripVertical, MapPin, Trash2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AddActivityModal } from './AddActivityModal'
import { deleteActivity, deleteStop } from '@/app/actions/itinerary'

interface StopCardProps {
  stop: any
  tripId: string
  onRefresh?: () => void
}

export function StopCard({ stop, tripId, onRefresh }: StopCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleDeleteStop = async () => {
    if (confirm('Delete this stop and all its activities?')) {
      const res = await deleteStop(stop.id, tripId)
      if (res.success && onRefresh) onRefresh()
    }
  }

  const handleDeleteActivity = async (activityId: string) => {
    const res = await deleteActivity(activityId, tripId)
    if (res.success && onRefresh) onRefresh()
  }

  return (
    <Card ref={setNodeRef} style={style} className="relative mb-4 bg-white dark:bg-zinc-900 shadow-sm">
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-8 cursor-grab hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-l-lg border-r text-zinc-400"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      
      <div className="ml-8">
        <CardHeader className="py-4 pb-2 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-500" />
              {stop.cityName}, {stop.country}
            </CardTitle>
            <p className="text-sm text-zinc-500">
              {format(new Date(stop.startDate), 'MMM d')} - {format(new Date(stop.endDate), 'MMM d, yyyy')}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleDeleteStop} className="text-zinc-400 hover:text-red-500 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="pt-2 pb-4">
          <div className="space-y-2">
            {stop.activities.length === 0 ? (
              <p className="text-sm text-zinc-400 italic py-2">No activities planned yet.</p>
            ) : (
              stop.activities.map((act: any) => (
                <div key={act.id} className="flex items-center justify-between rounded-md border bg-zinc-50 dark:bg-zinc-800/50 p-2 text-sm">
                  <div className="font-medium">{act.title}</div>
                  <div className="flex items-center gap-4 text-zinc-500">
                    {act.cost ? <span>${act.cost}</span> : null}
                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-red-500" onClick={() => handleDeleteActivity(act.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
            
            <div className="pt-2">
              <AddActivityModal stopId={stop.id} tripId={tripId} nextOrder={stop.activities.length} onSuccess={onRefresh} />
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
