'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getTripDetails(tripId: string) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: {
          orderBy: { order: 'asc' },
          include: {
            activities: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })
    return { success: true, trip }
  } catch (error: any) {
    console.error('Error fetching trip details:', error)
    return { success: false, error: error.message }
  }
}

export async function addStop(data: {
  tripId: string
  cityName: string
  country: string
  startDate: Date
  endDate: Date
  order: number
}) {
  try {
    const stop = await prisma.stop.create({
      data,
    })
    revalidatePath(`/trips/${data.tripId}`)
    return { success: true, stop }
  } catch (error: any) {
    console.error('Error adding stop:', error)
    return { success: false, error: error.message }
  }
}

export async function updateStopsOrder(tripId: string, stops: { id: string; order: number }[]) {
  try {
    // Run all updates in a transaction
    await prisma.$transaction(
      stops.map((stop) =>
        prisma.stop.update({
          where: { id: stop.id },
          data: { order: stop.order },
        })
      )
    )
    revalidatePath(`/trips/${tripId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error updating stops order:', error)
    return { success: false, error: error.message }
  }
}

export async function addActivity(data: {
  stopId: string
  tripId: string
  title: string
  category?: string
  cost?: number
  duration?: number
  notes?: string
  order: number
}) {
  try {
    const activity = await prisma.activity.create({
      data: {
        stopId: data.stopId,
        title: data.title,
        category: data.category,
        cost: data.cost,
        duration: data.duration,
        notes: data.notes,
        order: data.order,
      },
    })
    revalidatePath(`/trips/${data.tripId}`)
    return { success: true, activity }
  } catch (error: any) {
    console.error('Error adding activity:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteStop(stopId: string, tripId: string) {
  try {
    await prisma.stop.delete({
      where: { id: stopId },
    })
    revalidatePath(`/trips/${tripId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting stop:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteActivity(activityId: string, tripId: string) {
  try {
    await prisma.activity.delete({
      where: { id: activityId },
    })
    revalidatePath(`/trips/${tripId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting activity:', error)
    return { success: false, error: error.message }
  }
}
