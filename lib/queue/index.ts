import { Queue } from 'bullmq'
import { Redis } from 'ioredis'

if (!process.env.REDIS_URL) {
  throw new Error('Missing REDIS_URL')
}

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

export const scanQueue = new Queue('scan', {
  connection: connection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
})

export async function addScanJob(
  submissionId: string,
  sourceType: 'github' | 'zip',
  sourceUrl?: string
) {
  const job = await scanQueue.add('process-scan', {
    submissionId,
    sourceType,
    sourceUrl,
  })
  console.log(`📬 Scan job added: ${job.id}`)
  return job
}