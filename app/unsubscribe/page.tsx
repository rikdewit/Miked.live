'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { Footer } from '@/components/Footer'
import { UnsubscribeContent } from './UnsubscribeContent'

function UnsubscribeLoading() {
  return (
    <div className="flex flex-col w-full bg-white text-slate-900 relative min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-48 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-64 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl"></div>
      </div>
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 relative z-10 py-16">
        <PageHeader
          title="Unsubscribe"
          description="We'll remove you from the changelog email list"
          showBadge={false}
          titleColor="indigo"
        />
        <div className="mt-12 bg-slate-50 border border-slate-200 rounded-2xl p-8 shadow-lg">
          <div className="text-center space-y-4">
            <div className="animate-spin inline-block">
              <div className="h-8 w-8 border-4 border-indigo-500 border-t-indigo-200 rounded-full"></div>
            </div>
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<UnsubscribeLoading />}>
      <UnsubscribeContent />
    </Suspense>
  )
}
