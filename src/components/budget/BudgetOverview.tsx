'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Trash2, TrendingDown, TrendingUp, Wallet } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getTripBudget, deleteExpense } from '@/app/actions/budget'
import { AddExpenseModal } from './AddExpenseModal'
import { Button } from '@/components/ui/button'

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b']

export function BudgetOverview({ tripId }: { tripId: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const refreshData = () => setRefreshTrigger(prev => prev + 1)

  useEffect(() => {
    const fetchBudget = async () => {
      setLoading(true)
      const res = await getTripBudget(tripId)
      if (res.success) {
        setData(res.budgetInfo)
      }
      setLoading(false)
    }
    fetchBudget()
  }, [tripId, refreshTrigger])

  const handleDeleteExpense = async (expenseId: string) => {
    if (confirm('Delete this expense?')) {
      const res = await deleteExpense(expenseId, tripId)
      if (res.success) refreshData()
    }
  }

  if (loading || !data) {
    return <div className="py-12 text-center text-zinc-500">Loading budget data...</div>
  }

  const isOverBudget = data.remaining < 0

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Wallet className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalBudget?.toLocaleString() || '0'}</div>
            <p className="text-xs text-zinc-500 mt-1">Initial planned budget</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-zinc-500 mt-1">Activities + Expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingDown className={`h-4 w-4 ${isOverBudget ? 'text-red-500' : 'text-emerald-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isOverBudget ? 'text-red-500' : 'text-emerald-500'}`}>
              ${Math.abs(data.remaining).toLocaleString()}
              {isOverBudget && <span className="text-sm ml-1 font-normal">(Over)</span>}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Available to spend</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Visual breakdown of your costs</CardDescription>
          </CardHeader>
          <CardContent>
            {data.chartData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`$${value}`, 'Amount']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-zinc-500 border border-dashed rounded-lg">
                No spending data yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Manual Expenses</CardTitle>
              <CardDescription>Additional costs like flights</CardDescription>
            </div>
            <AddExpenseModal tripId={tripId} onSuccess={refreshData} />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.expenses.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-8">No manual expenses logged.</p>
              ) : (
                data.expenses.map((expense: any) => (
                  <div key={expense.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium text-sm">{expense.title}</p>
                      <p className="text-xs text-zinc-500">{expense.category}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-sm">${expense.amount}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-500" onClick={() => handleDeleteExpense(expense.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
