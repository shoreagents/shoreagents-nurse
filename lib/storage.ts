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
  Issuer
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
  ISSUERS: 'shoreagents_nurse_issuers'
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

// Inventory Medicine Storage
export const inventoryMedicineStorage = {
  getAll(): InventoryMedicine[] {
    const medicinesJson = localStorage.getItem(STORAGE_KEYS.INVENTORY_MEDICINES)
    const medicines = safeJsonParse<InventoryMedicine[]>(medicinesJson, [])
    
    return medicines.map(medicine => ({
      ...medicine,
      createdAt: new Date(medicine.createdAt),
      updatedAt: new Date(medicine.updatedAt),
      expiryDate: medicine.expiryDate ? new Date(medicine.expiryDate) : undefined
    }))
  },

  save(medicine: InventoryMedicine): void {
    const medicines = this.getAll()
    const existingIndex = medicines.findIndex(m => m.id === medicine.id)
    
    if (existingIndex >= 0) {
      medicines[existingIndex] = { ...medicine, updatedAt: new Date() }
    } else {
      medicines.push({ ...medicine, id: generateUUID(), createdAt: new Date(), updatedAt: new Date() })
    }
    
    localStorage.setItem(STORAGE_KEYS.INVENTORY_MEDICINES, safeJsonStringify(medicines))
  },

  getById(id: string): InventoryMedicine | null {
    const medicines = this.getAll()
    return medicines.find(m => m.id === id) || null
  },

  getByName(name: string): InventoryMedicine | null {
    const medicines = this.getAll()
    return medicines.find(m => m.name === name) || null
  },

  getActive(): InventoryMedicine[] {
    return this.getAll().filter(m => m.isActive)
  },

  updateStock(id: string, quantity: number, reason: string, userId: string, userName: string): void {
    const medicines = this.getAll()
    const medicineIndex = medicines.findIndex(m => m.id === id)
    
    if (medicineIndex >= 0) {
      const medicine = medicines[medicineIndex]
      const previousStock = medicine.stock
      medicine.stock = Math.max(0, medicine.stock + quantity)
      medicine.updatedAt = new Date()
      medicines[medicineIndex] = medicine
      
      localStorage.setItem(STORAGE_KEYS.INVENTORY_MEDICINES, safeJsonStringify(medicines))
      
      // Record transaction
      inventoryTransactionStorage.add({
        type: quantity > 0 ? 'stock_in' : 'stock_out',
        itemType: 'medicine',
        itemId: id,
        itemName: medicine.displayName,
        quantity: Math.abs(quantity),
        previousStock,
        newStock: medicine.stock,
        reason,
        userId,
        userName
      })
    }
  },

  delete(id: string): void {
    const medicines = this.getAll().filter(m => m.id !== id)
    localStorage.setItem(STORAGE_KEYS.INVENTORY_MEDICINES, safeJsonStringify(medicines))
  },

  search(searchTerm: string): InventoryMedicine[] {
    const medicines = this.getAll()
    const term = searchTerm.toLowerCase()
    
    return medicines.filter(m => 
      m.name.toLowerCase().includes(term) ||
      m.displayName.toLowerCase().includes(term) ||
      m.category.toLowerCase().includes(term) ||
      (m.description && m.description.toLowerCase().includes(term))
    )
  }
}

