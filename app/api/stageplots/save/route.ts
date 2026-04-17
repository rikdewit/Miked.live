import React from 'react'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'
import { supabaseAdmin } from '@/utils/supabaseAdmin'
import { createSupabaseServerClient } from '@/utils/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { plotData, stageplotId } = await request.json()

    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create a Supabase client with the token to verify the user
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!plotData) {
      return NextResponse.json({ error: 'Missing plotData' }, { status: 400 })
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
        .select('id, share_token, user_id')
        .eq('id', stageplotId)
        .single()

      if (fetchError || !existing) {
        return NextResponse.json({ error: 'Stage plot not found' }, { status: 404 })
      }

      // Verify ownership
      if (existing.user_id !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
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
      .insert([{ user_id: user.id, plot_data: cleanedPlotData, share_token: shareToken }])
      .select()
      .single()

    if (insertError || !plotRecord) {
      console.error('Stage plot insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save stage plot' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      stageplotId: plotRecord.id,
      shareToken: plotRecord.share_token,
      message: 'Stage plot saved',
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
