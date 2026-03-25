import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'
import { RiderData } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ stageplotId: string }> }
) {
  try {
    const { stageplotId } = await params
    const searchParams = request.nextUrl.searchParams
    const shareToken = searchParams.get('share')

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

    // 2. Try guest access via share token
    if (shareToken) {
      const { data: plot, error: plotError } = await supabase
        .from('stage_plots')
        .select('*')
        .eq('id', stageplotId)
        .eq('share_token', shareToken)
        .single()

      if (plotError || !plot) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
      }

      // Increment view count
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
    }

    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