// Inventory Supply Storage
export const inventorySupplyStorage = {
  getAll(): InventorySupply[] {
    const suppliesJson = localStorage.getItem(STORAGE_KEYS.INVENTORY_SUPPLIES)
    const supplies = safeJsonParse<InventorySupply[]>(suppliesJson, [])
    
    return supplies.map(supply => ({
      ...supply,
      createdAt: new Date(supply.createdAt),
      updatedAt: new Date(supply.updatedAt),
      expiryDate: supply.expiryDate ? new Date(supply.expiryDate) : undefined
    }))
  },

  save(supply: InventorySupply): void {
    const supplies = this.getAll()
    const existingIndex = supplies.findIndex(s => s.id === supply.id)
    
    if (existingIndex >= 0) {
      supplies[existingIndex] = { ...supply, updatedAt: new Date() }
    } else {
      supplies.push({ ...supply, id: generateUUID(), createdAt: new Date(), updatedAt: new Date() })
    }
    
    localStorage.setItem(STORAGE_KEYS.INVENTORY_SUPPLIES, safeJsonStringify(supplies))
  },

  getById(id: string): InventorySupply | null {
    const supplies = this.getAll()
    return supplies.find(s => s.id === id) || null
  },

  getByName(name: string): InventorySupply | null {
    const supplies = this.getAll()
    return supplies.find(s => s.name === name) || null
  },

  getActive(): InventorySupply[] {
    return this.getAll().filter(s => s.isActive)
  },

  updateStock(id: string, quantity: number, reason: string, userId: string, userName: string): void {
    const supplies = this.getAll()
    const supplyIndex = supplies.findIndex(s => s.id === id)
    
    if (supplyIndex >= 0) {
      const supply = supplies[supplyIndex]
      const previousStock = supply.stock
      supply.stock = Math.max(0, supply.stock + quantity)
      supply.updatedAt = new Date()
      supplies[supplyIndex] = supply
      
      localStorage.setItem(STORAGE_KEYS.INVENTORY_SUPPLIES, safeJsonStringify(supplies))
      
      // Record transaction
      inventoryTransactionStorage.add({
        type: quantity > 0 ? 'stock_in' : 'stock_out',
        itemType: 'supply',
        itemId: id,
        itemName: supply.displayName,
        quantity: Math.abs(quantity),
        previousStock,
        newStock: supply.stock,
        reason,
        userId,
        userName
      })
    }
  },

  delete(id: string): void {
    const supplies = this.getAll().filter(s => s.id !== id)
    localStorage.setItem(STORAGE_KEYS.INVENTORY_SUPPLIES, safeJsonStringify(supplies))
  },

  search(searchTerm: string): InventorySupply[] {
    const supplies = this.getAll()
    const term = searchTerm.toLowerCase()
    
    return supplies.filter(s => 
      s.name.toLowerCase().includes(term) ||
      s.displayName.toLowerCase().includes(term) ||
      s.category.toLowerCase().includes(term) ||
      (s.description && s.description.toLowerCase().includes(term))
    )
  }
}

// Inventory Transaction Storage
export const inventoryTransactionStorage = {
  getAll(): InventoryTransaction[] {
    const transactionsJson = localStorage.getItem(STORAGE_KEYS.INVENTORY_TRANSACTIONS)
    const transactions = safeJsonParse<InventoryTransaction[]>(transactionsJson, [])
    
    return transactions.map(transaction => ({
      ...transaction,
      createdAt: new Date(transaction.createdAt)
    }))
  },

  add(transaction: Omit<InventoryTransaction, 'id' | 'createdAt'>): void {
    const transactions = this.getAll()
    const newTransaction = {
      ...transaction,
      id: generateUUID(),
      createdAt: new Date()
    }
    
    transactions.push(newTransaction)
    localStorage.setItem(STORAGE_KEYS.INVENTORY_TRANSACTIONS, safeJsonStringify(transactions))
  },

  getByItemId(itemId: string): InventoryTransaction[] {
    return this.getAll().filter(t => t.itemId === itemId)
  },

  getByType(type: InventoryTransaction['type']): InventoryTransaction[] {
    return this.getAll().filter(t => t.type === type)
  },

  getRecent(limit: number = 10): InventoryTransaction[] {
    const transactions = this.getAll()
    return transactions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
  }
} 

