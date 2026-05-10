import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-col items-center justify-center text-center p-8 space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
          Traveloop
        </h1>
        <p className="max-w-[600px] text-lg text-zinc-500 dark:text-zinc-400">
          The ultimate travel planning application. Organize your trips, manage your budget, and build the perfect itinerary.
        </p>
        <div className="flex space-x-4">
          <Link href="/login">
            <Button size="lg">Log In</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" size="lg">Sign Up</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
