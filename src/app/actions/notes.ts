'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getNotes(tripId: string) {
  try {
    const notes = await prisma.note.findMany({
      where: { tripId },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, notes }
  } catch (error: any) {
    console.error('Error fetching notes:', error)
    return { success: false, error: error.message }
  }
}

export async function addNote(data: { tripId: string; content: string }) {
  try {
    const note = await prisma.note.create({
      data: {
        tripId: data.tripId,
        content: data.content,
      },
    })
    revalidatePath(`/trips/${data.tripId}`)
    return { success: true, note }
  } catch (error: any) {
    console.error('Error adding note:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteNote(noteId: string, tripId: string) {
  try {
    await prisma.note.delete({
      where: { id: noteId },
    })
    revalidatePath(`/trips/${tripId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting note:', error)
    return { success: false, error: error.message }
  }
}
