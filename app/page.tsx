import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-semibold tracking-tight">ShipReady</span>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900">How it works</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <Link href="/dashboard/new-scan" className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
              Audit my app
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-red-50 text-red-600 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            45% of AI-generated code has security vulnerabilities
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Your vibe-coded app,<br />made production-ready
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            Paste your GitHub URL. Get a full security audit, performance report, and exact fix prompts in 48 hours. Built for founders who ship fast.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/new-scan" className="bg-black text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-gray-800 transition-colors">
              Audit my app — $499
            </Link>
            <a href="#how-it-works" className="border border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-lg font-medium hover:bg-gray-50 transition-colors">
              See how it works
            </a>
          </div>
          <p className="text-sm text-gray-400 mt-6">No developer needed. Results in 48 hours.</p>
        </div>
      </section>

      {/* Social proof strip */}
      <div className="border-y border-gray-100 py-6 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-sm text-gray-400">
          <span>✓ Semgrep SAST scanning</span>
          <span>✓ Secret detection</span>
          <span>✓ Dependency vulnerabilities</span>
          <span>✓ AI-powered fix prompts</span>
          <span>✓ Production readiness score</span>
        </div>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-gray-500">Three steps from submission to production-ready</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Submit your app',
                desc: 'Paste your GitHub repo URL or upload a ZIP. Works with Lovable, Bolt, Replit, Cursor — any vibe-coded app.'
              },
              {
                step: '02',
                title: 'We scan everything',
                desc: 'Our scanner checks for exposed credentials, OWASP vulnerabilities, broken auth, slow queries, and dependency issues.'
              },
              {
                step: '03',
                title: 'Get your report',
                desc: 'A production readiness score, plain-English explanations, and exact fix prompts to paste back into your AI tool.'
              }
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-bold text-gray-100 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we catch */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What we catch</h2>
            <p className="text-gray-500">Everything that breaks in production that your AI coding tool missed</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: '🔑', title: 'Exposed API keys & secrets', desc: 'Credentials accidentally committed to your codebase — the #1 cause of data breaches.' },
              { icon: '🔒', title: 'Authentication vulnerabilities', desc: 'Broken login flows, missing session validation, and bypassed auth checks.' },
              { icon: '💉', title: 'Injection attacks', desc: 'SQL injection, XSS, and other OWASP Top 10 vulnerabilities found by Semgrep.' },
              { icon: '📦', title: 'Vulnerable dependencies', desc: 'npm packages with known CVEs that could be exploited by attackers.' },
              { icon: '⚡', title: 'Performance bottlenecks', desc: 'Database queries that work at 50 users but fail at 5,000.' },
              { icon: '🛡️', title: 'Missing rate limiting', desc: 'Unprotected API endpoints that can be abused or overwhelmed.' },
            ].map((item) => (
              <div key={item.title} className="bg-white p-6 rounded-xl border border-gray-100">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple pricing</h2>
            <p className="text-gray-500">Pay once, ship with confidence</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Audit',
                price: '$499',
                period: 'one-time',
                desc: 'Full security audit with report',
                features: ['Complete code scan', 'Production readiness score', 'AI fix prompts', 'PDF report', '30-min review call'],
                cta: 'Get audited',
                featured: false
              },
              {
                name: 'Monitoring',
                price: '$199',
                period: 'per month',
                desc: 'Ongoing protection as you ship',
                features: ['Everything in Audit', 'Monthly rescans', 'New vulnerability alerts', 'Email notifications', 'Priority support'],
                cta: 'Start monitoring',
                featured: true
              },
              {
                name: 'Cleanup',
                price: '$2,500',
                period: 'one-time',
                desc: 'We fix everything for you',
                features: ['Everything in Monitoring', 'We fix all critical issues', 'Production deployment', 'Clean codebase handoff', '90-day support'],
                cta: 'Get cleaned up',
                featured: false
              }
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 border ${plan.featured ? 'bg-black text-white border-black' : 'bg-white border-gray-200'}`}>
                <div className={`text-sm font-medium mb-1 ${plan.featured ? 'text-gray-400' : 'text-gray-500'}`}>{plan.name}</div>
                <div className="text-4xl font-bold mb-1">{plan.price}</div>
                <div className={`text-sm mb-4 ${plan.featured ? 'text-gray-400' : 'text-gray-500'}`}>{plan.period}</div>
                <p className={`text-sm mb-6 ${plan.featured ? 'text-gray-300' : 'text-gray-600'}`}>{plan.desc}</p>
                <ul className="space-y-2 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className={`text-sm flex items-center gap-2 ${plan.featured ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard/new-scan" className={`block text-center py-3 rounded-xl text-sm font-medium transition-colors ${plan.featured ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-800'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-black text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Stop losing customers to downtime and breaches</h2>
          <p className="text-gray-400 mb-8">Every day your app runs unaudited is a day you're one bug away from losing everything you've built.</p>
          <Link href="/dashboard/new-scan" className="bg-white text-black px-8 py-4 rounded-xl text-lg font-medium hover:bg-gray-100 transition-colors inline-block">
            Audit my app now — $499
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <span className="font-semibold">ShipReady</span>
          <p className="text-sm text-gray-400">© 2026 ShipReady. All rights reserved.</p>
        </div>
      </footer>

    </main>
  )
}