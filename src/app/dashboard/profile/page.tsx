'use client'

import React, { useState, useEffect } from 'react'
import {
  User, Mail, Phone, Globe, MapPin, Save, Camera,
  ArrowLeft, Briefcase, Star, Edit3, Check, X, Shield
} from 'lucide-react'
import { countriesData } from '@/lib/countries'
import Link from 'next/link'

const NEU = {
  PAGE:    'var(--neu-page)',
  SECTION: 'var(--neu-section)',
  CARD:    'var(--neu-card)',
  raised:  'var(--neu-raised)',
  hover:   'var(--neu-hover)',
  pressed: 'var(--neu-pressed)',
  input:   'var(--neu-input)',
}

interface UserData {
  id: string
  name?: string
  email?: string
  contact?: string
  country?: string
  city?: string
}

// ── Editable Field ──────────────────────────────────────────
const EditableField = ({
  label, icon: Icon, value, onChange, type = 'text', placeholder, readOnly = false
}: {
  label: string; icon: React.ElementType; value: string;
  onChange?: (v: string) => void; type?: string;
  placeholder?: string; readOnly?: boolean
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <label style={{
      fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase',
      color: 'var(--neu-text-3)', fontFamily: 'Inter, sans-serif', marginLeft: 4
    }}>{label}</label>
    <div style={{ position: 'relative' }}>
      <Icon style={{
        position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
        width: 18, height: 18, color: '#810100', pointerEvents: 'none', zIndex: 1,
      }} />
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder || label}
        style={{
          width: '100%', paddingLeft: 46, paddingRight: 16, paddingTop: 14, paddingBottom: 14,
          background: readOnly ? 'var(--neu-section)' : 'var(--neu-page)',
          borderRadius: 14, border: 'none', outline: 'none',
          fontSize: '0.95rem', color: 'var(--neu-text)',
          fontFamily: 'Inter, sans-serif',
          boxShadow: readOnly
            ? 'inset 2px 2px 4px rgba(139,120,112,.1), inset -2px -2px 4px rgba(255,255,255,.7)'
            : 'var(--neu-input)',
          transition: 'box-shadow .25s ease',
          cursor: readOnly ? 'default' : 'text',
          opacity: readOnly ? 0.7 : 1,
        }}
        onFocus={e => {
          if (!readOnly) e.currentTarget.style.boxShadow = `var(--neu-input), 0 0 0 2px rgba(129,1,0,.2)`
        }}
        onBlur={e => {
          if (!readOnly) e.currentTarget.style.boxShadow = 'var(--neu-input)'
        }}
      />
    </div>
  </div>
)

