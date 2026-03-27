'use client';

import React, { useRef, useState, useCallback } from 'react';
import { RotateCcw, RotateCw, Trash2, X, Plus, Minus } from 'lucide-react';
import { StageItem, BandMember } from '../types';
import { STAGE_WIDTH, STAGE_DEPTH, getItemConfig } from '../utils/stageConfig';

// SVG coordinate space: 800×500 = 8m×5m stage (1m = 100 SVG units)
const SVG_W = 800;
const SVG_H = 500;

const pctX = (p: number) => (p / 100) * SVG_W;
const pctY = (p: number) => (p / 100) * SVG_H;
const svgXToP = (x: number) => (x / SVG_W) * 100;
const svgYToP = (y: number) => (y / SVG_H) * 100;
const mW = (m: number) => (m / STAGE_WIDTH) * SVG_W;
const mH = (m: number) => (m / STAGE_DEPTH) * SVG_H;

export const MEMBER_COLORS = [
  '#818cf8', // indigo-400
  '#f472b6', // pink-400
  '#fb923c', // orange-400
  '#4ade80', // green-400
  '#22d3ee', // cyan-400
  '#c084fc', // purple-400
  '#facc15', // yellow-400
  '#f87171', // red-400
];

// Returns the half-width and half-height of the visual bounding box for each item type.
// Uses the exact viewBox dimensions of each SVG asset so the hit area and selection
// border always align with what's actually rendered.
function getItemBoundingBox(
  item: StageItem,
  w: number,
  h: number,
): { halfW: number; halfH: number } {
  const label = (item.label || '').toLowerCase();

  if (item.type === 'monitor') {
    // MONITOR.svg viewBox: 613×296
    const aspect = 613 / 296;
    const sw = Math.min(w, h * aspect) * 2.2;
    return { halfW: sw / 2, halfH: sw / aspect / 2 };
  }

  if (label.includes('mic')) {
    // MIC_STAND.svg viewBox: 317×482
    const aspect = 317 / 482;
    const sw = Math.min(w, h * aspect) * 5;
    return { halfW: sw / 2, halfH: sw / aspect / 2 };
  }

  if (label.includes('amp')) {
    // BASS_AMP.svg viewBox: 599×442  |  GUITAR_AMP.svg viewBox: 534×253
    const aspect = label.includes('bass') ? 599 / 442 : 534 / 253;
    const sw = Math.min(w, h * aspect) * 0.8;
    return { halfW: sw / 2, halfH: sw / aspect / 2 };
  }

  if (label.includes('di')) {
    // DI_BOX.svg viewBox: 127×191
    const aspect = 127 / 191;
    const sw = Math.min(w, h * aspect) * 0.6;
    return { halfW: sw / 2, halfH: sw / aspect / 2 };
  }

  if (label.toLowerCase().includes('keys')) {
    // KEYS.svg viewBox: 782×207
    const aspect = 782 / 207;
    const sw = Math.min(w, h * aspect) * .8;
    return { halfW: sw / 2, halfH: sw / aspect / 2 };
  }

  if (label.toLowerCase().includes('drum')) {
    // DRUM KIT.svg viewBox: 825×474
    const aspect = 825 / 474;
    const sw = Math.min(w, h * aspect) * 1;
    return { halfW: sw / 2, halfH: sw / aspect / 2 };
  }

  if (item.type === 'power') {
    const socketSize = Math.min(h, 40) * 0.75;
    return { halfW: ((item.quantity || 1) * socketSize) / 2, halfH: socketSize / 2 };
  }

  // Default: use the item's allocated rect dimensions
  return { halfW: w / 2, halfH: h / 2 };
}

function getMemberColor(item: StageItem, members: BandMember[]): string {
  if (!item.memberId) return '#6b7280';
  const idx = members.findIndex(m => m.id === item.memberId);
  return idx >= 0 ? MEMBER_COLORS[idx % MEMBER_COLORS.length] : '#6b7280';
}

