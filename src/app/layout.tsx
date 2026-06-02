// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
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

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
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
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
      // 💡 Tip: Add 'dark' class here or via script to enable dark mode
      // Example: className={`... ${theme === 'dark' ? 'dark' : ''}`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {/* 📊 Top Progress Loader */}
        <NextTopLoader 
          color="#6C63FF"
          showSpinner={false} 
          height={3} 
          shadow="0 0 10px rgba(108,99,255,0.4)" 
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
              background: '#EAEFF5',
              color: '#1e293b',
              border: 'none',
              boxShadow: '8px 8px 16px rgba(163,177,198,.45), -8px -8px 16px rgba(255,255,255,.85)',
              borderRadius: '20px',
            },
          }}
        />
      </body>
    </html>
  );
}