import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { uploadZip } from '@/lib/r2'

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!file.name.endsWith('.zip')) return NextResponse.json({ error: 'Only ZIP files accepted' }, { status: 400 })

  const key = `uploads/${userId}/${crypto.randomUUID()}.zip`
  const buffer = Buffer.from(await file.arrayBuffer())

  await uploadZip(key, buffer)

  return NextResponse.json({ key })
}