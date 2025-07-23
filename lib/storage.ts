import { 
  User, 
  ClinicLog, 
  Reimbursement, 
  AppSettings, 
  StorageData,
  DashboardStats,
  ActivityItem,
  InventoryMedicine,
  InventorySupply,
  InventoryTransaction,
  Client,
  Issuer,
  HealthCheckRequest
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
  LAST_BACKUP: 'shoreagents_nurse_last_backup',
  INVENTORY_MEDICINES: 'shoreagents_nurse_inventory_medicines',
  INVENTORY_SUPPLIES: 'shoreagents_nurse_inventory_supplies',
  INVENTORY_TRANSACTIONS: 'shoreagents_nurse_inventory_transactions',
  CLIENTS: 'shoreagents_nurse_clients',
  ISSUERS: 'shoreagents_nurse_issuers',
  HEALTH_CHECKS: 'shoreagents_nurse_health_checks'
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
  currency: 'PHP'
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
    // Dispatch custom event for immediate sync
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('authStateChanged'))
    }
  },

  clearCurrentUser(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    // Dispatch custom event for immediate sync
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('authStateChanged'))
    }
  },

  getAllUsers(): User[] {
    if (!isLocalStorageAvailable()) {
      return DEFAULT_USERS
    }
    
    const usersJson = localStorage.getItem(STORAGE_KEYS.USERS)
    const users = safeJsonParse<User[]>(usersJson, DEFAULT_USERS)
    
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
    
    // Don't call setCurrentUser here - let AuthService handle it
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

// Inventory Medicine Storage - API implementation
export const inventoryMedicineStorage = {
  async getAll(): Promise<InventoryMedicine[]> {
    const response = await fetch('/api/inventory/medicines')
    if (!response.ok) throw new Error('Failed to fetch medicines')
    return await response.json()
  },

  async save(medicine: InventoryMedicine): Promise<void> {
    const method = medicine.id ? 'PUT' : 'POST'
    const url = medicine.id ? `/api/inventory/medicines?id=${medicine.id}` : '/api/inventory/medicines'
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medicine)
    })
    
    if (!response.ok) throw new Error('Failed to save medicine')
  },

  async getById(id: string): Promise<InventoryMedicine | null> {
    const response = await fetch(`/api/inventory/medicines?id=${id}`)
    if (response.status === 404) return null
    if (!response.ok) throw new Error('Failed to fetch medicine')
    return await response.json()
  },

  async getByName(name: string): Promise<InventoryMedicine | null> {
    const medicines = await this.getAll()
    return medicines.find(m => m.name === name) || null
  },

  async getActive(): Promise<InventoryMedicine[]> {
    return await this.getAll() // API already filters by is_active = true
  },

  async updateStock(id: string, quantity: number, reason: string, userId: string, userName: string): Promise<void> {
    const medicine = await this.getById(id)
    if (medicine) {
      const newStock = Math.max(0, medicine.stock + quantity)
      await this.save({
        ...medicine,
        stock: newStock,
        updatedAt: new Date()
      })
    }
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/inventory/medicines?id=${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete medicine')
  },

  async search(searchTerm: string): Promise<InventoryMedicine[]> {
    const response = await fetch(`/api/inventory/medicines?search=${encodeURIComponent(searchTerm)}`)
    if (!response.ok) throw new Error('Failed to search medicines')
    return await response.json()
  }
}

// Inventory Supply Storage - API implementation
export const inventorySupplyStorage = {
  async getAll(): Promise<InventorySupply[]> {
    const response = await fetch('/api/inventory/supplies')
    if (!response.ok) throw new Error('Failed to fetch supplies')
    return await response.json()
  },

  async save(supply: InventorySupply): Promise<void> {
    const method = supply.id ? 'PUT' : 'POST'
    const url = supply.id ? `/api/inventory/supplies?id=${supply.id}` : '/api/inventory/supplies'
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supply)
    })
    
    if (!response.ok) throw new Error('Failed to save supply')
  },

  async getById(id: string): Promise<InventorySupply | null> {
    const response = await fetch(`/api/inventory/supplies?id=${id}`)
    if (response.status === 404) return null
    if (!response.ok) throw new Error('Failed to fetch supply')
    return await response.json()
  },

  async getByName(name: string): Promise<InventorySupply | null> {
    const supplies = await this.getAll()
    return supplies.find(s => s.name === name) || null
  },

  async getActive(): Promise<InventorySupply[]> {
    return await this.getAll() // API already filters by is_active = true
  },

  async updateStock(id: string, quantity: number, reason: string, userId: string, userName: string): Promise<void> {
    const supply = await this.getById(id)
    if (supply) {
      const newStock = Math.max(0, supply.stock + quantity)
      await this.save({
        ...supply,
        stock: newStock,
        updatedAt: new Date()
      })
    }
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/inventory/supplies?id=${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete supply')
  },

  async search(searchTerm: string): Promise<InventorySupply[]> {
    const response = await fetch(`/api/inventory/supplies?search=${encodeURIComponent(searchTerm)}`)
    if (!response.ok) throw new Error('Failed to search supplies')
    return await response.json()
  }
}

