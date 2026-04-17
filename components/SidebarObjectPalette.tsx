'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Square } from 'lucide-react';
import { STAGE_OBJECTS, STAGE_OBJECT_CATEGORIES } from '../constants';
import type { StageObjectDef } from '../types';

interface Props {
  onObjectDragStart: (e: React.DragEvent, objectId: string, label: string) => void;
  onObjectDragEnd: () => void;
  onAddObject: (objectId: string) => void;
}

export function SidebarObjectPalette({ onObjectDragStart, onObjectDragEnd, onAddObject }: Props) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const isSearching = search.trim().length > 0;

  const filtered = useMemo(() => {
    if (!isSearching) return STAGE_OBJECTS;
    const q = search.toLowerCase();
    return STAGE_OBJECTS.filter(obj =>
      obj.label.toLowerCase().includes(q) ||
      (obj.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }, [search, isSearching]);

  const objectsByCategory = useMemo(() => {
    if (isSearching) return [];
    return STAGE_OBJECT_CATEGORIES.map(cat => ({
      ...cat,
      items: STAGE_OBJECTS.filter(obj => obj.category === cat.id),
    })).filter(cat => cat.items.length > 0);
  }, [isSearching]);

  const toggleCategory = (catId: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(catId) ? next.delete(catId) : next.add(catId);
      return next;
    });
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Search bar */}
      <div className="px-3 py-2.5 border-b border-gray-200">
        <div className="relative">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search objects…"
            className="w-full bg-gray-100 border border-gray-200 rounded px-2.5 pl-7 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition-colors"
          />
        </div>
      </div>

      {/* Object grid */}
      <div className="flex-1 overflow-y-auto">
        {/* Search results (flat) */}
        {isSearching && (
          filtered.length === 0
            ? <p className="text-center py-10 text-gray-400 text-xs">No objects found</p>
            : <div className="p-2 grid grid-cols-2 gap-2">
                {filtered.map(obj => (
                  <ObjectTile
                    key={obj.id}
                    obj={obj}
                    onDragStart={onObjectDragStart}
                    onDragEnd={onObjectDragEnd}
                    onClick={() => onAddObject(obj.id)}
                  />
                ))}
              </div>
        )}

        {/* Categorized view */}
        {!isSearching && objectsByCategory.map(cat => (
          <div key={cat.id}>
            <button
              onClick={() => toggleCategory(cat.id)}
              className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
            >
              {collapsed.has(cat.id)
                ? <ChevronRight size={9} />
                : <ChevronDown size={9} />
              }
              {cat.label}
            </button>
            {!collapsed.has(cat.id) && (
              <div className="px-2 pb-2 grid grid-cols-2 gap-2">
                {cat.items.map(obj => (
                  <ObjectTile
                    key={obj.id}
                    obj={obj}
                    onDragStart={onObjectDragStart}
                    onDragEnd={onObjectDragEnd}
                    onClick={() => onAddObject(obj.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ObjectTile({
  obj,
  onDragStart,
  onDragEnd,
  onClick,
}: {
  obj: StageObjectDef;
  onDragStart: (e: React.DragEvent, id: string, label: string) => void;
  onDragEnd: () => void;
  onClick: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center rounded-md border border-gray-200 bg-white hover:bg-gray-50 hover:border-indigo-300 cursor-grab active:cursor-grabbing transition-colors select-none overflow-hidden shadow-sm"
      style={{ height: 88 }}
      draggable
      onDragStart={e => onDragStart(e, obj.id, obj.label)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      title={obj.label}
    >
      {/* Image area */}
      <div className="flex-1 flex items-center justify-center w-full bg-white px-1 pt-1.5">
        {obj.svgPath ? (
          <img
            src={obj.svgPath}
            alt={obj.label}
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: 52 }}
            draggable={false}
          />
        ) : (
          <FallbackIcon obj={obj} />
        )}
      </div>

      {/* Label */}
      <div className="w-full px-1 py-1.5 text-center">
        <span className="text-[9px] text-gray-500 leading-tight line-clamp-1">{obj.label}</span>
      </div>
    </div>
  );
}

function FallbackIcon({ obj }: { obj: StageObjectDef }) {
  if (obj.shape === 'circle') {
    return <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-indigo-400" />;
  }
  if (obj.customWidth === 0 && obj.customDepth === 0) {
    return <span className="text-gray-400 text-base font-bold font-mono">T</span>;
  }
  return <Square size={26} className="text-indigo-400" />;
}
