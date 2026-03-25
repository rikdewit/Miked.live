import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')
  const stageplotId = searchParams.get('stageplotId')

  console.log('[AUTH CALLBACK] Received request', { token: !!token, stageplotId })

  if (!token || !stageplotId) {
    console.log('[AUTH CALLBACK] Missing token or stageplotId')
    return NextResponse.redirect(new URL('/stageplot', request.url))
  }

  try {
    // Validate the magic link token
    const { data: magicLink, error: linkError } = await supabase
      .from('stageplot_magic_links')
      .select('*')
      .eq('token', token)
      .eq('stageplot_id', stageplotId)
      .single()

    if (linkError || !magicLink) {
      console.log('[AUTH CALLBACK] Magic link not found — redirecting as guest')
      const { data: plot } = await supabase
        .from('stage_plots')
        .select('share_token')
        .eq('id', stageplotId)
        .single()

      if (plot?.share_token) {
        return NextResponse.redirect(
          new URL(`/stageplots/${stageplotId}?share=${plot.share_token}`, request.url)
        )
      }
      return NextResponse.redirect(new URL('/stageplot', request.url))
    }

    // Check expiry
    if (new Date(magicLink.expires_at) < new Date()) {
      console.log('[AUTH CALLBACK] Magic link expired — redirecting as guest')
      const { data: plot } = await supabase
        .from('stage_plots')
        .select('share_token')
        .eq('id', stageplotId)
        .single()

      if (plot?.share_token) {
        return NextResponse.redirect(
          new URL(`/stageplots/${stageplotId}?share=${plot.share_token}`, request.url)
        )
      }
      return NextResponse.redirect(new URL('/stageplot', request.url))
    }

    // Delete token so it can't be reused
    await supabase
      .from('stageplot_magic_links')
      .delete()
      .eq('token', token)
      .eq('stageplot_id', stageplotId)

    console.log('[AUTH CALLBACK] Token valid, setting owner cookie')

    const response = NextResponse.redirect(new URL(`/stageplots/${stageplotId}`, request.url))
    response.cookies.set(`auth_sp_${stageplotId}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[AUTH CALLBACK] Unexpected error:', error)
    return NextResponse.redirect(new URL('/stageplot', request.url))
  }
}
