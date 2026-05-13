'use client'

import { Search, Map, LayoutDashboard, Plane, Settings, LogOut, User, Star, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function TopBar() {
  const [userName, setUserName] = useState('kunal')
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.name) {
        setUserName(user.user_metadata.name)
      } else if (user?.email) {
        setUserName(user.email.split('@')[0])
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="flex h-20 items-center justify-between border-b border-border bg-white px-8">
      {/* Left Logo */}
      <div className="flex items-center gap-2">
        <Map className="h-6 w-6 text-indigo-600" />
        <span className="text-xl font-bold tracking-tight text-black">Traveloop</span>
      </div>

      {/* Center Search */}
      <div className="flex flex-1 justify-center max-w-xl mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Where do you want to go?" 
            className="w-full pl-10 bg-gray-50 border-gray-200 h-11 rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-black"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <Link href="/dashboard/trips">
          <Button className="bg-[#111827] hover:bg-[#1F2937] text-white rounded-md px-6 py-2 h-10 font-medium shadow-sm transition-transform hover:scale-105">
            Create a trip
          </Button>
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700 hidden sm:block">Hello {userName}!</span>
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200 hover:bg-indigo-200 transition-colors cursor-pointer">
              <User className="h-5 w-5" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center w-full cursor-pointer text-zinc-600 hover:text-zinc-900">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/trips" className="flex items-center w-full cursor-pointer text-zinc-600 hover:text-zinc-900">
                <Plane className="mr-2 h-4 w-4" />
                <span>My Trips</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center w-full cursor-pointer text-zinc-600 hover:text-zinc-900">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/reviews" className="flex items-center w-full cursor-pointer text-zinc-600 hover:text-zinc-900">
                <Star className="mr-2 h-4 w-4" />
                <span>Reviews</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/contact" className="flex items-center w-full cursor-pointer text-zinc-600 hover:text-zinc-900">
                <Mail className="mr-2 h-4 w-4" />
                <span>Contact Us</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
