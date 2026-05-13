'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function toggleTripPublic(tripId: string, isPublic: boolean) {
  try {
    const dataToUpdate: any = { isPublic }
    
    // If making public and it doesn't have a share slug, generate one
    if (isPublic) {
      const trip = await prisma.trip.findUnique({ where: { id: tripId } })
      if (!trip?.shareSlug) {
        // Generate a random slug e.g. "my-trip-abc12"
        const slugPrefix = trip?.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'trip'
        const randomString = Math.random().toString(36).substring(2, 8)
        dataToUpdate.shareSlug = `${slugPrefix}-${randomString}`
      }
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: dataToUpdate,
    })

    revalidatePath(`/trips/${tripId}`)
    return { success: true, shareSlug: updatedTrip.shareSlug, isPublic: updatedTrip.isPublic }
  } catch (error: any) {
    console.error('Error toggling trip public status:', error)
    return { success: false, error: error.message }
  }
}

export async function getPublicTripDetails(shareSlug: string) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { shareSlug, isPublic: true },
      include: {
        user: {
          select: { name: true, avatarUrl: true }
        },
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
    console.error('Error fetching public trip:', error)
    return { success: false, error: error.message }
  }
}
