import { useState, useEffect, useCallback } from 'react'
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

  // Force re-check of authentication state
  const checkAuthState = useCallback(() => {
    const user = authService.getCurrentUser()
    const isAuthenticated = authService.isAuthenticated()
    
    setAuthState({
      user,
      isAuthenticated,
      isLoading: false,
      error: null
    })
  }, [authService])

  // Listen for localStorage changes to sync auth state
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'shoreagents_nurse_current_user') {
        checkAuthState()
      }
    }

    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom events for same-tab changes
    const handleAuthChange = () => {
      checkAuthState()
    }
    
    window.addEventListener('authStateChanged', handleAuthChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authStateChanged', handleAuthChange)
    }
  }, [checkAuthState])

  useEffect(() => {
    // Initial check
    checkAuthState()
  }, [checkAuthState])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const result = await authService.login(credentials)
      
      if (result.success) {
        // Single state update - let React handle re-renders naturally
        checkAuthState()
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('authStateChanged'))
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
  }, [authService, checkAuthState])

  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    
    try {
      await authService.logout()
      // Single state update
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('authStateChanged'))
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
      // Still dispatch event on error
      window.dispatchEvent(new CustomEvent('authStateChanged'))
    }
  }, [authService])

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