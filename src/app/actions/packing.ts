'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getPackingItems(tripId: string) {
  try {
    const items = await prisma.packingItem.findMany({
      where: { tripId },
      orderBy: { category: 'asc' },
    })
    return { success: true, items }
  } catch (error: any) {
    console.error('Error fetching packing items:', error)
    return { success: false, error: error.message }
  }
}

export async function addPackingItem(data: { tripId: string; name: string; category?: string }) {
  try {
    const item = await prisma.packingItem.create({
      data: {
        tripId: data.tripId,
        name: data.name,
        category: data.category || 'General',
      },
    })
    revalidatePath(`/trips/${data.tripId}`)
    return { success: true, item }
  } catch (error: any) {
    console.error('Error adding packing item:', error)
    return { success: false, error: error.message }
  }
}

export async function togglePackingItem(itemId: string, tripId: string, isPacked: boolean) {
  try {
    const item = await prisma.packingItem.update({
      where: { id: itemId },
      data: { isPacked },
    })
    revalidatePath(`/trips/${tripId}`)
    return { success: true, item }
  } catch (error: any) {
    console.error('Error toggling packing item:', error)
    return { success: false, error: error.message }
  }
}

export async function deletePackingItem(itemId: string, tripId: string) {
  try {
    await prisma.packingItem.delete({
      where: { id: itemId },
    })
    revalidatePath(`/trips/${tripId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting packing item:', error)
    return { success: false, error: error.message }
  }
}
