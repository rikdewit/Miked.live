'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { usePostHog } from 'posthog-js/react'
import { useStagePlot } from '@/providers/StagePlotProvider'
import { FooterNav } from '@/components/FooterNav'

const StepStagePlot = dynamic(() => import('@/components/StepStagePlot').then(m => ({ default: m.StepStagePlot })), { ssr: false })

export default function StagePage() {
  const posthog = usePostHog()
  const { data, setData, updateStageItems } = useStagePlot()

  useEffect(() => {
    posthog?.capture('step_viewed', { step: 'stage' })
  }, [])

  return (
    <>
      <div className="flex-1 min-h-0 p-4 md:p-8 overflow-auto">
        <StepStagePlot
          data={data}
          setData={setData}
          updateStageItems={updateStageItems}
        />
      </div>
      <FooterNav canProceed={true} />
    </>
  )
}
