'use server'

import prisma from '@/lib/prisma'

export async function checkProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    return { success: true, exists: !!user }
  } catch (error: any) {
    console.error('Error checking profile:', error)
    return { success: false, error: error.message }
  }
}

export async function createProfile(userId: string, data: { name: string; email: string }) {
  try {
    const user = await prisma.user.create({
      data: {
        id: userId,
        name: data.name,
        email: data.email,
      },
    })
    return { success: true, user }
  } catch (error: any) {
    console.error('Error creating profile:', error)
    return { success: false, error: error.message }
  }
}
