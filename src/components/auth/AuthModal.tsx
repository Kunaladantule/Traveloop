'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

// Simple Google Icon SVG component
const GoogleIcon = (props: React.ComponentProps<"svg">) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

type AuthMode = 'LOGIN' | 'SIGNUP'

export function AuthModal({ onAuthSuccess, trigger }: { onAuthSuccess?: () => void, trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<AuthMode>('LOGIN')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    if (mode === 'LOGIN') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setOpen(false)
        if (onAuthSuccess) onAuthSuccess()
        router.refresh()
      }
    } else {
      // In a real scenario, you'd save phone number to the user's metadata or profile
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            phone: phone
          }
        }
      })
      if (error) {
        setError(error.message)
      } else {
        // Automatically login or inform user to check email if confirm email is required
        // We'll assume auto-login works for now
        setOpen(false)
        if (onAuthSuccess) onAuthSuccess()
        router.refresh()
      }
    }
    setLoading(false)
  }

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (!val) {
        setEmail('')
        setPhone('')
        setPassword('')
        setError(null)
      }
    }}>
      <DialogTrigger asChild>
        {trigger ? trigger : <Button variant="outline" className="border-zinc-300 font-medium rounded-lg px-6 text-zinc-900 bg-white hover:bg-zinc-100 shadow-sm">Login / Signup</Button>}
      </DialogTrigger>
      {/* We use a dark translucent styling similar to the original login page */}
      <DialogContent className="sm:max-w-md !bg-[#1E1B4B]/90 backdrop-blur-xl border-white/10 text-white shadow-2xl">
        <div className="space-y-1 text-center mb-4">
          <DialogTitle className="text-3xl font-bold tracking-tight">
            {mode === 'LOGIN' ? 'Welcome back' : 'Create an account'}
          </DialogTitle>
          <DialogDescription className="text-zinc-300">
            {mode === 'LOGIN' ? 'Sign in to your Traveloop account' : 'Enter your details below to get started'}
          </DialogDescription>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-900/50 p-3 text-sm text-red-300 border border-red-500/50">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-zinc-100">Email</label>
            <Input 
              type="email" 
              required
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="bg-white/10 border-white/20 text-white placeholder:text-zinc-400 focus-visible:ring-white/50"
              placeholder="m@example.com"
            />
          </div>

          {/* Show mobile number section only during sign up if desired, or both. The prompt implies below email. */}
          {mode === 'SIGNUP' && (
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-zinc-100">Mobile Number (Optional)</label>
              <Input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className="bg-white/10 border-white/20 text-white placeholder:text-zinc-400 focus-visible:ring-white/50"
                placeholder="+91 9876543210"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-zinc-100">Password</label>
            <Input 
              type="password" 
              required
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="bg-white/10 border-white/20 text-white focus-visible:ring-white/50"
            />
          </div>

          <Button type="submit" className="w-full bg-white text-zinc-900 hover:bg-zinc-200 mt-2" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {mode === 'LOGIN' ? 'Sign In' : 'Sign Up'}
          </Button>

          <div className="flex items-center w-full my-4">
            <div className="flex-grow border-t border-white/20"></div>
            <span className="px-3 text-xs uppercase text-zinc-300">Or continue with</span>
            <div className="flex-grow border-t border-white/20"></div>
          </div>

          <Button 
            variant="outline" 
            type="button" 
            className="w-full bg-white/10 border-white/20 hover:bg-white/20 text-white hover:text-white" 
            onClick={() => handleOAuth('google')} 
            disabled={loading}
          >
            <GoogleIcon className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <div className="text-center text-sm text-zinc-300 mt-4">
            {mode === 'LOGIN' ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              className="font-semibold text-white hover:underline"
              onClick={() => setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
            >
              {mode === 'LOGIN' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
