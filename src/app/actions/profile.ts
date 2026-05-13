'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getProfile(userId: string) {
  try {
    const profile = await prisma.user.findUnique({
      where: { id: userId },
    })
    return { success: true, profile }
  } catch (error: any) {
    console.error('Error fetching profile:', error)
    return { success: false, error: error.message }
  }
}

export async function updateProfile(userId: string, data: { name?: string; avatarUrl?: string }) {
  try {
    const profile = await prisma.user.update({
      where: { id: userId },
      data,
    })
    revalidatePath('/dashboard/settings')
    return { success: true, profile }
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return { success: false, error: error.message }
  }
}