// Inventory Transaction Storage - API implementation (placeholder)
export const inventoryTransactionStorage = {
  async getAll(): Promise<InventoryTransaction[]> {
    // TODO: Create API route for transactions
    return []
  },

  async add(transaction: Omit<InventoryTransaction, 'id' | 'createdAt'>): Promise<void> {
    // TODO: Create API route for transactions
    console.log('Transaction logged:', transaction)
  },

  async getByItemId(itemId: string): Promise<InventoryTransaction[]> {
    // TODO: Create API route for transactions
    return []
  },

  async getByType(type: InventoryTransaction['type']): Promise<InventoryTransaction[]> {
    // TODO: Create API route for transactions
    return []
  },

  async getRecent(limit: number = 10): Promise<InventoryTransaction[]> {
    // TODO: Create API route for transactions
    return []
  }
} 

// Health Check storage management
export const healthCheckStorage = {
  getAll(): HealthCheckRequest[] {
    const healthChecksJson = localStorage.getItem(STORAGE_KEYS.HEALTH_CHECKS)
    const healthChecks = safeJsonParse<HealthCheckRequest[]>(healthChecksJson, [])
    
    return healthChecks.map(request => ({
      ...request,
      requestDate: new Date(request.requestDate),
      notifiedAt: request.notifiedAt ? new Date(request.notifiedAt) : undefined,
      arrivedAt: request.arrivedAt ? new Date(request.arrivedAt) : undefined,
      completedAt: request.completedAt ? new Date(request.completedAt) : undefined,
      createdAt: new Date(request.createdAt),
      updatedAt: new Date(request.updatedAt)
    }))
  },

  save(request: HealthCheckRequest): void {
    const requests = this.getAll()
    const existingIndex = requests.findIndex(r => r.id === request.id)
    
    if (existingIndex >= 0) {
      requests[existingIndex] = { ...request, updatedAt: new Date() }
    } else {
      requests.push({ ...request, id: generateUUID(), createdAt: new Date(), updatedAt: new Date() })
    }
    
    localStorage.setItem(STORAGE_KEYS.HEALTH_CHECKS, safeJsonStringify(requests))
  },

  delete(id: string): void {
    const requests = this.getAll().filter(request => request.id !== id)
    localStorage.setItem(STORAGE_KEYS.HEALTH_CHECKS, safeJsonStringify(requests))
  },

  getById(id: string): HealthCheckRequest | null {
    const requests = this.getAll()
    return requests.find(request => request.id === id) || null
  },

  getByStatus(status: string): HealthCheckRequest[] {
    return this.getAll().filter(request => request.status === status)
  },

  updateStatus(id: string, status: string, additionalData: any = {}): void {
    const requests = this.getAll()
    const requestIndex = requests.findIndex(r => r.id === id)
    
    if (requestIndex >= 0) {
      requests[requestIndex] = {
        ...requests[requestIndex],
        status: status as any,
        ...additionalData,
        updatedAt: new Date()
      }
      localStorage.setItem(STORAGE_KEYS.HEALTH_CHECKS, safeJsonStringify(requests))
    }
  }
}

// Initialize inventory - no default data, start with empty inventories
export const initializeInventory = () => {
  // No default data initialization - inventories start empty
  // Users can add their own medicines and supplies using the forms
}

// Client storage utility
export const clientStorage = {
  getAll: (): Client[] => {
    if (!isLocalStorageAvailable()) return []
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS)
    return safeJsonParse(data, []).map((client: any) => ({
      ...client,
      createdAt: new Date(client.createdAt),
      updatedAt: new Date(client.updatedAt)
    }))
  },

  getActive: (): Client[] => {
    return clientStorage.getAll().filter(client => client.isActive)
  },

  getById: (id: string): Client | null => {
    const clients = clientStorage.getAll()
    return clients.find(client => client.id === id) || null
  },

  save: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client => {
    const clients = clientStorage.getAll()
    const now = new Date()
    const newClient: Client = {
      ...client,
      id: generateUUID(),
      createdAt: now,
      updatedAt: now
    }
    
    clients.push(newClient)
    if (isLocalStorageAvailable()) {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients))
    }
    
    return newClient
  },

  update: (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>): Client | null => {
    const clients = clientStorage.getAll()
    const clientIndex = clients.findIndex(client => client.id === id)
    
    if (clientIndex === -1) return null
    
    const updatedClient = {
      ...clients[clientIndex],
      ...updates,
      updatedAt: new Date()
    }
    
    clients[clientIndex] = updatedClient
    
    if (isLocalStorageAvailable()) {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients))
    }
    
    return updatedClient
  },

  delete: (id: string): boolean => {
    const clients = clientStorage.getAll()
    const filteredClients = clients.filter(client => client.id !== id)
    
    if (filteredClients.length === clients.length) return false
    
    if (isLocalStorageAvailable()) {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(filteredClients))
    }
    
    return true
  },

  deactivate: (id: string): boolean => {
    return clientStorage.update(id, { isActive: false }) !== null
  }
}

