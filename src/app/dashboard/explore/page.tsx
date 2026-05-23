// app/dashboard/explore/page.tsx
'use client'

import React, { useState } from 'react'
import { Search, Compass, Star, MapPin, Sparkles, ArrowRight, Clock, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// ─────────────────────────────────────────────────────────────
// 🎨 Mock Activities Data (Enhanced with more details)
// ─────────────────────────────────────────────────────────────
const ACTIVITIES_MOCK = [
  {
    id: 'a1',
    title: 'Shibuya Sky Observatory',
    location: 'Tokyo, Japan',
    category: 'Sightseeing',
    rating: 4.8,
    reviews: 1240,
    price: '$22',
    duration: '2-3 hours',
    groupSize: 'Up to 15',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=600',
    description: '360° panoramic views of Tokyo from 230m high. Perfect for sunset photography.'
  },
  {
    id: 'a2',
    title: 'Louvre Guided Art Tour',
    location: 'Paris, France',
    category: 'Culture',
    rating: 4.9,
    reviews: 3280,
    price: '$45',
    duration: '3 hours',
    groupSize: 'Small group',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=600',
    description: 'Skip-the-line access with expert guide. See the Mona Lisa, Venus de Milo & more.'
  },
  {
    id: 'a3',
    title: 'Interlaken Glacier Paragliding',
    location: 'Zurich, Switzerland',
    category: 'Adventure',
    rating: 5.0,
    reviews: 840,
    price: '$180',
    duration: '45 min flight',
    groupSize: '1-on-1 tandem',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600',
    description: 'Soar over the Swiss Alps with certified pilots. Breathtaking aerial views guaranteed.'
  },
  {
    id: 'a4',
    title: 'Kyoto Kimono & Tea Ceremony',
    location: 'Kyoto, Japan',
    category: 'Culture',
    rating: 4.7,
    reviews: 950,
    price: '$35',
    duration: '2 hours',
    groupSize: 'Private or group',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600',
    description: 'Wear authentic kimono, stroll historic streets, and experience traditional tea ceremony.'
  },
  {
    id: 'a5',
    title: 'Santorini Sunset Catamaran Cruise',
    location: 'Santorini, Greece',
    category: 'Sightseeing',
    rating: 4.9,
    reviews: 2150,
    price: '$95',
    duration: '5 hours',
    groupSize: 'Up to 20',
    image: 'https://images.unsplash.com/photo-1613395877344-13d4c79e4df1?auto=format&fit=crop&q=80&w=600',
    description: 'Sail the caldera, swim in hot springs, and enjoy dinner while watching the famous sunset.'
  },
  {
    id: 'a6',
    title: 'Queenstown Bungee Jump',
    location: 'Queenstown, New Zealand',
    category: 'Adventure',
    rating: 5.0,
    reviews: 1890,
    price: '$195',
    duration: 'Half day',
    groupSize: 'Individual',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=600',
    description: 'The world\'s first commercial bungee site. 43m leap over the Kawarau River.'
  },
  {
    id: 'a7',
    title: 'Florence Cooking Class & Market Tour',
    location: 'Florence, Italy',
    category: 'Culture',
    rating: 4.8,
    reviews: 1560,
    price: '$89',
    duration: '4 hours',
    groupSize: 'Max 12',
    image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&q=80&w=600',
    description: 'Shop local markets with a chef, then cook authentic Tuscan dishes you\'ll enjoy together.'
  },
  {
    id: 'a8',
    title: 'Great Barrier Reef Snorkeling',
    location: 'Cairns, Australia',
    category: 'Adventure',
    rating: 4.9,
    reviews: 3420,
    price: '$145',
    duration: 'Full day',
    groupSize: 'Small boat',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600',
    description: 'Explore vibrant coral reefs, swim with sea turtles, and enjoy a gourmet lunch onboard.'
  }
]

// ─────────────────────────────────────────────────────────────
// 🧩 Reusable Components (Light Theme + Larger Text)
// ─────────────────────────────────────────────────────────────

const CategoryFilter = ({ 
  categories, selected, onSelect 
}: { 
  categories: string[]; selected: string; onSelect: (cat: string) => void 
}) => (
  <div className="flex flex-wrap items-center gap-2">
    {categories.map((cat) => (
      <Button
        key={cat}
        onClick={() => onSelect(cat)}
        variant={selected === cat ? 'default' : 'outline'}
        className={`rounded-xl px-5 py-2.5 text-base font-bold transition-all ${
          selected === cat
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-200/50'
            : 'bg-white border-slate-400 text-slate-900 hover:border-indigo-500 hover:bg-indigo-50'
        }`}
      >
        {cat}
      </Button>
    ))}
  </div>
)

const ActivityCard = ({ activity }: { activity: typeof ACTIVITIES_MOCK[0] }) => {
  const categoryColors: Record<string, string> = {
    Culture: 'bg-purple-100 text-purple-700 border-purple-200',
    Sightseeing: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    Adventure: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  }

  const categoryStyle = categoryColors[activity.category] || 'bg-slate-100 text-slate-700 border-slate-200'

  return (
    <Card className="group cursor-pointer overflow-hidden border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white flex flex-col h-full">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={activity.image} 
          alt={activity.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Category Badge */}
        <span className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${categoryStyle}`}>
          {activity.category}
        </span>
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg bg-white/95 backdrop-blur-sm border border-slate-200 shadow-sm flex items-center gap-1">
          <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
          <span className="text-sm font-bold text-slate-900">{activity.rating}</span>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-5 flex-1 flex flex-col gap-4">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
          <MapPin className="h-4 w-4 text-indigo-500 shrink-0" />
          <span className="text-base font-semibold">{activity.location}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors leading-tight line-clamp-2">
          {activity.title}
        </h3>

        {/* Description */}
        <p className="text-base text-slate-850 leading-relaxed line-clamp-2 font-medium">
          {activity.description}
        </p>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-1.5 text-sm text-slate-900 font-medium">
            <Clock className="h-4 w-4 text-slate-650" />
            <span>{activity.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-900 font-medium">
            <Users className="h-4 w-4 text-slate-650" />
            <span>{activity.groupSize}</span>
          </div>
        </div>

        {/* Footer: Reviews + Price + CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-1 text-sm text-slate-850 font-medium">
            <span className="font-bold text-slate-900">{activity.reviews.toLocaleString()}</span>
            <span>reviews</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-slate-900">{activity.price}</span>
            <Button 
              size="sm" 
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-sm"
              onClick={(e) => {
                e.stopPropagation()
                // Handle booking logic here
              }}
            >
              Book
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────
// 🚀 Main Explore Activities Page Component
// ─────────────────────────────────────────────────────────────

export default function ExploreActivitiesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const categories = ['All', 'Culture', 'Sightseeing', 'Adventure']

  const filtered = ACTIVITIES_MOCK.filter(act => {
    const matchesSearch = act.title.toLowerCase().includes(search.toLowerCase()) || 
                         act.location.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = filter === 'All' || act.category === filter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-12">
      
      {/* 🧭 Header Section */}
      <section className="text-center py-4">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white/95 p-10 shadow-xl shadow-slate-200/50">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-semibold uppercase tracking-wide mb-5">
            <Sparkles className="h-4 w-4" />
            Curated Experiences
          </div>
          
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-slate-900 tracking-tight">
            Explore Amazing Activities 🌍
          </h1>
        
        <p className="text-lg text-slate-900 mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
          Discover handpicked attractions, cultural experiences, and adrenaline-pumping adventures from around the world—all verified and ready to book.
        </p>
        </div>
      </section>

      {/* 🔍 Search & Filter Bar */}
      <Card className="bg-white border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          {/* Category Filters */}
          <CategoryFilter 
            categories={categories} 
            selected={filter} 
            onSelect={setFilter} 
          />
          
          {/* Search Input */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <Input
              placeholder="Search activities or locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-4 bg-white border-slate-350 rounded-xl text-slate-900 placeholder:text-slate-400 text-base py-3 h-12 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>
      </Card>

      {/* 📊 Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-base text-slate-900 font-semibold">
          Showing <span className="font-bold text-slate-950">{filtered.length}</span> activities
          {filter !== 'All' && <span> in <span className="font-bold text-indigo-750">{filter}</span></span>}
          {search && <span> matching "<span className="font-bold text-slate-950">{search}</span>"</span>}
        </p>
        
        {/* Sort dropdown could go here */}
      </div>

      {/* 🎯 Activities Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="bg-slate-50 border-slate-200 rounded-2xl p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Compass className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="font-heading font-semibold text-xl text-slate-900 mb-2">
            No activities found
          </h3>
          <p className="text-base text-slate-800 mb-4">
            Try adjusting your search or filters to discover more experiences.
          </p>
          <Button 
            variant="outline" 
            onClick={() => { setSearch(''); setFilter('All') }}
            className="border-slate-400 text-slate-900 font-bold hover:bg-slate-50"
          >
            Clear Filters
          </Button>
        </Card>
      )}

      {/* 📬 Newsletter CTA (Optional Enhancement) */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-250 rounded-2xl p-6 md:p-8 text-center">
        <Sparkles className="h-8 w-8 text-indigo-650 mx-auto mb-3" />
        <h3 className="font-heading font-bold text-xl text-slate-950 mb-2">
          Want personalized recommendations?
        </h3>
        <p className="text-base text-slate-900 mb-4 max-w-md mx-auto font-semibold">
          Tell us your travel preferences and we'll curate a custom list of activities just for you.
        </p>
        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl">
          Get Personalized Picks
        </Button>
      </Card>

    </div>
  )
}