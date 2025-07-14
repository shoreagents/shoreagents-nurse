import { 
  User, 
  ClinicLog, 
  Reimbursement, 
  AppSettings, 
  StorageData,
  DashboardStats,
  ActivityItem 
} from './types'

// Storage keys
const STORAGE_KEYS = {
  CURRENT_USER: 'shoreagents_nurse_current_user',
  CLINIC_LOGS: 'shoreagents_nurse_clinic_logs',
  REIMBURSEMENTS: 'shoreagents_nurse_reimbursements',
  USERS: 'shoreagents_nurse_users',
  SETTINGS: 'shoreagents_nurse_settings',
  FORM_DRAFTS: 'shoreagents_nurse_form_drafts',
  ACTIVITY_LOG: 'shoreagents_nurse_activity_log',
  LAST_BACKUP: 'shoreagents_nurse_last_backup'
} as const

// Helper function to safely parse JSON
function safeJsonParse<T>(value: string | null, defaultValue: T): T {
  if (!value) return defaultValue
  
  try {
    const parsed = JSON.parse(value)
    return parsed !== null ? parsed : defaultValue
  } catch (error) {
    console.warn('Failed to parse JSON from localStorage:', error)
    return defaultValue
  }
}

// Check if localStorage is available
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    console.error('localStorage is not available:', e)
    return false
  }
}

// Helper function to safely stringify JSON
function safeJsonStringify(value: any): string {
  try {
    return JSON.stringify(value)
  } catch (error) {
    console.warn('Failed to stringify JSON for localStorage:', error)
    return '{}'
  }
}

// Helper function to generate UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Default users for mock authentication
const DEFAULT_USERS: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@shoreagents.com',
    role: 'nurse',
    nurseId: 'N001',
    department: 'Emergency',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike.chen@shoreagents.com',
    role: 'nurse',
    nurseId: 'N002',
    department: 'ICU',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@shoreagents.com',
    role: 'admin',
    department: 'Administration',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'en',
  notifications: true,
  autoSave: true,
  itemsPerPage: 10,
  dateFormat: 'MM/dd/yyyy',
  currency: 'USD'
}

// User management
export const userStorage = {
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    if (!userJson) return null
    
    const user = safeJsonParse<User | null>(userJson, null)
    if (user && user.createdAt) {
      user.createdAt = new Date(user.createdAt)
      user.updatedAt = new Date(user.updatedAt)
    }
    return user
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, safeJsonStringify(user))
  },

  clearCurrentUser(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  },

  getAllUsers(): User[] {
    console.log('Getting all users...')
    
    if (!isLocalStorageAvailable()) {
      console.error('localStorage is not available, returning default users')
      return DEFAULT_USERS
    }
    
    const usersJson = localStorage.getItem(STORAGE_KEYS.USERS)
    console.log('Users JSON from localStorage:', usersJson)
    const users = safeJsonParse<User[]>(usersJson, DEFAULT_USERS)
    console.log('Parsed users:', users)
    
    return users.map(user => ({
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt)
    }))
  },

  saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, safeJsonStringify(users))
  },

  authenticateUser(email: string, password: string): User | null {
    console.log('Attempting authentication for:', email)
    
    // Super simple authentication - any email/password works
    // Just determine role based on email content
    let role: 'nurse' | 'admin' = 'nurse'
    let name = 'Demo User'
    
    if (email.toLowerCase().includes('admin')) {
      role = 'admin'
      name = 'Admin User'
    } else if (email.toLowerCase().includes('nurse') || email.toLowerCase().includes('sarah')) {
      role = 'nurse'
      name = 'Nurse User'
    }
    
    // Create a mock user on the fly
    const mockUser: User = {
      id: role === 'admin' ? '99' : '98',
      name,
      email,
      role,
      nurseId: role === 'nurse' ? 'N999' : undefined,
      department: role === 'nurse' ? 'Demo Department' : undefined,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    console.log('Authentication successful for:', mockUser)
    this.setCurrentUser(mockUser)
    return mockUser
  }
}

