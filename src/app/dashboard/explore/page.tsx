'use client'

import React, { useState } from 'react'
import { Search, Compass, Star, MapPin, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const ACTIVITIES_MOCK = [
  {
    id: 'a1',
    title: 'Shibuya Sky Observatory',
    location: 'Tokyo, Japan',
    category: 'Sightseeing',
    rating: 4.8,
    reviews: 1240,
    price: '$22',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'a2',
    title: 'Louvre Guided Art Tour',
    location: 'Paris, France',
    category: 'Culture',
    rating: 4.9,
    reviews: 3280,
    price: '$45',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'a3',
    title: 'Interlaken Glacier Tandem Paragliding',
    location: 'Zurich, Switzerland',
    category: 'Adventure',
    rating: 5.0,
    reviews: 840,
    price: '$180',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'a4',
    title: 'Kyoto Kimono Rental & Tea Ceremony',
    location: 'Kyoto, Japan',
    category: 'Culture',
    rating: 4.7,
    reviews: 950,
    price: '$35',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600'
  }
]

export default function ExploreActivitiesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const categories = ['All', 'Culture', 'Sightseeing', 'Adventure']

  const filtered = ACTIVITIES_MOCK.filter(act => {
    const matchesSearch = act.title.toLowerCase().includes(search.toLowerCase()) || act.location.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = filter === 'All' || act.category === filter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-zinc-100 flex items-center gap-2">
            <Compass className="h-7 w-7 text-indigo-400" />
            Explore Activities
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Discover popular local attractions, historical sites, and premium adventure bookings worldwide.</p>
        </div>
      </div>

      {/* Filter panel & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-950/20 border border-zinc-900 p-4 rounded-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <Button
              key={cat}
              onClick={() => setFilter(cat)}
              variant={filter === cat ? 'default' : 'ghost'}
              className={`rounded-xl text-xs px-4 py-2 ${
                filter === cat 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold' 
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search activity or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 bg-zinc-950/40 border-zinc-900 rounded-xl focus:border-indigo-500 text-sm"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((act) => (
          <Card key={act.id} className="bg-zinc-950/40 border-zinc-900 overflow-hidden group hover:border-indigo-500/20 transition-all duration-300">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="h-44 bg-zinc-900 relative overflow-hidden">
                <img 
                  src={act.image} 
                  alt={act.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute top-3 left-3 px-2 py-1 rounded bg-indigo-600 text-white text-[10px] font-bold tracking-wider uppercase">
                  {act.category}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-indigo-400" />
                    {act.location}
                  </span>
                  <h3 className="font-bold text-sm text-zinc-100 mt-1 line-clamp-1 group-hover:text-indigo-300 transition-colors">
                    {act.title}
                  </h3>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60 text-xs">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="font-bold">{act.rating}</span>
                    <span className="text-[10px] text-zinc-500">({act.reviews})</span>
                  </div>
                  <span className="font-extrabold text-zinc-200">{act.price}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
