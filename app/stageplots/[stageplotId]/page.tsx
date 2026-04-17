'use client'

import { useEffect, use } from 'react'
import { useRouter } from 'next/navigation'

interface PageProps {
  params: Promise<{ stageplotId: string }>
}

export default function StagePlotViewPage({ params }: PageProps) {
  const router = useRouter()
  const { stageplotId } = use(params)

  useEffect(() => {
    // Redirect to the unified /stageplot?id= route
    router.replace(`/stageplot?id=${stageplotId}`)
  }, [stageplotId, router])

  return null
}
