'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { AuthModal } from '@/components/auth/AuthModal'

export function HeroAuthButton() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setLoading(false)
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const triggerBtn = (
    <Button className="bg-[#111827] hover:bg-[#1F2937] text-white rounded-lg px-8 py-6 text-lg font-semibold shadow-lg transition-transform hover:scale-105">
      <Plus className="mr-2 h-5 w-5" />
      Plan & Book My Trip with Traveloop!
    </Button>
  )

  if (loading) {
    return triggerBtn
  }

  if (user) {
    return (
      <Link href="/dashboard/trips">
        {triggerBtn}
      </Link>
    )
  }

  return (
    <AuthModal trigger={triggerBtn} />
  )
}