// Issuer storage utility
export const issuerStorage = {
  getAll: (): Issuer[] => {
    if (!isLocalStorageAvailable()) return []
    const data = localStorage.getItem(STORAGE_KEYS.ISSUERS)
    return safeJsonParse(data, []).map((issuer: any) => ({
      ...issuer,
      createdAt: new Date(issuer.createdAt),
      updatedAt: new Date(issuer.updatedAt)
    }))
  },

  getActive: (): Issuer[] => {
    return issuerStorage.getAll().filter(issuer => issuer.isActive)
  },

  getById: (id: string): Issuer | null => {
    const issuers = issuerStorage.getAll()
    return issuers.find(issuer => issuer.id === id) || null
  },

  save: (issuer: Omit<Issuer, 'id' | 'createdAt' | 'updatedAt'>): Issuer => {
    const issuers = issuerStorage.getAll()
    const now = new Date()
    const newIssuer: Issuer = {
      ...issuer,
      id: generateUUID(),
      createdAt: now,
      updatedAt: now
    }
    
    issuers.push(newIssuer)
    if (isLocalStorageAvailable()) {
      localStorage.setItem(STORAGE_KEYS.ISSUERS, JSON.stringify(issuers))
    }
    
    return newIssuer
  },

  update: (id: string, updates: Partial<Omit<Issuer, 'id' | 'createdAt' | 'updatedAt'>>): Issuer | null => {
    const issuers = issuerStorage.getAll()
    const issuerIndex = issuers.findIndex(issuer => issuer.id === id)
    
    if (issuerIndex === -1) return null
    
    const updatedIssuer = {
      ...issuers[issuerIndex],
      ...updates,
      updatedAt: new Date()
    }
    
    issuers[issuerIndex] = updatedIssuer
    
    if (isLocalStorageAvailable()) {
      localStorage.setItem(STORAGE_KEYS.ISSUERS, JSON.stringify(issuers))
    }
    
    return updatedIssuer
  },

  delete: (id: string): boolean => {
    const issuers = issuerStorage.getAll()
    const filteredIssuers = issuers.filter(issuer => issuer.id !== id)
    
    if (filteredIssuers.length === issuers.length) return false
    
    if (isLocalStorageAvailable()) {
      localStorage.setItem(STORAGE_KEYS.ISSUERS, JSON.stringify(issuers))
    }
    
    return true
  },

  deactivate: (id: string): boolean => {
    return issuerStorage.update(id, { isActive: false }) !== null
  }
}

// Initialize storage with default data
export const initializeStorage = () => {
  // Check if localStorage is available
  if (!isLocalStorageAvailable()) {
    console.error('localStorage is not available')
    return
  }

  // Initialize users if not present
  const users = userStorage.getAllUsers()
  if (users.length === 0) {
    userStorage.saveUsers(DEFAULT_USERS)
  }

  // Initialize settings if not present
  const settings = settingsStorage.get()
  if (!settings || Object.keys(settings).length === 0) {
    settingsStorage.save(DEFAULT_SETTINGS)
  }

  // Initialize inventory
  initializeInventory()
  
  // Initialize health checks with sample data if not present
  const healthChecks = localStorage.getItem(STORAGE_KEYS.HEALTH_CHECKS)
  if (!healthChecks) {
    const sampleHealthChecks: HealthCheckRequest[] = [
      {
        id: generateUUID(),
        agentName: 'John Doe',
        client: 'TechCorp Inc.',
        employeeId: 'TC001',
        requestDate: new Date(),
        status: 'pending',
        requestType: 'routine',
        notes: 'Annual health check',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: generateUUID(),
        agentName: 'Jane Smith', 
        client: 'Healthcare Solutions',
        employeeId: 'HS002',
        requestDate: new Date(),
        status: 'notified',
        requestType: 'urgent',
        notes: 'Pre-employment medical exam',
        notifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    
    localStorage.setItem(STORAGE_KEYS.HEALTH_CHECKS, safeJsonStringify(sampleHealthChecks))
  }
} 