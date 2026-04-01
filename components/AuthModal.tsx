'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { supabase } from '@/utils/supabase'

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
  const [isSignUp, setIsSignUp] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          setIsLoading(false)
          return
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (signUpError) {
          setError(signUpError.message)
          setIsLoading(false)
          return
        }

        // Sign-up successful, proceed with save
        onAuthSuccess()
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          setError(signInError.message)
          setIsLoading(false)
          return
        }

        // Sign-in successful, proceed with save
        onAuthSuccess()
        setEmail('')
        setPassword('')
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
            <button
              onClick={() => {
                setIsSignUp(true)
                setError('')
              }}
              className={`text-sm font-medium transition-colors ${
                isSignUp ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Create account
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => {
                setIsSignUp(false)
                setError('')
              }}
              className={`text-sm font-medium transition-colors ${
                !isSignUp ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign in
            </button>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-4">
              Save and share your stage plot
            </p>
          </div>

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

          {/* Password */}
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

          {/* Confirm Password (sign-up only) */}
          {isSignUp && (
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

          {/* Error message */}
          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-300 rounded text-xs text-red-600">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || !email || !password || (isSignUp && !confirmPassword)}
            className="w-full px-4 py-2 mt-6 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {isSignUp ? 'Creating...' : 'Signing in...'}
              </>
            ) : isSignUp ? (
              'Create account'
            ) : (
              'Sign in'
            )}
          </button>

          {/* Info text */}
          <p className="text-xs text-slate-400 text-center mt-4">
            {isSignUp
              ? 'Create an account to save and share your stage plot'
              : 'Sign in to access your saved stage plots'}
          </p>
        </form>
      </div>
    </div>
  )
}
