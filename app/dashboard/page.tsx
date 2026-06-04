import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, scans(id, overall_score, status, completed_at)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold">ShipReady</Link>
          <Link href="/dashboard/new-scan" className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            + New scan
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Your scans</h1>

        {(!submissions || submissions.length === 0) ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No scans yet</h2>
            <p className="text-gray-500 mb-6">Submit your first app to get a production readiness report</p>
            <Link href="/dashboard/new-scan" className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors inline-block">
              Audit my first app
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub: any) => {
              const scan = sub.scans?.[0]
              return (
                <Link key={sub.id} href={`/dashboard/scans/${sub.id}`} className="block bg-white border border-gray-100 rounded-xl p-6 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-lg">{sub.source_url}</p>
                      <p className="text-sm text-gray-500 mt-1">{new Date(sub.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {scan?.overall_score != null && (
                        <div className={`text-2xl font-bold ${scan.overall_score >= 70 ? 'text-green-500' : scan.overall_score >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {scan.overall_score}/100
                        </div>
                      )}
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        sub.status === 'completed' ? 'bg-green-50 text-green-700' :
                        sub.status === 'failed' ? 'bg-red-50 text-red-700' :
                        'bg-yellow-50 text-yellow-700'
                      }`}>{sub.status}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}