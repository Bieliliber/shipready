import simpleGit from 'simple-git'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import AdmZip from 'adm-zip'
import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'

const WORK_DIR = '/tmp/shipready-scans'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

function buildCloneUrl(repoUrl: string): string {
  const token = process.env.GITHUB_TOKEN
  if (token) return repoUrl.replace('https://', `https://x-access-token:${token}@`)
  return repoUrl
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks)
}

export async function ingestFromGitHub(
  submissionId: string,
  repoUrl: string
): Promise<string> {
  const scanDir = path.join(WORK_DIR, submissionId)
  fs.mkdirSync(scanDir, { recursive: true })
  process.env.GIT_TERMINAL_PROMPT = '0'
  const git = simpleGit()
  await git.clone(buildCloneUrl(repoUrl), scanDir, ['--depth', '1'])
  console.log(`✅ Cloned ${repoUrl}`)
  return scanDir
}

export async function ingestFromZip(
  submissionId: string,
  r2Key: string
): Promise<string> {
  const scanDir = path.join(WORK_DIR, submissionId)
  fs.mkdirSync(scanDir, { recursive: true })

  console.log(`📥 Downloading ZIP from R2...`)
  const res = await r2.send(new GetObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'shipready-storage',
    Key: r2Key,
  }))

  const buffer = await streamToBuffer(res.Body as Readable)
  console.log(`📦 Extracting ZIP...`)
  const zip = new AdmZip(buffer)
  zip.extractAllTo(scanDir, true)
  console.log(`✅ Extracted to ${scanDir}`)
  return scanDir
}

export function cleanupScanDir(scanDir: string): void {
  if (fs.existsSync(scanDir)) {
    fs.rmSync(scanDir, { recursive: true, force: true })
    console.log(`🧹 Cleaned up ${scanDir}`)
  }
}