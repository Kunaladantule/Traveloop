'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Mail, Lock, User, Phone, Globe, MapPin, 
  ArrowRight, Compass, Check, Search, AlertCircle 
} from 'lucide-react'
import { countriesData } from '@/lib/countries'
import { createProfile, getUserByEmail } from '@/app/actions/auth'

// ─────────────────────────────────────────────────────────────
// 🎨 Light Theme Design Tokens
// ─────────────────────────────────────────────────────────────
const THEME = {
  colors: {
    primary: 'from-indigo-600 to-purple-600',
    primaryHover: 'from-indigo-500 to-purple-500',
    background: 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50',
    cardBg: 'bg-white/80',
    inputBg: 'bg-white',
    border: 'border-slate-200',
    borderFocus: 'border-indigo-400',
    text: {
      primary: 'text-slate-900',
      secondary: 'text-slate-700',
      muted: 'text-slate-500',
      label: 'text-slate-800',
      placeholder: 'text-slate-400'
    },
    shadow: 'shadow-xl shadow-slate-200/50',
    shadowHover: 'shadow-2xl shadow-indigo-200/60'
  },
  spacing: {
    card: 'p-6 md:p-8',
    input: 'py-3 px-4',
    gap: 'gap-4'
  },
  radius: {
    card: 'rounded-2xl',
    input: 'rounded-xl'
  }
}

// ─────────────────────────────────────────────────────────────
// 🧩 Reusable UI Components (Light Theme Optimized)
// ─────────────────────────────────────────────────────────────

const GlassCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative ${THEME.colors.cardBg} ${THEME.colors.border} border ${THEME.radius.card} ${THEME.spacing.card} backdrop-blur-lg ${THEME.colors.shadow} ${className}`}>
    {/* Subtle top gradient accent */}
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-2xl" />
    {children}
  </div>
)

const InputField = ({ 
  label, icon: Icon, type = 'text', value, onChange, placeholder, required = false, error, ...props 
}: {
  label: string, icon: React.ElementType, type?: string, value: string, 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string, 
  required?: boolean, error?: string, [key: string]: any
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold uppercase tracking-wide text-slate-700">{label}</label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full ${THEME.colors.inputBg} ${THEME.colors.border} ${THEME.radius.input} ${THEME.spacing.input} pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all ${error ? 'border-red-400 focus:ring-red-500/20' : ''}`}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-500 mt-0.5 ml-1">{error}</p>}
  </div>
)

