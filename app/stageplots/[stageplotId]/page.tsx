'use client'

import { useEffect, use, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePostHog } from 'posthog-js/react'
import { StagePlot2DCanvas, MEMBER_COLORS } from '@/components/StagePlot2DCanvas'
import { RiderData } from '@/types'
import { Download, Share2, Loader2, Check, Copy, CheckCheck } from 'lucide-react'
import { Mic2 } from 'lucide-react'

interface PageProps {
  params: Promise<{ stageplotId: string }>
  searchParams: Promise<{ share?: string }>
}

export default function StagePlotViewPage({ params, searchParams }: PageProps) {
  const { stageplotId } = use(params)
  const { share } = use(searchParams)
  const posthog = usePostHog()
  const posthogRef = useRef(posthog)
  useEffect(() => { posthogRef.current = posthog }, [posthog])

  const [plotData, setPlotData] = useState<RiderData | null>(null)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [viewCount, setViewCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    const fetchPlot = async () => {
      try {
        setIsLoading(true)
        const query = share ? `?share=${share}` : ''
        const response = await fetch(`/api/stageplots/${stageplotId}${query}`, { credentials: 'include' })

        if (!response.ok) {
          const status = response.status
          setError(status === 401 ? 'unauthorized' : status === 404 ? 'not_found' : 'unknown')
          return
        }

        const data = await response.json()
        setPlotData(data.plotData)
        setShareToken(data.shareToken ?? share ?? null)
        setViewCount(data.view_count ?? null)

        posthogRef.current?.capture('stageplot_viewed', { stageplotId, accessLevel: data.accessLevel })
      } catch {
        setError('unknown')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlot()
  }, [stageplotId, share])

  const handleDownloadPNG = useCallback(() => {
    const svg = document.querySelector<SVGSVGElement>('[data-export-svg]')
    if (!svg) return
    setIsDownloading(true)
    const xml = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = 1600
      c.height = 1000
      const ctx = c.getContext('2d')
      if (!ctx) { setIsDownloading(false); return }
      ctx.drawImage(img, 0, 0, 1600, 1000)
      URL.revokeObjectURL(url)
      c.toBlob(b => {
        if (!b) { setIsDownloading(false); return }
        const a = document.createElement('a')
        a.href = URL.createObjectURL(b)
        a.download = `${plotData?.details?.bandName || 'stage-plot'}.png`
        a.click()
        setIsDownloading(false)
      })
    }
    img.src = url
  }, [plotData?.details?.bandName])

  const handleCopyShareLink = useCallback(async () => {
    const token = shareToken ?? share
    if (!token) return
    const url = `${window.location.origin}/stageplots/${stageplotId}?share=${token}`
    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch { /* ignore */ }
  }, [shareToken, share, stageplotId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading stage plot…</p>
        </div>
      </div>
    )
  }

  if (error) {
    const messages: Record<string, { icon: string; title: string; body: string }> = {
      not_found:    { icon: '🔍', title: 'Stage plot not found',   body: "This stage plot doesn't exist or has been removed." },
      unauthorized: { icon: '🔐', title: 'Access denied',          body: 'Your access link is invalid or expired.' },
      unknown:      { icon: '⚠️', title: 'Something went wrong',   body: "We couldn't load this stage plot. Please try again." },
    }
    const msg = messages[error] ?? messages.unknown
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-sm w-full">
          <div className="text-4xl mb-4">{msg.icon}</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{msg.title}</h1>
          <p className="text-gray-500 text-sm mb-6">{msg.body}</p>
          <Link href="/stageplot" className="block w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition text-sm text-center">
            Create a new stage plot
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Minimal header */}
      <nav className="bg-slate-950 border-b border-slate-800/50 px-4 h-10 flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1 rounded-md">
            <Mic2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">
            Miked<span className="text-indigo-500">.live</span>
          </span>
        </div>
        {plotData?.details?.bandName && (
          <>
            <span className="text-slate-700 select-none">|</span>
            <span className="text-sm text-slate-400 truncate">{plotData.details.bandName}</span>
          </>
        )}
        {viewCount !== null && (
          <span className="ml-auto text-xs text-slate-600">{viewCount} view{viewCount !== 1 ? 's' : ''}</span>
        )}
      </nav>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        {plotData && (
          <StagePlot2DCanvas
            items={plotData.stagePlot}
            setItems={() => {}}
            editable={false}
            members={plotData.members}
          />
        )}
      </div>

      {/* Action bar */}
      <div className="bg-slate-900 border-t border-slate-800 p-4 flex justify-center gap-3 flex-wrap shrink-0">
        <button
          onClick={handleDownloadPNG}
          disabled={isDownloading}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-wait text-white rounded-lg font-semibold text-sm transition-colors"
        >
          {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {isDownloading ? 'Generating…' : 'Download PNG'}
        </button>

        {(shareToken || share) && (
          <button
            onClick={handleCopyShareLink}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold text-sm transition-colors"
          >
            {isCopied ? <CheckCheck size={16} className="text-green-400" /> : <Copy size={16} />}
            {isCopied ? 'Copied!' : 'Copy Share Link'}
          </button>
        )}
      </div>
    </div>
  )
}