// Clinic logs management
export const clinicLogStorage = {
  getAll(): ClinicLog[] {
    const logsJson = localStorage.getItem(STORAGE_KEYS.CLINIC_LOGS)
    const logs = safeJsonParse<ClinicLog[]>(logsJson, [])
    
    return logs.map(log => ({
      ...log,
      date: new Date(log.date),
      createdAt: new Date(log.createdAt),
      updatedAt: new Date(log.updatedAt)
    }))
  },

  save(log: ClinicLog): void {
    const logs = this.getAll()
    const existingIndex = logs.findIndex(l => l.id === log.id)
    
    if (existingIndex >= 0) {
      logs[existingIndex] = { ...log, updatedAt: new Date() }
    } else {
      logs.push({ ...log, id: generateUUID(), createdAt: new Date(), updatedAt: new Date() })
    }
    
    localStorage.setItem(STORAGE_KEYS.CLINIC_LOGS, safeJsonStringify(logs))
  },

  delete(id: string): void {
    const logs = this.getAll().filter(log => log.id !== id)
    localStorage.setItem(STORAGE_KEYS.CLINIC_LOGS, safeJsonStringify(logs))
  },

  getById(id: string): ClinicLog | null {
    const logs = this.getAll()
    return logs.find(log => log.id === id) || null
  },

  getByNurseId(nurseId: string): ClinicLog[] {
    return this.getAll().filter(log => log.nurseId === nurseId)
  },

  search(searchTerm: string): ClinicLog[] {
    const logs = this.getAll()
    const term = searchTerm.toLowerCase()
    
    return logs.filter(log => {
      const medicineNames = log.medicines.map(m => m.name.toLowerCase()).join(' ')
      const supplyNames = log.supplies.map(s => s.name.toLowerCase()).join(' ')
      
      return (
        log.firstName.toLowerCase().includes(term) ||
        log.lastName.toLowerCase().includes(term) ||
        medicineNames.includes(term) ||
        supplyNames.includes(term) ||
        log.chiefComplaint.toLowerCase().includes(term) ||
        log.employeeNumber.toLowerCase().includes(term) ||
        log.client.toLowerCase().includes(term)
      )
    })
  }
}

// Reimbursements management
export const reimbursementStorage = {
  getAll(): Reimbursement[] {
    const reimbursementsJson = localStorage.getItem(STORAGE_KEYS.REIMBURSEMENTS)
    const reimbursements = safeJsonParse<Reimbursement[]>(reimbursementsJson, [])
    
    return reimbursements
  },

  save(reimbursement: Reimbursement): void {
    const reimbursements = this.getAll()
    const existingIndex = reimbursements.findIndex(r => r.id === reimbursement.id)
    
    if (existingIndex >= 0) {
      reimbursements[existingIndex] = { ...reimbursement, updatedAt: new Date().toISOString() }
    } else {
      reimbursements.push({ 
        ...reimbursement, 
        id: generateUUID(), 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      })
    }
    
    localStorage.setItem(STORAGE_KEYS.REIMBURSEMENTS, safeJsonStringify(reimbursements))
  },

  delete(id: string): void {
    const reimbursements = this.getAll()
    const filtered = reimbursements.filter(r => r.id !== id)
    localStorage.setItem(STORAGE_KEYS.REIMBURSEMENTS, safeJsonStringify(filtered))
  },

  getById(id: string): Reimbursement | null {
    const reimbursements = this.getAll()
    return reimbursements.find(r => r.id === id) || null
  },

  getByStatus(status: string): Reimbursement[] {
    return this.getAll().filter(r => r.status === status)
  },

  getBySubmittedUser(userId: string): Reimbursement[] {
    return this.getAll().filter(r => r.employeeId === userId)
  },

  search(searchTerm: string): Reimbursement[] {
    const reimbursements = this.getAll()
    const term = searchTerm.toLowerCase()
    
    return reimbursements.filter(reimbursement => 
      reimbursement.fullNameEmployee.toLowerCase().includes(term) ||
      reimbursement.employeeId.toLowerCase().includes(term) ||
      reimbursement.email.toLowerCase().includes(term) ||
      (reimbursement.fullNameDependent && reimbursement.fullNameDependent.toLowerCase().includes(term))
    )
  }
}

// Settings management
export const settingsStorage = {
  get(): AppSettings {
    const settingsJson = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    return safeJsonParse<AppSettings>(settingsJson, DEFAULT_SETTINGS)
  },

  save(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, safeJsonStringify(settings))
  },

  reset(): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, safeJsonStringify(DEFAULT_SETTINGS))
  }
}

// Form drafts management
export const formDraftStorage = {
  saveDraft(formType: string, data: any): void {
    const drafts = this.getAllDrafts()
    drafts[formType] = {
      data,
      timestamp: new Date().toISOString(),
      id: generateUUID()
    }
    localStorage.setItem(STORAGE_KEYS.FORM_DRAFTS, safeJsonStringify(drafts))
  },

  getDraft(formType: string): any | null {
    const drafts = this.getAllDrafts()
    return drafts[formType]?.data || null
  },

  clearDraft(formType: string): void {
    const drafts = this.getAllDrafts()
    delete drafts[formType]
    localStorage.setItem(STORAGE_KEYS.FORM_DRAFTS, safeJsonStringify(drafts))
  },

  getAllDrafts(): Record<string, any> {
    const draftsJson = localStorage.getItem(STORAGE_KEYS.FORM_DRAFTS)
    return safeJsonParse<Record<string, any>>(draftsJson, {})
  },

  clearAllDrafts(): void {
    localStorage.removeItem(STORAGE_KEYS.FORM_DRAFTS)
  }
}

