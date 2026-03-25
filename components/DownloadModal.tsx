'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { usePostHog } from 'posthog-js/react'

interface DownloadModalProps {
  isOpen: boolean
  prefillEmail: string
  onClose: () => void
  onConfirm: (email: string) => Promise<void>
  isGeneratingPdf?: boolean
  lastSentEmail?: string | null
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  prefillEmail,
  onClose,
  onConfirm,
  isGeneratingPdf = false,
  lastSentEmail = null,
}) => {
  const posthog = usePostHog()
  const [emailChoice, setEmailChoice] = useState<'prefilled' | 'custom'>('prefilled')
  const [customEmail, setCustomEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(!!lastSentEmail)
  const [successEmail, setSuccessEmail] = useState(lastSentEmail || '')

  // Update success state when modal opens with lastSentEmail
  useEffect(() => {
    if (isOpen && lastSentEmail) {
      setIsSuccess(true)
      setSuccessEmail(lastSentEmail)
    }
  }, [isOpen, lastSentEmail])

  const selectedEmail = emailChoice === 'prefilled' ? prefillEmail : customEmail
  const isValidSelection =
    emailChoice === 'prefilled'
      ? isValidEmail(prefillEmail)
      : isValidEmail(customEmail)

  const handleConfirm = async () => {
    if (!isValidSelection) return

    try {
      setIsLoading(true)
      posthog?.capture('send_rider_link', {
        email: selectedEmail,
        email_choice: emailChoice,
      })
      await onConfirm(selectedEmail)
      setSuccessEmail(selectedEmail)
      setIsSuccess(true)
      setIsLoading(false)
    } catch (error) {
      console.error('Error confirming download:', error)
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setIsSuccess(false)
    setEmailChoice('prefilled')
    setCustomEmail('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isSuccess ? 'Stage plot saved!' : 'Save your stage plot & get a shareable link'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isSuccess ? (
            // Success Screen
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-4">
                  <Check className="text-green-600" size={32} />
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-700">
                  A shareable link has been sent to
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {successEmail}
                </p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4 space-y-3">
                <p className="text-xs font-medium text-gray-600">
                  You can now:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">✓</span>
                    <span>Access your stage plot anytime with the link</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">✓</span>
                    <span>Share it with venues and promoters</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">✓</span>
                    <span>Update your details later</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            // Form Screen
            <>
              {/* Question */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-4">
                  Is {prefillEmail} your email?
                </p>

                {/* Radio options */}
                <div className="space-y-3">
                  {/* Option 1: Yes, prefilled */}
                  <label className="flex items-start cursor-pointer group">
                    <input
                      type="radio"
                      name="emailChoice"
                      value="prefilled"
                      checked={emailChoice === 'prefilled'}
                      onChange={() => setEmailChoice('prefilled')}
                      disabled={isLoading}
                      className="mt-1 w-4 h-4 text-indigo-600 cursor-pointer"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        Yes, email me the link
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        We'll send it to {prefillEmail}
                      </p>
                    </div>
                  </label>

                  {/* Option 2: No, custom email */}
                  <label className="flex items-start cursor-pointer group">
                    <input
                      type="radio"
                      name="emailChoice"
                      value="custom"
                      checked={emailChoice === 'custom'}
                      onChange={() => setEmailChoice('custom')}
                      disabled={isLoading}
                      className="mt-1 w-4 h-4 text-indigo-600 cursor-pointer"
                    />
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        No, use a different email
                      </p>
                      {emailChoice === 'custom' && (
                        <input
                          type="email"
                          value={customEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          disabled={isLoading}
                          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-600 mb-3">
                  We'll send you a link so you can:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">✓</span>
                    <span>Access this stage plot anytime</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">✓</span>
                    <span>Share it with venues</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">✓</span>
                    <span>Update it later</span>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          {isSuccess ? (
            // Success footer
            <>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <Link
                href="/riders"
                onClick={() => {
                  posthog?.capture('view_riders_clicked', {
                    email: successEmail,
                  })
                  handleClose()
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                View Your Stage Plots
                <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            // Form footer
            <>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!isValidSelection || isLoading || isGeneratingPdf}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Download & Send Link
                    <span>→</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
