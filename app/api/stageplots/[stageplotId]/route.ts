import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'
import { RiderData } from '@/types'

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
    const authHeader = request.headers.get('Authorization')
    const bearerToken = authHeader?.replace('Bearer ', '')
    if (bearerToken) {
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
