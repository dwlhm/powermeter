import * as React from 'react'
import {
  createFileRoute,
  redirect,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import { z } from 'zod'

import { AuthContext, useAuth } from '../auth'

const fallback = '/perangkat' as const

export const Route = createFileRoute('/login')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: async ({ context, search }) => {
    const ctx: AuthContext = context.auth as AuthContext
    if (ctx.isAuthenticated) {
      throw redirect({ to: search.redirect || fallback})
    }
  },
  component: LoginComponent
})

function LoginComponent() {
  const auth = useAuth()
  const router = useRouter()
  const isLoading = useRouterState({ select: (s) => s.isLoading })
  const navigate = Route.useNavigate()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const search = Route.useSearch()

  const onFormSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true)
    try {
      evt.preventDefault()
      const data = new FormData(evt.currentTarget)
      const username_value = data.get('username')
      const password_value = data.get('password')

      if (!username_value || !password_value) return
      const username = username_value.toString()
      const password = password_value.toString()
      await auth.login({ username: username, password: password})
      
    } catch (error) {
    } finally {
      setIsSubmitting(false)
    }
  }

  React.useEffect(() => {
    if (auth.isAuthenticated) {
      router.invalidate()
      
      navigate({ to: search.redirect || fallback })
    }
  }, [auth.isAuthenticated])

  const isLoggingIn = isLoading || isSubmitting

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/30 rounded-full blur-[128px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

      <div className="relative z-10 w-full max-w-md p-8 bg-card/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 text-primary mb-4 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h3>
          {search.redirect ? (
            <p className="text-destructive mt-2 text-sm">Please sign in to access that page.</p>
          ) : (
            <p className="text-muted-foreground mt-2 text-sm">Sign in to your monitoring dashboard</p>
          )}
        </div>

        <form onSubmit={onFormSubmit} className="space-y-6">
          <fieldset disabled={isLoggingIn} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username-input" className="text-sm font-medium text-foreground">
                Username
              </label>
              <input
                id="username-input"
                name="username"
                placeholder="admin"
                type="text"
                className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password-input" className="text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password-input"
                name="password"
                placeholder="••••••••"
                type="password"
                className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all placeholder:text-muted-foreground"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(59,130,246,0.3)] mt-6 flex justify-center items-center"
            >
              {isLoggingIn ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Sign In'}
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  )
}