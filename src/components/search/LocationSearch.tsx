'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, X, Loader2 } from 'lucide-react'

// Hardcoded popular destinations based on the user's screenshot
const POPULAR_DESTINATIONS = [
  { name: 'Vietnam', path: 'Asia' },
  { name: 'Malaysia', path: 'Asia' },
  { name: 'Japan', path: 'Asia' },
  { name: 'Thailand', path: 'Asia' },
  { name: 'Singapore', path: 'Asia' },
  { name: 'Bali', path: 'Asia > Indonesia' },
]

interface SearchResult {
  id: number
  name: string
  admin1?: string
  country?: string
}

export function LocationSearch() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced API search
  useEffect(() => {
    const fetchLocations = async () => {
      if (query.trim().length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`)
        const data = await response.json()
        
        if (data.results) {
          setResults(data.results)
        } else {
          setResults([])
        }
      } catch (error) {
        console.error("Error fetching locations:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchLocations, 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  const clearSearch = () => {
    setQuery('')
    setResults([])
  }

  return (
    <div className="hidden md:flex flex-1 max-w-lg mx-8 relative" ref={dropdownRef}>
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
        <Search className="h-4 w-4 text-zinc-400" />
      </div>
      
      <input 
        type="text" 
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Where do you want to go?" 
        className="w-full bg-white border border-zinc-200 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-zinc-900"
      />

      {query && (
        <button 
          onClick={clearSearch}
          className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600 z-10"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-zinc-100 overflow-hidden z-50">
          
          {query.trim().length === 0 ? (
            /* Empty State: Popular Destinations */
            <div className="p-4">
              <h3 className="text-xs font-semibold text-zinc-400 mb-4 tracking-wider uppercase font-heading">
                Popular Destinations
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {POPULAR_DESTINATIONS.map((dest, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-lg cursor-pointer transition-colors group">
                    <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-zinc-200 transition-colors">
                      <MapPin className="h-5 w-5 text-zinc-700" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{dest.name}</p>
                      <p className="text-xs text-zinc-500">{dest.path}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Search Results State */
            <div className="py-2">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-zinc-400">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-sm">Searching...</span>
                </div>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-2 p-2 gap-2">
                  {results.map((result) => {
                    // Construct a path string similar to the screenshot: Asia > India > Rajasthan
                    const pathParts = []
                    if (result.country) pathParts.push(result.country)
                    if (result.admin1 && result.admin1 !== result.name) pathParts.push(result.admin1)
                    const path = pathParts.join(' > ')

                    return (
                      <div key={result.id} className="flex items-center gap-3 p-3 hover:bg-zinc-50 rounded-lg cursor-pointer transition-colors">
                        <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-zinc-100 flex items-center justify-center">
                          {/* Use a map pin as placeholder for the image since we don't have dynamic images for every city */}
                          <MapPin className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-semibold text-zinc-900 truncate">{result.name}</p>
                          <p className="text-xs text-zinc-500 truncate">{path || 'Unknown Region'}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-zinc-500 py-8">
                  No destinations found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
