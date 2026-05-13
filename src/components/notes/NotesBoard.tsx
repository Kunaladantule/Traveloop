'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, StickyNote, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { getNotes, addNote, deleteNote } from '@/app/actions/notes'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

export function NotesBoard({ tripId }: { tripId: string }) {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const refreshData = () => setRefreshTrigger(prev => prev + 1)

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true)
      const res = await getNotes(tripId)
      if (res.success) {
        setNotes(res.notes)
      }
      setLoading(false)
    }
    fetchNotes()
  }, [tripId, refreshTrigger])

  const handleAddNote = async () => {
    if (!newNoteContent.trim() || isSubmitting) return

    setIsSubmitting(true)
    const res = await addNote({ tripId, content: newNoteContent.trim() })
    if (res.success) {
      setNewNoteContent('')
      refreshData()
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (noteId: string) => {
    if (confirm('Delete this note?')) {
      const res = await deleteNote(noteId, tripId)
      if (res.success) refreshData()
    }
  }

  if (loading && notes.length === 0) {
    return <div className="py-12 text-center text-zinc-500">Loading notes...</div>
  }

  return (
    <div className="space-y-8">
      {/* Add New Note */}
      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-500 font-medium">
              <StickyNote className="h-5 w-5" />
              <h3>Jot down a new note</h3>
            </div>
            <Textarea 
              placeholder="Confirmation numbers, ideas, reminders..." 
              value={newNoteContent} 
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="min-h-[100px] bg-white/50 dark:bg-black/20 border-amber-200 dark:border-amber-800 focus-visible:ring-amber-500"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleAddNote} 
                disabled={!newNoteContent.trim() || isSubmitting}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" /> Save Note
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-zinc-500 border border-dashed rounded-lg">
            No notes yet. Add your first note above!
          </div>
        ) : (
          notes.map((note: any) => (
            <Card key={note.id} className="flex flex-col bg-amber-50 dark:bg-zinc-900 border-amber-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
              <CardContent className="pt-6 flex-1">
                <p className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-300">
                  {note.content}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center pb-4 pt-2 text-xs text-zinc-500 dark:text-zinc-500">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {format(new Date(note.createdAt), 'MMM d, yyyy')}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500" 
                  onClick={() => handleDelete(note.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
