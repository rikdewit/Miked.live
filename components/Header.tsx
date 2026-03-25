'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Mic2, Download, Share2, Copy, CheckCheck, X } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { useStagePlot } from '@/providers/StagePlotProvider'
import { DownloadModal } from '@/components/DownloadModal'

export const Header: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  const posthog = usePostHog()
  const { data, setData } = useStagePlot()

  // Title editing
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Share popover
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareRef = useRef<HTMLDivElement>(null)

  const routes = ['/', '/band', '/stage', '/details', '/rider-preview']
  const stepIndex = routes.indexOf(pathname)
  const isFlowPage = stepIndex !== -1
  const isLanding = stepIndex === 0
  const isStageplot = pathname === '/stageplot'

  const handleLogoClick = () => router.push('/')

  const handleStart = () => {
    posthog?.capture('start_now_clicked')
    router.push('/stageplot')
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

  // Export PNG via DOM query
  const handleExportPNG = useCallback(() => {
    const svg = document.querySelector<SVGSVGElement>('[data-export-svg]')
    if (!svg) return
    const xml = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = 1600
      c.height = 1000
      const ctx = c.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0, 1600, 1000)
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
  }, [data.details.bandName])

  // ── Stageplot save handler (called by DownloadModal) ─────────────────────
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
  const [isSavingPlot, setIsSavingPlot] = useState(false)
  const [shareStats, setShareStats] = useState<{ view_count: number; created_at: string } | null>(null)

  const { savedStageplotId, savedShareToken, savedAt, setSaved } = useStagePlot()

  const shareUrlValue = savedStageplotId && savedShareToken
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/stageplots/${savedStageplotId}?share=${savedShareToken}`
    : ''

  const handleSavePlot = useCallback(async (email: string) => {
    setIsSavingPlot(true)
    try {
      const res = await fetch('/api/stageplots/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          plotData: data,
          stageplotId: savedStageplotId ?? undefined,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setSaved(json.stageplotId, json.shareToken)
        setShareStats(null) // reset stats so they're re-fetched on next share open
        handleExportPNG()
      }
    } finally {
      setIsSavingPlot(false)
    }
  }, [data, savedStageplotId, setSaved, handleExportPNG])

  const handleOpenShare = useCallback(async () => {
    setShareOpen(o => !o)
    if (!savedStageplotId || !savedShareToken || shareStats) return
    try {
      const res = await fetch(`/api/stageplots/${savedStageplotId}?share=${savedShareToken}`)
      if (res.ok) {
        const json = await res.json()
        setShareStats({ view_count: json.view_count ?? 0, created_at: json.created_at })
      }
    } catch { /* ignore */ }
  }, [savedStageplotId, savedShareToken, shareStats])

  const handleCopyShareUrl = useCallback(() => {
    if (!shareUrlValue) return
    navigator.clipboard.writeText(shareUrlValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [shareUrlValue])

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

  if (isStageplot) {
    const displayName = data.details.bandName || 'Untitled Stage Plot'
    return (
      <>
        <nav className="no-print bg-slate-950 border-b border-slate-800/50 sticky top-0 z-50">
          <div className="px-4 h-10 flex items-center gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={handleLogoClick}>
              <div className="bg-indigo-600 p-1 rounded-md">
                <Mic2 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight">
                Miked<span className="text-indigo-500">.live</span>
              </span>
            </div>

            <span className="text-slate-700 select-none">|</span>

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

            {/* Saved indicator */}
            {savedStageplotId && (
              <span className="flex items-center gap-1 text-[10px] text-green-500">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                Saved {savedAt ? relativeTime(savedAt) : ''}
              </span>
            )}

            <div className="flex-1" />

            {/* Stats */}
            <span className="hidden sm:block text-xs text-slate-600 mr-1">
              {data.stagePlot.length} item{data.stagePlot.length !== 1 ? 's' : ''} · {data.members.length} member{data.members.length !== 1 ? 's' : ''}
            </span>

            {/* Download & Save button */}
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded text-xs transition-colors"
            >
              <Download size={12} /> Download & Save
            </button>

            {/* Share button + popover */}
            <div ref={shareRef} className="relative">
              <button
                onClick={handleOpenShare}
                disabled={!savedStageplotId}
                title={!savedStageplotId ? 'Download & Save first' : undefined}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded text-xs font-medium transition-colors"
              >
                <Share2 size={12} /> Share
              </button>

              {shareOpen && savedStageplotId && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-300">Share stage plot</span>
                    <button onClick={() => setShareOpen(false)} className="text-slate-600 hover:text-slate-400">
                      <X size={13} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Share URL row */}
                    <div className="flex gap-1.5">
                      <input
                        readOnly
                        value={shareUrlValue}
                        className="flex-1 min-w-0 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-400 focus:outline-none"
                      />
                      <button
                        onClick={handleCopyShareUrl}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs transition-colors shrink-0"
                      >
                        {copied ? <CheckCheck size={12} className="text-green-400" /> : <Copy size={12} />}
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="text-xs text-slate-500 space-y-1">
                      {shareStats ? (
                        <>
                          <p>Viewed {shareStats.view_count} time{shareStats.view_count !== 1 ? 's' : ''}</p>
                          <p>Created {relativeTime(shareStats.created_at)}</p>
                        </>
                      ) : (
                        <p className="text-slate-600">Loading stats…</p>
                      )}
                      {savedAt && <p>Saved {relativeTime(savedAt)}</p>}
                    </div>

                    {/* Re-save with different email */}
                    <button
                      onClick={() => { setShareOpen(false); setIsDownloadModalOpen(true) }}
                      className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                    >
                      Share with a different email →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        <DownloadModal
          isOpen={isDownloadModalOpen}
          prefillEmail={data.details.email}
          onClose={() => setIsDownloadModalOpen(false)}
          onConfirm={handleSavePlot}
          isGeneratingPdf={isSavingPlot}
          lastSentEmail={null}
        />
      </>
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
