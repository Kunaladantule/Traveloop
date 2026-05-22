// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from '@/components/ui/sonner';

// ─────────────────────────────────────────────────────────────
// 🎨 Font Configuration
// ─────────────────────────────────────────────────────────────
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap", // Improves perceived performance
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

// ─────────────────────────────────────────────────────────────
// 📄 Metadata (SEO Optimized)
// ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "Traveloop",
    template: "%s | Traveloop"
  },
  description: "Travel smarter with personalized AI-powered trip plans. Discover, plan, and explore with confidence.",
  keywords: ["travel", "trip planner", "itinerary", "vacation", "AI travel"],
  authors: [{ name: "Traveloop Team" }],
  creator: "Traveloop",
  publisher: "Traveloop",
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL("https://traveloop.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://traveloop.com",
    title: "Traveloop",
    description: "Travel smarter with personalized plans.",
    siteName: "Traveloop",
  },
  twitter: {
    card: "summary_large_image",
    title: "Traveloop",
    description: "Travel smarter with personalized plans.",
  },
};

// ─────────────────────────────────────────────────────────────
// 🚀 Root Layout Component (Light Theme Default)
// ─────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      // 💡 Tip: Add 'dark' class here or via script to enable dark mode
      // Example: className={`... ${theme === 'dark' ? 'dark' : ''}`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {/* 📊 Top Progress Loader */}
        <NextTopLoader 
          color="#6366f1" // Indigo-500 - matches light theme primary
          showSpinner={false} 
          height={3} 
          shadow="0 0 10px rgba(99, 102, 241, 0.3)" 
          crawlSpeed={200}
          easing="ease"
        />
        
        {/* 🎯 Main Content */}
        {children}
        
        {/* 🔔 Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'white',
              color: '#1e293b', // slate-800
              border: '1px solid #e2e8f0', // slate-200
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
            classNames: {
              success: 'border-l-4 border-l-emerald-500',
              error: 'border-l-4 border-l-red-500',
              warning: 'border-l-4 border-l-amber-500',
              info: 'border-l-4 border-l-indigo-500',
            }
          }}
        />
      </body>
    </html>
  );
}