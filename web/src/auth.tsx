import * as React from 'react'
import { useMutation, useQuery } from 'react-query'
import { doLogin, getProfile, UserProfile } from './api/users'
import { Login } from './api/users'
import { Api } from './api/internal'
import { AxiosError } from 'axios'

export interface AuthContext {
    isAuthenticated: boolean
    login: (data: Login) => Promise<void>
    logout: () => Promise<void>
    token: string | null
}

export interface Token<T> {
    token: string | null,
    data: T
}

interface LoginError {
    response: {
        data: {
            detail: any
        }
    }
}

interface LoginSuccess {
    data: {
        access_token: string,
        token_type: string
    }
}

const AuthContext = React.createContext<AuthContext | null>(null)

const key = 'auth.token'

function getStoredToken() {
    return localStorage.getItem(key)
}

function setStoredToken(token: string | null) {
    if (token) {
        localStorage.setItem(key, token)
    } else {
        localStorage.removeItem(key)
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = React.useState<string | null>(getStoredToken())
    let isAuthenticated = !!token
    if (isAuthenticated) {
        const { isError } = useQuery<Api<UserProfile>, AxiosError>({
            queryKey: ['user.profile', token],
            queryFn: getProfile,
            retry: 0
        }) 
        if (isError) isAuthenticated = false
    }
    const mutation = useMutation({
        mutationFn: doLogin,
    })

    const logout = React.useCallback(async () => {
        setStoredToken(null)
        setToken(null)
    }, [])

    const login = React.useCallback(async ({username, password}: Login) => {

        mutation.mutate({
            username: username,
            password: password
        } as Login,
        {
            onSuccess: (res: LoginSuccess) => {
                setStoredToken(res.data.access_token)
                setToken(res.data.access_token)
            },
            onError: (error) => {
                const err = error as LoginError
                console.error(err.response.data.detail)
            }
        })        
    }, [])

    React.useEffect(() => {
        setToken(getStoredToken())
    }, [])

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = React.useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    return context
}