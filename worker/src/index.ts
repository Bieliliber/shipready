import { Worker, Job } from 'bullmq'
import { Redis } from 'ioredis'
import { QUEUE_NAMES } from './queues'

if (!process.env.REDIS_URL) {
  throw new Error('Missing REDIS_URL')
}

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
    const { submissionId } = job.data as {
      submissionId: string
      sourceType: string
      sourceUrl?: string
    }
    console.log(`📦 Processing scan: ${submissionId}`)

    await job.updateProgress(10)
    console.log('Stage 1: Ingesting code...')

    await job.updateProgress(30)
    console.log('Stage 2: Static scan...')

    await job.updateProgress(60)
    console.log('Stage 3: AI analysis...')

    await job.updateProgress(85)
    console.log('Stage 4: Generating report...')

    await job.updateProgress(100)
    return { success: true, submissionId }
  },
  {
    connection: connection as any,
    concurrency: 3,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  }
)

worker.on('completed', (job: Job) =>
  console.log(`✅ Job ${job.id} completed`)
)

worker.on('failed', (job: Job | undefined, err: Error) =>
  console.error(`❌ Job ${job?.id} failed:`, err.message)
)

worker.on('progress', (job: Job, progress) =>
  console.log(`📊 Job ${job.id}: ${JSON.stringify(progress)}%`)
)

console.log(`✅ Worker listening on queue: ${QUEUE_NAMES.SCAN}`)