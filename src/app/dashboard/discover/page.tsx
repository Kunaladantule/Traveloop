'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, Globe, MapPin, Star, ChevronRight, Compass, Utensils, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getGooglePlaceSuggestions, getGooglePlacesForCity, PlacePrediction, GooglePlaceInfo } from '@/app/actions/googlePlaces'

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
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-10">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-950 pb-6">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-zinc-100 flex items-center gap-2">
            <Globe className="h-7 w-7 text-indigo-400" />
            Discover Destinations
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Explore real attractions and top cafes anywhere in the world using live Google Places data.</p>
        </div>
      </div>

      {/* Dynamic Search Autocomplete Container */}
      <div className="relative w-full max-w-lg z-50">
        <label className="text-xs font-black text-zinc-350 uppercase tracking-wider block mb-2">Search Destination</label>
        <div className="relative bg-zinc-950/20 border border-zinc-900 p-2 rounded-2xl backdrop-blur-md">
          <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-500" />
          <Input
            placeholder="Search any global city or country..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            className="pl-11 pr-4 bg-zinc-950/40 border-zinc-900 rounded-xl focus:border-indigo-500 text-sm w-full py-5.5 text-zinc-100"
          />
        </div>

        {/* Suggestions Autocomplete Panel */}
        {showSuggestions && suggestions.length > 0 && (
          <div ref={suggestionsRef} className="absolute top-[calc(100%+6px)] inset-x-0 bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-2xl z-50 max-h-60 overflow-y-auto">
            {suggestions.map((item) => (
              <button
                key={item.placeId}
                type="button"
                onClick={() => handleSelectSuggestion(item.description)}
                className="w-full text-left px-4 py-3 hover:bg-indigo-650/20 text-xs text-zinc-200 border-b border-zinc-900 last:border-0 transition-colors flex items-center gap-2.5"
              >
                <MapPin className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-bold text-zinc-100">{item.mainText}</span>
                  {item.secondaryText && <span className="text-[10px] text-zinc-500">{item.secondaryText}</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading && (
        <div className="flex flex-col justify-center items-center py-20 min-h-[40vh] gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-zinc-400 text-xs font-semibold">Consulting Google Places database...</p>
        </div>
      )}

      {!loading && !hasSearched && (
        <div className="border border-zinc-900 rounded-3xl bg-zinc-950/30 p-12 min-h-[300px] flex flex-col justify-center items-center text-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center">
            <Compass className="h-6 w-6 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-zinc-200 font-bold text-lg">Search a Destination</h3>
            <p className="text-zinc-500 text-xs mt-1 max-w-sm">Enter any city or country in the search bar above to fetch live points of interest, tourist attractions, and dining locations.</p>
          </div>
        </div>
      )}

      {!loading && hasSearched && (
        <div className="flex flex-col gap-10">
          
          {/* Destination Header Banner */}
          <div className="relative rounded-3xl overflow-hidden border border-indigo-500/10 bg-zinc-900/80 p-6 backdrop-blur-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-650/20 border border-indigo-400/30 flex items-center justify-center">
                <MapPin className="h-7 w-7 text-indigo-400" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black text-indigo-400 tracking-widest uppercase">📍 MAPPED REGION</span>
                <h2 className="text-xl font-black text-zinc-100 leading-none">{selectedDestination}</h2>
              </div>
            </div>
            <Button
              onClick={handlePlanTrip}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-4 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.25)]"
            >
              <Sparkles className="h-4 w-4" />
              Plan AI Itinerary
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          {/* SIGHTSEEING & SIGHTS */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-zinc-950 pb-2">
              <Compass className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-black text-zinc-100">Top Attractions & Sightseeing</h2>
            </div>
            
            {attractions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {attractions.map((place) => (
                  <PlaceCard key={place.name} place={place} />
                ))}
              </div>
            ) : (
              <p className="text-zinc-550 text-xs italic">No attraction hotspots found for this location.</p>
            )}
          </div>

          {/* DINING & CAFES */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-zinc-950 pb-2">
              <Utensils className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-black text-zinc-100">Recommended Cafes & Restaurants</h2>
            </div>
            
            {restaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((place) => (
                  <PlaceCard key={place.name} place={place} />
                ))}
              </div>
            ) : (
              <p className="text-zinc-550 text-xs italic">No dining listings found for this location.</p>
            )}
          </div>

        </div>
      )}

    </div>
  )
}

function PlaceCard({ place }: { place: GooglePlaceInfo }) {
  // Use place photoUrl if available, otherwise default to a high-quality fallback travel image
  const defaultImage = place.isMeal
    ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400'
    : 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=400'

  const imageUrl = place.photoUrl || defaultImage

  return (
    <Card className="bg-zinc-950/40 border-zinc-900 overflow-hidden relative group hover:border-indigo-500/20 transition-all duration-300 flex flex-col h-full shadow-lg">
      <div className="w-full h-44 relative overflow-hidden bg-zinc-900">
        <img 
          src={imageUrl} 
          alt={place.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          onError={(e) => {
            // fallback if google place photo link fails
            e.currentTarget.src = defaultImage
          }}
        />
        <div className="absolute top-3 right-3 bg-zinc-950/80 border border-zinc-800/80 px-2 py-1 rounded-lg text-[9px] font-bold text-amber-400 flex items-center gap-0.5">
          <Star className="h-3 w-3 fill-current" />
          {place.rating.toFixed(1)}
        </div>
      </div>
      <CardContent className="flex-1 p-5 flex flex-col justify-between gap-4 bg-zinc-950/10">
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-black text-indigo-400 tracking-widest uppercase">
            {place.types && place.types.length > 0 
              ? place.types[0].replace('_', ' ') 
              : (place.isMeal ? 'Restaurant' : 'Attraction')}
          </span>
          <h3 className="text-sm font-extrabold text-zinc-150 group-hover:text-indigo-300 transition-colors leading-snug">{place.name}</h3>
          
          <div className="flex items-start gap-1 text-[10px] text-zinc-500 mt-1 leading-normal">
            <MapPin className="h-3.5 w-3.5 text-zinc-650 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{place.address}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
