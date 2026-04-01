'use client'

import React, { useState, useMemo, useRef, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Download, Loader2 } from 'lucide-react'
import {
  Plus, Trash2, AlertTriangle, Music2, X,
} from 'lucide-react'
import { useStagePlot } from '@/providers/StagePlotProvider'
import { INSTRUMENTS, INITIAL_RIDER_DATA, STAGE_OBJECTS } from '@/constants'
import { generateMemberItems } from '@/utils/stageHelpers'
import { BandMember, StageItem, RiderData, StageObjectDef } from '@/types'
import { StagePlot2DCanvas, MEMBER_COLORS } from '@/components/StagePlot2DCanvas'
import { SidebarObjectPalette } from '@/components/SidebarObjectPalette'
import { AuthModal } from '@/components/AuthModal'
import { supabase } from '@/utils/supabase'

// ─── Helpers (mirrored from StepStagePlot) ────────────────────────────────────

function isMemberFullyPlaced(member: BandMember, stagePlot: StageItem[]): boolean {
  const hasPerson = stagePlot.some(item => item.memberId === member.id && item.type === 'person')
  if (!hasPerson) return false
  const expected = generateMemberItems(member, 50, 50)
  for (const exp of expected) {
    if (exp.type === 'person') continue
    const match = stagePlot.find(
      ex => ex.memberId === member.id &&
        ex.fromInstrumentIndex === exp.fromInstrumentIndex &&
        ex.label === exp.label
    )
    if (!match) return false
  }
  return true
}

function getPlacementStatus(member: BandMember, stagePlot: StageItem[]): 'full' | 'partial' | 'none' {
  const hasPerson = stagePlot.some(item => item.memberId === member.id && item.type === 'person')
  if (isMemberFullyPlaced(member, stagePlot)) return 'full'
  if (hasPerson) return 'partial'
  return 'none'
}

const ROTATION_STEP = 22.5 * (Math.PI / 180)


// ─── Stage object factory ────────────────────────────────────────────────────

