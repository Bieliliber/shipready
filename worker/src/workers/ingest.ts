import simpleGit from 'simple-git'
import fs from 'fs'
import path from 'path'

const WORK_DIR = '/tmp/shipready-scans'

export async function ingestFromGitHub(
  submissionId: string,
  repoUrl: string
): Promise<string> {
  const scanDir = path.join(WORK_DIR, submissionId)
  fs.mkdirSync(scanDir, { recursive: true })

  process.env.GIT_TERMINAL_PROMPT = '0'
  process.env.GIT_ASKPASS = 'echo'

  const git = simpleGit()
  await git.clone(repoUrl, scanDir, [
    '--depth', '1',
    '-c', 'credential.helper=',
    '-c', 'core.askpass=echo',
  ])

  console.log(`✅ Cloned ${repoUrl}`)
  return scanDir
}

export function cleanupScanDir(scanDir: string): void {
  if (fs.existsSync(scanDir)) {
    fs.rmSync(scanDir, { recursive: true, force: true })
    console.log(`🧹 Cleaned up ${scanDir}`)
  }
}