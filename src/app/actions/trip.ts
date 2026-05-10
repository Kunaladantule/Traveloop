'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createTrip(data: {
  userId: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  totalBudget?: number
}) {
  try {
    const trip = await prisma.trip.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        totalBudget: data.totalBudget,
      },
    })
    
    revalidatePath('/dashboard')
    return { success: true, trip }
  } catch (error: any) {
    console.error('Error creating trip:', error)
    return { success: false, error: error.message }
  }
}

export async function getUserTrips(userId: string) {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId },
      orderBy: { startDate: 'asc' },
      include: {
        _count: {
          select: { stops: true }
        }
      }
    })
    return { success: true, trips }
  } catch (error: any) {
    console.error('Error fetching trips:', error)
    return { success: false, error: error.message, trips: [] }
  }
}

export async function deleteTrip(tripId: string) {
  try {
    await prisma.trip.delete({
      where: { id: tripId },
    })
    
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting trip:', error)
    return { success: false, error: error.message }
  }
}
