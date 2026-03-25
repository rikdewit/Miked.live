'use client'

import { createContext, useContext, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useStagePlotState } from '@/hooks/useStagePlotState'
import { useAutoSaveStagePlot } from '@/hooks/useAutoSaveStagePlot'

type StagePlotContextType = ReturnType<typeof useStagePlotState>

const StagePlotContext = createContext<StagePlotContextType | null>(null)

export function StagePlotProvider({ children }: { children: React.ReactNode }) {
  const stagePlotState = useStagePlotState()
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentId = searchParams.get('id')

  // Enable auto-save with URL update for new stageplots
  useAutoSaveStagePlot({
    data: stagePlotState.data,
    savedStageplotId: stagePlotState.savedStageplotId,
    onSaved: (stageplotId, shareToken) => {
      stagePlotState.setSaved(stageplotId, shareToken)
      // Update URL if we just created a new stageplot (no ID in URL yet)
      if (!currentId) {
        router.replace(`/stageplot?id=${stageplotId}`)
      }
    },
  })

  return (
    <StagePlotContext.Provider value={stagePlotState}>
      {children}
    </StagePlotContext.Provider>
  )
}

export function useStagePlot() {
  const ctx = useContext(StagePlotContext)
  if (!ctx) throw new Error('useStagePlot must be used within StagePlotProvider')
  return ctx
}
