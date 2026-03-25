import React from 'react'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'
import { supabaseAdmin } from '@/utils/supabaseAdmin'
import { Resend } from 'resend'
import { subscribeUser } from '@/utils/subscribeUser'
import { StagePlotMagicLinkEmail } from '@/emails/templates/StagePlotMagicLink'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, plotData, stageplotId } = await request.json()

    if (!email || !plotData) {
      return NextResponse.json({ error: 'Missing email or plotData' }, { status: 400 })
    }

    // Handle logo upload to Supabase Storage if Base64
    let cleanedPlotData = { ...plotData }
    if (plotData.details?.logoUrl?.startsWith('data:')) {
      try {
        const dataUri = plotData.details.logoUrl
        const [header, base64Data] = dataUri.split(',')
        const mimeMatch = header.match(/data:([^;]+);base64/)
        const mimeType = mimeMatch?.[1] ?? 'image/png'
        const ext = mimeType.split('/')[1] ?? 'png'
        const buffer = Buffer.from(base64Data, 'base64')
        const filename = `${crypto.randomUUID()}.${ext}`

        const { error: uploadError } = await supabaseAdmin.storage
          .from('logos')
          .upload(filename, buffer, { contentType: mimeType, upsert: false })

        if (uploadError) {
          console.error('Logo upload error:', uploadError)
          cleanedPlotData = { ...cleanedPlotData, details: { ...cleanedPlotData.details, logoUrl: undefined } }
        } else {
          const { data: publicUrlData } = supabaseAdmin.storage.from('logos').getPublicUrl(filename)
          cleanedPlotData = { ...cleanedPlotData, details: { ...cleanedPlotData.details, logoUrl: publicUrlData.publicUrl } }
        }
      } catch (logoError) {
        console.error('Logo processing error:', logoError)
        cleanedPlotData = { ...cleanedPlotData, details: { ...cleanedPlotData.details, logoUrl: undefined } }
      }
    }

    // ── UPDATE path: existing stageplot ──────────────────────────────────────
    if (stageplotId) {
      const { data: existing, error: fetchError } = await supabase
        .from('stage_plots')
        .select('id, share_token')
        .eq('id', stageplotId)
        .single()

      if (fetchError || !existing) {
        return NextResponse.json({ error: 'Stage plot not found' }, { status: 404 })
      }

      const { error: updateError } = await supabase
        .from('stage_plots')
        .update({ plot_data: cleanedPlotData, updated_at: new Date().toISOString() })
        .eq('id', stageplotId)

      if (updateError) {
        console.error('Stage plot update error:', updateError)
        return NextResponse.json({ error: 'Failed to update stage plot' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        stageplotId: existing.id,
        shareToken: existing.share_token,
        message: 'Stage plot updated',
      })
    }

    // ── INSERT path: new stageplot ───────────────────────────────────────────
    const shareToken = crypto.randomUUID()

    const { data: plotRecord, error: insertError } = await supabase
      .from('stage_plots')
      .insert([{ email, plot_data: cleanedPlotData, share_token: shareToken }])
      .select()
      .single()

    if (insertError || !plotRecord) {
      console.error('Stage plot insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save stage plot' }, { status: 500 })
    }

    // Create magic link token (1 year expiry)
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

    const { error: linkError } = await supabase.from('stageplot_magic_links').insert([{
      stageplot_id: plotRecord.id,
      token,
      email,
      expires_at: expiresAt.toISOString(),
    }])

    if (linkError) {
      console.error('Magic link insert error:', linkError)
      return NextResponse.json({ error: 'Failed to create magic link' }, { status: 500 })
    }

    // Build magic link URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://miked.live'
    const magicLink = `${appUrl}/auth/callback?token=${token}&stageplotId=${plotRecord.id}`

    // Send email via Resend
    const bandName = cleanedPlotData.details?.bandName
    const subjectLine = bandName ? `Your stage plot for ${bandName} is saved` : 'Your stage plot is saved'
    const senderEmail = process.env.SENDER_EMAIL || 'support@miked.live'

    const emailResponse = await resend.emails.send({
      from: senderEmail,
      to: email,
      subject: subjectLine,
      react: React.createElement(StagePlotMagicLinkEmail, { bandName, magicLink, email, baseUrl: appUrl }),
    })

    if (emailResponse.error) {
      console.error('Email send error:', emailResponse.error)
    }

    // Subscribe user to changelog (non-blocking)
    try {
      await subscribeUser(email, { sendWelcomeEmail: false, source: 'stageplot_save' })
    } catch (err) {
      console.error('Failed to subscribe user:', err)
    }

    return NextResponse.json({
      success: true,
      stageplotId: plotRecord.id,
      shareToken: plotRecord.share_token,
      message: 'Stage plot saved and email sent',
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
