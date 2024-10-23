// src/components/AppLayout.tsx
import Footer from './Footer'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  )
}