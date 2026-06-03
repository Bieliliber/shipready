import { db } from '../utils/db'
import { AnalysisResult } from './ai-analysis'

export async function saveReport(
  submissionId: string,
  result: AnalysisResult
): Promise<void> {
  await db.from('submissions').update({
    status: 'completed',
    updated_at: new Date().toISOString()
  }).eq('id', submissionId)

  const { data: scan, error: scanError } = await db
    .from('scans')
    .insert({
      submission_id: submissionId,
      status: 'completed',
      score_security: result.scores.security,
      score_performance: result.scores.performance,
      score_reliability: result.scores.reliability,
      overall_score: result.scores.overall,
      completed_at: new Date().toISOString()
    })
    .select()
    .single()

  if (scanError || !scan) throw new Error(`Scan save failed: ${scanError?.message}`)

  if (result.findings.length > 0) {
    const { error } = await db.from('findings').insert(
      result.findings.map(f => ({
        scan_id: scan.id,
        severity: f.severity,
        category: f.category,
        title: f.title,
        description: f.plainEnglish || f.description,
        fix_prompt: f.fixPrompt || '',
        file_path: f.filePath || null,
        line_number: f.lineNumber || null,
        tool: f.tool,
        resolved: false
      }))
    )
    if (error) throw new Error(`Findings save failed: ${error.message}`)
  }

  await db.from('reports').insert({ scan_id: scan.id })
  console.log(`✅ Report saved for ${submissionId}`)
}

export async function markFailed(
  submissionId: string,
  errorMessage: string
): Promise<void> {
  await db.from('submissions').update({
    status: 'failed',
    updated_at: new Date().toISOString()
  }).eq('id', submissionId)

  await db.from('scans').insert({
    submission_id: submissionId,
    status: 'failed',
    error_message: errorMessage
  })
}