const SelectField = ({ 
  label, icon: Icon, value, options, onSelect, placeholder, disabled = false, searchPlaceholder = 'Search...', error 
}: {
  label: string, icon: React.ElementType, value: string, options: string[], 
  onSelect: (val: string) => void, placeholder: string, disabled?: boolean, 
  searchPlaceholder?: string, error?: string
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
    <div className="flex flex-col gap-1.5 relative" ref={ref}>
      <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center ${THEME.colors.inputBg} ${THEME.colors.border} ${THEME.radius.input} ${THEME.spacing.input} pl-10 pr-3 text-sm text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:bg-slate-50'} ${error ? 'border-red-400' : ''}`}
      >
        <span className="flex items-center gap-2 truncate text-slate-900">
          <Icon className="h-4 w-4 text-slate-400 shrink-0" />
          {value || <span className="text-slate-400">{placeholder}</span>}
        </span>
        <span className={`transform transition-transform text-slate-400 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {error && <p className="text-xs text-red-500 mt-0.5 ml-1">{error}</p>}

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto py-1 custom-scrollbar">
            {filtered.length > 0 ? (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onSelect(opt); setIsOpen(false); setSearch('') }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${value === opt ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  {opt}
                  {value === opt && <Check className="h-4 w-4 text-indigo-600" />}
                </button>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-3">No results found</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const PrimaryButton = ({ children, onClick, type = 'button', loading = false, className = '' }: {
  children: React.ReactNode, onClick?: () => void, type?: 'button' | 'submit', loading?: boolean, className?: string
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading}
    className={`group relative w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r ${THEME.colors.primary} text-white font-semibold text-sm ${THEME.radius.input} ${THEME.colors.shadow} hover:${THEME.colors.shadowHover} hover:${THEME.colors.primaryHover} transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
  >
    {loading ? (
      <span className="flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        Processing...
      </span>
    ) : (
      <>
        {children}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </>
    )}
  </button>
)

// ─────────────────────────────────────────────────────────────
// 🚀 Main Page Component (Light Theme)
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
  const allCities = availableCities

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => { const newErrs = { ...prev }; delete newErrs[field]; return newErrs })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (authMode === 'register') {
      if (!form.name.trim()) newErrors.name = 'Name is required'
      if (!form.contact.trim()) newErrors.contact = 'Contact is required'
      if (!form.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        newErrors.email = 'Please enter a valid email'
      }
      if (!form.country) newErrors.country = 'Select a country'
      if (!form.city) newErrors.city = 'Select a city'
      if (!form.password) {
        newErrors.password = 'Password is required'
      } else if (form.password.length < 6) {
        newErrors.password = 'Min. 6 characters'
      }
    } else {
      if (!form.email.trim()) newErrors.email = 'Email is required'
      if (!form.password) newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      if (authMode === 'login') {
        const res = await getUserByEmail(form.email)
        if (res.success && res.user) {
          localStorage.setItem('traveloop_user', JSON.stringify(res.user))
          window.location.href = '/dashboard'
          return
        }
        const mockUser = { id: `mock_${Date.now()}`, name: form.email.split('@')[0], email: form.email }
        localStorage.setItem('traveloop_user', JSON.stringify(mockUser))
        window.location.href = '/dashboard'
      } else {
        const userId = `usr_${Date.now()}`
        const res = await createProfile(userId, { name: form.name, email: form.email })
        if (res.success && res.user) {
          localStorage.setItem('traveloop_user', JSON.stringify(res.user))
          window.location.href = '/dashboard'
          return
        }
        const newUser = { id: userId, ...form }
        localStorage.setItem('traveloop_user', JSON.stringify(newUser))
        window.location.href = '/dashboard'
      }
    } catch (err) {
      console.error('Auth error:', err)
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`relative min-h-screen flex flex-col justify-center items-center ${THEME.colors.background} text-slate-900 font-sans overflow-hidden`}>
      
      {/* 🌤️ Light Background Layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.08)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[url('/light-pattern.svg')] bg-repeat opacity-[0.03]" />
      
      {/* ✨ Header */}
      <header className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Compass className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-700">
            Traveloop
          </span>
        </div>
        <span className="text-xs font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full">
          Flight TL-2026
        </span>
      </header>

      {/* 🎯 Main Content */}
      <main className="w-full max-w-md px-6 py-12 relative z-10">
        
        <GlassCard>
          {/* 🔁 Auth Mode Toggle */}
          <div className="flex mb-6 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${authMode === 'login' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${authMode === 'register' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Register
            </button>
          </div>

          {/* 📝 Form Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              {authMode === 'login' ? 'Welcome back! 👋' : 'Create your account ✨'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {authMode === 'login' 
                ? 'Sign in to continue your journey' 
                : 'Start planning your dream trip'}
            </p>
          </div>

          {/* ⚠️ Global Error */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* 📋 Form */}
          <form onSubmit={handleSubmit} className={`flex flex-col ${THEME.spacing.gap}`}>
            
            {authMode === 'register' && (
              <>
                <InputField
                  label="Full Name"
                  icon={User}
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  placeholder="John Doe"
                  required
                  error={errors.name}
                />
                <InputField
                  label="Contact Number"
                  icon={Phone}
                  type="tel"
                  value={form.contact}
                  onChange={(e) => updateForm('contact', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  required
                  error={errors.contact}
                />
              </>
            )}

            <InputField
              label="Email Address"
              icon={Mail}
              type="email"
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
              placeholder="you@example.com"
              required
              error={errors.email}
            />
            
            {authMode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Country"
                  icon={Globe}
                  value={form.country}
                  options={allCountries}
                  onSelect={(val) => { updateForm('country', val); updateForm('city', '') }}
                  placeholder="Select"
                  searchPlaceholder="Search country..."
                  error={errors.country}
                />
                <SelectField
                  label="City"
                  icon={MapPin}
                  value={form.city}
                  options={allCities}
                  onSelect={(val) => updateForm('city', val)}
                  placeholder="Select"
                  disabled={!form.country}
                  searchPlaceholder="Search city..."
                  error={errors.city}
                />
              </div>
            )}

            <InputField
              label="Password"
              icon={Lock}
              type="password"
              value={form.password}
              onChange={(e) => updateForm('password', e.target.value)}
              placeholder={authMode === 'login' ? '••••••••' : 'Create a password'}
              required
              minLength={6}
              error={errors.password}
            />

            {authMode === 'login' && (
              <div className="text-right -mt-1">
                <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); alert('Password reset coming soon!') }}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <PrimaryButton type="submit" loading={isLoading} className="mt-1">
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </PrimaryButton>

          </form>

          {/* 🔁 Toggle Auth Mode */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setErrors({}) }}
                className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                {authMode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </div>
        </GlassCard>

      </main>

      {/* 🦶 Footer */}
      <footer className="absolute bottom-6 text-center text-xs text-slate-500 z-10">
        <p>© 2026 Traveloop. All rights reserved.</p>
        <p className="mt-1 text-slate-400">Secure • Fast • Beautiful</p>
      </footer>

      {/* 🎨 Global Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(100,116,139,0.2); 
          border-radius: 99px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: rgba(100,116,139,0.4); 
        }
        @keyframes fade-in { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: translateY(0) } }
        .animate-in { animation: fade-in 0.2s ease-out forwards; }
        .slide-in-from-top-2 { --tw-translate-y: -0.5rem; }
      `}</style>
    </div>
  )
}