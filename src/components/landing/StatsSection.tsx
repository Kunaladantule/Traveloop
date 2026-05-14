import { Button } from '@/components/ui/button'

export function StatsSection() {
  return (
    <div className="bg-gradient-to-br from-[#fcf8d4] to-[#fdfbf0] py-24 px-6 relative w-full overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Side: Images */}
        <div className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center">
          {/* Back Image */}
          <div className="absolute left-4 md:left-10 top-10 transform -rotate-6 w-48 md:w-64 h-64 md:h-80 bg-white p-3 shadow-lg z-10 transition-transform hover:scale-105 hover:z-30">
            <div className="w-full h-full relative overflow-hidden bg-gray-200">
               <img src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=400&q=80" alt="Paris" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur px-3 md:px-4 py-1 rounded-full text-[10px] md:text-xs font-semibold shadow flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Paris
            </div>
          </div>
          {/* Front Image */}
          <div className="absolute right-4 md:right-10 bottom-10 transform rotate-3 w-56 md:w-72 h-72 md:h-96 bg-white p-3 shadow-xl z-20 transition-transform hover:scale-105">
            {/* Red Pin */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-30 text-red-600 drop-shadow-md">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </div>
            <div className="w-full h-full relative overflow-hidden bg-gray-200">
               <img src="https://images.unsplash.com/photo-1516483638261-f4085ee6bd0f?auto=format&fit=crop&w=400&q=80" alt="Italy" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur px-3 md:px-4 py-1 rounded-full text-[10px] md:text-xs font-semibold shadow flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Italy
            </div>
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="flex flex-col items-start text-left">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6 tracking-tight leading-tight font-heading">
            Where Will You Go Next?<br />Let's Plan It.
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-md font-medium leading-relaxed">
            Pick a place, pack your bags, and leave the planning to us — your next adventure is just a click away!
          </p>

          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-white px-6 py-6 rounded-md text-base font-semibold mb-16 shadow-lg">
            + Create a Trip Now!
          </Button>

          <div className="flex flex-row items-center gap-8 md:gap-12 w-full flex-wrap">
            <div className="flex flex-col">
              <span className="text-3xl font-semibold text-primary mb-1 drop-shadow-sm">100K+</span>
              <span className="text-[10px] md:text-xs text-gray-500 font-bold tracking-wide uppercase">Happy Travellers & Counting</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-semibold text-primary mb-1 drop-shadow-sm">500+</span>
              <span className="text-[10px] md:text-xs text-gray-500 font-bold tracking-wide uppercase">Total Tour Destinations</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-semibold text-primary mb-1 drop-shadow-sm">4.8</span>
              <span className="text-[10px] md:text-xs text-gray-500 font-bold tracking-wide uppercase">Rated By Travellers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
