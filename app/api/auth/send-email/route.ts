import React from 'react'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSenderEmails } from '@/utils/get-sender-emails'
import { PasswordResetEmail } from '@/emails/templates/PasswordReset'
import { SignupConfirmationEmail } from '@/emails/templates/SignupConfirmation'

const resend = new Resend(process.env.RESEND_API_KEY)

// Supabase Auth Hook payload for "Send Email" hook
interface AuthHookPayload {
  user: { email: string }
  email_data: {
    token: string
    token_hash: string
    redirect_to: string
    email_action_type: 'signup' | 'recovery' | 'invite' | 'magiclink' | 'email_change'
    site_url: string
  }
}

export async function POST(request: NextRequest) {
  // Verify the hook secret so only Supabase can call this endpoint
  const hookSecret = process.env.SUPABASE_AUTH_HOOK_SECRET
  const authHeader = request.headers.get('authorization')

  if (!hookSecret || authHeader !== `Bearer ${hookSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload: AuthHookPayload = await request.json()
  const { user, email_data } = payload
  const { support } = getSenderEmails()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://miked.live'

  // Base must be the Supabase project URL, not site_url — Supabase verifies tokens at its own domain
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const confirmationLink = `${supabaseUrl}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${encodeURIComponent(email_data.redirect_to)}`

  if (email_data.email_action_type === 'recovery') {
    const { error } = await resend.emails.send({
      from: `Miked.live <${support}>`,
      to: user.email,
      subject: 'Reset your Miked.live password',
      react: React.createElement(PasswordResetEmail, {
        resetLink: confirmationLink,
        baseUrl,
        email: user.email,
      }),
    })

    if (error) {
      console.error('Failed to send password reset email:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }
  } else if (email_data.email_action_type === 'signup') {
    const { error } = await resend.emails.send({
      from: `Miked.live <${support}>`,
      to: user.email,
      subject: 'Confirm your Miked.live account',
      react: React.createElement(SignupConfirmationEmail, {
        confirmLink: confirmationLink,
        baseUrl,
        email: user.email,
      }),
    })

    if (error) {
      console.error('Failed to send signup confirmation email:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
