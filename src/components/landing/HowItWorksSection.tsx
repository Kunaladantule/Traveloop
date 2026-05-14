import { ClipboardEdit, Sparkles, SlidersHorizontal, PlaneTakeoff } from 'lucide-react'

export function HowItWorksSection() {
  return (
    <div className="bg-background py-24 px-6 relative w-full">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4 text-center tracking-tight font-heading">
          How It Works
        </h2>
        <p className="text-gray-500 text-lg mb-20 max-w-2xl text-center font-medium">
          Your perfect trip, planned in 4 simple steps.
        </p>

        <div className="flex flex-col md:flex-row justify-between w-full relative gap-12 md:gap-4">
          {/* Connecting Line for Desktop */}
          <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-1 bg-gradient-to-r from-blue-100 via-indigo-200 to-purple-100 z-0 rounded-full"></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center text-center relative z-10 w-full md:w-1/4 group">
            <div className="w-24 h-24 rounded-full bg-white shadow-lg border-4 border-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-indigo-100 transition-all duration-300">
              <ClipboardEdit className="h-10 w-10 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-3 font-heading">1. Describe Your Trip</h3>
            <p className="text-gray-500 text-sm px-4 leading-relaxed">
              Tell us your destination, dates, budget, and vibe.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center relative z-10 w-full md:w-1/4 group">
            <div className="w-24 h-24 rounded-full bg-white shadow-lg border-4 border-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-blue-100 transition-all duration-300">
              <Sparkles className="h-10 w-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-3 font-heading">2. AI Builds Itinerary</h3>
            <p className="text-gray-500 text-sm px-4 leading-relaxed">
              Our AI crafts a personalized, day-by-day plan instantly.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center relative z-10 w-full md:w-1/4 group">
            <div className="w-24 h-24 rounded-full bg-white shadow-lg border-4 border-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-emerald-100 transition-all duration-300">
              <SlidersHorizontal className="h-10 w-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-3 font-heading">3. Customize Activities</h3>
            <p className="text-gray-500 text-sm px-4 leading-relaxed">
              Tweak the plan, add places, and finalize your perfect schedule.
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center relative z-10 w-full md:w-1/4 group">
            <div className="w-24 h-24 rounded-full bg-white shadow-lg border-4 border-purple-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-purple-100 transition-all duration-300">
              <PlaneTakeoff className="h-10 w-10 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-3 font-heading">4. Share & Travel</h3>
            <p className="text-gray-500 text-sm px-4 leading-relaxed">
              Share the itinerary with your friends and embark on your journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
