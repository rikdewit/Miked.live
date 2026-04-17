'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'
import { Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    // Supabase exchanges the token from the URL fragment into a session automatically.
    // We listen for the PASSWORD_RECOVERY event to know when it's ready.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setError('')
    setIsLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/'), 3000)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 max-w-md w-full p-8">
        <h1 className="text-lg font-semibold text-slate-900 mb-1">Set new password</h1>

        {success ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-slate-600">Your password has been updated. Redirecting you home...</p>
          </div>
        ) : !sessionReady ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={14} className="animate-spin" />
            Verifying reset link...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                New password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="px-3 py-2 bg-red-50 border border-red-300 rounded text-xs text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Updating...
                </>
              ) : (
                'Update password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
