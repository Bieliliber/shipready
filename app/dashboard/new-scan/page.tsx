'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewScanPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrl: url.trim(), sourceType: 'github' })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }
      const { submissionId } = await res.json()
      router.push(`/dashboard/scans/${submissionId}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold">ShipReady</Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">← Back</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit your app</h1>
        <p className="text-gray-500 mb-10">Paste your GitHub repository URL. We scan it and deliver your report within 48 hours.</p>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">GitHub repository URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://github.com/yourusername/your-app"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
              required
            />
            <p className="text-xs text-gray-400 mt-2">Repository must be public</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">What we check:</p>
            <div className="grid grid-cols-2 gap-2">
              {['Exposed secrets', 'OWASP vulnerabilities', 'Broken auth', 'Vulnerable dependencies', 'Performance issues', 'Missing rate limiting'].map(item => (
                <div key={item} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-green-500">✓</span> {item}
                </div>
              ))}
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

          <button type="submit" disabled={loading || !url.trim()}
            className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Submitting...' : 'Start scan'}
          </button>
          <p className="text-xs text-gray-400 text-center mt-3">Scan starts immediately after submission</p>
        </form>
      </div>
    </div>
  )
}