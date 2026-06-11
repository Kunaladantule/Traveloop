'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Mail, Lock, User, Phone, Globe, MapPin,
  ArrowRight, Compass, Check, Search, AlertCircle
} from 'lucide-react'
import { countriesData } from '@/lib/countries'
import { createProfile, getUserByEmail } from '@/app/actions/auth'

// ─────────────────────────────────────────────────────────────
// 3-Level Elevation Tokens
// ─────────────────────────────────────────────────────────────
const NEU = {
  PAGE:    '#EDEBDE',
  SECTION: '#E5E2D3',
  CARD:    '#F5F3EA',
  raised:  '8px 8px 18px rgba(139,120,112,.18), -8px -8px 18px rgba(255,255,255,.9)',
  pressed: 'inset 4px 4px 8px rgba(139,120,112,.2), inset -4px -4px 8px rgba(255,255,255,.9)',
  input:   'inset 3px 3px 6px rgba(139,120,112,.15), inset -3px -3px 6px rgba(255,255,255,.9)',
}

// ─────────────────────────────────────────────────────────────
// 🎴 Neumorphic Card
// ─────────────────────────────────────────────────────────────
const NeuCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`relative ${className}`}
    style={{
      background: NEU.CARD,
      borderRadius: 32,
      boxShadow: NEU.raised,
      border: 'none',
      padding: '2.25rem',
    }}
  >
    {children}
  </div>
)

// ─────────────────────────────────────────────────────────────
// 📝 Input Field
// ─────────────────────────────────────────────────────────────
const InputField = ({
  label, icon: Icon, type = 'text', value, onChange, placeholder,
  required = false, error, ...props
}: {
  label: string; icon: React.ElementType; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; required?: boolean; error?: string; [key: string]: any
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <label style={{
      fontSize: 10, fontWeight: 800, letterSpacing: '0.15em',
      textTransform: 'uppercase', color: '#6B5E5C', marginLeft: 4
    }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      <Icon style={{
        position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
        width: 20, height: 20, color: '#810100', pointerEvents: 'none'
      }} />
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          paddingLeft: 50, paddingRight: 16, paddingTop: 14, paddingBottom: 14,
          background: NEU.PAGE,
          borderRadius: 14,
          border: 'none',
          outline: 'none',
          fontSize: '0.95rem',
          color: '#1B1716',
          fontFamily: 'Inter, sans-serif',
          boxShadow: error
            ? 'inset 3px 3px 6px rgba(239,68,68,.15), inset -3px -3px 6px rgba(255,255,255,.9)'
            : NEU.input,
          transition: 'box-shadow .25s ease',
        }}
        onFocus={e => {
          e.currentTarget.style.boxShadow =
            `${NEU.input}, 0 0 0 2px rgba(129,1,0,.2)`
        }}
        onBlur={e => {
          e.currentTarget.style.boxShadow = NEU.input
        }}
        {...props}
      />
    </div>
    {error && <p style={{ fontSize: 12, color: '#EF4444', marginLeft: 4 }}>{error}</p>}
  </div>
)

