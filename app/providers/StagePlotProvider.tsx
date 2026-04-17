'use client'

import { createContext, useContext } from 'react'
import { useStagePlotState } from '@/hooks/useStagePlotState'

type StagePlotContextType = ReturnType<typeof useStagePlotState>

const StagePlotContext = createContext<StagePlotContextType | null>(null)

export function StagePlotProvider({ children }: { children: React.ReactNode }) {
  const stagePlotState = useStagePlotState()

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
