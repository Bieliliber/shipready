import { Worker, Job } from 'bullmq'
import { Redis } from 'ioredis'
import { QUEUE_NAMES } from './queues'

if (!process.env.REDIS_URL) throw new Error('Missing REDIS_URL')

export const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

connection.on('connect', () => console.log('✅ Connected to Redis'))
connection.on('error', (err: Error) => console.error('❌ Redis error:', err))

console.log('🚀 ShipReady Worker starting...')

const worker = new Worker(
  QUEUE_NAMES.SCAN,
  async (job: Job) => {
    const { submissionId, sourceType, sourceUrl } = job.data as {
      submissionId: string
      sourceType: string
      sourceUrl?: string
    }
    console.log(`📦 Processing scan: ${submissionId}`)

    const { ingestFromGitHub, cleanupScanDir } = await import('./workers/ingest')
    const { runStaticScan } = await import('./workers/static-scan')
    const { runAiAnalysis } = await import('./workers/ai-analysis')
    const { saveReport, markFailed } = await import('./workers/report')

    let scanDir: string | null = null

    try {
      await job.updateProgress(10)
      console.log('Stage 1: Ingesting code...')
      scanDir = await ingestFromGitHub(submissionId, sourceUrl || '')

      await job.updateProgress(30)
      console.log('Stage 2: Static scan...')
      const findings = await runStaticScan(scanDir)

      await job.updateProgress(60)
      console.log('Stage 3: AI analysis...')
      const analysisResult = await runAiAnalysis(findings)

      await job.updateProgress(85)
      console.log('Stage 4: Saving report...')
      await saveReport(submissionId, analysisResult)

      await job.updateProgress(100)
      return { success: true, submissionId, findingsCount: findings.length }

    } catch (err: any) {
      console.error(`❌ Scan failed: ${err.message}`)
      await markFailed(submissionId, err.message)
      throw err
    } finally {
      if (scanDir) cleanupScanDir(scanDir)
    }
  },
  {
    connection: connection as any,
    concurrency: 3,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  }
)

worker.on('completed', (job: Job) => console.log(`✅ Job ${job.id} completed`))
worker.on('failed', (job: Job | undefined, err: Error) => console.error(`❌ Job ${job?.id} failed:`, err.message))
worker.on('progress', (job: Job, progress) => console.log(`📊 Job ${job.id}: ${JSON.stringify(progress)}%`))

console.log(`✅ Worker listening on queue: ${QUEUE_NAMES.SCAN}`)