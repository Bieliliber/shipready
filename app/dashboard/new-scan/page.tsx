'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewScanPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'zip' | 'github'>('zip')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let sourceUrl = ''
      let sourceType: 'github' | 'zip' = tab

      if (tab === 'zip') {
        if (!file) throw new Error('Please select a ZIP file')
        const form = new FormData()
        form.append('file', file)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: form })
        if (!uploadRes.ok) throw new Error('Upload failed')
        const { key } = await uploadRes.json()
        sourceUrl = key
      } else {
        if (!url.trim()) throw new Error('Please enter a GitHub URL')
        sourceUrl = url.trim()
      }

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrl, sourceType })
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

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.name.endsWith('.zip')) setFile(dropped)
    else setError('Please upload a ZIP file only')
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
        <p className="text-gray-500 mb-8">Upload your code and get a full security audit within 48 hours.</p>

        {/* Tabs */}
        <div className="flex border border-gray-200 rounded-xl overflow-hidden mb-6">
          <button
            onClick={() => setTab('zip')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'zip' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            📁 Upload ZIP file
          </button>
          <button
            onClick={() => setTab('github')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'github' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            GitHub URL
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8">

          {tab === 'zip' ? (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Your ZIP file</label>

              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragOver ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}
              >
                {file ? (
                  <div>
                    <div className="text-2xl mb-2">✅</div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-400 mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    <button type="button" onClick={e => { e.stopPropagation(); setFile(null) }} className="text-xs text-red-500 mt-2 hover:underline">Remove</button>
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl mb-3">📁</div>
                    <p className="text-sm font-medium text-gray-700">Drop your ZIP here or click to browse</p>
                    <p className="text-xs text-gray-400 mt-1">Only .zip files accepted</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept=".zip" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>

              <div className="mt-4 bg-blue-50 rounded-xl p-4">
                <p className="text-sm font-medium text-blue-800 mb-1">How to get your ZIP from GitHub:</p>
                <p className="text-sm text-blue-700">Open your repo on GitHub → click the green <strong>"Code"</strong> button → click <strong>"Download ZIP"</strong></p>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">GitHub repository URL</label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://github.com/yourusername/your-app"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
              />
              <div className="mt-3 flex items-start gap-2 bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                <span className="text-yellow-500 mt-0.5">⚠️</span>
                <p className="text-sm text-yellow-800">
                  <strong>Your repository must be public</strong> to use this method. If your repo is private, use the ZIP upload tab instead — it works for all repos.
                </p>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">What we check:</p>
            <div className="grid grid-cols-2 gap-2">
              {['Exposed secrets', 'OWASP vulnerabilities', 'Broken auth', 'Vulnerable dependencies', 'Performance issues', 'Missing rate limiting'].map(item => (
                <div key={item} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-green-500">✓</span> {item}
                </div>
              ))}
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

          <button
            type="submit"
            disabled={loading || (tab === 'zip' ? !file : !url.trim())}
            className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (tab === 'zip' ? 'Uploading...' : 'Submitting...') : 'Start scan'}
          </button>
          <p className="text-xs text-gray-400 text-center mt-3">Scan starts immediately after submission</p>
        </form>
      </div>
    </div>
  )
}