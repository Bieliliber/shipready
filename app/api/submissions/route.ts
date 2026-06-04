import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { addScanJob } from '@/lib/queue'

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sourceUrl, sourceType } = await request.json()
  if (!sourceUrl || !sourceType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data: submission, error } = await supabase
    .from('submissions')
    .insert({ user_id: userId, source_type: sourceType, source_url: sourceUrl, status: 'pending' })
    .select()
    .single()

  if (error || !submission) {
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 })
  }

  await addScanJob(submission.id, sourceType, sourceUrl)

  return NextResponse.json({ submissionId: submission.id }, { status: 201 })
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('submissions')
    .select('*, scans(id, overall_score, status, completed_at)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return NextResponse.json(data || [])
}