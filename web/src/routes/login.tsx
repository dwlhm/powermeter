import * as React from 'react'
import {
  createFileRoute,
  redirect,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import { z } from 'zod'

import { AuthContext, useAuth } from '../auth'
import { sleep } from '../utils'

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
      console.error('Error logging in: ', error)
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
    <div className="p-2 grid gap-2 place-items-center w-screen h-screen flex items-center justify-center">
      <div>
        <h3 className="text-2xl font-bold">Login page</h3>
        {search.redirect ? (
          <p className="text-red-500">You need to login to access this page.</p>
        ) : (
          <p>Wellcome.</p>
        )}
        <form className="mt-8 max-w-lg" onSubmit={onFormSubmit}>
          <fieldset disabled={isLoggingIn} className="w-full grid gap-2">
            <div className="grid gap-2 items-center min-w-[300px]">
              <label htmlFor="username-input" className="text-sm font-medium">
                Username
              </label>
              <input
                id="username-input"
                name="username"
                placeholder="Enter your name"
                type="text"
                className="border border-gray-300 rounded-md p-2 w-full"
                required
              />
            </div>
            <div className="grid gap-2 items-center min-w-[300px]">
              <label htmlFor="password-input" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password-input"
                name="password"
                placeholder="Enter your password"
                type="password"
                className="border border-gray-300 rounded-md p-2 w-full"
                required
              />
            </div>
            <button
              type="submit"
              className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md w-full disabled:bg-gray-300 disabled:text-gray-500"
            >
              {isLoggingIn ? 'Loading...' : 'Login'}
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  )
}