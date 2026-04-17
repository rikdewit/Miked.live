
import { useState, useCallback, useEffect } from 'react';
import { RiderData, BandMember, StageItem, InstrumentType, InputConfig } from '../types';
import { INITIAL_RIDER_DATA, INSTRUMENTS } from '../constants';

const STORAGE_KEY = 'miked_rider_data';
const SAVE_STATE_KEY = 'miked_sp_save';

interface SaveState {
  savedStageplotId: string | null
  savedShareToken: string | null
  savedAt: string | null
}

const INITIAL_SAVE_STATE: SaveState = {
  savedStageplotId: null,
  savedShareToken: null,
  savedAt: null,
}

export const useStagePlotState = () => {
  const [data, setData] = useState<RiderData>(INITIAL_RIDER_DATA);
  const [saveState, setSaveStateInternal] = useState<SaveState>(INITIAL_SAVE_STATE);
  const [isHydrated, setIsHydrated] = useState(false);
  const [viewMode, setViewMode] = useState<'editor' | 'viewer'>('editor');

  // Load from localStorage after hydration
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setData(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load data from localStorage:', err);
    }

    try {
      const savedState = localStorage.getItem(SAVE_STATE_KEY);
      if (savedState) {
        setSaveStateInternal(JSON.parse(savedState));
      }
    } catch (err) {
      console.error('Failed to load save state from localStorage:', err);
    }

    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }, [data]);

  const setSaved = useCallback((stageplotId: string, shareToken: string, savedAt?: string) => {
    const next: SaveState = { savedStageplotId: stageplotId, savedShareToken: shareToken, savedAt: savedAt ?? new Date().toISOString() }
    setSaveStateInternal(next)
    try {
      localStorage.setItem(SAVE_STATE_KEY, JSON.stringify(next))
    } catch (err) {
      console.error('Failed to persist save state:', err)
    }
  }, [])

  const loadFromServer = useCallback(async (stageplotId: string): Promise<'success' | 'unauthorized' | 'not_found' | 'error'> => {
    const { data: { session } } = await (await import('@/utils/supabase')).supabase.auth.getSession()
    if (!session?.access_token) return 'unauthorized'

    try {
      const res = await fetch(`/api/stageplots/${stageplotId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (!res.ok) {
        return res.status === 404 ? 'not_found' : res.status === 401 ? 'unauthorized' : 'error'
      }

      const json = await res.json()
      if (json.plotData) {
        setData(json.plotData)
        setSaved(json.stageplotId, json.shareToken, json.updated_at ?? json.created_at)
        return 'success'
      }
      return 'error'
    } catch (err) {
      console.error('Failed to load stageplot from server:', err)
      return 'error'
    }
  }, [setSaved])

  const clearSaved = useCallback(() => {
    setSaveStateInternal(INITIAL_SAVE_STATE)
    try {
      localStorage.removeItem(SAVE_STATE_KEY)
    } catch { /* ignore */ }
  }, [])

  const resetPlot = useCallback(() => {
    setData(INITIAL_RIDER_DATA)
    setSaveStateInternal(INITIAL_SAVE_STATE)
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(SAVE_STATE_KEY)
    } catch { /* ignore */ }
  }, [])

  const addMember = useCallback(() => {
    setData(prev => {
      const usedIndices = new Set(prev.members.map(m => m.colorIndex ?? prev.members.indexOf(m)));
      let colorIndex = 0;
      while (usedIndices.has(colorIndex)) colorIndex++;
      const newMember: BandMember = {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        instruments: [{ instrumentId: INSTRUMENTS[0].id }],
        colorIndex,
      };
      return { ...prev, members: [...prev.members, newMember] };
    });
  }, []);

  const applyRockTemplate = useCallback(() => {
    const newMembers: BandMember[] = [
      { id: Math.random().toString(36).substr(2, 9), name: 'Drummer', instruments: [{ instrumentId: 'drums' }], colorIndex: 0 },
      { id: Math.random().toString(36).substr(2, 9), name: 'Bassist', instruments: [{ instrumentId: 'bass_amp' }], colorIndex: 1 },
      { id: Math.random().toString(36).substr(2, 9), name: 'Guitarist', instruments: [{ instrumentId: 'gtr_amp' }], colorIndex: 2 },
      { id: Math.random().toString(36).substr(2, 9), name: 'Lead Singer', instruments: [{ instrumentId: 'voc_lead' }], colorIndex: 3 },
    ];
    // Reset members AND clear stage plot entirely when applying a full template
    setData(prev => ({ ...prev, members: newMembers, stagePlot: [] }));
  }, []);

  const updateMemberColor = useCallback((id: string, colorIndex: number) => {
    setData(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === id ? { ...m, colorIndex } : m),
    }));
  }, []);

  const updateMemberName = useCallback((id: string, name: string) => {
    setData(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === id ? { ...m, name } : m),
      // Also update labels on stage if they exist
      stagePlot: prev.stagePlot.map(item => {
        if (item.memberId === id && item.type === 'person') {
            return { ...item, label: name };
        }
        return item;
      })
    }));
  }, []);

  const addMemberInstrument = useCallback((memberId: string) => {
    setData(prev => ({
      ...prev,
      members: prev.members.map(m => {
        if (m.id === memberId) {
          return { ...m, instruments: [...m.instruments, { instrumentId: INSTRUMENTS[0].id }] };
        }
        return m;
      }),
      // No stage items to remove when adding a new instrument slot
    }));
  }, []);

  const updateMemberInstrument = useCallback((memberId: string, index: number, newInstrumentId: string) => {
    setData(prev => {
      const member = prev.members.find(m => m.id === memberId);
      if (!member) return prev;

      const oldInstrumentId = member.instruments[index].instrumentId;
      const oldInstDef = INSTRUMENTS.find(i => i.id === oldInstrumentId);
      const newInstDef = INSTRUMENTS.find(i => i.id === newInstrumentId);

      // Determine cleanup strategy
      // If Types match (e.g. Guitar -> Guitar), we only remove "Peripheral" items (Amp).
      // If Types differ (e.g. Guitar -> Keys), we remove ALL items for this slot.
      const sameType = oldInstDef && newInstDef && oldInstDef.type === newInstDef.type;

      // Update Member
      const updatedMembers = prev.members.map(m => {
        if (m.id === memberId) {
          const newSlots = [...m.instruments];
          // When changing instrument, reset inputs to defaults
          newSlots[index] = { ...newSlots[index], instrumentId: newInstrumentId, inputs: undefined };
          return { ...m, instruments: newSlots };
        }
        return m;
      });

      // Update Stage Plot
      let updatedStagePlot = prev.stagePlot.filter(item => {
        // If it's not this member, keep it
        if (item.memberId !== memberId) return true;

        // If it's the Person, keep it
        if (item.type === 'person') return true;

        // If it belongs to a different instrument index, keep it
        if (item.fromInstrumentIndex !== index) return true;

        // If it belongs to THIS instrument index:
        if (sameType) {
            // Same type: Remove only Peripherals (e.g. Amp), Keep Core (e.g. Guitar Body)
            return !item.isPeripheral;
        } else {
            // Different type: Remove everything for this instrument
            return false;
        }
      });

      // Update labels for core items if instrument changed
      updatedStagePlot = updatedStagePlot.map(item => {
        if (item.memberId === memberId && item.fromInstrumentIndex === index && !item.isPeripheral) {
            return { ...item, label: newInstDef?.group || item.label };
        }
        return item;
      });

      return {
        ...prev,
        members: updatedMembers,
        stagePlot: updatedStagePlot
      };
    });
  }, []);

  const removeMemberInstrument = useCallback((memberId: string, indexToRemove: number) => {
    setData(prev => ({
      ...prev,
      members: prev.members.map(m => {
        if (m.id === memberId) {
           const newSlots = m.instruments.filter((_, i) => i !== indexToRemove);
           return { ...m, instruments: newSlots };
        }
        return m;
      }),
      // Remove items for the deleted index, and shift indices for subsequent items
      stagePlot: prev.stagePlot
        .filter(item => {
            if (item.memberId !== memberId) return true;
            // Remove items belonging to the deleted slot
            if (item.fromInstrumentIndex === indexToRemove) return false;
            return true;
        })
        .map(item => {
            if (item.memberId === memberId && item.fromInstrumentIndex !== undefined && item.fromInstrumentIndex > indexToRemove) {
                // Shift index down to match new array
                return { ...item, fromInstrumentIndex: item.fromInstrumentIndex - 1 };
            }
            return item;
        })
    }));
  }, []);

  const removeMember = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== id),
      // Remove everything for this member
      stagePlot: prev.stagePlot.filter(item => item.memberId !== id)
    }));
  }, []);

  const updateStageItems = useCallback((newItems: StageItem[]) => {
    setData(prev => ({ ...prev, stagePlot: newItems }));
  }, []);

  const updateInstrumentInputs = useCallback((memberId: string, index: number, inputs: InputConfig[]) => {
    setData(prev => ({
      ...prev,
      members: prev.members.map(m => {
        if (m.id === memberId) {
          const newSlots = [...m.instruments];
          newSlots[index] = { ...newSlots[index], inputs };
          return { ...m, instruments: newSlots };
        }
        return m;
      })
    }));
  }, []);

  const moveToFront = useCallback((itemId: string) => {
    setData(prev => {
      const index = prev.stagePlot.findIndex(item => item.id === itemId);
      if (index === -1 || index === prev.stagePlot.length - 1) return prev; // Already at front or not found
      const item = prev.stagePlot[index];
      const newStagePlot = prev.stagePlot.filter((_, i) => i !== index);
      newStagePlot.push(item);
      return { ...prev, stagePlot: newStagePlot };
    });
  }, []);

  const moveToBack = useCallback((itemId: string) => {
    setData(prev => {
      const index = prev.stagePlot.findIndex(item => item.id === itemId);
      if (index === -1 || index === 0) return prev; // Already at back or not found
      const item = prev.stagePlot[index];
      const newStagePlot = prev.stagePlot.filter((_, i) => i !== index);
      newStagePlot.unshift(item);
      return { ...prev, stagePlot: newStagePlot };
    });
  }, []);

  return {
    data,
    setData,
    addMember,
    applyRockTemplate,
    updateMemberColor,
    updateMemberName,
    addMemberInstrument,
    updateMemberInstrument,
    removeMemberInstrument,
    removeMember,
    updateStageItems,
    updateInstrumentInputs,
    moveToFront,
    moveToBack,
    savedStageplotId: saveState.savedStageplotId,
    savedShareToken: saveState.savedShareToken,
    savedAt: saveState.savedAt,
    setSaved,
    clearSaved,
    resetPlot,
    loadFromServer,
    isHydrated,
    viewMode,
    setViewMode,
  };
};
