import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'
import { RiderData } from '@/types'

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const bearerToken = authHeader?.replace('Bearer ', '')

  if (!bearerToken) {
    return null
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      },
    }
  )

  const { data: { user } } = await supabaseClient.auth.getUser()
  return user
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ stageplotId: string }> }
) {
  try {
    const { stageplotId } = await params

    if (!stageplotId) {
      return NextResponse.json({ error: 'Missing stageplotId' }, { status: 400 })
    }

    // 1. Try owner access via auth cookie
    const { cookies } = request
    const authToken = cookies.get(`auth_sp_${stageplotId}`)?.value

    if (authToken) {
      const { data: plot } = await supabase
        .from('stage_plots')
        .select('*')
        .eq('id', stageplotId)
        .single()

      if (plot) {
        return NextResponse.json({
          plotData: plot.plot_data as RiderData,
          stageplotId: plot.id,
          shareToken: plot.share_token,
          accessLevel: 'owner',
          view_count: plot.view_count,
          created_at: plot.created_at,
        })
      }
    }

    // 1b. Try owner access via Authorization Bearer token
    const user = await getAuthUser(request)
    if (user) {
      const { data: plot } = await supabase
        .from('stage_plots')
        .select('*')
        .eq('id', stageplotId)
        .eq('user_id', user.id)
        .single()

      if (plot) {
        return NextResponse.json({
          plotData: plot.plot_data,
          stageplotId: plot.id,
          shareToken: plot.share_token,
          accessLevel: 'owner',
          view_count: plot.view_count,
          created_at: plot.created_at,
        })
      }
    }

    // 2. Public guest access — no authentication required
    const { data: plot, error: plotError } = await supabase
      .from('stage_plots')
      .select('*')
      .eq('id', stageplotId)
      .single()

    if (plotError || !plot) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    // Increment view count for guest access
    await supabase
      .from('stage_plots')
      .update({ view_count: (plot.view_count ?? 0) + 1 })
      .eq('id', stageplotId)

    return NextResponse.json({
      plotData: plot.plot_data as RiderData,
      stageplotId: plot.id,
      shareToken: plot.share_token,
      accessLevel: 'guest',
      view_count: (plot.view_count ?? 0) + 1,
      created_at: plot.created_at,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ stageplotId: string }> }
) {
  try {
    const { stageplotId } = await params

    if (!stageplotId) {
      return NextResponse.json({ error: 'Missing stageplotId' }, { status: 400 })
    }

    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bandName } = await request.json()
    if (!bandName) {
      return NextResponse.json({ error: 'Missing bandName' }, { status: 400 })
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('stage_plots')
      .select('id, user_id, plot_data')
      .eq('id', stageplotId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Stage plot not found' }, { status: 404 })
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update band name in plot_data
    const updatedPlotData = {
      ...existing.plot_data,
      details: {
        ...existing.plot_data.details,
        bandName,
      },
    }

    const { error: updateError } = await supabase
      .from('stage_plots')
      .update({ plot_data: updatedPlotData, updated_at: new Date().toISOString() })
      .eq('id', stageplotId)

    if (updateError) {
      console.error('Stage plot update error:', updateError)
      return NextResponse.json({ error: 'Failed to update stage plot' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ stageplotId: string }> }
) {
  try {
    const { stageplotId } = await params

    if (!stageplotId) {
      return NextResponse.json({ error: 'Missing stageplotId' }, { status: 400 })
    }

    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('stage_plots')
      .select('id, user_id')
      .eq('id', stageplotId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Stage plot not found' }, { status: 404 })
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from('stage_plots')
      .delete()
      .eq('id', stageplotId)

    if (deleteError) {
      console.error('Stage plot delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete stage plot' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
