'use client'

import React, { useState } from 'react'
import { Search, Globe, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const DESTINATIONS_MOCK = [
  {
    name: 'Kyoto',
    country: 'Japan',
    description: 'Ancient bamboo forests, golden temples, and deep-rooted cultural arts.',
    image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=600'
  },
  {
    name: 'Paris',
    country: 'France',
    description: 'Iconic street architecture, world-renowned dining tables, and romantic skyline views.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600'
  },
  {
    name: 'Zurich',
    country: 'Switzerland',
    description: 'Scenic lakeside promenades, alpine mountain peaks, and chocolate boutiques.',
    image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&q=80&w=600'
  },
  {
    name: 'Sydney',
    country: 'Australia',
    description: 'Sparkling blue harbor bays, sandy beaches, and landmark opera house vaults.',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=600'
  }
]

export default function DiscoverDestinationPage() {
  const [search, setSearch] = useState('')

  const filtered = DESTINATIONS_MOCK.filter(dest => 
    dest.name.toLowerCase().includes(search.toLowerCase()) || 
    dest.country.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-zinc-100 flex items-center gap-2">
            <Globe className="h-7 w-7 text-indigo-400" />
            Discover Destinations
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Browse trending destinations, curate local itineraries, and discover tips from seasoned travelers.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md bg-zinc-950/20 border border-zinc-900 p-2 rounded-2xl backdrop-blur-md">
        <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Where to next? Search country or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11 pr-4 bg-zinc-950/40 border-zinc-900 rounded-xl focus:border-indigo-500 text-sm w-full"
        />
      </div>

      {/* Destination Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((dest) => (
          <Card key={dest.name} className="bg-zinc-950/40 border-zinc-900 overflow-hidden relative group hover:border-indigo-500/20 transition-all duration-300 flex flex-col md:flex-row h-auto md:h-48 cursor-pointer">
            <div className="w-full md:w-44 h-48 md:h-auto relative overflow-hidden bg-zinc-900">
              <img 
                src={actImage(dest.image)} 
                alt={dest.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
            </div>
            <CardContent className="flex-1 p-5 flex flex-col justify-between gap-3 bg-zinc-950/20">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase">{dest.country}</span>
                <h3 className="text-lg font-extrabold text-zinc-100 group-hover:text-indigo-300 transition-colors leading-snug">{dest.name}</h3>
                <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed line-clamp-2">{dest.description}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-500 group-hover:text-indigo-400 transition-colors">
                Explore guides
                <ChevronRight className="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function actImage(url: string) {
  return url
}
