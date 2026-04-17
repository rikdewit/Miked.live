import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'
import type { RiderData } from '@/types'

export async function GET(request: NextRequest) {
  try {
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

    // Fetch all stageplots for this user
    const { data, error: dbError } = await supabase
      .from('stage_plots')
      .select('id, created_at, updated_at, plot_data')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    // Map to lightweight response format
    const stageplots = (data ?? []).map(row => ({
      id: row.id,
      bandName: (row.plot_data as RiderData)?.details?.bandName ?? '',
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))

    return NextResponse.json({ stageplots })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
