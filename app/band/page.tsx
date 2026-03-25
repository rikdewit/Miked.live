'use client'

import { useEffect, useState } from 'react'
import { usePostHog } from 'posthog-js/react'
import { StepInstruments } from '@/components/StepInstruments'
import { useStagePlot } from '@/providers/StagePlotProvider'
import { FooterNav } from '@/components/FooterNav'

export default function BandPage() {
  const posthog = usePostHog()
  const [isHydrated, setIsHydrated] = useState(false)
  const {
    data,
    addMember,
    applyRockTemplate,
    updateMemberName,
    addMemberInstrument,
    updateMemberInstrument,
    removeMemberInstrument,
    removeMember,
    updateInstrumentInputs
  } = useStagePlot()

  useEffect(() => {
    setIsHydrated(true)
    posthog?.capture('step_viewed', { step: 'band' })
  }, [])

  const canProceed =
    data.members.length > 0 &&
    data.members.every(m => m.name.trim() !== '' && m.instruments.length > 0)

  if (!isHydrated) {
    return (
      <>
        <div className="flex-1 overflow-y-auto flex flex-col items-center p-4 md:p-8">
          <div className="flex items-center justify-center p-8">
            <div className="w-6 h-6 border-2 border-slate-600 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        </div>
        <FooterNav canProceed={false} />
      </>
    )
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto flex flex-col items-center p-4 md:p-8">
        <StepInstruments
          data={data}
          addMember={addMember}
          applyRockTemplate={applyRockTemplate}
          updateMemberName={updateMemberName}
          updateMemberInstrument={updateMemberInstrument}
          removeMemberInstrument={removeMemberInstrument}
          addMemberInstrument={addMemberInstrument}
          removeMember={removeMember}
          updateInstrumentInputs={updateInstrumentInputs}
        />
      </div>
      <FooterNav canProceed={canProceed} />
    </>
  )
}