// ── Stat Pill ───────────────────────────────────────────────
const StatPill = ({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string
}) => (
  <div style={{
    background: NEU.CARD, borderRadius: 20, boxShadow: NEU.raised, padding: '1.1rem 1.4rem',
    display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 140,
  }}>
    <div style={{
      width: 38, height: 38, borderRadius: 12, background: NEU.PAGE, boxShadow: NEU.pressed,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0,
    }}><Icon size={18} /></div>
    <div>
      <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--neu-text-3)', fontFamily: 'Inter, sans-serif' }}>{label}</div>
      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--neu-text)' }}>{value}</div>
    </div>
  </div>
)

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [form, setForm] = useState({ name: '', email: '', contact: '', country: '', city: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tripCount, setTripCount] = useState(0)
  const [countryCount, setCountryCount] = useState(0)

  const selectedCountry = countriesData.find(c => c.name === form.country)
  const availableCities = selectedCountry?.cities || []

  useEffect(() => {
    try {
      const raw = localStorage.getItem('traveloop_user')
      if (!raw) { window.location.href = '/'; return }
      const u: UserData = JSON.parse(raw)
      setUser(u)
      setForm({
        name: u.name || '',
        email: u.email || '',
        contact: (u as any).contact || '',
        country: (u as any).country || '',
        city: (u as any).city || '',
      })

      // Load stats
      const tripsRaw = localStorage.getItem(`traveloop_trips_${u.id}`)
      if (tripsRaw) {
        const trips = JSON.parse(tripsRaw)
        setTripCount(trips.length)
        const countries = new Set(trips.flatMap((t: any) => t.stops?.map((s: any) => s.country) || []))
        setCountryCount(countries.size)
      }
    } catch { /* */ }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      if (!user) return
      const updated = { ...user, ...form }
      localStorage.setItem('traveloop_user', JSON.stringify(updated))

      // Update the all_users registry too
      const allUsersRaw = localStorage.getItem('traveloop_all_users')
      if (allUsersRaw) {
        const allUsers: any[] = JSON.parse(allUsersRaw)
        const idx = allUsers.findIndex((u: any) => u.id === user.id)
        if (idx !== -1) {
          allUsers[idx] = { ...allUsers[idx], ...form }
          localStorage.setItem('traveloop_all_users', JSON.stringify(allUsers))
        }
      }

      setUser(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const userInitial = form.name?.charAt(0).toUpperCase() || 'U'

  // Avatar gradient colors based on initial
  const gradients = [
    ['#810100', '#630102'], ['#3B82F6', '#1D4ED8'],
    ['#22C55E', '#16A34A'], ['#F59E0B', '#D97706'],
    ['#8B5CF6', '#7C3AED'], ['#06B6D4', '#0891B2'],
  ]
  const avatarGradient = gradients[userInitial.charCodeAt(0) % gradients.length]

  if (!user) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 800, margin: '0 auto', paddingBottom: 48 }}>

      {/* Back nav */}
      <div>
        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px',
            borderRadius: 14, background: NEU.CARD, boxShadow: NEU.raised,
            color: 'var(--neu-text-2)', fontFamily: 'Inter, sans-serif',
            fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
            transition: 'all .25s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      {/* Profile Hero Card */}
      <div style={{
        background: NEU.CARD, borderRadius: 32, boxShadow: NEU.raised,
        padding: '2.5rem', display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap',
      }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 100, height: 100, borderRadius: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg, ${avatarGradient[0]}, ${avatarGradient[1]})`,
            boxShadow: `8px 8px 20px rgba(0,0,0,.15), -4px -4px 12px rgba(255,255,255,.8)`,
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '2.5rem', color: '#fff',
          }}>{userInitial}</div>
          <div style={{
            position: 'absolute', bottom: -4, right: -4,
            width: 28, height: 28, borderRadius: '50%',
            background: '#810100', boxShadow: NEU.raised,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
            title="Change avatar (coming soon)"
          >
            <Camera size={12} color="#fff" />
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px',
            borderRadius: 999, background: NEU.PAGE, boxShadow: NEU.pressed,
            fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: '#810100', fontFamily: 'Inter, sans-serif', marginBottom: 10,
          }}>
            <Shield size={10} /> Verified Traveler
          </div>
          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800,
            fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--neu-text)',
            margin: '0 0 4px', lineHeight: 1.2,
          }}>{form.name || 'Your Name'}</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--neu-text-2)', fontFamily: 'Inter, sans-serif', margin: 0 }}>
            {form.email}
          </p>
          {form.country && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <MapPin size={14} color="#810100" />
              <span style={{ fontSize: '0.85rem', color: 'var(--neu-text-2)', fontFamily: 'Inter, sans-serif' }}>
                {form.city ? `${form.city}, ` : ''}{form.country}
              </span>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', width: '100%', marginTop: 8 }}>
          <StatPill label="Trips Created" value={tripCount} icon={Briefcase} color="#810100" />
          <StatPill label="Countries" value={countryCount} icon={Globe} color="#22C55E" />
          <StatPill label="Traveler Since" value="2026" icon={Star} color="#F59E0B" />
        </div>
      </div>

      {/* Edit Form */}
      <div style={{ background: NEU.CARD, borderRadius: 32, boxShadow: NEU.raised, padding: '2rem 2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 14, background: NEU.PAGE, boxShadow: NEU.pressed,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Edit3 size={18} color="#810100" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.15rem', color: 'var(--neu-text)', margin: 0 }}>
              Edit Profile
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--neu-text-3)', fontFamily: 'Inter, sans-serif', margin: 0 }}>
              Update your personal information
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <EditableField
              label="Full Name" icon={User} value={form.name}
              onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="Your full name"
            />
            <EditableField
              label="Contact Number" icon={Phone} value={form.contact}
              onChange={v => setForm(p => ({ ...p, contact: v }))} placeholder="+1 (555) 000-0000"
            />
          </div>

          <EditableField
            label="Email Address" icon={Mail} type="email" value={form.email}
            onChange={v => setForm(p => ({ ...p, email: v }))} placeholder="you@example.com"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Country selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{
                fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--neu-text-3)', fontFamily: 'Inter, sans-serif', marginLeft: 4
              }}>Country</label>
              <div style={{ position: 'relative' }}>
                <Globe style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#810100', pointerEvents: 'none', zIndex: 1 }} />
                <select
                  value={form.country}
                  onChange={e => setForm(p => ({ ...p, country: e.target.value, city: '' }))}
                  style={{
                    width: '100%', paddingLeft: 46, paddingRight: 16, paddingTop: 14, paddingBottom: 14,
                    background: 'var(--neu-page)', borderRadius: 14, border: 'none', outline: 'none',
                    fontSize: '0.95rem', color: 'var(--neu-text)',
                    fontFamily: 'Inter, sans-serif', boxShadow: 'var(--neu-input)',
                    appearance: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="">Select Country</option>
                  {countriesData.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* City selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{
                fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--neu-text-3)', fontFamily: 'Inter, sans-serif', marginLeft: 4
              }}>City</label>
              <div style={{ position: 'relative' }}>
                <MapPin style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#810100', pointerEvents: 'none', zIndex: 1 }} />
                <select
                  value={form.city}
                  onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                  disabled={!form.country}
                  style={{
                    width: '100%', paddingLeft: 46, paddingRight: 16, paddingTop: 14, paddingBottom: 14,
                    background: 'var(--neu-page)', borderRadius: 14, border: 'none', outline: 'none',
                    fontSize: '0.95rem', color: 'var(--neu-text)',
                    fontFamily: 'Inter, sans-serif', boxShadow: 'var(--neu-input)',
                    appearance: 'none', cursor: form.country ? 'pointer' : 'not-allowed',
                    opacity: form.country ? 1 : 0.5,
                  }}
                >
                  <option value="">Select City</option>
                  {availableCities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1, padding: '14px 24px', borderRadius: 16, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                background: saved
                  ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                  : 'linear-gradient(135deg, #810100, #630102)',
                color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.95rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '6px 6px 14px rgba(139,120,112,.18), -6px -6px 14px rgba(255,255,255,.9)',
                transition: 'all .3s ease',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Saving...
                </>
              ) : saved ? (
                <><Check size={16} /> Changes Saved!</>
              ) : (
                <><Save size={16} /> Save Changes</>
              )}
            </button>
            <Link
              href="/dashboard"
              style={{
                padding: '14px 24px', borderRadius: 16,
                background: NEU.PAGE, boxShadow: NEU.raised,
                color: 'var(--neu-text-2)', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.95rem',
                display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
                transition: 'all .25s ease',
              }}
            >
              <X size={16} /> Cancel
            </Link>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div style={{ background: NEU.CARD, borderRadius: 32, boxShadow: NEU.raised, padding: '1.75rem 2.5rem' }}>
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--neu-text)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={16} color="#810100" /> Account Security
        </h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => alert('Password reset coming soon!')}
            style={{
              padding: '11px 20px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: NEU.PAGE, boxShadow: NEU.raised, color: 'var(--neu-text-2)',
              fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.85rem',
              transition: 'all .25s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
          >
            Change Password
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to sign out?')) {
                localStorage.removeItem('traveloop_user')
                window.location.href = '/'
              }
            }}
            style={{
              padding: '11px 20px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: NEU.PAGE, boxShadow: NEU.raised, color: '#EF4444',
              fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.85rem',
              transition: 'all .25s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
          >
            Sign Out
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
