'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import { StopCard } from './StopCard'
import { updateStopsOrder } from '@/app/actions/itinerary'

interface StopListProps {
  initialStops: any[]
  tripId: string
  onRefresh?: () => void
}

export function StopList({ initialStops, tripId, onRefresh }: StopListProps) {
  const [stops, setStops] = useState(initialStops)

  // Sync state if props change (e.g., from server actions adding/deleting stops)
  useEffect(() => {
    setStops(initialStops)
  }, [initialStops])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = stops.findIndex((stop) => stop.id === active.id)
      const newIndex = stops.findIndex((stop) => stop.id === over.id)

      const newStops = arrayMove(stops, oldIndex, newIndex)
      
      // Optimistic update
      setStops(newStops)

      // Send to server
      const payload = newStops.map((stop, index) => ({
        id: stop.id,
        order: index,
      }))
      
      const res = await updateStopsOrder(tripId, payload)
      if (!res.success) {
        // Revert on failure
        setStops(initialStops)
        alert('Failed to update stop order.')
      }
    }
  }

  if (stops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-zinc-500">
        <p>No stops added to your itinerary yet.</p>
        <p className="text-sm">Click "Add Stop" to begin planning your route.</p>
      </div>
    )
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={stops.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {stops.map((stop) => (
            <StopCard key={stop.id} stop={stop} tripId={tripId} onRefresh={onRefresh} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
