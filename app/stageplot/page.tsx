'use client'

import React, { useState, useMemo, useRef, useCallback } from 'react'
import {
  Plus, Trash2, GripVertical, ChevronDown, ChevronUp,
  Check, RefreshCw, AlertTriangle,
  Music2, X, Speaker, Mic2 as MicStand, Zap, Square, Tag
} from 'lucide-react'
import { useStagePlot } from '@/providers/StagePlotProvider'
import { INSTRUMENTS } from '@/constants'
import { generateMemberItems } from '@/utils/stageHelpers'
import { BandMember, StageItem } from '@/types'
import { StagePlot2DCanvas, MEMBER_COLORS } from '@/components/StagePlot2DCanvas'

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

// ─── Instrument group/variant selectors ──────────────────────────────────────

const uniqueGroups = Array.from(new Set(INSTRUMENTS.map(i => i.group)))

function getDefaultIdForGroup(groupName: string): string {
  return INSTRUMENTS.find(i => i.group === groupName)?.id || INSTRUMENTS[0].id
}

// ─── Member Card ──────────────────────────────────────────────────────────────

interface MemberCardProps {
  member: BandMember
  index: number
  status: 'full' | 'partial' | 'none'
  expanded: boolean
  onToggleExpand: () => void
  onDragStart: (e: React.DragEvent, memberId: string, memberName: string) => void
  onDragEnd: () => void
  onClick: () => void
  onUpdateName: (name: string) => void
  onUpdateInstrument: (slotIdx: number, instrumentId: string) => void
  onRemoveInstrument: (slotIdx: number) => void
  onAddInstrument: () => void
  onRemove: () => void
}

