// app/dashboard/discover/page.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  Search, Globe, MapPin, Star, ChevronRight, Compass, 
  Utensils, Sparkles, ArrowRight, Clock, DollarSign 
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getGooglePlaceSuggestions, getGooglePlacesForCity, PlacePrediction, GooglePlaceInfo } from '@/app/actions/googlePlaces'

// ─────────────────────────────────────────────────────────────
// 🎨 Popular Destinations Data
// ─────────────────────────────────────────────────────────────
const POPULAR_DESTINATIONS = [
  {
    name: 'Paris, France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600',
    desc: 'The City of Light, famous for the Eiffel Tower, the Louvre Museum, and historic cafes.',
    highlight: 'Romance & Culture'
  },
  {
    name: 'Tokyo, Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=600',
    desc: 'Futuristic neon-lit skyscrapers, ancient shrines, and the world\'s best local food spots.',
    highlight: 'Tech & Tradition'
  },
  {
    name: 'Rome, Italy',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=600',
    desc: 'Step into ancient history with the Colosseum, Vatican museums, and incredible gelato.',
    highlight: 'History & Food'
  },
  {
    name: 'New York, USA',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=600',
    desc: 'The city that never sleeps, boasting Times Square, Broadway, and beautiful Central Park.',
    highlight: 'Energy & Arts'
  },
  {
    name: 'Bali, Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600',
    desc: 'Tropical surf beaches, ancient temples, wellness retreats, and lush volcanic forests.',
    highlight: 'Nature & Wellness'
  },
  {
    name: 'Dubai, UAE',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=600',
    desc: 'Ultra-luxury skyscrapers, desert dunes, grand shopping malls, and pristine artificial islands.',
    highlight: 'Luxury & Adventure'
  }
]

// ─────────────────────────────────────────────────────────────
// 🧩 Reusable Components (Light Theme + Larger Text)
// ─────────────────────────────────────────────────────────────

const DestinationCard = ({ 
  dest, onClick 
}: { 
  dest: typeof POPULAR_DESTINATIONS[0]; onClick: () => void 
}) => (
  <Card 
    onClick={onClick}
    className="group cursor-pointer overflow-hidden border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white"
  >
    {/* Image Section */}
    <div className="relative h-44 overflow-hidden">
      <img 
        src={dest.image} 
        alt={dest.name} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
      
      {/* Highlight Badge */}
      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 shadow-sm">
        <span className="text-xs font-semibold text-indigo-700">{dest.highlight}</span>
      </div>
      
      {/* Title Overlay */}
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-xl font-bold text-white drop-shadow-sm group-hover:text-indigo-100 transition-colors">
          {dest.name}
        </h3>
      </div>
    </div>

    {/* Content Section */}
    <CardContent className="p-5">
      <p className="text-base text-slate-850 leading-relaxed line-clamp-2">
        {dest.desc}
      </p>
      <div className="mt-4 flex items-center gap-1.5 text-indigo-600 font-semibold group-hover:gap-2 transition-all">
        <span className="text-base">Explore this destination</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </CardContent>
  </Card>
)

