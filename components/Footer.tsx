'use client'

import { Mic2 } from 'lucide-react'

export const Footer = () => {
  return (
    <footer className="py-12 border-t border-slate-200 text-slate-500 text-sm">
      <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded">
            <Mic2 className="w-4 h-4 text-slate-700" />
          </div>
          <span className="font-semibold text-slate-800">
            Miked<span className="text-indigo-500">.live</span>
          </span>
        </div>
        <div className="flex gap-8">
          <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
          <a href="/terms" className="hover:text-white transition-colors">Terms</a>
          <a href="/contact" className="hover:text-white transition-colors">Contact</a>
        </div>
        <div>&copy; {new Date().getFullYear()} Miked.live. All rights reserved.</div>
      </div>
    </footer>
  )
}
