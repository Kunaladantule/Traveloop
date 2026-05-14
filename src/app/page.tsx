import { HeroAuthButton } from '@/components/auth/HeroAuthButton'
import { Tag, HeadphonesIcon, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { LandingNav } from '@/components/layout/LandingNav'
import { FadeUp } from '@/components/ui/fade-up'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { StatsSection } from '@/components/landing/StatsSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen text-primary font-sans bg-white">
      {/* Navigation */}
      <LandingNav />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col relative overflow-hidden min-h-[calc(100vh-72px)]">
        <FadeUp delay={0.2} className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-12 pb-64 z-10 relative">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-black drop-shadow-md mb-2 leading-[1.1] font-heading">
            Plan Smarter, Travel Better
          </h1>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-black drop-shadow-md mb-6 leading-[1.1] font-heading">
            Our AI's on It
          </h1>

          <p className="text-lg md:text-xl text-black drop-shadow-sm mb-10 max-w-2xl font-medium">
            Personalized itineraries, budgets, activities, packing lists, and shareable trip plans—all in one place.
          </p>

          <HeroAuthButton />
        </FadeUp>

        {/* Full Screen Background */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <img
            src="/bg.png"
            alt="Background"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </main>

      {/* Trust Strip */}
      <div className="z-20 relative w-full">
        <div className="bg-[#059669] h-4 w-full"></div>
        <div className="bg-primary text-primary-foreground text-white py-4 px-6">
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

      {/* Features Section */}
      <FadeUp id="features">
        <FeaturesSection />
      </FadeUp>

      {/* How It Works Section */}
      <FadeUp id="how-it-works">
        <HowItWorksSection />
      </FadeUp>

      <FadeUp>
        <StatsSection />
      </FadeUp>
      
      <FadeUp id="testimonials">
        <TestimonialsSection />
      </FadeUp>
      
      <FadeUp id="faq">
        <FAQSection />
      </FadeUp>

      {/* Trust Strip removed from bottom */}
    </div>
  )
}
