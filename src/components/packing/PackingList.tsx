'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Check, Circle } from 'lucide-react'
import { getPackingItems, addPackingItem, togglePackingItem, deletePackingItem } from '@/app/actions/packing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

const CATEGORIES = ['Clothing', 'Toiletries', 'Electronics', 'Documents', 'Health', 'General']

export function PackingList({ tripId }: { tripId: string }) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newItemName, setNewItemName] = useState('')
  const [newItemCategory, setNewItemCategory] = useState('General')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const refreshData = () => setRefreshTrigger(prev => prev + 1)

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true)
      const res = await getPackingItems(tripId)
      if (res.success) {
        setItems(res.items)
      }
      setLoading(false)
    }
    fetchItems()
  }, [tripId, refreshTrigger])

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName.trim() || isSubmitting) return

    setIsSubmitting(true)
    const res = await addPackingItem({ tripId, name: newItemName.trim(), category: newItemCategory })
    if (res.success) {
      setNewItemName('')
      refreshData()
    }
    setIsSubmitting(false)
  }

  const handleToggle = async (itemId: string, isPacked: boolean) => {
    // Optimistic update
    setItems(items.map(item => item.id === itemId ? { ...item, isPacked } : item))
    await togglePackingItem(itemId, tripId, isPacked)
  }

  const handleDelete = async (itemId: string) => {
    if (confirm('Delete this item?')) {
      const res = await deletePackingItem(itemId, tripId)
      if (res.success) refreshData()
    }
  }

  if (loading && items.length === 0) {
    return <div className="py-12 text-center text-zinc-500">Loading packing list...</div>
  }

  // Group items by category
  const groupedItems = items.reduce((acc: any, item: any) => {
    const cat = item.category || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  const packedCount = items.filter(i => i.isPacked).length
  const totalCount = items.length
  const progress = totalCount === 0 ? 0 : Math.round((packedCount / totalCount) * 100)

  return (
    <div className="space-y-8">
      {/* Add New Item */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-sm font-medium">Item Name</label>
              <Input 
                placeholder="e.g. Passport, Charger" 
                value={newItemName} 
                onChange={(e) => setNewItemName(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48 space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={!newItemName.trim() || isSubmitting} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-zinc-500">
            <span>Packing Progress</span>
            <span>{packedCount} / {totalCount} ({progress}%)</span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2.5">
            <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-6">
        {totalCount === 0 ? (
          <div className="text-center py-12 text-zinc-500 border border-dashed rounded-lg">
            Your packing list is empty. Add some items above!
          </div>
        ) : (
          CATEGORIES.filter(cat => groupedItems[cat] && groupedItems[cat].length > 0).map(cat => (
            <div key={cat} className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center text-zinc-800 dark:text-zinc-200 border-b pb-2 font-heading">
                {cat}
                <span className="ml-2 text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full text-zinc-500 font-normal">
                  {groupedItems[cat].length}
                </span>
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {groupedItems[cat].map((item: any) => (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${item.isPacked ? 'bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800' : 'bg-white border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 hover:border-indigo-200'}`}
                  >
                    <button 
                      onClick={() => handleToggle(item.id, !item.isPacked)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      {item.isPacked ? (
                        <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-zinc-300 dark:text-zinc-700 shrink-0" />
                      )}
                      <span className={`text-sm ${item.isPacked ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-700 dark:text-zinc-300 font-medium'}`}>
                        {item.name}
                      </span>
                    </button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-zinc-400 hover:text-red-500" 
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
