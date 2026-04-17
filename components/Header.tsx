'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Mic2, Download, Share2, Copy, CheckCheck, X, LogOut, UserCircle, Home } from 'lucide-react'
import { useStagePlot } from '@/providers/StagePlotProvider'
import { supabase } from '@/utils/supabase'
import { AuthModal } from '@/components/AuthModal'
import type { User } from '@supabase/supabase-js'

export const Header: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { data, setData } = useStagePlot()

  // Auth state
  const [user, setUser] = useState<User | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Title editing
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Share popover
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const shareRef = useRef<HTMLDivElement>(null)

  // User menu
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Check auth on mount and subscribe to changes
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const { viewMode } = useStagePlot()

  const routes = ['/', '/band', '/stage', '/details', '/rider-preview']
  const stepIndex = routes.indexOf(pathname)
  const isFlowPage = stepIndex !== -1
  const isLanding = stepIndex === 0
  const isStageplot = pathname === '/stageplot'
  const isSharedStageplot = pathname.startsWith('/stageplots/')

  const handleLogoClick = () => router.push('/')

  const handleStart = () => {
    router.push(user ? '/dashboard' : '/stageplot')
  }

  // Title
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

  // Close share popover on outside click
  useEffect(() => {
    if (!shareOpen) return
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [shareOpen])

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [userMenuOpen])

  // Export PNG via DOM query
  const handleExportPNG = useCallback(() => {
    const svg = document.querySelector<SVGSVGElement>('[data-export-svg]')
    if (!svg) return

    // Fetch and embed all external SVG images as data URLs
    const images = svg.querySelectorAll<SVGImageElement>('image')
    const imagePromises = Array.from(images).map(imgEl => {
      const href = imgEl.getAttribute('href') || imgEl.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
      if (!href) return Promise.resolve()

      return fetch(href)
        .then(res => res.blob())
        .then(blob => new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        }))
        .then(dataUrl => {
          // Replace href with data URL
          imgEl.setAttribute('href', dataUrl)
        })
        .catch(() => {
          // If fetch fails, leave it as-is
        })
    })

    Promise.all(imagePromises).then(() => {
      const xml = new XMLSerializer().serializeToString(svg)
      const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => {
        const c = document.createElement('canvas')
        c.width = 4800
        c.height = 3000
        const ctx = c.getContext('2d')
        if (!ctx) return
        ctx.drawImage(img, 0, 0, 4800, 3000)
        URL.revokeObjectURL(url)
        c.toBlob(b => {
          if (!b) return
          const a = document.createElement('a')
          a.href = URL.createObjectURL(b)
          a.download = `${data.details.bandName || 'stage-plot'}.png`
          a.click()
        })
      }
      img.src = url
    })
  }, [data.details.bandName])

  // ── Stageplot save handler ─────────────────────────────────────────────
  const [isSavingPlot, setIsSavingPlot] = useState(false)
  const [shareStats, setShareStats] = useState<{ view_count: number; created_at: string } | null>(null)
  const lastSavedDataRef = useRef<string | null>(null)

  const { savedStageplotId, savedShareToken, savedAt, setSaved, clearSaved } = useStagePlot()

  // Check if there are unsaved changes
  const hasUnsavedChanges = lastSavedDataRef.current !== null && lastSavedDataRef.current !== JSON.stringify(data)
  const isSaveDisabled = isSavingPlot || (!!savedStageplotId && !hasUnsavedChanges)

  const shareUrlValue = savedStageplotId
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/stageplot?id=${savedStageplotId}`
    : ''

  const handleSavePlot = useCallback(async (): Promise<boolean> => {
    if (!user) return false
    setIsSavingPlot(true)
    try {
      // Get the current session to get the access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session?.access_token) {
        console.error('Failed to get session:', sessionError)
        return false
      }

      const res = await fetch('/api/stageplots/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          plotData: data,
          stageplotId: savedStageplotId ?? undefined,
        }),
      })
      const json = await res.json()
      if (json.success) {
        const isFirstSave = !savedStageplotId
        setSaved(json.stageplotId, json.shareToken)
        setShareStats(null) // reset stats so they're re-fetched on next share open
        lastSavedDataRef.current = JSON.stringify(data)
        if (isFirstSave) {
          router.replace(`/stageplot?id=${json.stageplotId}`)
        }
        return true
      }
      return false
    } finally {
      setIsSavingPlot(false)
    }
  }, [data, savedStageplotId, setSaved, handleExportPNG, user])

  const handleNavigateToDashboard = useCallback(async () => {
    const isDefaultPlot = !data.details.bandName && data.members.length === 0 && data.stagePlot.length === 0
    if (user && !isDefaultPlot && (hasUnsavedChanges || !savedStageplotId)) {
      await handleSavePlot()
    }
    router.push('/dashboard')
  }, [user, data, hasUnsavedChanges, savedStageplotId, handleSavePlot, router])

  const handleOpenShare = useCallback(async () => {
    setShareOpen(o => !o)
    if (!savedStageplotId || shareStats) return
    try {
      const res = await fetch(`/api/stageplots/${savedStageplotId}`)
      if (res.ok) {
        const json = await res.json()
        setShareStats({ view_count: json.view_count ?? 0, created_at: json.created_at })
      }
    } catch { /* ignore */ }
  }, [savedStageplotId, shareStats])

  const handleCopyShareUrl = useCallback(() => {
    if (!shareUrlValue) return
    navigator.clipboard.writeText(shareUrlValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [shareUrlValue])

  // Initialize last saved data when a plot is loaded
  useEffect(() => {
    if (savedStageplotId) {
      lastSavedDataRef.current = JSON.stringify(data)
    }
  }, [savedStageplotId])

  function relativeTime(iso: string | null): string {
    if (!iso) return ''
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  if (isSharedStageplot) {
    return null
  }

  // Viewer mode - header is rendered by the page itself
  if (isStageplot && viewMode === 'viewer') {
    return null
  }

  if (isStageplot) {
    const displayName = data.details.bandName || 'Untitled Stage Plot'
    return (
      <>
        <nav className="no-print bg-white border-b border-slate-200/70 sticky top-0 z-50">
          <div className="px-4 h-16 flex items-center gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-indigo-600 p-1.5 rounded-lg cursor-pointer" onClick={handleLogoClick} title="Go to home">
                <Mic2 className="w-5 h-5 text-white" />
              </div>
              {user && (
                <button
                  onClick={handleNavigateToDashboard}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Go to dashboard"
                >
                  <Home className="w-5 h-5 text-slate-500 hover:text-slate-800" />
                </button>
              )}
            </div>

            {user && <span className="text-slate-300 select-none">|</span>}

            {/* Editable title */}
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
                className="bg-transparent text-slate-900 text-base font-medium focus:outline-none border-b border-indigo-500 px-0.5 w-48 min-w-0"
                placeholder="Untitled Stage Plot"
              />
            ) : (
              <button
                onClick={handleTitleClick}
                className="text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 px-1.5 py-0.5 rounded transition-colors truncate max-w-xs"
              >
                {displayName}
              </button>
            )}

            {/* Saved/unsaved indicator + Save button */}
            <div className="flex items-center gap-2">
              {savedStageplotId && !hasUnsavedChanges && user ? (
                <span className="flex items-center gap-1 text-xs text-green-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  Saved {savedAt ? relativeTime(savedAt) : ''}
                </span>
              ) : hasUnsavedChanges ? (
                <span className="flex items-center gap-1 text-xs text-amber-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  Unsaved changes
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  Not saved to cloud
                </span>
              )}
              <button
                onClick={() => {
                  if (!user) {
                    setIsAuthModalOpen(true)
                  } else {
                    handleSavePlot()
                  }
                }}
                disabled={isSaveDisabled}
                className={`text-xs px-3 py-1.5 rounded transition-colors ${
                  isSaveDisabled
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                } disabled:opacity-50`}
              >
                {isSavingPlot ? 'Saving...' : 'Save'}
              </button>
            </div>

            <div className="flex-1" />

            {/* Stats */}
            <span className="hidden sm:block text-sm text-slate-300 mr-1">
              {data.stagePlot.length} item{data.stagePlot.length !== 1 ? 's' : ''} · {data.members.length} member{data.members.length !== 1 ? 's' : ''}
            </span>

            {/* Download button */}
            <button
              onClick={handleExportPNG}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 hover:text-slate-900 rounded text-sm transition-colors"
            >
              <Download size={14} /> Download
            </button>

            {/* Share button + popover */}
            <div ref={shareRef} className="relative">
              <button
                onClick={async () => {
                  if (!user) {
                    setIsAuthModalOpen(true)
                  } else if (!savedStageplotId || hasUnsavedChanges) {
                    const success = await handleSavePlot()
                    if (success) setShareOpen(true)
                  } else {
                    handleOpenShare()
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium transition-colors"
              >
                <Share2 size={14} /> Share
              </button>

              {shareOpen && savedStageplotId && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-700">Share stage plot</span>
                    <button onClick={() => setShareOpen(false)} className="text-slate-300 hover:text-slate-500">
                      <X size={13} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Share URL row */}
                    <div className="flex gap-1.5">
                      <input
                        readOnly
                        value={shareUrlValue}
                        className="flex-1 min-w-0 bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-500 focus:outline-none"
                      />
                      <button
                        onClick={handleCopyShareUrl}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs transition-colors shrink-0"
                      >
                        {copied ? <CheckCheck size={12} className="text-green-500" /> : <Copy size={12} />}
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="text-xs text-slate-400 space-y-1">
                      {shareStats ? (
                        <>
                          <p>Viewed {shareStats.view_count} time{shareStats.view_count !== 1 ? 's' : ''}</p>
                          <p>Created {relativeTime(shareStats.created_at)}</p>
                        </>
                      ) : (
                        <p className="text-slate-300">Loading stats…</p>
                      )}
                      {savedAt && <p>Saved {relativeTime(savedAt)}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User menu or account button */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => {
                  if (user) {
                    setUserMenuOpen(!userMenuOpen)
                  } else {
                    setIsAuthModalOpen(true)
                  }
                }}
                className="flex items-center gap-2 px-2 py-1 hover:bg-slate-100 rounded transition-colors"
                title={user ? "User menu" : "Sign in"}
              >
                <UserCircle size={20} className="text-slate-500" />
              </button>

              {user && userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-2xl z-50">
                  <div className="p-3 border-b border-slate-200">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-xs text-slate-700 font-medium truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={async () => {
                      setSigningOut(true)
                      try {
                        const { error } = await supabase.auth.signOut()
                        if (error) throw error
                        setUserMenuOpen(false)
                      } catch (err) {
                        console.error('Sign out failed:', err)
                      } finally {
                        setSigningOut(false)
                      }
                    }}
                    disabled={signingOut}
                    className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <LogOut size={13} />
                    {signingOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={() => {
            setIsAuthModalOpen(false)
            handleSavePlot()
          }}
        />


      </>
    )
  }

  // Landing page header
  if (isLanding) {
    return (
      <nav className="no-print bg-white border-b border-slate-200/70 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Mic2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Miked<span className="text-indigo-500">.live</span>
            </span>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <a href="#features" className="hover:text-indigo-500 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-500 transition-colors">How it Works</a>
            <a href="/changelog" className="hover:text-indigo-500 transition-colors">Changelog</a>
            <a href="/contact" className="hover:text-indigo-500 transition-colors">Contact</a>
            <button
              onClick={handleStart}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium h-9 px-4 rounded-md transition-colors"
            >
              Start Now
            </button>
          </div>
          <div className="md:hidden flex items-center gap-3 text-xs font-medium text-slate-500">
            <a href="/changelog" className="hover:text-indigo-500 transition-colors">Changelog</a>
            <a href="/contact" className="hover:text-indigo-500 transition-colors">Contact</a>
            <button
              onClick={handleStart}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium h-8 px-3 rounded-md transition-colors"
            >
              Start
            </button>
          </div>
        </div>
      </nav>
    )
  }

  // Dashboard and other pages header
  return (
    <nav className="no-print bg-white border-b border-slate-200/70 sticky top-0 z-50">
      <div className="px-4 h-16 flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-indigo-600 p-1.5 rounded-lg cursor-pointer" onClick={handleLogoClick} title="Go to home">
            <Mic2 className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Empty space */}
        <div className="flex-1" />

        {/* User menu */}
        {user && (
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-2 py-1 hover:bg-slate-100 rounded transition-colors"
              title="User menu"
            >
              <UserCircle size={20} className="text-slate-500" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-2xl z-50">
                <div className="p-3 border-b border-slate-200">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-xs text-slate-700 font-medium truncate">{user.email}</p>
                </div>
                <button
                  onClick={async () => {
                    setSigningOut(true)
                    try {
                      const { error } = await supabase.auth.signOut()
                      if (error) throw error
                      setUserMenuOpen(false)
                    } catch (err) {
                      console.error('Sign out failed:', err)
                    } finally {
                      setSigningOut(false)
                    }
                  }}
                  disabled={signingOut}
                  className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <LogOut size={13} />
                  {signingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