// ─────────────────────────────────────────────────────────────
// 🔽 Select Field
// ─────────────────────────────────────────────────────────────
const SelectField = ({
  label, icon: Icon, value, options, onSelect, placeholder,
  disabled = false, searchPlaceholder = 'Search...', error
}: {
  label: string; icon: React.ElementType; value: string; options: string[];
  onSelect: (val: string) => void; placeholder: string; disabled?: boolean;
  searchPlaceholder?: string; error?: string
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }} ref={ref}>
      <label style={{
        fontSize: 10, fontWeight: 800, letterSpacing: '0.15em',
        textTransform: 'uppercase', color: '#6B5E5C', marginLeft: 4
      }}>
        {label}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: NEU.PAGE, borderRadius: 14, border: 'none', outline: 'none',
          padding: '14px 16px', cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? .55 : 1, color: '#1B1716', fontSize: '0.875rem', fontWeight: 500,
          fontFamily: 'Inter, sans-serif',
          boxShadow: error
            ? 'inset 3px 3px 6px rgba(239,68,68,.15), inset -3px -3px 6px rgba(255,255,255,.9)'
            : NEU.input,
          transition: 'box-shadow .25s ease',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Icon style={{ width: 16, height: 16, color: '#810100', flexShrink: 0 }} />
          <span style={{ color: value ? '#1B1716' : '#9B8E8C' }}>{value || placeholder}</span>
        </span>
        <span style={{ color: '#9B8E8C', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease', fontSize: 12 }}>▼</span>
      </button>
      {error && <p style={{ fontSize: 12, color: '#EF4444', marginLeft: 4 }}>{error}</p>}

      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', left: 0, right: 0, zIndex: 50,
          background: NEU.CARD, borderRadius: 20, border: 'none',
          boxShadow: '10px 10px 22px rgba(139,120,112,.15), -10px -10px 22px rgba(255,255,255,.95)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '10px 10px 6px' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9B8E8C' }} />
              <input
                type="text" autoFocus value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                style={{
                  width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                  background: NEU.PAGE, borderRadius: 12, border: 'none', outline: 'none', fontSize: '0.8rem', color: '#1B1716',
                  boxShadow: NEU.input,
                  fontFamily: 'Inter, sans-serif',
                }}
              />
            </div>
          </div>
          <div style={{ maxHeight: 192, overflowY: 'auto' }} className="custom-scrollbar">
            {filtered.length > 0 ? (
              filtered.map(opt => (
                <button
                  key={opt} type="button"
                  onClick={() => { onSelect(opt); setIsOpen(false); setSearch('') }}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none',
                    cursor: 'pointer', color: value === opt ? '#810100' : '#2E2523',
                    fontWeight: value === opt ? 700 : 500, fontSize: '0.85rem',
                    transition: 'background .15s ease', fontFamily: 'Inter, sans-serif',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(129,1,0,.05)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                >
                  {opt}
                  {value === opt && <Check style={{ width: 14, height: 14, color: '#810100' }} />}
                </button>
              ))
            ) : (
              <p style={{ textAlign: 'center', padding: '12px', color: '#9B8E8C', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 🔘 Primary Button
// ─────────────────────────────────────────────────────────────
const PrimaryButton = ({ children, onClick, type = 'button', loading = false }: {
  children: React.ReactNode; onClick?: () => void;
  type?: 'button' | 'submit'; loading?: boolean
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading}
    className="neu-btn-primary"
    style={{ width: '100%', padding: '1rem 1.75rem', marginTop: 4 }}
  >
    {loading ? (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 18, height: 18, border: '2px solid rgba(255,255,255,.3)',
          borderTop: '2px solid white', borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        Processing...
      </span>
    ) : (
      <>
        {children}
        <ArrowRight style={{ width: 18, height: 18, marginLeft: 4 }} />
      </>
    )}
  </button>
)

// ─────────────────────────────────────────────────────────────
// 🔑 Password match helper (simple hash for demo)
// ─────────────────────────────────────────────────────────────
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(36)
}

// ─────────────────────────────────────────────────────────────
// 🚀 Main Auth Page
// ─────────────────────────────────────────────────────────────
export default function AuthPage() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    name: '', contact: '', email: '', password: '', country: '', city: ''
  })

  const selectedCountry = countriesData.find(c => c.name === form.country)
  const availableCities = selectedCountry?.cities || []
  const allCountries = countriesData.map(c => c.name)

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  const validateForm = () => {
    const errs: Record<string, string> = {}
    if (authMode === 'register') {
      if (!form.name.trim()) errs.name = 'Name is required'
      if (!form.contact.trim()) errs.contact = 'Contact is required'
      if (!form.email.trim()) errs.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
      if (!form.country) errs.country = 'Select a country'
      if (!form.city) errs.city = 'Select a city'
      if (!form.password) errs.password = 'Password is required'
      else if (form.password.length < 6) errs.password = 'Min. 6 characters'
    } else {
      if (!form.email.trim()) errs.email = 'Email is required'
      if (!form.password) errs.password = 'Password is required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    try {
      if (authMode === 'login') {
        // ── Step 1: Check localStorage for registered users ──
        const allUsersRaw = localStorage.getItem('traveloop_all_users')
        const allUsers: any[] = allUsersRaw ? JSON.parse(allUsersRaw) : []
        const localUser = allUsers.find((u: any) => u.email?.toLowerCase() === form.email.toLowerCase())

        if (localUser) {
          // Verify password hash
          if (localUser.passwordHash && localUser.passwordHash !== simpleHash(form.password)) {
            setErrors({ submit: 'Incorrect password. Please try again.' })
            setIsLoading(false)
            return
          }
          const { passwordHash, ...safeUser } = localUser
          localStorage.setItem('traveloop_user', JSON.stringify(safeUser))
          window.location.href = '/dashboard'
          return
        }

        // ── Step 2: Check DB ──
        const res = await getUserByEmail(form.email)
        if (res.success && res.user) {
          localStorage.setItem('traveloop_user', JSON.stringify(res.user))
          window.location.href = '/dashboard'
          return
        }

        // ── Step 3: No user found ──
        setErrors({ submit: 'No account found with this email. Please register first.' })

      } else {
        // ── Register ──
        // Check if email already exists in localStorage
        const allUsersRaw = localStorage.getItem('traveloop_all_users')
        const allUsers: any[] = allUsersRaw ? JSON.parse(allUsersRaw) : []
        const existingUser = allUsers.find((u: any) => u.email?.toLowerCase() === form.email.toLowerCase())
        if (existingUser) {
          setErrors({ email: 'An account with this email already exists.' })
          setIsLoading(false)
          return
        }

        const userId = `usr_${Date.now()}`
        const newUser = {
          id: userId,
          name: form.name,
          email: form.email,
          contact: form.contact,
          country: form.country,
          city: form.city,
          passwordHash: simpleHash(form.password),
        }

        // Save to all_users registry
        allUsers.push(newUser)
        localStorage.setItem('traveloop_all_users', JSON.stringify(allUsers))

        // Try DB registration
        try {
          await createProfile(userId, { name: form.name, email: form.email })
        } catch { /* DB optional */ }

        const { passwordHash, ...safeUser } = newUser
        localStorage.setItem('traveloop_user', JSON.stringify(safeUser))
        window.location.href = '/dashboard'
      }
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '12px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
    fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.875rem',
    transition: 'all .3s ease',
    background: active ? NEU.PAGE : 'transparent',
    color: active ? '#810100' : '#6B5E5C',
    boxShadow: active ? NEU.raised : 'none',
  })

  return (
    <div style={{ minHeight: '100vh', background: NEU.PAGE, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '1.5rem' }}>

      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 360, height: 360, background: 'rgba(129,1,0,.06)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -80, width: 320, height: 320, background: 'rgba(99,1,2,.05)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

      {/* Header — logo only, no extra badge */}
      <header style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '2rem 2.5rem', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="neu-raised" style={{ width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Compass style={{ width: 22, height: 22, color: '#810100' }} />
          </div>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#1B1716' }}>Traveloop</span>
        </div>
      </header>

      {/* Main Card */}
      <main style={{ width: '100%', maxWidth: 460, paddingTop: '5rem', paddingBottom: '3rem', position: 'relative', zIndex: 10 }}>
        <NeuCard>
          {/* Toggle Tab */}
          <div style={{
            display: 'flex', padding: 6, borderRadius: 18, marginBottom: 32,
            boxShadow: NEU.pressed,
            background: NEU.PAGE,
          }}>
            <button style={tabStyle(authMode === 'login')} onClick={() => setAuthMode('login')}>Sign In</button>
            <button style={tabStyle(authMode === 'register')} onClick={() => setAuthMode('register')}>Register</button>
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '1.75rem', color: '#1B1716', margin: 0 }}>
              {authMode === 'login' ? 'Welcome back!' : 'Create account'}
            </h1>
            <p style={{ marginTop: 8, fontSize: '0.9rem', color: '#6B5E5C', fontFamily: 'Inter, sans-serif' }}>
              {authMode === 'login' ? 'Sign in to continue your journey' : 'Start planning your dream trip'}
            </p>
          </div>

          {/* Error */}
          {errors.submit && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px',
              background: NEU.PAGE, borderRadius: 16, marginBottom: 20,
              boxShadow: 'inset 3px 3px 6px rgba(239,68,68,.15), inset -3px -3px 6px rgba(255,255,255,.9)',
              color: '#EF4444', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif'
            }}>
              <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
              {errors.submit}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {authMode === 'register' && (
              <>
                <InputField label="Full Name" icon={User} value={form.name} onChange={e => updateForm('name', e.target.value)} placeholder="John Doe" required error={errors.name} />
                <InputField label="Contact Number" icon={Phone} type="tel" value={form.contact} onChange={e => updateForm('contact', e.target.value)} placeholder="+1 (555) 000-0000" required error={errors.contact} />
              </>
            )}

            <InputField label="Email Address" icon={Mail} type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} placeholder="you@example.com" required error={errors.email} />

            {authMode === 'register' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <SelectField label="Country" icon={Globe} value={form.country} options={allCountries} onSelect={val => { updateForm('country', val); updateForm('city', '') }} placeholder="Select" searchPlaceholder="Search country..." error={errors.country} />
                <SelectField label="City" icon={MapPin} value={form.city} options={availableCities} onSelect={val => updateForm('city', val)} placeholder="Select" disabled={!form.country} searchPlaceholder="Search city..." error={errors.city} />
              </div>
            )}

            <InputField label="Password" icon={Lock} type="password" value={form.password} onChange={e => updateForm('password', e.target.value)} placeholder={authMode === 'login' ? '••••••••' : 'Create a password'} required minLength={6} error={errors.password} />

            {authMode === 'login' && (
              <div style={{ textAlign: 'right', marginTop: -8 }}>
                <button type="button" onClick={e => { e.preventDefault(); alert('Password reset coming soon!') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#810100', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                  Forgot password?
                </button>
              </div>
            )}

            <PrimaryButton type="submit" loading={isLoading}>
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </PrimaryButton>
          </form>

          {/* Switch mode */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: '#6B5E5C', fontFamily: 'Inter, sans-serif' }}>
              {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button type="button"
                onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setErrors({}) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#810100', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>
                {authMode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </div>
        </NeuCard>
      </main>

      <footer style={{ position: 'absolute', bottom: 28, textAlign: 'center', zIndex: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9B8E8C', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
          © 2026 Traveloop · Secure · Fast · Beautiful
        </p>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}