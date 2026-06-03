import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

export interface ScanFinding {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  category: 'security' | 'performance' | 'reliability' | 'secrets'
  title: string
  description: string
  filePath?: string
  lineNumber?: number
  tool: string
}

function mapSemgrepSeverity(severity: string): ScanFinding['severity'] {
  switch (severity?.toUpperCase()) {
    case 'ERROR': return 'critical'
    case 'WARNING': return 'high'
    case 'INFO': return 'medium'
    default: return 'low'
  }
}

export async function runSemgrep(scanDir: string): Promise<ScanFinding[]> {
  console.log('🔍 Running Semgrep...')
  try {
    const output = execSync(
      `semgrep --config=auto --json --timeout=60 ${scanDir}`,
      { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] }
    )
    const parsed = JSON.parse(output)
    console.log(`✅ Semgrep: ${parsed.results?.length || 0} issues found`)
    return (parsed.results || []).map((r: any) => ({
      severity: mapSemgrepSeverity(r.extra?.severity),
      category: 'security' as const,
      title: r.check_id || 'Unknown rule',
      description: r.extra?.message || 'No description',
      filePath: r.path,
      lineNumber: r.start?.line,
      tool: 'semgrep'
    }))
  } catch (error: any) {
    if (error.stdout) {
      try {
        const parsed = JSON.parse(error.stdout)
        console.log(`✅ Semgrep: ${parsed.results?.length || 0} issues found`)
        return (parsed.results || []).map((r: any) => ({
          severity: mapSemgrepSeverity(r.extra?.severity),
          category: 'security' as const,
          title: r.check_id || 'Unknown rule',
          description: r.extra?.message || 'No description',
          filePath: r.path,
          lineNumber: r.start?.line,
          tool: 'semgrep'
        }))
      } catch {}
    }
    console.error('Semgrep error:', error.message)
    return []
  }
}

export async function runGitleaks(scanDir: string): Promise<ScanFinding[]> {
  console.log('🔍 Running Gitleaks...')
  const reportPath = `/tmp/gitleaks-${Date.now()}.json`
  try {
    execSync(
      `gitleaks detect --source ${scanDir} --report-format json --report-path ${reportPath} --no-git`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    )
    console.log('✅ Gitleaks: no secrets found')
    return []
  } catch (error: any) {
    if (fs.existsSync(reportPath)) {
      try {
        const findings = JSON.parse(fs.readFileSync(reportPath, 'utf-8'))
        console.log(`⚠️ Gitleaks: ${findings.length} secrets found`)
        return (findings || []).map((f: any) => ({
          severity: 'critical' as const,
          category: 'secrets' as const,
          title: `Exposed secret: ${f.RuleID}`,
          description: `${f.Description}. Remove this credential immediately and rotate it.`,
          filePath: f.File,
          lineNumber: f.StartLine,
          tool: 'gitleaks'
        }))
      } catch {}
    }
    console.error('Gitleaks error:', error.message)
    return []
  } finally {
    if (fs.existsSync(reportPath)) fs.unlinkSync(reportPath)
  }
}

export async function runNpmAudit(scanDir: string): Promise<ScanFinding[]> {
  console.log('🔍 Running npm audit...')
  const packageJsonPath = path.join(scanDir, 'package.json')
  if (!fs.existsSync(packageJsonPath)) {
    console.log('⏭️ No package.json found, skipping')
    return []
  }
  try {
    execSync('npm audit --json', {
      cwd: scanDir,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    })
    console.log('✅ npm audit: no vulnerabilities')
    return []
  } catch (error: any) {
    try {
      const parsed = JSON.parse(error.stdout || '{}')
      const vulnerabilities = parsed.vulnerabilities || {}
      const findings: ScanFinding[] = []
      for (const [pkg, vuln] of Object.entries(vulnerabilities)) {
        const v = vuln as any
        findings.push({
          severity: mapNpmSeverity(v.severity),
          category: 'security' as const,
          title: `Vulnerable dependency: ${pkg}`,
          description: `${pkg} has a ${v.severity} vulnerability. Run npm audit fix to resolve.`,
          tool: 'npm-audit'
        })
      }
      console.log(`⚠️ npm audit: ${findings.length} vulnerabilities found`)
      return findings
    } catch {
      return []
    }
  }
}

function mapNpmSeverity(severity: string): ScanFinding['severity'] {
  switch (severity) {
    case 'critical': return 'critical'
    case 'high': return 'high'
    case 'moderate': return 'medium'
    case 'low': return 'low'
    default: return 'info'
  }
}

export async function runStaticScan(scanDir: string): Promise<ScanFinding[]> {
  const [semgrepFindings, gitleaksFindings, npmFindings] = await Promise.all([
    runSemgrep(scanDir),
    runGitleaks(scanDir),
    runNpmAudit(scanDir),
  ])
  const all = [...semgrepFindings, ...gitleaksFindings, ...npmFindings]
  console.log(`📊 Static scan complete: ${all.length} total findings`)
  return all
}