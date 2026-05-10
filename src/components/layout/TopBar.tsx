'use client'

import { Search, Bell, UserCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function TopBar() {
  const [userName, setUserName] = useState('Traveler')

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

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 dark:bg-zinc-950 dark:border-zinc-800">
      <div className="flex w-full max-w-md items-center gap-2">
        <Search className="h-4 w-4 text-zinc-500" />
        <Input 
          type="search" 
          placeholder="Search Destinations..." 
          className="border-none bg-transparent shadow-none focus-visible:ring-0 px-2"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3 border-l pl-4 dark:border-zinc-800">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Welcome back, {userName}!</span>
          </div>
          <UserCircle className="h-8 w-8 text-zinc-400" />
        </div>
      </div>
    </header>
  )
}
