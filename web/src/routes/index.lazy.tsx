import { Link } from '@tanstack/react-router'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@/auth'
import { useNavigate } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate({ to: '/perangkat' })
    }
  }, [auth.isAuthenticated])

  return (
    <div className="relative min-h-screen flex flex-col bg-background overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[160px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[160px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[200px]" />

      <header className="relative z-10 flex items-center justify-between px-6 sm:px-12 py-6">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-primary font-bold text-2xl tracking-wider">MPM</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/login" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
            Sign In
          </Link>
          <Link
            to="/login"
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.25)]"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-3xl animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium tracking-wide uppercase">
            Monitoring Dashboard
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight">
            Power Meter
            <br />
            <span className="text-primary">Monitoring</span> Platform
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Real-time monitoring and management system for power meters across your campus.
            Track consumption, analyze trends, and optimize energy usage.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all shadow-[0_0_25px_rgba(59,130,246,0.3)] hover:shadow-[0_0_35px_rgba(59,130,246,0.45)]"
            >
              Enter Dashboard
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 bg-card/40 backdrop-blur-xl border border-border hover:border-primary/30 text-foreground font-medium rounded-xl transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl w-full animate-slide-up">
          {[
            { label: 'Real-time Data', desc: 'Live power meter readings and status monitoring' },
            { label: 'Usage Analytics', desc: 'Track consumption patterns and historical trends' },
            { label: 'Alert System', desc: 'Automated notifications for anomalies and events' },
          ].map((feature) => (
            <div
              key={feature.label}
              className="p-5 rounded-2xl bg-card/30 backdrop-blur-xl border border-border hover:border-primary/20 transition-all text-left"
            >
              <h3 className="text-foreground font-semibold text-sm mb-1.5">{feature.label}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 py-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} MPM. All rights reserved.
      </footer>
    </div>
  )
}