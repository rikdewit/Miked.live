'use client'

import { useRouter } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'
import { Landing } from '@/components/Landing'

export default function Page() {
  const router = useRouter()
  const posthog = usePostHog()

  const handleStart = () => {
    posthog?.capture('start_now_clicked')
    router.push('/dashboard')
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Landing onStart={handleStart} />
    </div>
  )
}