const MemberCard: React.FC<MemberCardProps> = ({
  member, index, status, expanded, onToggleExpand,
  onDragStart, onDragEnd, onClick, onUpdateName,
  onUpdateInstrument, onRemoveInstrument, onAddInstrument, onRemove,
}) => {
  const color = MEMBER_COLORS[index % MEMBER_COLORS.length]
  const isFull = status === 'full'
  const isPartial = status === 'partial'

  // Instrument group + variant selectors
  const getGroupForId = (instId: string) => INSTRUMENTS.find(i => i.id === instId)?.group || uniqueGroups[0]
  const getVariantsForGroup = (group: string) => INSTRUMENTS.filter(i => i.group === group)

  return (
    <div
      className={`rounded-lg border transition-all ${
        isFull
          ? 'bg-slate-900/40 border-slate-700/50'
          : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
      }`}
    >
      {/* Card header row */}
      <div
        className="flex items-center gap-2 p-2.5 cursor-pointer"
        draggable={!isFull}
        onDragStart={e => onDragStart(e, member.id, member.name)}
        onDragEnd={onDragEnd}
        onClick={onClick}
      >
        {/* Color dot */}
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />

        {/* Drag handle */}
        {!isFull && <GripVertical size={13} className="text-slate-600 shrink-0" />}

        {/* Name */}
        <span className={`flex-1 text-sm font-medium truncate ${isFull ? 'text-slate-500' : 'text-white'}`}>
          {member.name || <span className="text-slate-500 italic">Unnamed</span>}
        </span>

        {/* Status badge */}
        {isFull && (
          <span className="flex items-center gap-0.5 text-[10px] bg-green-900/30 text-green-400 border border-green-900/50 px-1.5 py-0.5 rounded-full shrink-0">
            <Check size={9} /> Placed
          </span>
        )}
        {isPartial && (
          <span className="flex items-center gap-0.5 text-[10px] bg-indigo-900/30 text-indigo-300 border border-indigo-800/50 px-1.5 py-0.5 rounded-full shrink-0">
            <RefreshCw size={9} /> Partial
          </span>
        )}

        {/* Expand / delete */}
        <button
          onClick={e => { e.stopPropagation(); onToggleExpand() }}
          className="p-1 hover:bg-slate-700 rounded transition-colors shrink-0"
        >
          {expanded ? <ChevronUp size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-400" />}
        </button>
        <button
          onClick={e => { e.stopPropagation(); onRemove() }}
          className="p-1 hover:bg-red-900/40 rounded transition-colors shrink-0"
        >
          <Trash2 size={12} className="text-slate-600 hover:text-red-400" />
        </button>
      </div>

      {/* Instrument chips (collapsed view) */}
      {!expanded && member.instruments.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 pb-2.5">
          {member.instruments.map(slot => {
            const inst = INSTRUMENTS.find(i => i.id === slot.instrumentId)
            return inst ? (
              <span key={slot.instrumentId + Math.random()} className="text-[10px] bg-slate-700/60 text-slate-400 px-1.5 py-0.5 rounded">
                {inst.group}
              </span>
            ) : null
          })}
        </div>
      )}

      {/* Expanded editor */}
      {expanded && (
        <div className="border-t border-slate-700/60 px-3 py-3 space-y-2" onClick={e => e.stopPropagation()}>
          {/* Name input */}
          <input
            type="text"
            value={member.name}
            onChange={e => onUpdateName(e.target.value)}
            placeholder="Member name"
            className="w-full bg-slate-900 border border-slate-600 rounded px-2.5 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />

          {/* Instrument slots */}
          <div className="space-y-1.5">
            {member.instruments.map((slot, idx) => {
              const currentGroup = getGroupForId(slot.instrumentId)
              const variants = getVariantsForGroup(currentGroup)
              const hasVariants = variants.length > 1

              return (
                <div key={idx} className="flex gap-1.5 items-center">
                  {/* Group select */}
                  <select
                    value={currentGroup}
                    onChange={e => {
                      const newId = getDefaultIdForGroup(e.target.value)
                      onUpdateInstrument(idx, newId)
                    }}
                    className="flex-1 min-w-0 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {uniqueGroups.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>

                  {/* Variant select */}
                  {hasVariants && (
                    <select
                      value={slot.instrumentId}
                      onChange={e => onUpdateInstrument(idx, e.target.value)}
                      className="flex-1 min-w-0 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {variants.map(v => (
                        <option key={v.id} value={v.id}>{v.variantLabel || v.name}</option>
                      ))}
                    </select>
                  )}

                  <button
                    onClick={() => onRemoveInstrument(idx)}
                    className="p-1 hover:bg-red-900/40 rounded shrink-0"
                    disabled={member.instruments.length <= 1}
                  >
                    <X size={11} className="text-slate-600 hover:text-red-400" />
                  </button>
                </div>
              )
            })}
          </div>

          <button
            onClick={onAddInstrument}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Plus size={11} /> Add instrument
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const {
    data, setData, updateStageItems,
    addMember, removeMember, updateMemberName,
    addMemberInstrument, updateMemberInstrument, removeMemberInstrument,
  } = useStagePlot()

  // Drag-from-sidebar state
  const [draggingMemberId, setDraggingMemberId] = useState<string | null>(null)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const dragLabelRef = useRef<HTMLDivElement>(null)
  const [dragLabelText, setDragLabelText] = useState('')

  // UI state
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // ── Rotation ──────────────────────────────────────────────────────────────
  const handleRotateItem = useCallback((itemId: string, direction: 'left' | 'right') => {
    const item = data.stagePlot.find(i => i.id === itemId)
    if (!item) return
    const cur = item.rotation || 0
    const next = direction === 'right' ? cur - ROTATION_STEP : cur + ROTATION_STEP
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const memberId = e.dataTransfer.getData('memberId')
    const finalPos = dragPos
    setDraggingMemberId(null)
    setDragPos(null)

    if (!memberId || !finalPos) return
    const member = data.members.find(m => m.id === memberId)
    if (!member) return
    if (isMemberFullyPlaced(member, data.stagePlot)) return

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
    if (!draggingMemberId || !dragPos) return []
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
  }, [draggingMemberId, dragPos, data.members, data.stagePlot])

  // ── Toolbar actions ───────────────────────────────────────────────────────
  const addMonitor = () => {
    const nextNum = Math.max(...data.stagePlot.filter(i => i.type === 'monitor').map(i => i.monitorNumber || 0), 0) + 1
    updateStageItems([...data.stagePlot, { id: `mon-${Date.now()}`, type: 'monitor', x: 50, y: 70, label: 'Mon', monitorNumber: nextNum }])
  }
  const addStand = () => updateStageItems([...data.stagePlot, { id: `stand-${Date.now()}`, type: 'stand', x: 50, y: 50, label: 'Mic Stand' }])
  const addPower = () => updateStageItems([...data.stagePlot, { id: `pwr-${Date.now()}`, type: 'power', x: 50, y: 50, label: 'Power', quantity: 1 }])
  const addCustom = () => updateStageItems([...data.stagePlot, { id: `custom-${Date.now()}`, type: 'custom', x: 50, y: 50, label: 'Custom', customWidth: 1.0, customDepth: 1.0 }])
  const addLabel = () => updateStageItems([...data.stagePlot, { id: `lbl-${Date.now()}`, type: 'custom', x: 50, y: 50, label: 'Label', customWidth: 0, customDepth: 0 }])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">

      {/* Hidden custom drag label */}
      <div ref={dragLabelRef} className="absolute top-[-9999px] left-[-9999px] bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-md border border-slate-600 shadow-xl whitespace-nowrap z-50 pointer-events-none">
        {dragLabelText}
      </div>

      {/* ── LEFT PANEL: Members ──────────────────────────────────────────── */}
      <aside className="w-[268px] shrink-0 flex flex-col bg-slate-950 border-r border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music2 size={14} className="text-indigo-400" />
            <span className="text-sm font-semibold text-white">Members</span>
          </div>
          <button
            onClick={addMember}
            className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded transition-colors"
          >
            <Plus size={11} /> Add
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {data.members.length === 0 && (
            <div className="text-center py-8 text-slate-600 text-xs">
              <Music2 size={24} className="mx-auto mb-2 text-slate-700" />
              Add band members to get started
            </div>
          )}

          {data.members.map((member, index) => {
            const status = getPlacementStatus(member, data.stagePlot)
            return (
              <MemberCard
                key={member.id}
                member={member}
                index={index}
                status={status}
                expanded={expandedMemberId === member.id}
                onToggleExpand={() => setExpandedMemberId(expandedMemberId === member.id ? null : member.id)}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onClick={() => handleMemberClick(member.id)}
                onUpdateName={name => updateMemberName(member.id, name)}
                onUpdateInstrument={(idx, instId) => updateMemberInstrument(member.id, idx, instId)}
                onRemoveInstrument={idx => removeMemberInstrument(member.id, idx)}
                onAddInstrument={() => addMemberInstrument(member.id)}
                onRemove={() => removeMember(member.id)}
              />
            )
          })}
        </div>

        {/* Template shortcut */}
        {data.members.length === 0 && (
          <div className="px-3 pb-3">
            <button
              onClick={() => {
                const templates = [
                  { name: 'Drummer', instruments: [{ instrumentId: 'drums' }] },
                  { name: 'Bassist', instruments: [{ instrumentId: 'bass_amp' }] },
                  { name: 'Guitarist', instruments: [{ instrumentId: 'gtr_amp' }] },
                  { name: 'Lead Singer', instruments: [{ instrumentId: 'voc_lead' }] },
                ]
                const newMembers = templates.map(t => ({
                  id: Math.random().toString(36).substr(2, 9),
                  ...t,
                }))
                setData(prev => ({ ...prev, members: newMembers, stagePlot: [] }))
              }}
              className="w-full text-xs text-slate-500 hover:text-slate-300 border border-slate-800 hover:border-slate-600 rounded py-2 transition-colors"
            >
              Use rock band template
            </button>
          </div>
        )}

        {/* Stage item buttons */}
        <div className="border-t border-slate-800 p-3 space-y-1.5">
          <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-0.5">Add to stage</span>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'Monitor', icon: <Speaker size={12} />, action: addMonitor },
              { label: 'Mic Stand', icon: <MicStand size={12} />, action: addStand },
              { label: 'Power', icon: <Zap size={12} />, action: addPower },
              { label: 'Custom', icon: <Square size={12} />, action: addCustom },
              { label: 'Label', icon: <Tag size={12} />, action: addLabel },
            ].map(({ label, icon, action }) => (
              <button
                key={label}
                onClick={action}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs border border-slate-700 transition-colors"
              >
                {icon} {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => data.stagePlot.length > 0 && setShowClearConfirm(true)}
            disabled={data.stagePlot.length === 0}
            className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs border rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-red-950/40 hover:bg-red-900/40 text-red-300 border-red-900/50"
          >
            <Trash2 size={11} /> Clear stage
          </button>
        </div>
      </aside>

      {/* ── CENTER: Stage Canvas ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-hidden">

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
          />

          {/* Empty state */}
          {data.stagePlot.length === 0 && !draggingMemberId && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center p-6 bg-slate-900/70 backdrop-blur rounded-xl border border-slate-800">
                <Music2 size={32} className="mx-auto text-slate-700 mb-3" />
                <p className="text-slate-500 text-sm font-medium mb-1">Stage is empty</p>
                <p className="text-slate-600 text-xs">Click or drag members from the left panel</p>
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
    </div>
  )
}
