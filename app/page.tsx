'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'
import { Landing } from '@/components/Landing'
import { supabase } from '@/utils/supabase'
import type { User } from '@supabase/supabase-js'

export default function Page() {
  const router = useRouter()
  const posthog = usePostHog()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    checkAuth()
  }, [])

  const handleStart = () => {
    posthog?.capture('start_now_clicked')
    router.push(user ? '/dashboard' : '/stageplot')
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Landing onStart={handleStart} />
    </div>
  )
}
