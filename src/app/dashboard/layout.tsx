import { TopBar } from '@/components/layout/TopBar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white text-[#0F172A] font-sans">
      <TopBar />
      <main className="flex-1 bg-white">
        {children}
      </main>
    </div>
  )
}
