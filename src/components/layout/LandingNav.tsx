'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Map } from 'lucide-react'
import { HeaderAuth } from '@/components/auth/HeaderAuth'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { AuthModal } from '@/components/auth/AuthModal'

export function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleStartPlanning = () => {
    router.push('/dashboard')
  }

  const handleDemo = (e: React.MouseEvent) => {
    e.preventDefault()
    toast.success("Interactive demo is starting...", {
      description: "Preparing your personalized AI trip planning experience."
    })
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className={`p-1.5 rounded-lg transition-colors ${isScrolled ? 'bg-indigo-50' : 'bg-white/40 backdrop-blur-md'}`}>
            <Map className={`h-6 w-6 ${isScrolled ? 'text-indigo-600' : 'text-primary'}`} />
          </div>
          <span className={`text-xl font-bold tracking-tight transition-colors ${isScrolled ? 'text-slate-900' : 'text-primary'}`}>
            Traveloop
          </span>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-8 font-medium">
          <a href="#features" className={`text-sm transition-colors hover:text-indigo-600 ${isScrolled ? 'text-slate-600' : 'text-slate-800'}`}>Features</a>
          <a href="#pricing" className={`text-sm transition-colors hover:text-indigo-600 ${isScrolled ? 'text-slate-600' : 'text-slate-800'}`}>Pricing</a>
          <a href="#demo" onClick={handleDemo} className={`text-sm transition-colors hover:text-indigo-600 ${isScrolled ? 'text-slate-600' : 'text-slate-800'}`}>Demo</a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <HeaderAuth />
          {user ? (
            <Button 
              onClick={handleStartPlanning}
              className="hidden md:flex bg-primary text-primary-foreground hover:bg-indigo-600 text-white rounded-full px-6 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Start Planning
            </Button>
          ) : (
            <AuthModal 
              trigger={
                <Button 
                  className="hidden md:flex bg-primary text-primary-foreground hover:bg-indigo-600 text-white rounded-full px-6 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  Start Planning
                </Button>
              }
            />
          )}
        </div>
      </div>
    </header>
  )
}
