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

  const [forceUpdate, setForceUpdate] = useState(0)
  const authService = AuthService.getInstance()

  // Force re-check of authentication state
  const checkAuthState = useCallback(() => {
    console.log('useAuth: Checking authentication state...')
    const user = authService.getCurrentUser()
    const isAuthenticated = authService.isAuthenticated()
    
    console.log('useAuth: Current state check result:', { user, isAuthenticated })
    
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
        console.log('useAuth: localStorage change detected for current_user')
        checkAuthState()
      }
    }

    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom events for same-tab changes
    const handleAuthChange = () => {
      console.log('useAuth: Custom auth change event detected')
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
    console.log('useAuth: Login called with:', credentials)
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const result = await authService.login(credentials)
      console.log('useAuth: Login result:', result)
      
      if (result.success) {
        console.log('useAuth: Login successful, updating state...')
        // Force immediate state update
        checkAuthState()
        // Force a re-render
        setForceUpdate(prev => prev + 1)
        // Dispatch custom event for immediate sync
        window.dispatchEvent(new CustomEvent('authStateChanged'))
        
        // Additional force update after a tiny delay to ensure React catches the change
        setTimeout(() => {
          checkAuthState()
          setForceUpdate(prev => prev + 1)
        }, 10)
      } else {
        console.log('useAuth: Login failed:', result.error)
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: result.error || 'Login failed'
        })
      }
      
      return result
    } catch (error) {
      console.error('useAuth: Login error:', error)
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
    console.log('useAuth: Logout called')
    setAuthState(prev => ({ ...prev, isLoading: true }))
    
    try {
      await authService.logout()
      console.log('useAuth: Logout successful, updating state...')
      // Force immediate state update
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
      // Force a re-render
      setForceUpdate(prev => prev + 1)
      // Dispatch custom event for immediate sync
      window.dispatchEvent(new CustomEvent('authStateChanged'))
      
      // Additional force update after a tiny delay to ensure React catches the change
      setTimeout(() => {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
        setForceUpdate(prev => prev + 1)
      }, 10)
    } catch (error) {
      console.error('useAuth: Logout error:', error)
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
    clearError,
    // Force re-render when needed
    _forceUpdate: forceUpdate
  }
} 