function ItemShape({
  item,
  members,
  isGhost,
  isSelected,
  editable,
  onPointerDown,
}: {
  item: StageItem;
  members: BandMember[];
  isGhost: boolean;
  isSelected: boolean;
  editable: boolean;
  onPointerDown?: (e: React.PointerEvent, item: StageItem) => void;
}) {
  const config = getItemConfig(item);
  const cx = pctX(item.x);
  const cy = pctY(item.y);
  const w = Math.max(mW(config.width), 16);
  const h = Math.max(mH(config.depth), 12);
  const rotDeg = ((item.rotation || 0) * 180) / Math.PI;
  const color = getMemberColor(item, members);
  const label = item.label || '';
  const shortLabel = label.length > 9 ? label.slice(0, 8) + '…' : label;
  const opacity = isGhost ? 0.45 : 1;
  const sel = '#818cf8';
  const cursor = editable && !isGhost ? 'grab' : 'default';

  const groupProps = {
    transform: `rotate(${rotDeg}, ${cx}, ${cy})`,
    opacity,
    style: { cursor },
    onPointerDown: isGhost || !editable ? undefined : (e: React.PointerEvent) => onPointerDown?.(e, item),
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
  };

  // Person — single circle
  if (config.shape === 'person') {
    const r = Math.min(w, h) / 2;
    return (
      <g {...groupProps}>
        <circle cx={cx} cy={cy} r={r} fill={color} stroke={isSelected ? sel : 'rgba(0,0,0,0.4)'} strokeWidth={isSelected ? 2 : 1} strokeDasharray={isSelected ? "5 2" : undefined} />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={8} fill="black" fontFamily="system-ui,sans-serif" fontWeight="600" pointerEvents="none"
          transform={`rotate(${-rotDeg}, ${cx}, ${cy})`}>
          {label}
        </text>
      </g>
    );
  }

  // Monitor — using SVG asset
  if (item.type === 'monitor') {
    const { halfW, halfH } = getItemBoundingBox(item, w, h);
    return (
      <g {...groupProps}>
        <image
          x={cx - halfW}
          y={cy - halfH}
          width={halfW * 2}
          height={halfH * 2}
          href="/assets/MONITOR.svg"
          pointerEvents="none"
        />
        <rect
          x={cx - halfW}
          y={cy - halfH}
          width={halfW * 2}
          height={halfH * 2}
          fill="transparent"
          pointerEvents="auto"
        />
        {isSelected && (
          <rect
            x={cx - halfW - 2}
            y={cy - halfH - 2}
            width={halfW * 2 + 4}
            height={halfH * 2 + 4}
            rx={2}
            fill="none"
            stroke={sel}
            strokeWidth={2}
            strokeDasharray="4 2"
          />
        )}
        <text x={cx} y={cy + halfH + 11} textAnchor="middle" fontSize={8} fill="#64748b" fontFamily="system-ui" pointerEvents="none"
          transform={`rotate(${-rotDeg}, ${cx}, ${cy})`}>
          {item.monitorNumber ? `M${item.monitorNumber}` : 'Mon'}
        </text>
      </g>
    );
  }

  // Mic stand — check first so it uses SVG asset
  if (label.toLowerCase().includes('mic') || (item.type === 'stand' && label.toLowerCase().includes('mic stand'))) {
    const { halfW, halfH } = getItemBoundingBox(item, w, h);
    return (
      <g {...groupProps}>
        <image
          x={cx - halfW}
          y={cy - halfH}
          width={halfW * 2}
          height={halfH * 2}
          href="/assets/MIC_STAND.svg"
          pointerEvents="none"
        />
        <rect
          x={cx - halfW}
          y={cy - halfH}
          width={halfW * 2}
          height={halfH * 2}
          fill="transparent"
          pointerEvents="auto"
        />
        {isSelected && (
          <rect
            x={cx - halfW - 2}
            y={cy - halfH - 2}
            width={halfW * 2 + 4}
            height={halfH * 2 + 4}
            rx={2}
            fill="none"
            stroke={sel}
            strokeWidth={2}
            strokeDasharray="4 2"
          />
        )}
        <text x={cx} y={cy + halfH + 11} textAnchor="middle" fontSize={8} fill="#64748b" fontFamily="system-ui" pointerEvents="none"
          transform={`rotate(${-rotDeg}, ${cx}, ${cy})`}>
          {shortLabel}
        </text>
      </g>
    );
  }

  // Other poles — small circle (not mic stands)
  if (config.shape === 'pole' || item.type === 'stand') {
    const r = Math.min(w, h) / 2;
    return (
      <g {...groupProps}>
        <circle cx={cx} cy={cy} r={r} fill="#475569" stroke={isSelected ? sel : '#334155'} strokeWidth={isSelected ? 2 : 1} />
        <text x={cx} y={cy + r + 11} textAnchor="middle" fontSize={8} fill="#64748b" fontFamily="system-ui" pointerEvents="none"
          transform={`rotate(${-rotDeg}, ${cx}, ${cy})`}>
          Stand
        </text>
      </g>
    );
  }

  // Label-only (zero-size custom)
  if (item.customWidth === 0 && item.customDepth === 0) {
    return (
      <g {...groupProps}>
        <rect x={cx - 32} y={cy - 11} width={64} height={22} rx={3} fill="transparent" stroke={isSelected ? sel : 'transparent'} strokeWidth={1} />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize={10} fill="#94a3b8" fontFamily="system-ui,sans-serif" fontWeight="600" pointerEvents="none">
          {label}
        </text>
      </g>
    );
  }

  // Drum Kit — using SVG asset (checked before generic drum shape)
  if (label.toLowerCase().includes('drum')) {
    const { halfW, halfH } = getItemBoundingBox(item, w, h);
    return (
      <g {...groupProps}>
        <image
          x={cx - halfW}
          y={cy - halfH}
          width={halfW * 2}
          height={halfH * 2}
          href="/assets/DRUM KIT.svg"
          pointerEvents="none"
        />
        <rect
          x={cx - halfW}
          y={cy - halfH}
          width={halfW * 2}
          height={halfH * 2}
          fill="transparent"
          pointerEvents="auto"
        />
        {isSelected && (
          <rect
            x={cx - halfW - 2}
            y={cy - halfH - 2}
            width={halfW * 2 + 4}
            height={halfH * 2 + 4}
            rx={2}
            fill="none"
            stroke={sel}
            strokeWidth={2}
            strokeDasharray="4 2"
          />
        )}
        <text x={cx} y={cy + halfH + 11} textAnchor="middle" fontSize={8} fill="#64748b" fontFamily="system-ui" pointerEvents="none"
          transform={`rotate(${-rotDeg}, ${cx}, ${cy})`}>
          {shortLabel}
        </text>
      </g>
    );
  }

  // Drum kit — red rect + inner circles (fallback for non-SVG drum items)
  if (label.toLowerCase().includes('kit')) {
    return (
      <g {...groupProps}>
        <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={4} fill="#7f1d1d" stroke={isSelected ? sel : '#991b1b'} strokeWidth={isSelected ? 2 : 1} />
        <circle cx={cx} cy={cy + h * 0.1} r={Math.min(w, h) * 0.2} fill="none" stroke="#fca5a5" strokeWidth={1.5} />
        <circle cx={cx - w * 0.25} cy={cy - h * 0.15} r={Math.min(w, h) * 0.1} fill="none" stroke="#fca5a5" strokeWidth={1} />
        <circle cx={cx + w * 0.28} cy={cy + h * 0.15} r={Math.min(w, h) * 0.1} fill="none" stroke="#fca5a5" strokeWidth={1} />
        <text x={cx} y={cy - h / 2 - 5} textAnchor="middle" fontSize={9} fill="#fca5a5" fontFamily="system-ui" fontWeight="600" pointerEvents="none"
          transform={`rotate(${-rotDeg}, ${cx}, ${cy})`}>
          {shortLabel}
        </text>
      </g>
    );
  }

  // Keys — using SVG asset
  if (label.toLowerCase().includes('keys')) {
    const { halfW, halfH } = getItemBoundingBox(item, w, h);
    return (
      <g {...groupProps}>
        <image
          x={cx - halfW}
          y={cy - halfH}
          width={halfW * 2}
          height={halfH * 2}
          href="/assets/KEYS.svg"
          pointerEvents="none"
        />
        <rect
          x={cx - halfW}
          y={cy - halfH}
          width={halfW * 2}
          height={halfH * 2}
          fill="transparent"
          pointerEvents="auto"
        />
        {isSelected && (
          <rect
            x={cx - halfW - 2}
            y={cy - halfH - 2}
            width={halfW * 2 + 4}
            height={halfH * 2 + 4}
            rx={2}
            fill="none"
            stroke={sel}
            strokeWidth={2}
            strokeDasharray="4 2"
          />
        )}
        <text x={cx} y={cy + halfH + 11} textAnchor="middle" fontSize={8} fill="#64748b" fontFamily="system-ui" pointerEvents="none"
          transform={`rotate(${-rotDeg}, ${cx}, ${cy})`}>
          {shortLabel}
        </text>
      </g>
    );
  }

  // Amp — guitar or bass amplifier (using SVG assets)
  if (label.toLowerCase().includes('amp')) {
    const isBassAmp = label.toLowerCase().includes('bass');
    const ampSvg = isBassAmp ? '/assets/BASS_AMP.svg' : '/assets/GUITAR_AMP.svg';
    const { halfW, halfH } = getItemBoundingBox(item, w, h);
    return (
      <g {...groupProps}>
        <image
          x={cx - halfW}
          y={cy - halfH}
          width={halfW * 2}
          height={halfH * 2}
          href={ampSvg}
          pointerEvents="none"
        />
        <rect
          x={cx - halfW}
          y={cy - halfH}
          width={halfW * 2}
          height={halfH * 2}
          fill="transparent"
          pointerEvents="auto"
        />
        {isSelected && (
          <rect
            x={cx - halfW - 2}
            y={cy - halfH - 2}
            width={halfW * 2 + 4}
            height={halfH * 2 + 4}
            rx={2}
            fill="none"
            stroke={sel}
            strokeWidth={2}
            strokeDasharray="4 2"
          />
        )}
        <text x={cx} y={cy + halfH + 11} textAnchor="middle" fontSize={8} fill="#64748b" fontFamily="system-ui" pointerEvents="none"
          transform={`rotate(${-rotDeg}, ${cx}, ${cy})`}>
          {shortLabel}
        </text>
      </g>
    );
  }

  // Power strip
  if (item.type === 'power') {
    const socketCount = item.quantity || 1;
    const socketSize = Math.min(h, 40) * 0.75; // 25% smaller, square socket to maintain SVG aspect ratio
    const totalStripW = socketCount * socketSize;
    const stripStartX = cx - totalStripW / 2;
    const scale = socketSize / 178; // SVG is 178x178

    return (
      <g {...groupProps}>
        {/* Render multiple sockets */}
        {Array.from({ length: socketCount }, (_, i) => {
          const socketX = stripStartX + i * socketSize;
          return (
            <g key={i} transform={`translate(${socketX}, ${cy - socketSize / 2}) scale(${scale})`}>
              {/* White background with border */}
              <rect x="2" y="2" width="174" height="174" rx="13" fill="white" stroke="black" strokeWidth="4"/>
              {/* Large gray center circle */}
              <circle cx="89.5" cy="88.5" r="65.5" fill="#D9D9D9" stroke="black" strokeWidth="4"/>
              {/* Left socket hole */}
              <circle cx="63" cy="89" r="9" fill="#949494" stroke="black" strokeWidth="4"/>
              {/* Right socket hole */}
              <circle cx="115" cy="89" r="9" fill="#949494" stroke="black" strokeWidth="4"/>
              {/* Top ground pin */}
              <mask id={`top-mask-${item.id}-${i}`} fill="white">
                <rect x="83" y="22" width="12" height="12" rx="2"/>
              </mask>
              <rect x="83" y="22" width="12" height="12" rx="2" fill="#949494" stroke="black" strokeWidth="8" mask={`url(#top-mask-${item.id}-${i})`}/>
              {/* Bottom ground pin */}
              <mask id={`bottom-mask-${item.id}-${i}`} fill="white">
                <rect x="83" y="143" width="12" height="12" rx="2"/>
              </mask>
              <rect x="83" y="143" width="12" height="12" rx="2" fill="#949494" stroke="black" strokeWidth="8" mask={`url(#bottom-mask-${item.id}-${i})`}/>
            </g>
          );
        })}

        {/* Invisible interactive rect for clicking/dragging - matches actual socket layout */}
        <rect
          x={stripStartX}
          y={cy - socketSize / 2}
          width={totalStripW}
          height={socketSize}
          fill="transparent"
          pointerEvents="auto"
        />
        {/* Selection border */}
        {isSelected && (
          <rect
            x={stripStartX - 2}
            y={cy - socketSize / 2 - 2}
            width={totalStripW + 4}
            height={socketSize + 4}
            rx={5}
            fill="none"
            stroke={sel}
            strokeWidth={2}
            strokeDasharray="4 2"
          />
        )}
      </g>
    );
  }

  // DI box — using SVG asset
  if (label.toLowerCase().includes('di')) {
    const { halfW, halfH } = getItemBoundingBox(item, w, h);
    return (
      <g {...groupProps}>
        <image
          x={cx - halfW}
          y={cy - halfH}
          width={halfW * 2}
          height={halfH * 2}
          href="/assets/DI BOX.svg"
          pointerEvents="none"
        />
        <rect
          x={cx - halfW}
          y={cy - halfH}
          width={halfW * 2}
          height={halfH * 2}
          fill="transparent"
          pointerEvents="auto"
        />
        {isSelected && (
          <rect
            x={cx - halfW - 2}
            y={cy - halfH - 2}
            width={halfW * 2 + 4}
            height={halfH * 2 + 4}
            rx={2}
            fill="none"
            stroke={sel}
            strokeWidth={2}
            strokeDasharray="4 2"
          />
        )}
      </g>
    );
  }

  // Custom block — label inside, always upright
  if (item.type === 'custom') {
    return (
      <g {...groupProps}>
        <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={3} fill="#D9D9D9" stroke={isSelected ? sel : 'black'} strokeWidth={isSelected ? 2 : 1} strokeDasharray={isSelected ? "5 2" : undefined} />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={9} fill="#1e293b" fontFamily="system-ui,sans-serif" fontWeight="600" pointerEvents="none"
          transform={`rotate(${-rotDeg}, ${cx}, ${cy})`}>
          {shortLabel}
        </text>
      </g>
    );
  }

  // Default rect (instruments, pedals, etc.) — label below, always upright
  return (
    <g {...groupProps}>
      <rect
        x={cx - w / 2}
        y={cy - h / 2}
        width={w}
        height={h}
        rx={3}
        fill={config.color}
        stroke={isSelected ? sel : 'rgba(0,0,0,0.35)'}
        strokeWidth={isSelected ? 2 : 1}
      />
      <text x={cx} y={cy + h / 2 + 11} textAnchor="middle" fontSize={8} fill="#94a3b8" fontFamily="system-ui" pointerEvents="none"
        transform={`rotate(${-rotDeg}, ${cx}, ${cy})`}>
        {shortLabel}
      </text>
    </g>
  );
}

