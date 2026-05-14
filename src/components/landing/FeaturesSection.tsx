import { Wallet, Compass, Briefcase, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function FeaturesSection() {
  return (
    <div className="bg-background py-24 px-6 relative z-10 w-full">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4 tracking-tight font-heading">
          Because Great Trips Should Feel Easy
        </h2>
        <p className="text-gray-500 text-lg mb-20 max-w-2xl font-medium">
          No chaos. No guesswork. Just good journeys.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 w-full">
          {/* Feature 1 */}
          <div className="relative group p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-out w-full flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-primary text-xl mb-3 font-heading">Smart Budget Planner</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-[250px]">
              Keep track of your expenses, set budgets, and never overspend on your dream trip.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="relative group p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-out w-full flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
              <Compass className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-primary text-xl mb-3 font-heading">Activity Discovery</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-[250px]">
              Find hidden gems, local favorites, and top-rated attractions wherever you go.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="relative group p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-out w-full flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-primary text-xl mb-3 font-heading">Packing Assistant</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-[250px]">
              Get smart packing lists based on your destination's weather and planned activities.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="relative group p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-out w-full flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-primary text-xl mb-3 font-heading">Share & Collaborate</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-[250px]">
              Invite friends, vote on itineraries, and plan your group adventure together seamlessly.
            </p>
          </div>
        </div>

        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-white px-8 py-6 rounded-md text-base font-semibold group flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
          Explore how Traveloop plans trips
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>

        <div className="mt-32 flex flex-col items-center border-t border-gray-200 pt-20 w-full">
          <h2 className="text-4xl font-bold text-primary mb-4 font-heading">My Trips</h2>
          <p className="text-gray-500 text-lg mb-8">
            View your trips and start planning your next adventure.
          </p>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-white px-8 py-6 rounded-md text-base font-semibold shadow-lg hover:shadow-xl transition-all">
            View all plans
          </Button>
        </div>
      </div>
    </div>
  )
}
