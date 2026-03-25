'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Music2, Plus, AlertTriangle, Loader } from 'lucide-react'
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
        setStageplots(data.stageplots || [])
      } catch (err) {
        console.error('Error fetching stageplots:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndFetch()
  }, [router])

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
                onClick={() => router.push(`/stageplot?id=${plot.id}`)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-5 cursor-pointer transition-colors group"
              >
                {/* Card Top Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Music2 size={16} className="text-indigo-400 shrink-0" />
                    <h3 className="text-white font-semibold truncate">
                      {plot.bandName || <span className="italic text-slate-500">Untitled Stage Plot</span>}
                    </h3>
                  </div>
                  <div className="text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0">→</div>
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
