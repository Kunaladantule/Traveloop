// app/dashboard/discover/page.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Search, Globe, MapPin, Star, Compass,
  Utensils, Sparkles, ArrowRight, DollarSign
} from 'lucide-react'
import { getGooglePlaceSuggestions, getGooglePlacesForCity, PlacePrediction, GooglePlaceInfo } from '@/app/actions/googlePlaces'

// ─────────────────────────────────────────────────────────────
// Shared Neumorphic tokens
// ─────────────────────────────────────────────────────────────
const NEU = {
  BG: '#EAEFF5',
  raised: '8px 8px 16px rgba(163,177,198,.45), -8px -8px 16px rgba(255,255,255,.85)',
  hover:  '12px 12px 24px rgba(163,177,198,.35), -12px -12px 24px rgba(255,255,255,.9)',
  pressed:'inset 4px 4px 8px rgba(163,177,198,.45), inset -4px -4px 8px rgba(255,255,255,.85)',
  input:  'inset 3px 3px 8px rgba(163,177,198,.35), inset -3px -3px 8px rgba(255,255,255,.85)',
}

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────
const POPULAR_DESTINATIONS = [
  { name: 'Paris, France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600', desc: 'The City of Light, famous for the Eiffel Tower, the Louvre Museum, and historic cafes.', highlight: 'Romance & Culture' },
  { name: 'Tokyo, Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=600', desc: "Futuristic neon-lit skyscrapers, ancient shrines, and the world's best local food spots.", highlight: 'Tech & Tradition' },
  { name: 'Rome, Italy', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=600', desc: 'Step into ancient history with the Colosseum, Vatican museums, and incredible gelato.', highlight: 'History & Food' },
  { name: 'New York, USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=600', desc: 'The city that never sleeps, boasting Times Square, Broadway, and beautiful Central Park.', highlight: 'Energy & Arts' },
  { name: 'Bali, Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600', desc: 'Tropical surf beaches, ancient temples, wellness retreats, and lush volcanic forests.', highlight: 'Nature & Wellness' },
  { name: 'Dubai, UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=600', desc: 'Ultra-luxury skyscrapers, desert dunes, grand shopping malls, and pristine artificial islands.', highlight: 'Luxury & Adventure' },
]

// ─────────────────────────────────────────────────────────────
// Destination Card
// ─────────────────────────────────────────────────────────────
const DestinationCard = ({ dest, onClick }: { dest: typeof POPULAR_DESTINATIONS[0]; onClick: () => void }) => (
  <div
    onClick={onClick}
    style={{
      background: NEU.BG, borderRadius: 24, boxShadow: NEU.raised, border: 'none',
      overflow: 'hidden', cursor: 'pointer', transition: 'all .3s ease',
    }}
    onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-6px)'; el.style.boxShadow = NEU.hover }}
    onMouseLeave={e => { const el = e.currentTarget; el.style.transform = 'translateY(0)'; el.style.boxShadow = NEU.raised }}
  >
    <div style={{ position: 'relative', height: 200, padding: 10 }}>
      <div style={{ width: '100%', height: '100%', borderRadius: 18, overflow: 'hidden', boxShadow: NEU.pressed, position: 'relative' }}>
        <img src={dest.image} alt={dest.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.5) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: 14, left: 14 }}>
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#fff', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,.3)' }}>{dest.name}</h3>
        </div>
      </div>
      <div style={{
        position: 'absolute', top: 20, left: 20, padding: '5px 14px', borderRadius: 999,
        background: 'rgba(255,255,255,.7)', backdropFilter: 'blur(8px)',
        boxShadow: '4px 4px 10px rgba(163,177,198,.3), -4px -4px 10px rgba(255,255,255,.7)',
        fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6C63FF',
        fontFamily: 'Inter, sans-serif',
      }}>{dest.highlight}</div>
    </div>
    <div style={{ padding: '6px 18px 18px' }}>
      <p style={{ fontSize: '0.85rem', color: '#94A3B8', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '0 0 12px' }}>{dest.desc}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6C63FF', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'Inter, sans-serif' }}>
        Explore this destination <ArrowRight size={14} />
      </div>
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────
// Place Card
// ─────────────────────────────────────────────────────────────
const PlaceCard = ({ place }: { place: GooglePlaceInfo }) => {
  const defaultImage = place.isMeal
    ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400'
    : 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=400'
  const imageUrl = place.photoUrl || defaultImage
  const category = place.types?.[0]?.replace('_', ' ') || (place.isMeal ? 'Restaurant' : 'Attraction')

  return (
    <div
      style={{
        background: NEU.BG, borderRadius: 24, boxShadow: NEU.raised, border: 'none',
        overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%',
        transition: 'all .3s ease',
      }}
      onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = NEU.hover }}
      onMouseLeave={e => { const el = e.currentTarget; el.style.transform = 'translateY(0)'; el.style.boxShadow = NEU.raised }}
    >
      <div style={{ position: 'relative', height: 180, padding: 10 }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 18, overflow: 'hidden', boxShadow: NEU.pressed, position: 'relative' }}>
          <img src={imageUrl} alt={place.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" onError={e => { e.currentTarget.src = defaultImage }} />
        </div>
        {place.rating && (
          <div style={{
            position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 12px', borderRadius: 12,
            background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(10px)',
            boxShadow: '4px 4px 10px rgba(163,177,198,.3), -4px -4px 10px rgba(255,255,255,.7)',
          }}>
            <Star size={12} color="#F59E0B" style={{ fill: '#F59E0B' }} />
            <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#1E293B', fontFamily: 'Inter, sans-serif' }}>{place.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <div style={{ padding: '6px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{
          display: 'inline-flex', alignSelf: 'flex-start',
          padding: '4px 12px', borderRadius: 999,
          background: NEU.BG, boxShadow: NEU.pressed,
          fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6C63FF',
          fontFamily: 'Inter, sans-serif',
        }}>{category}</div>
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1E293B', margin: 0, lineHeight: 1.3 }}>{place.name}</h3>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 2 }}>
          <MapPin size={14} color="#6C63FF" style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontFamily: 'Inter, sans-serif', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{place.address}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 'auto', paddingTop: 10, borderTop: '1px solid rgba(163,177,198,.2)' }}>
          {place.priceLevel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
              <DollarSign size={13} color="#94A3B8" /> {'💰'.repeat(place.priceLevel)}
            </div>
          )}
          {place.openNow !== undefined && (
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: place.openNow ? '#22C55E' : '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
              {place.openNow ? '● Open now' : '○ Closed'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Main Page
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

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) setShowSuggestions(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearchChange = async (val: string) => {
    setSearch(val); setShowSuggestions(true)
    if (val.trim().length > 1) {
      try { const r = await getGooglePlaceSuggestions(val); setSuggestions(r.success ? r.predictions : []) } catch { setSuggestions([]) }
    } else setSuggestions([])
  }

  const handleSelectSuggestion = async (desc: string) => {
    setSearch(desc); setSelectedDestination(desc); setShowSuggestions(false); setLoading(true); setHasSearched(true)
    try { setPlaces(await getGooglePlacesForCity(desc)) } catch { /* no-op */ } finally { setLoading(false) }
  }

  const attractions = places.filter(p => !p.isMeal)
  const restaurants = places.filter(p => p.isMeal)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>

      {/* Hero */}
      <section style={{ textAlign: 'center', paddingTop: 8 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', background: NEU.BG, borderRadius: 32, boxShadow: NEU.raised, padding: '2.5rem 3rem', border: 'none' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 18px', borderRadius: 999,
            background: NEU.BG, boxShadow: NEU.raised,
            fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6C63FF',
            marginBottom: 20, fontFamily: 'Inter, sans-serif',
          }}>
            <Globe size={14} /> Explore the World
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#1E293B', margin: '0 0 12px' }}>
            Discover Your Next Adventure ✈️
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748B', fontFamily: 'Inter, sans-serif', lineHeight: 1.7, maxWidth: 580, margin: '0 auto' }}>
            Search any city or country to find top attractions, hidden gems, and the best local dining — all powered by Google Places.
          </p>
        </div>
      </section>

      {/* Search */}
      <section style={{ position: 'relative', maxWidth: 640, width: '100%', margin: '0 auto', zIndex: 40 }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#6C63FF', pointerEvents: 'none', zIndex: 1 }} />
          <input
            placeholder="Search any city, country, or landmark..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            style={{
              width: '100%', paddingLeft: 50, paddingRight: 18, paddingTop: 16, paddingBottom: 16,
              background: NEU.BG, borderRadius: 20, border: 'none', outline: 'none',
              fontSize: '1rem', color: '#1E293B', fontFamily: 'Inter, sans-serif',
              boxShadow: NEU.input,
            }}
          />
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div ref={suggestionsRef} style={{ position: 'absolute', top: 'calc(100% + 10px)', left: 0, right: 0, zIndex: 50, background: NEU.BG, borderRadius: 20, boxShadow: NEU.hover, border: 'none', overflow: 'hidden', maxHeight: 280, overflowY: 'auto' }} className="custom-scrollbar">
            {suggestions.map(item => (
              <button
                key={item.placeId}
                type="button"
                onClick={() => handleSelectSuggestion(item.description)}
                style={{
                  width: '100%', textAlign: 'left', padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12, transition: 'background .15s ease', fontFamily: 'Inter, sans-serif',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(108,99,255,.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <MapPin size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9rem' }}>{item.mainText}</div>
                  {item.secondaryText && <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{item.secondaryText}</div>}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '30vh', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 20, background: NEU.BG, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Compass size={24} color="#6C63FF" style={{ animation: 'spin 1.5s linear infinite' }} />
          </div>
          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>Finding amazing places for you...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Default: Popular Destinations */}
      {!loading && !hasSearched && (
        <section>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.3rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <Sparkles size={20} color="#6C63FF" /> 🔥 Trending Destinations Worldwide
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {POPULAR_DESTINATIONS.map((d, i) => <DestinationCard key={i} dest={d} onClick={() => handleSelectSuggestion(d.name)} />)}
          </div>
        </section>
      )}

      {/* Search Results */}
      {!loading && hasSearched && selectedDestination && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

          {/* Banner */}
          <div style={{ background: NEU.BG, borderRadius: 28, boxShadow: NEU.raised, padding: '1.75rem 2.25rem', border: 'none', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 20, background: NEU.BG, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={24} color="#6C63FF" />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6C63FF', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>📍 Selected Destination</div>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#1E293B', margin: 0 }}>{selectedDestination}</h2>
              </div>
            </div>
            <button
              className="neu-btn-primary"
              onClick={() => { window.location.href = `/dashboard/ai-planner?destination=${encodeURIComponent(selectedDestination)}` }}
              style={{ padding: '12px 24px' }}
            >
              <Sparkles size={16} /> Plan AI Itinerary <ArrowRight size={16} />
            </button>
          </div>

          {/* Attractions */}
          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Compass size={20} color="#6C63FF" /> Top Attractions & Sightseeing
            </h2>
            {attractions.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                {attractions.map((p, i) => <PlaceCard key={`${p.name}-${i}`} place={p} />)}
              </div>
            ) : (
              <div style={{ background: NEU.BG, borderRadius: 24, boxShadow: NEU.raised, padding: '2.5rem 2rem', textAlign: 'center', border: 'none' }}>
                <Compass size={40} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#64748B', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem' }}>No attractions found. Try a major city!</p>
              </div>
            )}
          </section>

          {/* Restaurants */}
          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Utensils size={20} color="#F59E0B" /> Recommended Cafes & Restaurants
            </h2>
            {restaurants.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                {restaurants.map((p, i) => <PlaceCard key={`${p.name}-${i}`} place={p} />)}
              </div>
            ) : (
              <div style={{ background: NEU.BG, borderRadius: 24, boxShadow: NEU.raised, padding: '2.5rem 2rem', textAlign: 'center', border: 'none' }}>
                <Utensils size={40} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#64748B', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem' }}>No dining spots found. Try a popular tourist destination!</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}