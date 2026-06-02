import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('paddle-signature') ?? ''
  
  // TODO: verify signature and process events in Step 13
  console.log('Paddle webhook received')
  
  return NextResponse.json({ received: true })
}