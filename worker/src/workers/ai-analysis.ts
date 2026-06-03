import { ScanFinding } from './static-scan'

export interface AnalyzedFinding extends ScanFinding {
  plainEnglish: string
  fixPrompt: string
}

export interface AnalysisResult {
  findings: AnalyzedFinding[]
  scores: {
    security: number
    performance: number
    reliability: number
    overall: number
  }
  summary: string
}

function calculateScores(findings: ScanFinding[]): AnalysisResult['scores'] {
  let security = 100
  for (const f of findings) {
    if (f.category === 'security' || f.category === 'secrets') {
      security -= f.severity === 'critical' ? 20
        : f.severity === 'high' ? 10
        : f.severity === 'medium' ? 5
        : f.severity === 'low' ? 2 : 0
    }
  }
  security = Math.max(0, security)
  const performance = 85
  const reliability = 80
  const overall = Math.round((security + performance + reliability) / 3)
  return { security, performance, reliability, overall }
}

function fallback(findings: ScanFinding[]): AnalyzedFinding[] {
  return findings.map(f => ({
    ...f,
    plainEnglish: `${f.title}: ${f.description}`,
    fixPrompt: `Fix the ${f.severity} severity issue "${f.title}" in ${f.filePath || 'your code'}.`
  }))
}

export async function runAiAnalysis(findings: ScanFinding[]): Promise<AnalysisResult> {
  const scores = calculateScores(findings)

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('⏭️ No Anthropic key — using basic analysis')
    return {
      findings: fallback(findings),
      scores,
      summary: `Found ${findings.length} issues. ${findings.filter(f => f.severity === 'critical').length} critical, ${findings.filter(f => f.severity === 'high').length} high severity.`
    }
  }

  console.log('🤖 Running Claude AI analysis...')
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `You are a security expert helping non-technical founders understand their app vulnerabilities.

Raw scan findings:
${JSON.stringify(findings.slice(0, 20), null, 2)}

For each finding provide plainEnglish (1-2 sentences a non-technical founder understands) and fixPrompt (exact prompt to paste into Cursor/Lovable to fix it).

Respond ONLY with valid JSON:
{
  "findings": [{"index": 0, "plainEnglish": "...", "fixPrompt": "..."}],
  "summary": "2-3 sentence executive summary"
}`
        }]
      })
    })

    const data = await response.json()
    const parsed = JSON.parse(data.content[0].text)

    const analyzed: AnalyzedFinding[] = findings.map((f, i) => {
      const ai = parsed.findings.find((x: any) => x.index === i)
      return { ...f, plainEnglish: ai?.plainEnglish || f.description, fixPrompt: ai?.fixPrompt || '' }
    })

    console.log('✅ AI analysis complete')
    return { findings: analyzed, scores, summary: parsed.summary }
  } catch (err: any) {
    console.error('AI analysis error:', err.message)
    return { findings: fallback(findings), scores, summary: `Found ${findings.length} issues requiring attention.` }
  }
}