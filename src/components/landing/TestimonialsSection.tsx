"use client"

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    title: "An unforgettable honeymoon in Bali!",
    quote: "\"Traveloop made our Bali trip so personal — from a private villa setup to a surprise candlelight dinner by the beach. Everything felt curated just for us. Couldn't have asked for a better start to our marriage!\"",
    author: "Riya & Karan, Delhi",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 2,
    title: "A thrilling adventure in the Alps!",
    quote: "\"The itinerary planned by Traveloop was flawless. Every ski resort and hiking trail was perfectly matched to our skill level. The 24/7 support really gave us peace of mind during the whole trip.\"",
    author: "Alex & Sam, New York",
    image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 3,
    title: "Seamless solo travel in Japan",
    quote: "\"As a solo traveler, I was nervous about navigating Tokyo and Kyoto. Traveloop's detailed guides and local tips made it so easy. I discovered hidden gems I would have never found on my own!\"",
    author: "Priya, Bangalore",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80"
  }
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="bg-background py-24 px-6 w-full">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-20 text-center font-heading">
          What Our Happy Travelers Say
        </h2>

        {/* Image Constellation */}
        <div className="relative w-full max-w-4xl h-[300px] md:h-[400px] mb-12 flex items-center justify-center">
          {/* Center Main Image */}
          <div className="relative z-20 w-56 h-56 md:w-80 md:h-80 rounded-full border-[6px] border-[#86efac] overflow-hidden shadow-2xl transition-all duration-500">
            <img 
              src={testimonials[currentIndex].image} 
              alt={testimonials[currentIndex].author} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Floating surrounding images */}
          <div className="absolute top-10 left-[5%] md:left-[10%] w-16 h-16 md:w-20 md:h-20 rounded-full border-[3px] border-white overflow-hidden shadow-lg">
            <img src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=150&q=80" alt="Travel 1" className="w-full h-full object-cover" />
          </div>
          <div className="absolute top-[40%] left-[0%] md:left-[5%] w-12 h-12 md:w-16 md:h-16 rounded-full border-[3px] border-white overflow-hidden shadow-lg hidden sm:block">
            <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=150&q=80" alt="Travel 2" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-[10%] left-[10%] md:left-[15%] w-20 h-20 md:w-24 md:h-24 rounded-full border-[3px] border-white overflow-hidden shadow-lg">
            <img src="https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=150&q=80" alt="Travel 3" className="w-full h-full object-cover" />
          </div>
          <div className="absolute top-10 right-[10%] md:right-[15%] w-20 h-20 md:w-24 md:h-24 rounded-full border-[3px] border-white overflow-hidden shadow-lg">
            <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&q=80" alt="Travel 4" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-[20%] right-[5%] w-16 h-16 md:w-20 md:h-20 rounded-full border-[3px] border-white overflow-hidden shadow-lg hidden sm:block">
            <img src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=150&q=80" alt="Travel 5" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Text and Controls */}
        <div className="max-w-2xl text-center flex flex-col items-center">
          <h3 className="text-xl md:text-2xl font-bold text-primary mb-6 font-heading">
            {testimonials[currentIndex].title}
          </h3>
          <div className="flex items-center gap-2 md:gap-4 w-full justify-between md:justify-center">
            <button onClick={prev} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-800 shrink-0">
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed px-2 md:px-6 min-h-[100px] flex items-center italic">
              {testimonials[currentIndex].quote}
            </p>
            <button onClick={next} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-800 shrink-0">
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          </div>
          <p className="text-primary font-bold mt-6 text-sm">
            - {testimonials[currentIndex].author}
          </p>
        </div>
      </div>
    </div>
  )
}