// Initialize default inventory data
export const initializeInventory = () => {
  const medicines = inventoryMedicineStorage.getAll()
  const supplies = inventorySupplyStorage.getAll()
  
  // If inventory is empty, populate with default data
  if (medicines.length === 0) {
    const defaultMedicines = [
      { name: 'acetylcysteine_600mg', displayName: 'ACETYLCYSTEINE (600mg/SACHET) - FLUCYSTEINE 600', category: 'Respiratory', unit: 'sachets', stock: 100, reorderLevel: 20 },
      { name: 'advil', displayName: 'ADVIL', category: 'Analgesics', unit: 'tablets', stock: 200, reorderLevel: 50 },
      { name: 'ambroxol_hcl_30mg', displayName: 'AMBROXOL HCL 30mg - MUCOSOLVAN', category: 'Respiratory', unit: 'tablets', stock: 150, reorderLevel: 30 },
      { name: 'amlodipine_10mg', displayName: 'AMLODIPINE 10mg - RITEMED', category: 'Cardiovascular', unit: 'tablets', stock: 180, reorderLevel: 40 },
      { name: 'bactidol_lozenges', displayName: 'BACTIDOL LOZENGES', category: 'Respiratory', unit: 'pieces', stock: 120, reorderLevel: 25 },
      { name: 'betahistine_16mg', displayName: 'BETAHISTINE 16mg - SERC', category: 'Other', unit: 'tablets', stock: 90, reorderLevel: 15 },
      { name: 'bioflu', displayName: 'BIOFLU', category: 'Respiratory', unit: 'capsules', stock: 140, reorderLevel: 30 },
      { name: 'biogesic', displayName: 'BIOGESIC', category: 'Analgesics', unit: 'tablets', stock: 250, reorderLevel: 60 },
      { name: 'buscopan_10mg', displayName: 'BUSCOPAN 10mg', category: 'Antispasmodics', unit: 'tablets', stock: 80, reorderLevel: 20 },
      { name: 'butamirate_citrate_50mg', displayName: 'BUTAMIRATE CITRATE 50mg - SINECOD FORTE', category: 'Respiratory', unit: 'tablets', stock: 70, reorderLevel: 15 },
      { name: 'catapres_75mcg', displayName: 'CATAPRES 75mcg', category: 'Cardiovascular', unit: 'tablets', stock: 60, reorderLevel: 10 },
      { name: 'celecoxib_200mg', displayName: 'CELECOXIB 200mg - RITEMED', category: 'Analgesics', unit: 'capsules', stock: 110, reorderLevel: 25 },
      { name: 'cetirizine_10mg', displayName: 'CETIRIZINE 10mg - VIRLIX', category: 'Antihistamines', unit: 'tablets', stock: 200, reorderLevel: 50 },
      { name: 'cinnarizine_75mg', displayName: 'CINNARIZINE 75mg', category: 'Other', unit: 'tablets', stock: 85, reorderLevel: 20 },
      { name: 'difflam', displayName: 'DIFFLAM', category: 'Topical', unit: 'ml', stock: 50, reorderLevel: 10 },
      { name: 'domperidone_10mg', displayName: 'DOMPERIDONE 10mg - RITEMED', category: 'Digestive', unit: 'tablets', stock: 130, reorderLevel: 30 },
      { name: 'gaviscon', displayName: 'GAVISCON (24 SACHETS/BOX)', category: 'Digestive', unit: 'boxes', stock: 40, reorderLevel: 8 },
      { name: 'hidrasec', displayName: 'HIDRASEC', category: 'Digestive', unit: 'capsules', stock: 90, reorderLevel: 20 },
      { name: 'kremil_s_advance', displayName: 'KREMIL-S ADVANCE', category: 'Digestive', unit: 'tablets', stock: 160, reorderLevel: 35 },
      { name: 'loperamide_2mg', displayName: 'LOPERAMIDE 2mg - DIATABS', category: 'Digestive', unit: 'tablets', stock: 140, reorderLevel: 30 },
      { name: 'loratadine_10mg', displayName: 'LORATADINE 10mg - ALLERTA', category: 'Antihistamines', unit: 'tablets', stock: 180, reorderLevel: 40 },
      { name: 'losartan_potassium_50mg', displayName: 'LOSARTAN POTASSIUM 50mg - RITEMED', category: 'Cardiovascular', unit: 'tablets', stock: 170, reorderLevel: 35 },
      { name: 'mefenamic_acid_500mg', displayName: 'MEFENAMIC ACID 500mg - DOLFENAL', category: 'Analgesics', unit: 'tablets', stock: 190, reorderLevel: 45 },
      { name: 'metoclopramide_10mg', displayName: 'METOCLOPRAMIDE 10mg - PLASIL', category: 'Digestive', unit: 'tablets', stock: 120, reorderLevel: 25 },
      { name: 'naproxen_sodium', displayName: 'NAPROXEN SODIUM - FLANAX', category: 'Analgesics', unit: 'tablets', stock: 100, reorderLevel: 25 },
      { name: 'neozep_z_non_drowsy', displayName: 'NEOZEP Z+ NON-DROWSY', category: 'Respiratory', unit: 'tablets', stock: 150, reorderLevel: 35 },
      { name: 'omeprazole_40mg', displayName: 'OMEPRAZOLE 40mg - RITEMED', category: 'Digestive', unit: 'capsules', stock: 130, reorderLevel: 30 },
      { name: 'oral_rehydration_salts', displayName: 'ORAL REHYDRATION SALTS (APPLE FLAVOR) - HYDRITE', category: 'Digestive', unit: 'sachets', stock: 80, reorderLevel: 20 },
      { name: 'salbutamol_nebule', displayName: 'SALBUTAMOL NEBULE (2.5ml) - HIVENT', category: 'Bronchodilators', unit: 'vials', stock: 60, reorderLevel: 15 },
      { name: 'tranexamic_acid_500mg', displayName: 'TRANEXAMIC ACID 500mg - HEMOSTAN', category: 'Other', unit: 'tablets', stock: 90, reorderLevel: 20 }
    ]
    
    defaultMedicines.forEach(medicine => {
      inventoryMedicineStorage.save({
        id: '',
        name: medicine.name,
        displayName: medicine.displayName,
        category: medicine.category,
        unit: medicine.unit,
        stock: medicine.stock,
        reorderLevel: medicine.reorderLevel,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    })
  }
  
  if (supplies.length === 0) {
    const defaultSupplies = [
      { name: 'arm_sling', displayName: 'ARM SLING', category: 'Emergency', unit: 'pieces', stock: 25, reorderLevel: 5 },
      { name: 'band_aid_standard', displayName: 'BAND AID (STANDARD STRIPS-100pcs/BOX) - MEDIPLAST', category: 'Bandages', unit: 'boxes', stock: 30, reorderLevel: 8 },
      { name: 'blood_pressure_apparatus', displayName: 'BLOOD PRESSURE APPARATUS (DESK TYPE) - INDOPLAS', category: 'Diagnostic', unit: 'units', stock: 3, reorderLevel: 1 },
      { name: 'blood_pressure_cuff_large', displayName: 'BLOOD PRESSURE CUFF (LARGE)', category: 'Diagnostic', unit: 'pieces', stock: 10, reorderLevel: 2 },
      { name: 'burn_ointment_15g', displayName: 'BURN OINTMENT 15g - UNITED HOME', category: 'Topical', unit: 'tubes', stock: 40, reorderLevel: 10 },
      { name: 'calamine_lotion_30ml', displayName: 'CALAMINE LOTION 30ml - CALADRYL', category: 'Topical', unit: 'bottles', stock: 35, reorderLevel: 8 },
      { name: 'calmoseptine_ointment', displayName: 'CALMOSEPTINE OINTMENT 3.5g', category: 'Topical', unit: 'tubes', stock: 45, reorderLevel: 12 },
      { name: 'cotton_balls', displayName: 'COTTON BALLS', category: 'Consumables', unit: 'packs', stock: 80, reorderLevel: 20 },
      { name: 'cotton_buds', displayName: 'COTTON BUDS', category: 'Consumables', unit: 'packs', stock: 60, reorderLevel: 15 },
      { name: 'digital_thermometer', displayName: 'DIGITAL THERMOMETER', category: 'Diagnostic', unit: 'pieces', stock: 15, reorderLevel: 3 },
      { name: 'disposable_vinyl_gloves_medium', displayName: 'DISPOSABLE VINYL GLOVES (MEDIUM, 100PCS/BOX) - SURE-GUARD', category: 'Protective Equipment', unit: 'boxes', stock: 50, reorderLevel: 12 },
      { name: 'efficascent_oil_100ml', displayName: 'EFFICASCENT OIL 100ml', category: 'Topical', unit: 'bottles', stock: 25, reorderLevel: 6 },
      { name: 'elastic_bandage_2inch', displayName: 'ELASTIC BANDAGE 2"', category: 'Bandages', unit: 'rolls', stock: 40, reorderLevel: 10 },
      { name: 'elastic_bandage_4inch', displayName: 'ELASTIC BANDAGE 4"', category: 'Bandages', unit: 'rolls', stock: 35, reorderLevel: 8 },
      { name: 'face_mask_50pcs', displayName: 'FACE MASK 50PCS/BOX - RX DR. CARE', category: 'Protective Equipment', unit: 'boxes', stock: 100, reorderLevel: 25 },
      { name: 'hot_bag_electric', displayName: 'HOT BAG (ELECTRIC)', category: 'Instruments', unit: 'pieces', stock: 8, reorderLevel: 2 },
      { name: 'hydrogen_peroxide_120ml', displayName: 'HYDROGEN PEROXIDE 120ml - AGUAPER', category: 'Cleaning', unit: 'bottles', stock: 45, reorderLevel: 12 },
      { name: 'ice_bag_size_9', displayName: 'ICE BAG (SIZE 9) - INMED', category: 'Instruments', unit: 'pieces', stock: 20, reorderLevel: 5 },
      { name: 'infrared_thermometer', displayName: 'INFRARED THERMOMETER', category: 'Diagnostic', unit: 'pieces', stock: 10, reorderLevel: 2 },
      { name: 'micropore_tape', displayName: 'MICROPORE TAPE', category: 'Bandages', unit: 'rolls', stock: 50, reorderLevel: 12 },
      { name: 'mupirocin_ointment_15g', displayName: 'MUPIROCIN OINTMENT (15g/TUBE)', category: 'Topical', unit: 'tubes', stock: 30, reorderLevel: 8 },
      { name: 'nebulizer_kit', displayName: 'NEBULIZER KIT', category: 'Instruments', unit: 'kits', stock: 15, reorderLevel: 3 },
      { name: 'omega_pain_killer_120ml', displayName: 'OMEGA PAIN KILLER 120ml', category: 'Topical', unit: 'bottles', stock: 35, reorderLevel: 8 },
      { name: 'oxygen_mask', displayName: 'OXYGEN MASK', category: 'Emergency', unit: 'pieces', stock: 40, reorderLevel: 10 },
      { name: 'oxygen_nasal_cannula', displayName: 'OXYGEN NASAL CANNULA', category: 'Emergency', unit: 'pieces', stock: 30, reorderLevel: 8 },
      { name: 'paper_cups', displayName: 'PAPER CUPS', category: 'Consumables', unit: 'packs', stock: 25, reorderLevel: 6 },
      { name: 'povidine_iodine_120ml', displayName: 'POVIDINE IODINE 120ml - BETADINE', category: 'Cleaning', unit: 'bottles', stock: 40, reorderLevel: 10 },
      { name: 'salonpas_20_patches', displayName: 'SALONPAS (20 PATCHES)', category: 'Topical', unit: 'boxes', stock: 30, reorderLevel: 8 },
      { name: 'silver_sulfadiazine_cream_20g', displayName: 'SILVER SULFADIAZINE CREAM 20g - MAZINE', category: 'Topical', unit: 'tubes', stock: 25, reorderLevel: 6 },
      { name: 'sterile_gauze_4x4', displayName: 'STERILE GAUZE 4x4 - RX DR. CARE', category: 'Bandages', unit: 'packs', stock: 60, reorderLevel: 15 },
      { name: 'sterile_tongue_depressor_6inch', displayName: 'STERILE TONGUE DEPRESSOR 6" - RX DR. CARE', category: 'Diagnostic', unit: 'packs', stock: 40, reorderLevel: 10 },
      { name: 'tears_naturale_ii', displayName: 'TEARS NATURALE II - ALCON', category: 'Topical', unit: 'bottles', stock: 20, reorderLevel: 5 },
      { name: 'tobramycin_eye_drops_5ml', displayName: 'TOBRAMYCIN EYE DROPS 5ml - TOBREX', category: 'Topical', unit: 'bottles', stock: 25, reorderLevel: 6 },
      { name: 'tourniquet', displayName: 'TOURNIQUET', category: 'Emergency', unit: 'pieces', stock: 15, reorderLevel: 3 },
      { name: 'triangular_bandage', displayName: 'TRIANGULAR BANDAGE', category: 'Bandages', unit: 'pieces', stock: 35, reorderLevel: 8 },
      { name: 'white_flower_20ml', displayName: 'WHITE FLOWER 20ml', category: 'Topical', unit: 'bottles', stock: 30, reorderLevel: 8 }
    ]
    
    defaultSupplies.forEach(supply => {
      inventorySupplyStorage.save({
        id: '',
        name: supply.name,
        displayName: supply.displayName,
        category: supply.category,
        unit: supply.unit,
        stock: supply.stock,
        reorderLevel: supply.reorderLevel,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    })
  }
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
} 