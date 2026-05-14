"use client"

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    question: "How do I get my dream trip planned with Traveloop?",
    answer: "Easy — just tell us where you'd like to go and what you're confused about, when you're going, and what kind of traveler you are. Whether you're into adventure, food, culture, or just chilling, we mix your vibe with our tech + travel experts to craft a trip that's 100% you."
  },
  {
    question: "What makes Traveloop itineraries so different (read: better)?",
    answer: "Our itineraries aren't generic templates. They are deeply personalized using AI and human expertise, matching your exact preferences, pace, and budget, with smart suggestions you won't find on a standard tour."
  },
  {
    question: "Will someone be there if things go wrong mid-trip?",
    answer: "Absolutely! We provide 24/7 on-ground support and a dedicated concierge to handle any hiccups, rebookings, or emergencies while you are traveling."
  },
  {
    question: "Can you help with visa, insurance, and all that jazz?",
    answer: "Yes, we offer comprehensive assistance for visas, travel insurance, and necessary documentation to ensure you have a hassle-free boarding process."
  },
  {
    question: "Can I change or cancel stuff later?",
    answer: "We offer flexible booking options. Depending on the specific flight and hotel policies, you can modify or cancel aspects of your trip through our platform."
  },
  {
    question: "Don't know where to go? Will you help me pick?",
    answer: "Of course. Use our discovery tool to input your vibe and budget, and we'll recommend the best destinations perfectly suited for you."
  },
  {
    question: "Any hidden charges I should worry about?",
    answer: "Zero hidden charges. What you see during the booking process is exactly what you pay. We pride ourselves on 100% transparent pricing."
  },
  {
    question: "Do you do budget-friendly trips (like under ₹1 Lakh)?",
    answer: "Yes, we cater to all budgets! Whether it's a luxury getaway or a budget backpacking trip, we optimize the best possible experience for your budget."
  },
  {
    question: "Are your plans just touristy spots or something cooler?",
    answer: "We love offbeat travel. While we include the must-sees, our specialty is adding local secrets, hidden gems, and authentic experiences you won't find in typical guides."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-background py-24 px-6 w-full">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <h2 className="text-4xl font-bold text-primary mb-4 text-center font-heading">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-500 text-lg mb-16 text-center font-medium">
          Planning made simple with answers to your most common questions.
        </p>

        <div className="w-full max-w-4xl flex flex-col gap-2">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`border-b border-gray-200 py-6 transition-all`}
              >
                <button 
                  onClick={() => toggle(index)}
                  className="w-full flex justify-between items-center text-left focus:outline-none group"
                >
                  <span className={`font-semibold text-lg md:text-base pr-8 ${isOpen ? 'text-primary' : 'text-gray-800 group-hover:text-primary'}`}>
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0">
                    {isOpen ? (
                      <Minus className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Plus className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
