import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default async function ScanPage({ params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { data: submission } = await supabase
    .from('submissions')
    .select('*, scans(*, findings(*))')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single()

  if (!submission) redirect('/dashboard')

  const scan = submission.scans?.[0]
  const findings = scan?.findings || []
  const critical = findings.filter((f: any) => f.severity === 'critical')
  const high = findings.filter((f: any) => f.severity === 'high')
  const medium = findings.filter((f: any) => f.severity === 'medium')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold">ShipReady</Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">← Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Status */}
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-1 truncate">{submission.source_url}</p>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Scan Report</h1>
            <span className={`text-sm px-3 py-1 rounded-full ${
              submission.status === 'completed' ? 'bg-green-50 text-green-700' :
              submission.status === 'failed' ? 'bg-red-50 text-red-700' :
              'bg-yellow-50 text-yellow-700'
            }`}>{submission.status}</span>
          </div>
        </div>

        {/* Pending state */}
        {submission.status !== 'completed' && submission.status !== 'failed' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center mb-8">
            <div className="text-4xl mb-4 animate-pulse">🔍</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Scan in progress</h2>
            <p className="text-gray-500">We're scanning your codebase. This page will update when complete.</p>
            <p className="text-sm text-gray-400 mt-4">Refresh this page to check progress</p>
          </div>
        )}

        {/* Scores */}
        {scan && submission.status === 'completed' && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Overall', score: scan.overall_score },
                { label: 'Security', score: scan.score_security },
                { label: 'Performance', score: scan.score_performance },
                { label: 'Reliability', score: scan.score_reliability },
              ].map(({ label, score }) => (
                <div key={label} className="bg-white border border-gray-100 rounded-xl p-6 text-center">
                  <div className={`text-4xl font-bold mb-1 ${score >= 70 ? 'text-green-500' : score >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {score}
                  </div>
                  <div className="text-sm text-gray-500">{label}</div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Critical', count: critical.length, color: 'text-red-600 bg-red-50' },
                { label: 'High', count: high.length, color: 'text-orange-600 bg-orange-50' },
                { label: 'Medium', count: medium.length, color: 'text-yellow-600 bg-yellow-50' },
              ].map(({ label, count, color }) => (
                <div key={label} className={`rounded-xl p-4 text-center ${color}`}>
                  <div className="text-3xl font-bold">{count}</div>
                  <div className="text-sm font-medium">{label}</div>
                </div>
              ))}
            </div>

            {/* Findings */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Findings ({findings.length})</h2>
              <div className="space-y-4">
                {findings.map((f: any) => (
                  <div key={f.id} className="bg-white border border-gray-100 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          f.severity === 'critical' ? 'bg-red-50 text-red-700' :
                          f.severity === 'high' ? 'bg-orange-50 text-orange-700' :
                          f.severity === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-gray-50 text-gray-700'
                        }`}>{f.severity}</span>
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{f.tool}</span>
                      </div>
                      {f.file_path && (
                        <span className="text-xs text-gray-400 font-mono">{f.file_path}:{f.line_number}</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{f.description}</p>
                    {f.fix_prompt && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Fix prompt — paste into Cursor/Lovable:</p>
                        <p className="text-sm text-gray-700 font-mono">{f.fix_prompt}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {submission.status === 'failed' && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
            <p className="text-red-700 font-medium">Scan failed. Please try again or contact support.</p>
          </div>
        )}
      </div>
    </div>
  )
}