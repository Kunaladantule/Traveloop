// app/dashboard/explore/page.tsx
'use client'

import React, { useState } from 'react'
import { Search, Compass, Star, MapPin, Sparkles, ArrowRight, Clock, Users, Globe } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// 3-Level Elevation Tokens
// ─────────────────────────────────────────────────────────────
const NEU = {
  PAGE:    '#E8EDF4',
  SECTION: '#EEF2F7',
  CARD:    '#F8FAFC',
  raised:  '8px 8px 18px rgba(163,177,198,.18), -8px -8px 18px rgba(255,255,255,.9)',
  hover:   '10px 10px 22px rgba(163,177,198,.15), -10px -10px 22px rgba(255,255,255,.95)',
  pressed: 'inset 4px 4px 8px rgba(163,177,198,.2), inset -4px -4px 8px rgba(255,255,255,.9)',
  input:   'inset 3px 3px 6px rgba(163,177,198,.15), inset -3px -3px 6px rgba(255,255,255,.9)',
}

// ─────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────
const ACTIVITIES_MOCK = [
  { id: 'a1', title: 'Shibuya Sky Observatory', location: 'Tokyo, Japan', category: 'Sightseeing', rating: 4.8, reviews: 1240, price: '$22', duration: '2-3 hours', groupSize: 'Up to 15', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=600', description: '360° panoramic views of Tokyo from 230m high. Perfect for sunset photography.' },
  { id: 'a2', title: 'Louvre Guided Art Tour', location: 'Paris, France', category: 'Culture', rating: 4.9, reviews: 3280, price: '$45', duration: '3 hours', groupSize: 'Small group', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=600', description: 'Skip-the-line access with expert guide. See the Mona Lisa, Venus de Milo & more.' },
  { id: 'a3', title: 'Interlaken Glacier Paragliding', location: 'Zurich, Switzerland', category: 'Adventure', rating: 5.0, reviews: 840, price: '$180', duration: '45 min flight', groupSize: '1-on-1 tandem', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600', description: 'Soar over the Swiss Alps with certified pilots. Breathtaking aerial views guaranteed.' },
  { id: 'a4', title: 'Kyoto Kimono & Tea Ceremony', location: 'Kyoto, Japan', category: 'Culture', rating: 4.7, reviews: 950, price: '$35', duration: '2 hours', groupSize: 'Private or group', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600', description: 'Wear authentic kimono, stroll historic streets, and experience traditional tea ceremony.' },
  { id: 'a5', title: 'Santorini Sunset Catamaran Cruise', location: 'Santorini, Greece', category: 'Sightseeing', rating: 4.9, reviews: 2150, price: '$95', duration: '5 hours', groupSize: 'Up to 20', image: 'https://images.unsplash.com/photo-1613395877344-13d4c79e4df1?auto=format&fit=crop&q=80&w=600', description: 'Sail the caldera, swim in hot springs, and enjoy dinner while watching the famous sunset.' },
  { id: 'a6', title: 'Queenstown Bungee Jump', location: 'Queenstown, New Zealand', category: 'Adventure', rating: 5.0, reviews: 1890, price: '$195', duration: 'Half day', groupSize: 'Individual', image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=600', description: "The world's first commercial bungee site. 43m leap over the Kawarau River." },
  { id: 'a7', title: 'Florence Cooking Class & Market Tour', location: 'Florence, Italy', category: 'Culture', rating: 4.8, reviews: 1560, price: '$89', duration: '4 hours', groupSize: 'Max 12', image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&q=80&w=600', description: "Shop local markets with a chef, then cook authentic Tuscan dishes you'll enjoy together." },
  { id: 'a8', title: 'Great Barrier Reef Snorkeling', location: 'Cairns, Australia', category: 'Adventure', rating: 4.9, reviews: 3420, price: '$145', duration: 'Full day', groupSize: 'Small boat', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600', description: 'Explore vibrant coral reefs, swim with sea turtles, and enjoy a gourmet lunch onboard.' },
]

// ─────────────────────────────────────────────────────────────
// Category Filter
// ─────────────────────────────────────────────────────────────
const CategoryFilter = ({ categories, selected, onSelect }: { categories: string[]; selected: string; onSelect: (c: string) => void }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
    {categories.map(cat => (
      <button
        key={cat}
        onClick={() => onSelect(cat)}
        style={{
          padding: '10px 20px', borderRadius: 14, border: 'none', cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.85rem',
          background: selected === cat ? 'linear-gradient(135deg, #6C63FF, #8B5CF6)' : NEU.CARD,
          color: selected === cat ? '#fff' : '#334155',
          boxShadow: selected === cat ? '4px 4px 10px rgba(108,99,255,.3), -2px -2px 6px rgba(255,255,255,.5)' : NEU.raised,
          transition: 'all .3s ease',
          transform: selected === cat ? 'scale(.97)' : 'scale(1)',
        }}
      >
        {cat}
      </button>
    ))}
  </div>
)

// ─────────────────────────────────────────────────────────────
// Activity Card
// ─────────────────────────────────────────────────────────────
const ActivityCard = ({ activity }: { activity: typeof ACTIVITIES_MOCK[0] }) => (
  <div
    style={{
      background: NEU.CARD, borderRadius: 28, boxShadow: NEU.raised, border: 'none',
      overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%',
      cursor: 'pointer', transition: 'all .3s ease',
    }}
    onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-6px)'; el.style.boxShadow = NEU.hover }}
    onMouseLeave={e => { const el = e.currentTarget; el.style.transform = 'translateY(0)'; el.style.boxShadow = NEU.raised }}
  >
    {/* Image */}
    <div style={{ position: 'relative', height: 200, padding: 10 }}>
      <div style={{ width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden', boxShadow: NEU.pressed, position: 'relative' }}>
        <img src={activity.image} alt={activity.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.3) 0%, transparent 50%)' }} />
      </div>

      {/* Category chip */}
      <div style={{
        position: 'absolute', top: 20, left: 20, padding: '5px 14px', borderRadius: 999,
        background: 'rgba(248,250,252,.8)', backdropFilter: 'blur(8px)',
        boxShadow: '4px 4px 10px rgba(163,177,198,.2), -4px -4px 10px rgba(255,255,255,.7)',
        fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: activity.category === 'Adventure' ? '#059669' : activity.category === 'Culture' ? '#7C3AED' : '#6C63FF',
        fontFamily: 'Inter, sans-serif',
      }}>{activity.category}</div>

      {/* Rating badge */}
      <div style={{
        position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: 4,
        padding: '5px 12px', borderRadius: 12,
        background: 'rgba(248,250,252,.8)', backdropFilter: 'blur(8px)',
        boxShadow: '4px 4px 10px rgba(163,177,198,.2), -4px -4px 10px rgba(255,255,255,.7)',
      }}>
        <Star size={12} color="#F59E0B" style={{ fill: '#F59E0B' }} />
        <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#1E293B', fontFamily: 'Inter, sans-serif' }}>{activity.rating}</span>
      </div>
    </div>

    {/* Content */}
    <div style={{ padding: '6px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <MapPin size={14} color="#6C63FF" />
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{activity.location}</span>
      </div>

      <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#1E293B', margin: 0, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {activity.title}
      </h3>

      <p style={{ fontSize: '0.82rem', color: '#94A3B8', fontFamily: 'Inter, sans-serif', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
        {activity.description}
      </p>

      {/* Meta */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#64748B', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
          <Clock size={13} color="#94A3B8" /> {activity.duration}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#64748B', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
          <Users size={13} color="#94A3B8" /> {activity.groupSize}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(163,177,198,.15)' }}>
        <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
          <strong style={{ color: '#334155' }}>{activity.reviews.toLocaleString()}</strong> reviews
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: '#1E293B' }}>{activity.price}</span>
          <button
            className="neu-btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.78rem', borderRadius: 12 }}
            onClick={e => e.stopPropagation()}
          >
            Book <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────
// Main Explore Page
// ─────────────────────────────────────────────────────────────
export default function ExploreActivitiesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const categories = ['All', 'Culture', 'Sightseeing', 'Adventure']

  const filtered = ACTIVITIES_MOCK.filter(act => {
    const s = act.title.toLowerCase().includes(search.toLowerCase()) || act.location.toLowerCase().includes(search.toLowerCase())
    const c = filter === 'All' || act.category === filter
    return s && c
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36, maxWidth: 1200, margin: '0 auto', paddingBottom: 48 }}>

      {/* Hero */}
      <section style={{ textAlign: 'center', paddingTop: 8 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', background: NEU.CARD, borderRadius: 32, boxShadow: NEU.raised, padding: '2.5rem 3rem', border: 'none' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 18px', borderRadius: 999,
            background: NEU.PAGE, boxShadow: NEU.pressed,
            fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6C63FF',
            marginBottom: 20, fontFamily: 'Inter, sans-serif',
          }}>
            <Sparkles size={14} /> Curated Experiences
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#1E293B', margin: '0 0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            Explore Amazing Activities <Globe size={32} color="#06B6D4" />
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748B', fontFamily: 'Inter, sans-serif', lineHeight: 1.7, maxWidth: 580, margin: '0 auto' }}>
            Discover handpicked attractions, cultural experiences, and adrenaline-pumping adventures from around the world.
          </p>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <div style={{ background: NEU.CARD, borderRadius: 32, boxShadow: NEU.raised, padding: '1.5rem 2rem', border: 'none', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <CategoryFilter categories={categories} selected={filter} onSelect={setFilter} />
        <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6C63FF', pointerEvents: 'none' }} />
          <input
            placeholder="Search activities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
              background: NEU.PAGE, borderRadius: 14, border: 'none', outline: 'none',
              fontSize: '0.9rem', color: '#1E293B', fontFamily: 'Inter, sans-serif',
              boxShadow: NEU.input, transition: 'box-shadow .25s ease'
            }}
            onFocus={e => { e.currentTarget.style.boxShadow = `${NEU.input}, 0 0 0 2px rgba(108,99,255,.2)` }}
            onBlur={e => { e.currentTarget.style.boxShadow = NEU.input }}
          />
        </div>
      </div>

      {/* Results summary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
        <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
          Showing <strong style={{ color: '#1E293B' }}>{filtered.length}</strong> activities
          {filter !== 'All' && <> in <strong style={{ color: '#6C63FF' }}>{filter}</strong></>}
          {search && <> matching "<strong style={{ color: '#1E293B' }}>{search}</strong>"</>}
        </p>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {filtered.map(a => <ActivityCard key={a.id} activity={a} />)}
        </div>
      ) : (
        <div style={{
          background: NEU.CARD, borderRadius: 32, boxShadow: NEU.raised, padding: '4rem 2rem',
          textAlign: 'center', border: 'none',
        }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: NEU.PAGE, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Compass size={28} color="#94A3B8" />
          </div>
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#1E293B', margin: '0 0 8px' }}>No activities found</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>Try adjusting your search or filters.</p>
          <button className="neu-btn" onClick={() => { setSearch(''); setFilter('All') }} style={{ padding: '10px 22px', color: '#334155' }}>
            Clear Filters
          </button>
        </div>
      )}

      {/* CTA Banner */}
      <div style={{ background: NEU.CARD, borderRadius: 32, boxShadow: NEU.raised, padding: '2.5rem 2.5rem', textAlign: 'center', border: 'none' }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: NEU.PAGE, boxShadow: NEU.pressed, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Sparkles size={22} color="#6C63FF" />
        </div>
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#1E293B', margin: '0 0 8px' }}>
          Want personalized recommendations?
        </h3>
        <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: 440, margin: '0 auto 20px', fontFamily: 'Inter, sans-serif' }}>
          Tell us your travel preferences and we'll curate a custom list just for you.
        </p>
        <button className="neu-btn-primary" onClick={() => { window.location.href = '/dashboard/ai-planner' }} style={{ padding: '12px 28px' }}>
          Get Personalized Picks
        </button>
      </div>
    </div>
  )
}