// Activity log management
export const activityStorage = {
  getAll(): ActivityItem[] {
    const activityJson = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG)
    const activities = safeJsonParse<ActivityItem[]>(activityJson, [])
    
    return activities.map(activity => ({
      ...activity,
      timestamp: new Date(activity.timestamp)
    }))
  },

  add(activity: Omit<ActivityItem, 'id' | 'timestamp'>): void {
    const activities = this.getAll()
    const newActivity: ActivityItem = {
      ...activity,
      id: generateUUID(),
      timestamp: new Date()
    }
    
    activities.unshift(newActivity)
    
    // Keep only last 100 activities
    if (activities.length > 100) {
      activities.splice(100)
    }
    
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, safeJsonStringify(activities))
  },

  getRecent(limit: number = 10): ActivityItem[] {
    return this.getAll().slice(0, limit)
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.ACTIVITY_LOG)
  }
}

// Dashboard statistics
export const dashboardStorage = {
  getStats(): DashboardStats {
    const clinicLogs = clinicLogStorage.getAll()
    const reimbursements = reimbursementStorage.getAll()
    const recentActivity = activityStorage.getRecent(5)
    
    const totalMedicineValue = clinicLogs.reduce((sum, log) => {
      const medicineTotal = log.medicines.reduce((medSum, medicine) => medSum + (medicine.quantity || 0), 0)
      const supplyTotal = log.supplies.reduce((supSum, supply) => supSum + (supply.quantity || 0), 0)
      return sum + medicineTotal + supplyTotal
    }, 0)
    const totalReimbursementAmount = reimbursements.reduce((sum, reimbursement) => sum + reimbursement.amountRequested, 0)
    const pendingReimbursements = reimbursements.filter(r => r.status === 'pending').length
    const approvedReimbursements = reimbursements.filter(r => r.status === 'approved').length
    
    return {
      totalClinicLogs: clinicLogs.length,
      totalReimbursements: reimbursements.length,
      pendingReimbursements,
      approvedReimbursements,
      totalMedicineValue,
      totalReimbursementAmount,
      recentActivity
    }
  }
}

// Backup and restore
export const backupStorage = {
  exportData(): StorageData {
    return {
      clinicLogs: clinicLogStorage.getAll(),
      reimbursements: reimbursementStorage.getAll(),
      users: userStorage.getAllUsers(),
      currentUser: userStorage.getCurrentUser(),
      settings: settingsStorage.get()
    }
  },

  importData(data: StorageData): void {
    if (data.clinicLogs) {
      localStorage.setItem(STORAGE_KEYS.CLINIC_LOGS, safeJsonStringify(data.clinicLogs))
    }
    if (data.reimbursements) {
      localStorage.setItem(STORAGE_KEYS.REIMBURSEMENTS, safeJsonStringify(data.reimbursements))
    }
    if (data.users) {
      localStorage.setItem(STORAGE_KEYS.USERS, safeJsonStringify(data.users))
    }
    if (data.currentUser) {
      userStorage.setCurrentUser(data.currentUser)
    }
    if (data.settings) {
      settingsStorage.save(data.settings)
    }
  },

  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  },

  getLastBackupDate(): Date | null {
    const dateStr = localStorage.getItem(STORAGE_KEYS.LAST_BACKUP)
    return dateStr ? new Date(dateStr) : null
  },

  setLastBackupDate(date: Date): void {
    localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, date.toISOString())
  }
}

// Initialize default data if not exists
export function initializeStorage(): void {
  console.log('Initializing storage...')
  
  if (!isLocalStorageAvailable()) {
    console.error('localStorage is not available during initialization')
    return
  }
  
  // Initialize users if not exists
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    console.log('Initializing default users')
    userStorage.saveUsers(DEFAULT_USERS)
  } else {
    console.log('Users already exist in localStorage')
  }

  // Initialize settings if not exists
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    console.log('Initializing default settings')
    settingsStorage.save(DEFAULT_SETTINGS)
  }

  // Initialize empty arrays for other data if not exists
  if (!localStorage.getItem(STORAGE_KEYS.CLINIC_LOGS)) {
    console.log('Initializing empty clinic logs')
    localStorage.setItem(STORAGE_KEYS.CLINIC_LOGS, '[]')
  }

  if (!localStorage.getItem(STORAGE_KEYS.REIMBURSEMENTS)) {
    console.log('Initializing empty reimbursements')
    localStorage.setItem(STORAGE_KEYS.REIMBURSEMENTS, '[]')
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG)) {
    console.log('Initializing empty activity log')
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, '[]')
  }
  
  console.log('Storage initialization complete')
}

// Storage utilities
export const storageUtils = {
  getStorageSize(): number {
    let total = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length
      }
    }
    return total
  },

  formatStorageSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (e) {
      return false
    }
  }
} 