const PlaceCard = ({ place }: { place: GooglePlaceInfo }) => {
  const defaultImage = place.isMeal
    ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400'
    : 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=400'

  const imageUrl = place.photoUrl || defaultImage
  const category = place.types?.[0]?.replace('_', ' ') || (place.isMeal ? 'Restaurant' : 'Attraction')

  return (
    <Card className="group overflow-hidden border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 bg-white flex flex-col h-full">
      {/* Image Header */}
      <div className="relative h-40 overflow-hidden bg-slate-100">
        <img 
          src={imageUrl} 
          alt={place.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = defaultImage }}
        />
        
        {/* Rating Badge */}
        {place.rating && (
          <div className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg bg-white/95 backdrop-blur-sm border border-slate-200 shadow-sm flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
            <span className="text-sm font-bold text-slate-900">{place.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="flex-1 p-5 flex flex-col gap-3">
        {/* Category Tag */}
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wide w-fit">
          {category}
        </span>
        
        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors leading-tight">
          {place.name}
        </h3>
        
        {/* Address */}
        <div className="flex items-start gap-2 text-slate-800">
          <MapPin className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
          <span className="text-base leading-relaxed line-clamp-2">{place.address}</span>
        </div>

        {/* Additional Info (if available) */}
        <div className="flex items-center gap-4 mt-auto pt-3 border-t border-slate-100">
          {place.priceLevel && (
            <div className="flex items-center gap-1 text-sm text-slate-800">
              <DollarSign className="h-4 w-4 text-slate-400" />
              <span>{'💰'.repeat(place.priceLevel)}</span>
            </div>
          )}
          {place.openNow !== undefined && (
            <span className={`text-sm font-medium ${place.openNow ? 'text-emerald-600' : 'text-slate-400'}`}>
              {place.openNow ? '● Open now' : '○ Closed'}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const SearchSuggestions = ({ 
  suggestions, onSelect, suggestionsRef 
}: { 
  suggestions: PlacePrediction[]; 
  onSelect: (desc: string) => void; 
  suggestionsRef: React.RefObject<HTMLDivElement | null> 
}) => (
  <div 
    ref={suggestionsRef} 
    className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xl z-50 max-h-72 overflow-y-auto"
  >
    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
      <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide flex items-center gap-1.5">
        <Search className="h-3.5 w-3.5" />
        Search Results
      </span>
    </div>
    {suggestions.map((item) => (
      <button
        key={item.placeId}
        type="button"
        onClick={() => onSelect(item.description)}
        className="w-full text-left px-5 py-4 hover:bg-indigo-50 text-slate-900 border-b border-slate-100 last:border-0 transition-colors flex items-center gap-3"
      >
        <MapPin className="h-5 w-5 text-indigo-500 shrink-0" />
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 text-base">{item.mainText}</span>
          {item.secondaryText && <span className="text-sm text-slate-750">{item.secondaryText}</span>}
        </div>
      </button>
    ))}
  </div>
)

// ─────────────────────────────────────────────────────────────
// 🚀 Main Discover Destinations Page Component
// ─────────────────────────────────────────────────────────────

export default function DiscoverDestinationPage() {
  const [search, setSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([])
  
  const [selectedDestination, setSelectedDestination] = useState('')
  const [places, setPlaces] = useState<GooglePlaceInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Close suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchChange = async (val: string) => {
    setSearch(val)
    setShowSuggestions(true)
    if (val.trim().length > 1) {
      try {
        const res = await getGooglePlaceSuggestions(val)
        if (res.success) {
          setSuggestions(res.predictions)
        } else {
          setSuggestions([])
        }
      } catch (e) {
        console.error(e)
        setSuggestions([])
      }
    } else {
      setSuggestions([])
    }
  }

  const handleSelectSuggestion = async (desc: string) => {
    setSearch(desc)
    setSelectedDestination(desc)
    setShowSuggestions(false)
    setLoading(true)
    setHasSearched(true)
    try {
      const results = await getGooglePlacesForCity(desc)
      setPlaces(results)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const attractions = places.filter(p => !p.isMeal)
  const restaurants = places.filter(p => p.isMeal)

  const handlePlanTrip = () => {
    if (!selectedDestination) return
    window.location.href = `/dashboard/ai-planner?destination=${encodeURIComponent(selectedDestination)}`
  }

  return (
    <div className="flex flex-col gap-12 max-w-7xl mx-auto pb-16">
      
      {/* 🌍 Header Section */}
      <section className="text-center py-6">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white/95 p-10 shadow-xl shadow-slate-200/50">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-semibold uppercase tracking-wide mb-5">
            <Globe className="h-4 w-4" />
            Explore the World
          </div>
          
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-slate-900 tracking-tight">
            Discover Your Next Adventure ✈️
          </h1>
        
        <p className="text-lg text-slate-900 mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
          Search any city or country to find top attractions, hidden gems, and the best local dining experiences—all powered by Google Places.
        </p>
        </div>
      </section>

      {/* 🔍 Search Bar */}
      <section className="relative w-full max-w-2xl mx-auto z-40">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
          <Input
            placeholder="Search any city, country, or landmark..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            className="pl-12 pr-4 bg-white border-slate-300 rounded-2xl text-slate-900 placeholder:text-slate-400 text-lg py-4 h-14 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 shadow-sm"
          />
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <SearchSuggestions 
            suggestions={suggestions} 
            onSelect={handleSelectSuggestion} 
            suggestionsRef={suggestionsRef} 
          />
        )}
      </section>

      {/* 🎯 Main Content Area */}
      {loading && (
        <div className="flex flex-col justify-center items-center py-20 min-h-[40vh] gap-5">
          <div className="w-14 h-14 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="text-lg text-slate-900 font-bold">Finding amazing places for you...</p>
        </div>
      )}

      {/* 🏠 Initial State: Popular Destinations */}
      {!loading && !hasSearched && (
        <div className="flex flex-col gap-12">

          {/* Popular Destinations Grid */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-indigo-600" />
              <h2 className="font-heading font-bold text-2xl text-slate-900">
                🔥 Trending Destinations Worldwide
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {POPULAR_DESTINATIONS.map((dest, index) => (
                <DestinationCard 
                  key={index} 
                  dest={dest} 
                  onClick={() => handleSelectSuggestion(dest.name)} 
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* 📍 Search Results: Destination Details */}
      {!loading && hasSearched && selectedDestination && (
        <div className="flex flex-col gap-12">
          
          {/* Destination Header Banner */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">📍 Selected Destination</span>
                  <h2 className="font-heading font-bold text-3xl text-slate-900 leading-tight">
                    {selectedDestination}
                  </h2>
                </div>
              </div>
              
              <Button
                onClick={handlePlanTrip}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-md shadow-indigo-200/50 hover:shadow-lg flex items-center gap-2 transition-all"
              >
                <Sparkles className="h-5 w-5" />
                Plan AI Itinerary
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* 🏛️ Attractions Section */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <Compass className="h-6 w-6 text-indigo-600" />
              <h2 className="font-heading font-bold text-2xl text-slate-900">
                Top Attractions & Sightseeing
              </h2>
            </div>
            
            {attractions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {attractions.map((place, idx) => (
                  <PlaceCard key={`${place.name}-${idx}`} place={place} />
                ))}
              </div>
            ) : (
              <Card className="bg-slate-50 border-slate-200 rounded-2xl p-8 text-center">
                <Compass className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-lg text-slate-900 font-semibold">
                  No attractions found for this location. Try searching for a major city!
                </p>
              </Card>
            )}
          </section>

          {/* 🍽️ Restaurants Section */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <Utensils className="h-6 w-6 text-amber-600" />
              <h2 className="font-heading font-bold text-2xl text-slate-900">
                Recommended Cafes & Restaurants
              </h2>
            </div>
            
            {restaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((place, idx) => (
                  <PlaceCard key={`${place.name}-${idx}`} place={place} />
                ))}
              </div>
            ) : (
              <Card className="bg-slate-50 border-slate-200 rounded-2xl p-8 text-center">
                <Utensils className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-lg text-slate-900 font-semibold">
                  No dining spots found for this location. Try a popular tourist destination!
                </p>
              </Card>
            )}
          </section>

        </div>
      )}

    </div>
  )
}