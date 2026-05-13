import { Plus, Star, Tag, HeadphonesIcon, ShieldCheck, Map } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LocationSearch } from '@/components/search/LocationSearch'
import { HeaderAuth } from '@/components/auth/HeaderAuth'
import { HeroAuthButton } from '@/components/auth/HeroAuthButton'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen text-[#0F172A] font-sans bg-white">
      {/* Navigation */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Map className="h-6 w-6 text-indigo-600" />
          <span className="text-xl font-bold tracking-tight">Traveloop</span>
        </div>

        {/* Search Bar Component */}
        <LocationSearch />

        {/* Login/Signup / Profile Avatar */}
        <div>
          <HeaderAuth />
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-12 pb-64 z-10 relative">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-black drop-shadow-md mb-2 leading-[1.1]">
            Your Trip, Your Vibe
          </h1>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-black drop-shadow-md mb-6 leading-[1.1]">
            Our AI's on It
          </h1>

          <p className="text-lg md:text-xl text-black drop-shadow-sm mb-10 max-w-2xl font-medium">
            Solo? Couple? Group? We Plan Like It's Just for You — Because It Is
          </p>

          <HeroAuthButton />
        </div>

        {/* Full Screen Background */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <img
            src="/bg.png"
            alt="Background"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </main>

      {/* Trust Strip Footer */}
      <div className="z-20 relative">
        <div className="bg-[#059669] h-4 w-full"></div>
        <div className="bg-[#0F172A] text-white py-4 px-6">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center md:justify-between items-center gap-6 text-sm font-medium text-zinc-300">
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-full p-1 w-6 h-6 flex items-center justify-center">
                <span className="text-[#EA4335] font-bold text-[10px]">G</span>
              </div>
              4.8+ rated
            </div>

            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-emerald-400" />
              All Taxes & Fees Included
            </div>

            <div className="flex items-center gap-2">
              <HeadphonesIcon className="h-4 w-4 text-emerald-400" />
              24/7 Support
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              Secure Payments
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
