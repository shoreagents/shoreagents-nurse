import { useState, useEffect } from 'react'
import { User, AuthState, LoginCredentials } from '@/lib/types'
import { AuthService } from '@/lib/auth'

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  })

  const authService = AuthService.getInstance()

  useEffect(() => {
    // Check if user is already authenticated
    const user = authService.getCurrentUser()
    const isAuthenticated = authService.isAuthenticated()
    
    setAuthState({
      user,
      isAuthenticated,
      isLoading: false,
      error: null
    })
  }, [authService])

  const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const result = await authService.login(credentials)
      
      if (result.success) {
        const user = authService.getCurrentUser()
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: result.error || 'Login failed'
        })
      }
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      })
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    
    try {
      await authService.logout()
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error('Logout error:', error)
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
    }
  }

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }))
  }

  return {
    ...authState,
    login,
    logout,
    clearError
  }
} 