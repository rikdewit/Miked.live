'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { supabase } from '@/utils/supabase'

type AuthView = 'sign-up' | 'sign-in' | 'forgot-password'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [view, setView] = useState<AuthView>('sign-up')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [signUpSent, setSignUpSent] = useState(false)

  const switchView = (next: AuthView) => {
    setView(next)
    setError('')
    setResetSent(false)
    setSignUpSent(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (view === 'sign-up') {
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          setIsLoading(false)
          return
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password })

        if (signUpError) {
          setError(signUpError.message)
          setIsLoading(false)
          return
        }

        // If session is null, email confirmation is required
        if (!signUpData.session) {
          // Supabase returns identities: [] for already-registered emails (fake success to prevent enumeration)
          if (signUpData.user?.identities?.length === 0) {
            setError('An account with this email already exists.')
            setIsLoading(false)
            return
          }
          setSignUpSent(true)
          return
        }

        onAuthSuccess()
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      } else if (view === 'sign-in') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

        if (signInError) {
          setError(signInError.message)
          setIsLoading(false)
          return
        }

        onAuthSuccess()
        setEmail('')
        setPassword('')
      } else {
        const redirectTo = `${window.location.origin}/auth/reset-password`
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

        if (resetError) {
          setError(resetError.message)
          setIsLoading(false)
          return
        }

        setResetSent(true)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full border border-slate-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <div className="flex gap-2">
            {view !== 'forgot-password' ? (
              <>
                <button
                  onClick={() => switchView('sign-up')}
                  className={`text-sm font-medium transition-colors ${
                    view === 'sign-up' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Create account
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() => switchView('sign-in')}
                  className={`text-sm font-medium transition-colors ${
                    view === 'sign-in' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Sign in
                </button>
              </>
            ) : (
              <button
                onClick={() => switchView('sign-in')}
                className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                ← Back to sign in
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-slate-500 transition"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {signUpSent ? (
          <div className="p-6 text-center space-y-3">
            <p className="text-sm font-medium text-slate-800">Check your email</p>
            <p className="text-sm text-slate-500">
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
            </p>
            <button
              onClick={() => switchView('sign-in')}
              className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Back to sign in
            </button>
          </div>
        ) : resetSent ? (
          <div className="p-6 text-center space-y-3">
            <p className="text-sm font-medium text-slate-800">Check your email</p>
            <p className="text-sm text-slate-500">
              We sent a password reset link to <strong>{email}</strong>.
            </p>
            <button
              onClick={() => switchView('sign-in')}
              className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-sm text-slate-600">
              {view === 'forgot-password'
                ? "Enter your email and we'll send you a reset link."
                : 'Save and share your stage plot'}
            </p>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                disabled={isLoading}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            {/* Password (not shown for forgot-password) */}
            {view !== 'forgot-password' && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Password
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
            )}

            {/* Confirm Password (sign-up only) */}
            {view === 'sign-up' && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Confirm password
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
            )}

            {/* Forgot password link (sign-in only) */}
            {view === 'sign-in' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => switchView('forgot-password')}
                  className="text-xs text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="px-3 py-2 bg-red-50 border border-red-300 rounded text-xs text-red-600 space-y-1">
                <p>{error}</p>
                {error === 'An account with this email already exists.' && (
                  <button
                    type="button"
                    onClick={() => switchView('sign-in')}
                    className="underline text-red-700 hover:text-red-800"
                  >
                    Go to sign in
                  </button>
                )}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={
                isLoading ||
                !email ||
                (view !== 'forgot-password' && !password) ||
                (view === 'sign-up' && !confirmPassword)
              }
              className="w-full px-4 py-2 mt-6 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {view === 'sign-up' ? 'Creating...' : view === 'sign-in' ? 'Signing in...' : 'Sending...'}
                </>
              ) : view === 'sign-up' ? (
                'Create account'
              ) : view === 'sign-in' ? (
                'Sign in'
              ) : (
                'Send reset link'
              )}
            </button>

            <p className="text-xs text-slate-400 text-center mt-4">
              {view === 'sign-up'
                ? 'Create an account to save and share your stage plot'
                : view === 'sign-in'
                ? 'Sign in to access your saved stage plots'
                : ''}
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
