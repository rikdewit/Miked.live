import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Magic links are no longer used. This route is kept for backwards compatibility.
  // Redirect to stageplot editor.
  return NextResponse.redirect(new URL('/stageplot', request.url))
}
