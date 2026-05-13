'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, User, Mail, Link as LinkIcon } from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { getProfile, updateProfile } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  const router = useRouter()

  useEffect(() => {
    const fetchAuthAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)

      const res = await getProfile(session.user.id)
      if (res.success && res.profile) {
        setName(res.profile.name || '')
        setAvatarUrl(res.profile.avatarUrl || '')
      }
      setLoading(false)
    }

    fetchAuthAndProfile()
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSaving(true)
    await updateProfile(user.id, { name, avatarUrl })
    setIsSaving(false)
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center">Loading settings...</div>
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-zinc-500 mt-2">Manage your account settings and profile preferences.</p>
      </div>

      <Card>
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your public profile details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-zinc-500" /> Email Address
              </label>
              <Input value={user?.email || ''} disabled className="bg-zinc-50 dark:bg-zinc-900" />
              <p className="text-xs text-zinc-500">Your email is managed by your authentication provider.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-zinc-500" /> Display Name
              </label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="How should we call you?"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-zinc-500" /> Avatar URL
              </label>
              <div className="flex gap-4 items-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar Preview" className="h-12 w-12 rounded-full object-cover border" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                    <User className="h-6 w-6 text-zinc-400" />
                  </div>
                )}
                <Input 
                  value={avatarUrl} 
                  onChange={(e) => setAvatarUrl(e.target.value)} 
                  placeholder="https://example.com/avatar.jpg"
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6 bg-zinc-50/50 dark:bg-zinc-900/50">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
