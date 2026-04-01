'use client'

import React, { useState } from 'react'
import { Mail, Check } from 'lucide-react'

interface EmailSubscribeProps {
  title?: string
  description?: string
  buttonText?: string
  placeholder?: string
}

export const EmailSubscribe: React.FC<EmailSubscribeProps> = ({
  title = "Stay Updated",
  description = "Get notified about new updates and features",
  buttonText = "Subscribe",
  placeholder = "Enter your email",
}) => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      setIsSuccess(true)
      setEmail('')
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (err) {
      console.error('Subscription error:', err)
      setError('Failed to subscribe. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex gap-8">
      {/* Hidden date column for alignment - matches post layout */}
      <div className="hidden md:block w-24 flex-shrink-0"></div>

      {/* Email subscribe content */}
      <div className="flex-1 pt-8 border-t border-slate-200 bg-gradient-to-br from-purple-50/50 to-slate-50 backdrop-blur-sm rounded-2xl p-8 hover:border-purple-300/50 transition-colors shadow-lg border border-slate-200">
        <div className="flex items-start gap-3 mb-4">
          <Mail className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
          <div>
            <p className="text-lg font-extrabold text-slate-900">{title}</p>
            <p className="text-sm text-slate-500 mt-1">{description}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex gap-2 flex-col sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading || isSuccess}
            className="flex-1 px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap shadow-lg hover:shadow-indigo-500/50 hover:shadow-xl"
          >
            {isSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Subscribed!</span>
                <span className="sm:hidden">Done!</span>
              </>
            ) : isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span className="hidden sm:inline">Subscribing...</span>
                <span className="sm:hidden">Subscribe...</span>
              </>
            ) : (
              <>{buttonText}</>
            )}
          </button>
        </form>

        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
      </div>
    </div>
  )
}
