'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Music2, Plus, AlertTriangle, Loader, MoreVertical } from 'lucide-react'
import { supabase } from '@/utils/supabase'

interface Stageplot {
  id: string
  bandName: string
  created_at: string
  updated_at: string
}

function relativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`
  return `${Math.floor(seconds / 2592000)}mo ago`
}

export default function DashboardPage() {
  const router = useRouter()
  const [stageplots, setStageplots] = useState<Stageplot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  useEffect(() => {
    async function checkAuthAndFetch() {
      try {
        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          router.replace('/')
          return
        }

        // Fetch stageplots
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          router.replace('/')
          return
        }

        const res = await fetch('/api/stageplots', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })

        if (!res.ok) {
          if (res.status === 401) {
            router.replace('/')
            return
          }
          throw new Error('Failed to fetch stageplots')
        }

        const data = await res.json()
        const sorted = (data.stageplots || []).sort(
          (a: Stageplot, b: Stageplot) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
        setStageplots(sorted)
      } catch (err) {
        console.error('Error fetching stageplots:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndFetch()
  }, [router])

  // Close menu on outside click
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node
      const isMenuButton = (target as Element).closest('[data-menu-button]')
      const isMenuContent = (target as Element).closest('[data-menu-content]')

      if (!isMenuButton && !isMenuContent) {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  const handleDelete = async (plotId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch(`/api/stageplots/${plotId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (res.ok) {
        setStageplots(stageplots.filter(p => p.id !== plotId))
        setOpenMenuId(null)
      }
    } catch (err) {
      console.error('Error deleting stageplot:', err)
    }
  }

  const handleRenameStart = (plot: Stageplot) => {
    setRenamingId(plot.id)
    setRenameValue(plot.bandName)
    setOpenMenuId(null)
  }

  const handleRenameSave = async (plotId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch(`/api/stageplots/${plotId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ bandName: renameValue }),
      })

      if (res.ok) {
        const updated = stageplots
          .map(p =>
            p.id === plotId ? { ...p, bandName: renameValue, updated_at: new Date().toISOString() } : p
          )
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        setStageplots(updated)
        setRenamingId(null)
        setRenameValue('')
      }
    } catch (err) {
      console.error('Error renaming stageplot:', err)
    }
  }

  const handleCopy = async (plot: Stageplot) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      // Fetch full plot data
      const getRes = await fetch(`/api/stageplots/${plot.id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (!getRes.ok) return

      const { plotData } = await getRes.json()

      // Create copy with new name
      const copiedData = {
        ...plotData,
        details: {
          ...plotData.details,
          bandName: `${plot.bandName} copy`,
        },
      }

      // Save as new stageplot
      const saveRes = await fetch('/api/stageplots/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plotData: copiedData }),
      })

      if (saveRes.ok) {
        const { stageplotId } = await saveRes.json()
        const newCopy: Stageplot = {
          id: stageplotId,
          bandName: `${plot.bandName} copy`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        // Insert at top and sort by updated_at descending
        const updated = [newCopy, ...stageplots].sort(
          (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
        setStageplots(updated)
        setOpenMenuId(null)
      }
    } catch (err) {
      console.error('Error copying stageplot:', err)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">My Stage Plots</h1>
          <button
            onClick={() => router.push('/stageplot')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            New Stage Plot
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader size={40} className="text-indigo-600 animate-spin mb-3" />
            <p className="text-slate-400">Loading your stage plots…</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-400 font-semibold">Error</h3>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && stageplots.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center max-w-sm">
              <Music2 size={40} className="text-slate-700 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-400 mb-2">No stage plots yet</h2>
              <p className="text-slate-600 text-sm mb-6">Create your first stage plot to get started</p>
              <button
                onClick={() => router.push('/stageplot')}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus size={16} />
                Create Stage Plot
              </button>
            </div>
          </div>
        )}

        {/* Grid of Stage Plots */}
        {!loading && !error && stageplots.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stageplots.map(plot => (
              <div
                key={plot.id}
                onClick={() => renamingId !== plot.id && router.push(`/stageplot?id=${plot.id}`)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-5 cursor-pointer transition-colors group relative"
              >
                {/* Card Top Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Music2 size={16} className="text-indigo-400 shrink-0" />
                    {renamingId === plot.id ? (
                      <input
                        autoFocus
                        type="text"
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleRenameSave(plot.id)
                          } else if (e.key === 'Escape') {
                            setRenamingId(null)
                            setRenameValue('')
                          }
                        }}
                        onBlur={() => handleRenameSave(plot.id)}
                        onClick={e => e.stopPropagation()}
                        className="flex-1 min-w-0 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <h3 className="text-white font-semibold truncate">
                        {plot.bandName || <span className="italic text-slate-500">Untitled Stage Plot</span>}
                      </h3>
                    )}
                  </div>
                  <div className="relative" data-menu-button={plot.id}>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        setOpenMenuId(openMenuId === plot.id ? null : plot.id)
                      }}
                      className="text-slate-600 hover:text-indigo-400 transition-colors p-1 shrink-0"
                      aria-label="More options"
                      data-menu-button
                    >
                      <MoreVertical size={18} />
                    </button>

                    {/* Dropdown Menu */}
                    {openMenuId === plot.id && (
                      <div className="absolute top-full right-0 mt-1 w-44 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50" data-menu-content>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            handleRenameStart(plot)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors first:rounded-t-lg"
                        >
                          Rename
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            handleCopy(plot)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                          Make a copy
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            handleDelete(plot.id)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-950 hover:text-red-300 transition-colors last:rounded-b-lg"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom Row */}
                <div className="text-xs text-slate-500 space-y-1">
                  <div>Created: {relativeTime(plot.created_at)}</div>
                  <div>Updated: {relativeTime(plot.updated_at)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