export interface StagePlot2DCanvasProps {
  items: StageItem[];
  setItems: (items: StageItem[]) => void;
  editable: boolean;
  ghostItems?: StageItem[];
  members: BandMember[];
  onRotateItem?: (id: string, dir: 'left' | 'right') => void;
  exportRef?: React.RefObject<SVGSVGElement | null>;
}

export const StagePlot2DCanvas: React.FC<StagePlot2DCanvasProps> = ({
  items,
  setItems,
  editable,
  ghostItems = [],
  members,
  onRotateItem,
  exportRef,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const setSvgRef = useCallback((el: SVGSVGElement | null) => {
    (svgRef as React.MutableRefObject<SVGSVGElement | null>).current = el;
    if (exportRef) (exportRef as React.MutableRefObject<SVGSVGElement | null>).current = el;
  }, [exportRef]);

  const toSvgCoords = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * SVG_W,
      y: ((clientY - rect.top) / rect.height) * SVG_H,
    };
  }, []);

  const handleItemPointerDown = useCallback((e: React.PointerEvent, item: StageItem) => {
    if (!editable) return;
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setSelectedId(item.id);
    const { x, y } = toSvgCoords(e.clientX, e.clientY);
    setDragging({ id: item.id, offsetX: x - pctX(item.x), offsetY: y - pctY(item.y) });
  }, [editable, toSvgCoords]);

  const handleSvgPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const { x, y } = toSvgCoords(e.clientX, e.clientY);
    const newX = Math.max(0, Math.min(100, svgXToP(x - dragging.offsetX)));
    const newY = Math.max(0, Math.min(100, svgYToP(y - dragging.offsetY)));
    setItems(items.map(it => it.id === dragging.id ? { ...it, x: newX, y: newY } : it));
  }, [dragging, toSvgCoords, items, setItems]);

  const handleSvgPointerUp = useCallback(() => setDragging(null), []);

  const handleSvgClick = useCallback(() => {
    setSelectedId(null);
  }, []);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    setItems(items.filter(i => i.id !== selectedId));
    setSelectedId(null);
  }, [selectedId, items, setItems]);

  const updateSocketCount = useCallback((delta: number) => {
    if (!selectedId) return;
    setItems(items.map(i => {
      if (i.id === selectedId && i.type === 'power') {
        const newQuantity = Math.max(1, (i.quantity || 1) + delta);
        return { ...i, quantity: newQuantity };
      }
      return i;
    }));
  }, [selectedId, items, setItems]);

  const selectedItem = items.find(i => i.id === selectedId);

  // All items have their own selection borders drawn within ItemShape
  const selectionRing = null;

  return (
    <div className="relative w-full h-full select-none">
      <svg
        ref={setSvgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full h-full"
        data-export-svg="true"
        onPointerMove={handleSvgPointerMove}
        onPointerUp={handleSvgPointerUp}
        onClick={handleSvgClick}
        style={{ touchAction: 'none' }}
      >
        {/* Stage floor */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />
        <rect x={0} y={0} width={SVG_W} height={SVG_H - 44} fill="white" />

        {/* 1m grid */}
        {[100, 200, 300, 400, 500, 600, 700].map(x => (
          <line key={`v${x}`} x1={x} y1={0} x2={x} y2={SVG_H - 44} stroke="#e5e7eb" strokeWidth={0.75} />
        ))}
        {[100, 200, 300, 400].map(y => (
          <line key={`h${y}`} x1={0} y1={y} x2={SVG_W} y2={y} stroke="#e5e7eb" strokeWidth={0.75} />
        ))}

        {/* Stage edge */}
        <line x1={0} y1={SVG_H - 44} x2={SVG_W} y2={SVG_H - 44} stroke="#4b5563" strokeWidth={1.5} />

        {/* Labels */}
        <text x={SVG_W / 2} y={SVG_H - 16} textAnchor="middle" fontSize={10} fill="#4b5563" fontFamily="system-ui,sans-serif" letterSpacing={5} fontWeight={600}>
          AUDIENCE
        </text>

        {/* Ghost items */}
        {ghostItems.map(item => (
          <ItemShape key={`ghost-${item.id}`} item={item} members={members} isGhost={true} isSelected={false} editable={false} />
        ))}

        {/* Stage items */}
        {items.map(item => (
          <ItemShape key={item.id} item={item} members={members} isGhost={false} isSelected={item.id === selectedId} editable={editable} onPointerDown={handleItemPointerDown} />
        ))}

        {selectionRing}
      </svg>

      {/* Selected item toolbar */}
      {selectedItem && editable && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-lg px-2 py-1 shadow-xl z-10 pointer-events-auto">
          <span className="text-xs text-slate-300 mr-2 max-w-[120px] truncate font-medium">{selectedItem.label || 'Item'}</span>
          <button onClick={() => onRotateItem?.(selectedItem.id, 'left')} className="p-1.5 hover:bg-slate-700 rounded transition-colors" title="Rotate left">
            <RotateCcw size={13} className="text-slate-300" />
          </button>
          <button onClick={() => onRotateItem?.(selectedItem.id, 'right')} className="p-1.5 hover:bg-slate-700 rounded transition-colors" title="Rotate right">
            <RotateCw size={13} className="text-slate-300" />
          </button>
          {selectedItem.type === 'power' && (
            <>
              <div className="w-px h-4 bg-slate-700 mx-1" />
              <button onClick={() => updateSocketCount(-1)} className="p-1.5 hover:bg-slate-700 rounded transition-colors" title="Remove socket">
                <Minus size={13} className="text-slate-300" />
              </button>
              <button onClick={() => updateSocketCount(1)} className="p-1.5 hover:bg-slate-700 rounded transition-colors" title="Add socket">
                <Plus size={13} className="text-slate-300" />
              </button>
            </>
          )}
          <div className="w-px h-4 bg-slate-700 mx-1" />
          <button onClick={deleteSelected} className="p-1.5 hover:bg-red-900/50 rounded transition-colors" title="Delete">
            <Trash2 size={13} className="text-red-400" />
          </button>
          <button onClick={() => setSelectedId(null)} className="p-1.5 hover:bg-slate-700 rounded transition-colors ml-0.5" title="Deselect">
            <X size={11} className="text-slate-500" />
          </button>
        </div>
      )}
    </div>
  );
};
