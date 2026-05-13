'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AuthModal } from '@/components/auth/AuthModal'
import { Button } from '@/components/ui/button'
import { User as UserIcon, LogOut, LayoutDashboard, Plane, Settings, Star, Mail } from 'lucide-react'

export function HeaderAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user || null)
    setLoading(false)
  }

  useEffect(() => {
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setDropdownOpen(false)
    router.refresh()
  }

  if (loading) {
    return <div className="w-24 h-10 bg-zinc-100 animate-pulse rounded-lg"></div>
  }

  if (user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <div 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <span className="text-sm font-medium text-slate-700 hidden sm:block">
            Hello {user?.user_metadata?.name || user?.email?.split('@')[0]}!
          </span>
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200 hover:bg-indigo-200 transition-colors">
            <UserIcon className="h-5 w-5" />
          </div>
        </div>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden z-50">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
              <p className="text-sm font-medium text-zinc-900 truncate">
                {user.email}
              </p>
            </div>
            <div className="p-2 space-y-1">
              <Link href="/dashboard" onClick={() => setDropdownOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  My Profile
                </Button>
              </Link>
              <Link href="/dashboard/trips" onClick={() => setDropdownOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100">
                  <Plane className="mr-2 h-4 w-4" />
                  My Trips
                </Button>
              </Link>
              <Link href="/dashboard/settings" onClick={() => setDropdownOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
              <Link href="/dashboard/reviews" onClick={() => setDropdownOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100">
                  <Star className="mr-2 h-4 w-4" />
                  Reviews
                </Button>
              </Link>
              <Link href="/contact" onClick={() => setDropdownOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Us
                </Button>
              </Link>
              <div className="h-[1px] bg-zinc-200 my-1 mx-2" />
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return <AuthModal onAuthSuccess={checkUser} />
}
