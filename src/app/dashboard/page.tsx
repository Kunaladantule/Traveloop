'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Edit2,
  CheckCircle2,
  Bus,
  Ship,
  Plane,
  Bike,
  Bed,
  UserCircle2
} from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export default function DashboardOverviewPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
      setLoading(false)
    }

    fetchDashboardData()
  }, [router])

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center">Loading dashboard...</div>
  }

  // Extract user info
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'kunal'
  const userEmail = user?.email || 'kunaldantule@gmail.com'

  return (
    <div className="relative max-w-5xl mx-auto space-y-12 py-10 px-4 min-h-screen">
      {/* Decorative Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute top-[40%] left-[20%] w-[50%] h-[30%] rounded-full bg-purple-200/40 blur-3xl" />
      </div>

      {/* Profile Card */}
      <Card className="shadow-2xl border-white/10 bg-primary text-primary-foreground/90 backdrop-blur-2xl overflow-visible mt-8 text-white rounded-3xl">
        <CardContent className="p-10 flex flex-col md:flex-row gap-12 relative">

          {/* Left Column - Avatar */}
          <div className="flex flex-col items-center flex-shrink-0 md:w-1/3">
            <div className="relative group cursor-pointer mb-4">
              <div className="h-32 w-32 rounded-full bg-white/10 flex items-center justify-center text-indigo-300 overflow-hidden border border-white/20 shadow-sm backdrop-blur-md">
                <UserCircle2 className="h-28 w-28 text-white/50" />
              </div>
              {/* Edit Icon Badge */}
              <div className="absolute bottom-0 right-0 bg-white text-black text-[10px] flex items-center gap-1 px-2 py-1 rounded-md border-2 border-[#0F172A] cursor-pointer hover:bg-gray-200 transition-colors shadow-lg">
                <Edit2 className="h-3 w-3" /> Edit
              </div>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white font-heading">{userName}</h2>
              <button className="text-slate-400 hover:text-white transition-colors">
                <Edit2 className="h-4 w-4" />
              </button>
            </div>

            <button className="text-sm text-indigo-400 hover:underline hover:text-indigo-300 transition-colors">
              Add your country
            </button>
          </div>

          {/* Right Column - Details */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-8 font-heading">Your Profile</h2>

            <div className="space-y-6">
              {/* Contact Number */}
              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Contact Number</p>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-400">+919584668971</span>
                  <button className="text-zinc-400 hover:text-white transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
              </div>

              {/* WhatsApp Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <Checkbox id="whatsapp" defaultChecked className="rounded-sm border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-primary h-4 w-4" />
                <label htmlFor="whatsapp" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-300">
                  Receive booking updates on WhatsApp?
                </label>
              </div>

              {/* Email */}
              <div className="pt-2">
                <p className="text-sm font-semibold text-zinc-300 mb-2">Email</p>
                <div className="flex items-center gap-4">
                  <span className="text-zinc-400">{userEmail}</span>
                  <button className="text-zinc-400 hover:text-white transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <Button variant="destructive" size="sm" className="bg-red-500 hover:bg-red-600 text-white text-xs h-7 px-3 rounded-md border-0">
                    Verify Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Trips Section */}
      <div className="pt-8 relative min-h-[400px]">
        <h2 className="text-2xl font-bold text-primary mb-8 font-heading">My Trips</h2>
        <p className="text-slate-500 mb-16">
          You don&apos;t have any plans yet. <Link href="/dashboard/trips" className="text-primary hover:underline">Start Planning</Link>
        </p>

        {/* Decorative Illustration */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md flex justify-center mt-12 pb-12">
          {/* Circular abstract background elements */}
          <div className="absolute bottom-0 w-64 h-64 rounded-full border border-dashed border-yellow-300 opacity-50 z-0" />
          <div className="absolute bottom-10 -left-10 w-48 h-48 rounded-full border border-dashed border-yellow-300 opacity-50 z-0" />
          <div className="absolute bottom-20 left-10 w-32 h-32 rounded-full bg-yellow-100 opacity-80 z-0" />

          {/* Icons Row */}
          <div className="flex items-center gap-4 z-10 mt-20 relative">
            <div className="h-14 w-14 rounded-full bg-[#3f3f5a] flex items-center justify-center text-white shadow-md">
              <Bus className="h-6 w-6" />
            </div>
            <div className="h-14 w-14 rounded-full bg-[#3f3f5a] flex items-center justify-center text-white shadow-md">
              <Ship className="h-6 w-6" />
            </div>
            <div className="h-14 w-14 rounded-full bg-[#3f3f5a] flex items-center justify-center text-white shadow-md">
              <Plane className="h-6 w-6" />
            </div>
            <div className="h-14 w-14 rounded-full bg-[#3f3f5a] flex items-center justify-center text-white shadow-md">
              <Bike className="h-6 w-6" />
            </div>
            <div className="h-14 w-14 rounded-full bg-[#3f3f5a] flex items-center justify-center text-white shadow-md">
              <Bed className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
