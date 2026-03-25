'use client'

import { useEffect, useState } from 'react'
import { usePostHog } from 'posthog-js/react'
import { useStagePlot } from '@/providers/StagePlotProvider'
import { StepDetails } from '@/components/StepDetails'
import { FooterNav } from '@/components/FooterNav'

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

export default function DetailsPage() {
  const posthog = usePostHog()
  const { data, setData } = useStagePlot()
  const [showErrors, setShowErrors] = useState(false)

  useEffect(() => {
    posthog?.capture('step_viewed', { step: 'details' })
  }, [])

  const canProceed =
    data.details.bandName.trim() !== '' &&
    data.details.contactName.trim() !== '' &&
    isValidEmail(data.details.email)

  const handleAttemptProceed = () => {
    setShowErrors(true)
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto flex flex-col items-center p-4 md:p-8">
        <StepDetails
          data={data}
          setData={setData}
          showErrors={showErrors}
        />
      </div>
      <FooterNav
        canProceed={canProceed}
        onAttemptProceed={handleAttemptProceed}
      />
    </>
  )
}
