import { useEffect, useRef } from 'react'
import { RiderData } from '@/types'
import { supabase } from '@/utils/supabase'

interface UseAutoSaveStagePlotProps {
  data: RiderData
  savedStageplotId: string | null
  onSaved: (stageplotId: string, shareToken: string) => void
  debounceMs?: number
}

export const useAutoSaveStagePlot = ({
  data,
  savedStageplotId,
  onSaved,
  debounceMs = 2000,
}: UseAutoSaveStagePlotProps) => {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedDataRef = useRef<RiderData | null>(null)
  const isSavingRef = useRef(false)

  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Check if data actually changed
    const dataChanged = JSON.stringify(lastSavedDataRef.current) !== JSON.stringify(data)
    if (!dataChanged) return

    // Set new timer
    debounceTimerRef.current = setTimeout(async () => {
      // Only save if user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      // Prevent duplicate saves
      if (isSavingRef.current) return
      isSavingRef.current = true

      try {
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
          lastSavedDataRef.current = data
          onSaved(json.stageplotId, json.shareToken)
        }
      } catch (error) {
        console.error('Auto-save error:', error)
      } finally {
        isSavingRef.current = false
      }
    }, debounceMs)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [data, savedStageplotId, onSaved, debounceMs])
}
