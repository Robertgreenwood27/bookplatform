// src/components/Footer.tsx
import { Settings } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full py-4 px-4 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-zinc-500 text-sm">
          © {new Date().getFullYear()} Book Platform
        </div>
        <Link 
          href="/studio"
          className="text-zinc-500 hover:text-zinc-300 transition-colors duration-200 opacity-30 hover:opacity-100"
          aria-label="Content Management System"
        >
          <Settings size={20} />
        </Link>
      </div>
    </footer>
  )
}