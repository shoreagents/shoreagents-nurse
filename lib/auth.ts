import { User, AuthState, LoginCredentials } from './types'
import { userStorage } from './storage'
import { validateLogin } from './validations'

// Mock authentication service
export class AuthService {
  private static instance: AuthService | null = null
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  public async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    // Basic validation
    if (!credentials.email || !credentials.password) {
      return { success: false, error: 'Email and password are required' }
    }

    try {
      // Mock authentication - always succeed for demo
      const user = userStorage.authenticateUser(credentials.email, credentials.password)
      
      if (user) {
        this.authState = {
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        }
        
        // Force immediate sync with storage and trigger events
        userStorage.setCurrentUser(user)
        
        return { success: true }
      } else {
        return { success: false, error: 'Authentication failed' }
      }
    } catch (error) {
      return { success: false, error: 'Authentication error occurred' }
    }
  }

  public async logout(): Promise<void> {
    userStorage.clearCurrentUser()
    this.authState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    }
  }

  public getCurrentUser(): User | null {
    return userStorage.getCurrentUser()
  }

  public isAuthenticated(): boolean {
    return userStorage.getCurrentUser() !== null
  }
}

// User permission utilities
export const permissions = {
  canViewClinicLogs: (user: User | null): boolean => {
    if (!user) return false
    return user.role === 'nurse' || user.role === 'admin'
  },

  canCreateClinicLog: (user: User | null): boolean => {
    if (!user) return false
    return user.role === 'nurse' || user.role === 'admin'
  },

  canEditClinicLog: (user: User | null, clinicLog: { nurseId: string }): boolean => {
    if (!user) return false
    if (user.role === 'admin') return true
    return user.role === 'nurse' && user.id === clinicLog.nurseId
  },

  canDeleteClinicLog: (user: User | null, clinicLog: { nurseId: string }): boolean => {
    if (!user) return false
    if (user.role === 'admin') return true
    return user.role === 'nurse' && user.id === clinicLog.nurseId
  },

  canViewReimbursements: (user: User | null): boolean => {
    if (!user) return false
    return user.role === 'nurse' || user.role === 'admin' || user.role === 'staff'
  },

  canCreateReimbursement: (user: User | null): boolean => {
    if (!user) return false
    return user.role === 'nurse' || user.role === 'admin' || user.role === 'staff'
  },

  canEditReimbursement: (user: User | null, reimbursement: { submittedBy: string }): boolean => {
    if (!user) return false
    if (user.role === 'admin') return true
    return user.id === reimbursement.submittedBy
  },

  canApproveReimbursement: (user: User | null): boolean => {
    if (!user) return false
    return user.role === 'admin'
  },

  canDeleteReimbursement: (user: User | null, reimbursement: { submittedBy: string }): boolean => {
    if (!user) return false
    if (user.role === 'admin') return true
    return user.id === reimbursement.submittedBy
  },

  canViewDashboard: (user: User | null): boolean => {
    if (!user) return false
    return user.role === 'nurse' || user.role === 'admin'
  },

  canManageUsers: (user: User | null): boolean => {
    if (!user) return false
    return user.role === 'admin'
  },

  canExportData: (user: User | null): boolean => {
    if (!user) return false
    return user.role === 'admin'
  },

  canViewSettings: (user: User | null): boolean => {
    if (!user) return false
    return true // All authenticated users can view settings
  },

  canViewInventory: (user: User | null): boolean => {
    if (!user) return false
    return user.role === 'nurse' || user.role === 'admin'
  },

  canManageInventory: (user: User | null): boolean => {
    if (!user) return false
    return user.role === 'nurse' || user.role === 'admin'
  },

  canAddInventoryItems: (user: User | null): boolean => {
    if (!user) return false
    return user.role === 'nurse' || user.role === 'admin'
  },

  canEditInventoryItems: (user: User | null): boolean => {
    if (!user) return false
    return user.role === 'nurse' || user.role === 'admin'
  },

  canDeleteInventoryItems: (user: User | null): boolean => {
    if (!user) return false
    return user.role === 'admin'
  }
} 