'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addExpense(data: {
  tripId: string
  title: string
  amount: number
  category: string
  date?: Date
}) {
  try {
    const expense = await prisma.expense.create({
      data: {
        tripId: data.tripId,
        title: data.title,
        amount: data.amount,
        category: data.category,
        date: data.date,
      },
    })
    revalidatePath(`/trips/${data.tripId}`)
    return { success: true, expense }
  } catch (error: any) {
    console.error('Error adding expense:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteExpense(expenseId: string, tripId: string) {
  try {
    await prisma.expense.delete({
      where: { id: expenseId },
    })
    revalidatePath(`/trips/${tripId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting expense:', error)
    return { success: false, error: error.message }
  }
}

export async function getTripBudget(tripId: string) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        expenses: {
          orderBy: { createdAt: 'desc' }
        },
        stops: {
          include: {
            activities: true
          }
        }
      }
    })

    if (!trip) throw new Error('Trip not found')

    // Aggregate data
    const expenses = trip.expenses || []
    const activities = trip.stops.flatMap(stop => stop.activities)
    
    // Group costs by category
    const categoryTotals: Record<string, number> = {}
    
    // Add explicit expenses
    expenses.forEach(exp => {
      const cat = exp.category || 'Other'
      categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount
    })
    
    // Add activity costs (treating 'Activity' as the category if not specified)
    activities.forEach(act => {
      if (act.cost) {
        const cat = act.category || 'Activities'
        categoryTotals[cat] = (categoryTotals[cat] || 0) + act.cost
      }
    })

    const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value)

    const totalSpent = chartData.reduce((acc, curr) => acc + curr.value, 0)
    const remaining = trip.totalBudget ? trip.totalBudget - totalSpent : 0

    return { 
      success: true, 
      budgetInfo: {
        totalBudget: trip.totalBudget,
        totalSpent,
        remaining,
        chartData,
        expenses,
        activities
      }
    }
  } catch (error: any) {
    console.error('Error fetching budget:', error)
    return { success: false, error: error.message }
  }
}