function createStageItemFromObject(
  objDef: StageObjectDef,
  x: number,
  y: number,
  existingItems: StageItem[],
  idOverride?: string,
): StageItem {
  const id = idOverride ?? `${objDef.id}-${Date.now()}`

  if (objDef.itemType === 'monitor') {
    const nextNum = Math.max(0, ...existingItems.filter(i => i.type === 'monitor').map(i => i.monitorNumber || 0)) + 1
    return { id, type: 'monitor', x, y, label: objDef.itemLabel, monitorNumber: nextNum }
  }
  if (objDef.itemType === 'power') {
    return { id, type: 'power', x, y, label: objDef.itemLabel, quantity: 1 }
  }
  if (objDef.itemType === 'stand') {
    return { id, type: 'stand', x, y, label: objDef.itemLabel }
  }
  return {
    id,
    type: 'custom',
    x, y,
    label: objDef.itemLabel,
    ...(objDef.shape ? { shape: objDef.shape } : {}),
    ...(objDef.customWidth !== undefined ? { customWidth: objDef.customWidth } : {}),
    ...(objDef.customDepth !== undefined ? { customDepth: objDef.customDepth } : {}),
  }
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function DashboardPageInner() {
  const searchParams = useSearchParams()
  const {
    data, setData, updateStageItems,
    addMember, removeMember,
    moveToFront, moveToBack,
    loadFromServer, isHydrated, viewMode, setViewMode, clearSaved,
  } = useStagePlot()

  // Loading stageplot by ID state
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'success' | 'unauthorized' | 'not_found' | 'error'>('idle')
  const [viewPlotData, setViewPlotData] = useState<RiderData | null>(null)
  const [viewCount, setViewCount] = useState<number | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [stageplotIdToLoad, setStageplotIdToLoad] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  // Handle stageplot loading based on URL param
  useEffect(() => {
    if (!isHydrated) return
    const id = searchParams.get('id')
    if (id) {
      setLoadStatus('loading')
      setStageplotIdToLoad(id)

      // Try to load with owner auth first
      ;(async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          const headers = session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}

          const res = await fetch(`/api/stageplots/${id}`, { headers })

          if (!res.ok) {
            const status = res.status === 404 ? 'not_found' : res.status === 401 ? 'unauthorized' : 'error'
            setLoadStatus(status)
            return
          }

          const json = await res.json()

          if (json.accessLevel === 'owner') {
            // Owner — load into editor via loadFromServer
            setViewMode('editor')
            loadFromServer(id).then(status => {
              setLoadStatus(status)
            })
          } else {
            // Guest — show read-only viewer
            setViewPlotData(json.plotData)
            setData(json.plotData) // Load into context so header can display the name
            setViewCount(json.view_count ?? null)
            setViewMode('viewer')
            setLoadStatus('success')
          }
        } catch {
          setLoadStatus('error')
        }
      })()
    } else {
      // New stageplot - start fresh with initial data instead of localStorage
      setData(INITIAL_RIDER_DATA)
      clearSaved()
      setViewMode('editor')
      setLoadStatus('success')
    }
  }, [isHydrated, searchParams, loadFromServer, setData])

  // Drag-from-sidebar state
  const [draggingMemberId, setDraggingMemberId] = useState<string | null>(null)
  const [draggingObjectId, setDraggingObjectId] = useState<string | null>(null)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const dragLabelRef = useRef<HTMLDivElement>(null)
  const [dragLabelText, setDragLabelText] = useState('')

  // UI state
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // ── Rotation ──────────────────────────────────────────────────────────────
  const handleRotateItem = useCallback((itemId: string, direction: 'left' | 'right') => {
    const item = data.stagePlot.find(i => i.id === itemId)
    if (!item) return
    const cur = item.rotation || 0
    const next = direction === 'right' ? cur + ROTATION_STEP : cur - ROTATION_STEP
    const norm = ((next % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    updateStageItems(data.stagePlot.map(i => i.id === itemId ? { ...i, rotation: norm } : i))
  }, [data.stagePlot, updateStageItems])

  // ── Drag-from-sidebar ─────────────────────────────────────────────────────
  const handleDragStart = useCallback((e: React.DragEvent, memberId: string, memberName: string) => {
    e.dataTransfer.setData('memberId', memberId)
    e.dataTransfer.effectAllowed = 'copy'
    setDraggingMemberId(memberId)
    setDragLabelText(memberName)
    if (dragLabelRef.current) e.dataTransfer.setDragImage(dragLabelRef.current, 0, 0)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setDragPos({ x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) })
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setDragPos(null)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggingMemberId(null)
    setDragPos(null)
  }, [])

  const handleObjectDragStart = useCallback((e: React.DragEvent, objectId: string, label: string) => {
    e.dataTransfer.setData('stageObjectId', objectId)
    e.dataTransfer.effectAllowed = 'copy'
    setDraggingObjectId(objectId)
    setDragLabelText(label)
    if (dragLabelRef.current) e.dataTransfer.setDragImage(dragLabelRef.current, 0, 0)
  }, [])

  const handleObjectDragEnd = useCallback(() => {
    setDraggingObjectId(null)
    setDragPos(null)
  }, [])

  const handleAddObject = useCallback((objectId: string) => {
    const objDef = STAGE_OBJECTS.find(o => o.id === objectId)
    if (!objDef) return
    const newItem = createStageItemFromObject(objDef, 50, 50, data.stagePlot)
    updateStageItems([...data.stagePlot, newItem])
  }, [data.stagePlot, updateStageItems])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const memberId = e.dataTransfer.getData('memberId')
    const stageObjectId = e.dataTransfer.getData('stageObjectId')
    const finalPos = dragPos
    setDraggingMemberId(null)
    setDraggingObjectId(null)
    setDragPos(null)

    if (!finalPos) return

    if (memberId) {
      const member = data.members.find(m => m.id === memberId)
      if (!member || isMemberFullyPlaced(member, data.stagePlot)) return
      const potentialItems = generateMemberItems(member, finalPos.x, finalPos.y)
      const hasPerson = data.stagePlot.some(i => i.memberId === memberId && i.type === 'person')
      const itemsToAdd = potentialItems.filter(newItem => {
        if (newItem.type === 'person' && hasPerson) return false
        if (newItem.fromInstrumentIndex !== undefined) {
          const idx = newItem.fromInstrumentIndex
          const existingCore = data.stagePlot.find(i => i.memberId === memberId && i.fromInstrumentIndex === idx && !i.isPeripheral)
          if (!newItem.isPeripheral && existingCore) return false
          const existingSame = data.stagePlot.find(i => i.memberId === memberId && i.fromInstrumentIndex === idx && i.label === newItem.label)
          if (existingSame) return false
        }
        return true
      })
      updateStageItems([...data.stagePlot, ...itemsToAdd])
      return
    }

    if (stageObjectId) {
      const objDef = STAGE_OBJECTS.find(o => o.id === stageObjectId)
      if (!objDef) return
      const newItem = createStageItemFromObject(objDef, finalPos.x, finalPos.y, data.stagePlot)
      updateStageItems([...data.stagePlot, newItem])
    }
  }, [dragPos, data.members, data.stagePlot, updateStageItems])

  // Click-to-place (mobile fallback)
  const handleMemberClick = useCallback((memberId: string) => {
    const member = data.members.find(m => m.id === memberId)
    if (!member || isMemberFullyPlaced(member, data.stagePlot)) return
    const potentialItems = generateMemberItems(member, 50, 50)
    const hasPerson = data.stagePlot.some(i => i.memberId === memberId && i.type === 'person')
    const itemsToAdd = potentialItems.filter(newItem => {
      if (newItem.type === 'person' && hasPerson) return false
      if (newItem.fromInstrumentIndex !== undefined) {
        const idx = newItem.fromInstrumentIndex
        const existingCore = data.stagePlot.find(i => i.memberId === memberId && i.fromInstrumentIndex === idx && !i.isPeripheral)
        if (!newItem.isPeripheral && existingCore) return false
        const existingSame = data.stagePlot.find(i => i.memberId === memberId && i.fromInstrumentIndex === idx && i.label === newItem.label)
        if (existingSame) return false
      }
      return true
    })
    updateStageItems([...data.stagePlot, ...itemsToAdd])
  }, [data.members, data.stagePlot, updateStageItems])

  // Ghost items
  const ghostItems = useMemo(() => {
    if (!dragPos) return []

    if (draggingMemberId) {
      const member = data.members.find(m => m.id === draggingMemberId)
      if (!member) return []
      const potential = generateMemberItems(member, dragPos.x, dragPos.y, `ghost-${member.id}`)
      const hasPerson = data.stagePlot.some(i => i.memberId === draggingMemberId && i.type === 'person')
      return potential.filter(newItem => {
        if (newItem.type === 'person' && hasPerson) return false
        if (newItem.fromInstrumentIndex !== undefined) {
          const idx = newItem.fromInstrumentIndex
          const existingCore = data.stagePlot.find(i => i.memberId === draggingMemberId && i.fromInstrumentIndex === idx && !i.isPeripheral)
          if (!newItem.isPeripheral && existingCore) return false
          const existingSame = data.stagePlot.find(i => i.memberId === draggingMemberId && i.fromInstrumentIndex === idx && i.label === newItem.label)
          if (existingSame) return false
        }
        return true
      })
    }

    if (draggingObjectId) {
      const objDef = STAGE_OBJECTS.find(o => o.id === draggingObjectId)
      if (!objDef) return []
      return [createStageItemFromObject(objDef, dragPos.x, dragPos.y, data.stagePlot, `ghost-obj-${draggingObjectId}`)]
    }

    return []
  }, [draggingMemberId, draggingObjectId, dragPos, data.members, data.stagePlot])

  // ── Download handler (shared by editor and viewer) ────────────────────────
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
        const bandName = viewMode === 'viewer' ? viewPlotData?.details?.bandName : data.details?.bandName
        a.download = `${bandName || 'stage-plot'}.png`
        a.click()
        setIsDownloading(false)
      })
    }
    img.src = url
  }, [viewMode, viewPlotData?.details?.bandName, data.details?.bandName])


  // ── Render ────────────────────────────────────────────────────────────────

  // Show loading screen while loading stageplot by ID
  if (loadStatus === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading stage plot…</p>
        </div>
      </div>
    )
  }

  // Show error screen for not found
  if (loadStatus === 'not_found') {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900 p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-sm w-full">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Stage plot not found</h1>
          <p className="text-gray-500 text-sm">This stage plot doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  // Show error screen for other errors
  if (loadStatus === 'error') {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900 p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-sm w-full">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-500 text-sm">We couldn't load this stage plot. Please try again.</p>
        </div>
      </div>
    )
  }

  // ── VIEWER MODE (read-only) ────────────────────────────────────────────────
  if (viewMode === 'viewer' && viewPlotData) {
    return (
      <div className="fixed inset-0 flex flex-col bg-slate-950 z-40">
        {/* Nav bar with viewer info and download */}
        <nav className="bg-slate-950 border-b border-slate-800/50 px-4 h-16 flex items-center gap-3 shrink-0">
          {viewPlotData?.details?.bandName && (
            <span className="text-base text-slate-300 truncate">{viewPlotData.details.bandName}</span>
          )}

          <div className="flex-1" />

          {viewCount !== null && (
            <span className="hidden sm:block text-sm text-slate-600">
              {viewCount} view{viewCount !== 1 ? 's' : ''}
            </span>
          )}

          {/* Download button */}
          <button
            onClick={handleDownloadPNG}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Download
          </button>
        </nav>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden">
          {viewPlotData && (
            <StagePlot2DCanvas
              items={viewPlotData.stagePlot}
              setItems={() => {}}
              editable={false}
              members={viewPlotData.members}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">

      {/* Hidden custom drag label */}
      <div ref={dragLabelRef} className="absolute top-[-9999px] left-[-9999px] bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-md border border-slate-600 shadow-xl whitespace-nowrap z-50 pointer-events-none">
        {dragLabelText}
      </div>

      {/* ── LEFT PANEL ───────────────────────────────────────────────────── */}
      <aside className="w-[272px] shrink-0 flex flex-col bg-white border-r border-gray-200 overflow-hidden">

        {/* Members — compact dot strip */}
        <div className="px-3 py-2.5 border-b border-gray-200 flex flex-wrap items-center gap-1.5 shrink-0">
          {data.members.map((member, index) => {
            const color = MEMBER_COLORS[index % MEMBER_COLORS.length]
            const isFull = getPlacementStatus(member, data.stagePlot) === 'full'
            return (
              <div key={member.id} className="relative group" title={member.name || 'Unnamed'}>
                <div
                  className={`w-6 h-6 rounded-full cursor-grab active:cursor-grabbing transition-opacity ${isFull ? 'opacity-40' : ''}`}
                  style={{ backgroundColor: color }}
                  draggable={!isFull}
                  onDragStart={e => handleDragStart(e, member.id, member.name)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleMemberClick(member.id)}
                />
                <button
                  onClick={e => { e.stopPropagation(); removeMember(member.id) }}
                  className="absolute -top-1 -right-1 hidden group-hover:flex items-center justify-center w-3.5 h-3.5 bg-red-500 rounded-full text-white z-10"
                >
                  <X size={7} />
                </button>
              </div>
            )
          })}
          <button
            onClick={addMember}
            className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 hover:border-indigo-500 flex items-center justify-center transition-colors"
            title="Add member"
          >
            <Plus size={11} className="text-gray-400" />
          </button>
          {data.members.length === 0 && (
            <button
              onClick={() => {
                const templates = [
                  { name: 'Drummer', instruments: [{ instrumentId: 'drums' }] },
                  { name: 'Bassist', instruments: [{ instrumentId: 'bass_amp' }] },
                  { name: 'Guitarist', instruments: [{ instrumentId: 'gtr_amp' }] },
                  { name: 'Lead Singer', instruments: [{ instrumentId: 'voc_lead' }] },
                ]
                const newMembers = templates.map(t => ({
                  id: Math.random().toString(36).slice(2, 11),
                  ...t,
                }))
                setData(prev => ({ ...prev, members: newMembers, stagePlot: [] }))
              }}
              className="text-[10px] text-gray-400 hover:text-indigo-500 border border-dashed border-gray-300 hover:border-indigo-400 rounded px-2 py-0.5 transition-colors"
            >
              Use template
            </button>
          )}
        </div>

        {/* Object palette - takes rest of space */}
        <div className="flex-1 min-h-0 flex flex-col border-t border-gray-200">
          <SidebarObjectPalette
            onObjectDragStart={handleObjectDragStart}
            onObjectDragEnd={handleObjectDragEnd}
            onAddObject={handleAddObject}
          />
        </div>

        {/* Footer: Clear stage */}
        <div className="border-t border-gray-200 p-2 shrink-0">
          <button
            onClick={() => data.stagePlot.length > 0 && setShowClearConfirm(true)}
            disabled={data.stagePlot.length === 0}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs border rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-red-50 hover:bg-red-100 text-red-500 border-red-200"
          >
            <Trash2 size={10} /> Clear stage
          </button>
        </div>
      </aside>

      {/* ── CENTER: Stage Canvas ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-100 overflow-hidden">

        {/* Drop zone + canvas */}
        <div
          className="flex-1 relative overflow-hidden"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <StagePlot2DCanvas
            items={data.stagePlot}
            setItems={updateStageItems}
            editable={true}
            ghostItems={ghostItems}
            members={data.members}
            onRotateItem={handleRotateItem}
            onMoveToFront={moveToFront}
            onMoveToBack={moveToBack}
          />

          {/* Empty state */}
          {data.stagePlot.length === 0 && !draggingMemberId && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center p-6 bg-white/80 backdrop-blur rounded-xl border border-gray-200 shadow-sm">
                <Music2 size={32} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-700 text-sm font-medium mb-1">Stage is empty</p>
                <p className="text-gray-500 text-xs">Click or drag members from the left panel</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Clear confirm modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <AlertTriangle size={22} />
              <h3 className="text-base font-bold text-white">Clear Stage?</h3>
            </div>
            <p className="text-slate-300 text-sm mb-5">All items will be removed from the stage. This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 rounded text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors">
                Cancel
              </button>
              <button
                onClick={() => { updateStageItems([]); setShowClearConfirm(false) }}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth modal for loading private stageplot */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => {
          setShowAuthModal(false)
          if (stageplotIdToLoad) {
            setLoadStatus('loading')
            loadFromServer(stageplotIdToLoad).then(status => {
              setLoadStatus(status)
            })
          }
        }}
      />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DashboardPageInner />
    </Suspense>
  )
}
