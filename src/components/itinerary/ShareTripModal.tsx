'use client'

import { useState } from 'react'
import { Share, Copy, Check, Globe } from 'lucide-react'
import { toggleTripPublic } from '@/app/actions/share'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'

export function ShareTripModal({ tripId, initialIsPublic, initialShareSlug }: { tripId: string, initialIsPublic: boolean, initialShareSlug: string | null }) {
  const [open, setOpen] = useState(false)
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [shareSlug, setShareSlug] = useState(initialShareSlug)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleToggle = async (checked: boolean) => {
    setLoading(true)
    const res = await toggleTripPublic(tripId, checked)
    if (res.success) {
      setIsPublic(checked)
      setShareSlug(res.shareSlug)
    }
    setLoading(false)
  }

  const handleCopy = () => {
    if (!shareSlug) return
    const url = `${window.location.origin}/share/${shareSlug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-white/10 text-white hover:bg-white/20 border-white/20">
          <Share className="h-4 w-4 mr-2" /> Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Trip</DialogTitle>
          <DialogDescription>
            Make your itinerary public and share it with others.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium leading-none">Public Link</span>
            <span className="text-sm text-zinc-500">Allow anyone with the link to view this trip.</span>
          </div>
          <Switch 
            checked={isPublic} 
            onCheckedChange={handleToggle} 
            disabled={loading}
          />
        </div>
        {isPublic && shareSlug && (
          <div className="flex flex-col space-y-2 pb-4">
            <label className="text-sm font-medium">Share Link</label>
            <div className="flex items-center space-x-2">
              <Input
                readOnly
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/share/${shareSlug}`}
                className="flex-1 bg-zinc-50 dark:bg-zinc-900"
              />
              <Button size="icon" onClick={handleCopy} variant="secondary" className="shrink-0">
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-2 rounded">
              <Globe className="h-4 w-4" />
              <span>Public viewers cannot see your budget or make edits.</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
