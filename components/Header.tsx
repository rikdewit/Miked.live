'use client'

import React, { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Mic2 } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { useRider } from '@/providers/RiderProvider'

export const Header: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  const posthog = usePostHog()
  const { data, setData } = useRider()

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)

  const routes = ['/', '/band', '/stage', '/details', '/rider-preview']
  const stepIndex = routes.indexOf(pathname)
  const isFlowPage = stepIndex !== -1 && !pathname.startsWith('/riders/')
  const isLanding = stepIndex === 0 || pathname.startsWith('/riders/')
  const isDashboard = pathname === '/dashboard'

  const handleLogoClick = () => router.push('/')

  const handleStart = () => {
    posthog?.capture('start_now_clicked')
    router.push('/dashboard')
  }

  const handleTitleClick = () => {
    setTitleDraft(data.details.bandName || '')
    setEditingTitle(true)
  }

  const handleTitleSave = () => {
    setData(prev => ({ ...prev, details: { ...prev.details, bandName: titleDraft } }))
    setEditingTitle(false)
  }

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [editingTitle])

  if (isDashboard) {
    const displayName = data.details.bandName || 'Untitled Stage Plot'
    return (
      <nav className="no-print bg-slate-950 border-b border-slate-800/50 sticky top-0 z-50">
        <div className="px-4 h-10 flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={handleLogoClick}>
            <div className="bg-indigo-600 p-1 rounded-md">
              <Mic2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight">
              Miked<span className="text-indigo-500">.live</span>
            </span>
          </div>
          <span className="text-slate-700 select-none">|</span>
          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={e => {
                if (e.key === 'Enter') handleTitleSave()
                if (e.key === 'Escape') setEditingTitle(false)
              }}
              className="bg-transparent text-white text-sm font-medium focus:outline-none border-b border-indigo-500 px-0.5 w-48 min-w-0"
              placeholder="Untitled Stage Plot"
            />
          ) : (
            <button
              onClick={handleTitleClick}
              className="text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 px-1.5 py-0.5 rounded transition-colors truncate max-w-xs"
            >
              {displayName}
            </button>
          )}
        </div>
      </nav>
    )
  }

  return (
    <nav className="no-print bg-slate-950 border-b border-slate-800/50 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Mic2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Miked<span className="text-indigo-500">.live</span>
          </span>
        </div>

        {/* Right side */}
        {isLanding || !isFlowPage ? (
          <>
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
              <a href={isLanding ? "#features" : "/#features"} className="hover:text-indigo-400 transition-colors">Features</a>
              <a href={isLanding ? "#how-it-works" : "/#how-it-works"} className="hover:text-indigo-400 transition-colors">How it Works</a>
              <a href="/changelog" className="hover:text-indigo-400 transition-colors">Changelog</a>
              <a href="/contact" className="hover:text-indigo-400 transition-colors">Contact</a>
              <button
                onClick={handleStart}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium h-9 px-4 rounded-md transition-colors"
              >
                Start Now
              </button>
            </div>
            {/* Mobile navigation */}
            <div className="md:hidden flex items-center gap-3 text-xs font-medium text-slate-400">
              <a href="/changelog" className="hover:text-indigo-400 transition-colors">Changelog</a>
              <a href="/contact" className="hover:text-indigo-400 transition-colors">Contact</a>
              <button
                onClick={handleStart}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium h-8 px-3 rounded-md transition-colors"
              >
                Start
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-end gap-6 text-sm text-slate-400">
            <span className="hidden md:inline">
              <span className={stepIndex >= 1 ? 'text-indigo-400 font-bold' : ''}>1. Band</span>
              <span className="mx-3">→</span>
              <span className={stepIndex >= 2 ? 'text-indigo-400 font-bold' : ''}>2. Stage</span>
              <span className="mx-3">→</span>
              <span className={stepIndex >= 3 ? 'text-indigo-400 font-bold' : ''}>3. Details</span>
              <span className="mx-3">→</span>
              <span className={stepIndex >= 4 ? 'text-indigo-400 font-bold' : ''}>4. Download</span>
            </span>
            <span className="md:hidden">
              <span className={stepIndex >= 1 ? 'text-indigo-400 font-bold' : ''}>1</span>
              <span className="mx-4">→</span>
              <span className={stepIndex >= 2 ? 'text-indigo-400 font-bold' : ''}>2</span>
              <span className="mx-4">→</span>
              <span className={stepIndex >= 3 ? 'text-indigo-400 font-bold' : ''}>3</span>
              <span className="mx-4">→</span>
              <span className={stepIndex >= 4 ? 'text-indigo-400 font-bold' : ''}>4</span>
            </span>
          </div>
        )}
      </div>
    </nav>
  )
}
