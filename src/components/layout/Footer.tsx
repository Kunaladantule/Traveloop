import { Map } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// SVG Icons for social media since lucide-react might not have them
const TwitterIcon = (props: any) => <svg viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>;
const FacebookIcon = (props: any) => <svg viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
const InstagramIcon = (props: any) => <svg viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>;
const LinkedinIcon = (props: any) => <svg viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
const PinterestIcon = (props: any) => <svg viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.601 0 12.017 0z"/></svg>;

export function Footer() {
  return (
    <footer className="bg-[#1C1C1C] text-white pt-16 pb-6 px-6 md:px-12 mt-auto w-full">
      <div className="max-w-7xl mx-auto">
        {/* Yellow Subscription Box */}
        <div className="bg-[#FFEB3B] rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 mb-16 relative overflow-hidden">
          <h2 className="text-3xl md:text-4xl font-bold text-black max-w-md">
            Good Vibes & Great Deals, Straight to You.
          </h2>
          <div className="flex w-full md:max-w-md items-center bg-white rounded-lg p-1 overflow-hidden">
            <Input type="email" placeholder="Email Address" className="border-0 focus-visible:ring-0 text-black shadow-none bg-transparent flex-1" />
            <Button className="bg-black text-white hover:bg-gray-800 rounded-md px-8 h-10">Subscribe</Button>
          </div>
        </div>

        {/* Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Map className="h-8 w-8 text-white" />
              <span className="text-2xl font-bold tracking-tight text-white">Traveloop</span>
            </div>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Traveloop designs personalised travel experiences powered by Kaira, our AI travel planner. From discovery to bookings, Kaira helps craft seamless, immersive journeys tailored to you.
            </p>
            <div className="flex gap-3 mb-8">
              <div className="w-8 h-8 rounded-full bg-[#1DA1F2] flex items-center justify-center cursor-pointer hover:opacity-80 transition"><TwitterIcon className="h-4 w-4 text-white fill-current" /></div>
              <div className="w-8 h-8 rounded-full bg-[#4267B2] flex items-center justify-center cursor-pointer hover:opacity-80 transition"><FacebookIcon className="h-4 w-4 text-white fill-current" /></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F56040] to-[#C13584] flex items-center justify-center cursor-pointer hover:opacity-80 transition"><InstagramIcon className="h-4 w-4 text-white" /></div>
              <div className="w-8 h-8 rounded-full bg-[#0077B5] flex items-center justify-center cursor-pointer hover:opacity-80 transition"><LinkedinIcon className="h-4 w-4 text-white fill-current" /></div>
              <div className="w-8 h-8 rounded-full bg-[#E60023] flex items-center justify-center cursor-pointer hover:opacity-80 transition"><PinterestIcon className="h-4 w-4 text-white fill-current" /></div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white mb-2">Contact Us</h3>
              <p className="text-xs text-gray-400 flex items-center gap-2"><span>📞</span> +91 7827441548</p>
              <p className="text-xs text-gray-400 flex items-center gap-2"><span>✉️</span> info@traveloop.com</p>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="text-sm font-bold text-white mb-6">Travel Destinations</h3>
            <ul className="space-y-4 text-xs font-medium text-gray-400">
              <li><Link href="#" className="hover:text-white transition">Europe</Link></li>
              <li><Link href="#" className="hover:text-white transition">Asia</Link></li>
              <li><Link href="#" className="hover:text-white transition">North America</Link></li>
              <li><Link href="#" className="hover:text-white transition">South America</Link></li>
              <li><Link href="#" className="hover:text-white transition">Australia & New Zealand</Link></li>
              <li><Link href="#" className="hover:text-white transition">Africa</Link></li>
              <li><Link href="#" className="hover:text-white transition">Caribbean</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-6">Travel Styles</h3>
            <ul className="space-y-4 text-xs font-medium text-gray-400">
              <li><Link href="#" className="hover:text-white transition">Personalise</Link></li>
              <li><Link href="#" className="hover:text-white transition">La Tomatina</Link></li>
              <li><Link href="#" className="hover:text-white transition">Summer Holidays</Link></li>
              <li><Link href="#" className="hover:text-white transition">Road Trips</Link></li>
              <li><Link href="#" className="hover:text-white transition">Europe under 1 Lakh</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-6">Company</h3>
            <ul className="space-y-4 text-xs font-medium text-gray-400">
              <li><Link href="#" className="hover:text-white transition">Blogs</Link></li>
              <li><Link href="#" className="hover:text-white transition">For Corporates</Link></li>
              <li><Link href="#" className="hover:text-white transition">Testimonials</Link></li>
              <li><Link href="#" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-6">Terms & Policies</h3>
            <ul className="space-y-4 text-xs font-medium text-gray-400">
              <li><Link href="#" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition">COVID-19 Safety</Link></li>
              <li><Link href="#" className="hover:text-white transition">Subscribe</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright Bottom */}
        <div className="border-t border-gray-800 pt-6 mt-8 text-center text-[10px] text-gray-500">
          <p>Copyright © 2018 - 2026 Traveloop Private Limited ® - All Rights Reserved</p>
        </div>
      </div>
    </footer>
  )
}
