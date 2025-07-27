// User types
export interface User {
  id: string
  name: string
  email: string
  role: 'nurse' | 'admin' | 'staff'
  nurseId?: string
  department?: string
  avatar?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Authentication types
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

// Medicine and Supply item types
export interface MedicineItem {
  name: string
  customName?: string
  quantity: number
}

export interface SupplyItem {
  name: string
  customName?: string
  quantity: number
}

// Database enums
export type ItemTypeMedical = 'Medicine' | 'Supply'

// Category and Supplier types
export interface MedicalCategory {
  id: number
  item_type: ItemTypeMedical
  name: string
}

export interface MedicalSupplier {
  id: number
  name: string
}

// Inventory management types
export interface InventoryMedicine {
  id: number
  item_type: ItemTypeMedical
  name: string
  description?: string
  category_id?: number
  stock: number
  reorder_level: number
  price?: number
  supplier_id?: number
  // Joined fields for display
  category_name?: string
  supplier_name?: string
}

export interface InventorySupply {
  id: number
  item_type: ItemTypeMedical
  name: string
  description?: string
  category_id?: number
  stock: number
  reorder_level: number
  price?: number
  supplier_id?: number
  // Joined fields for display
  category_name?: string
  supplier_name?: string
}

export interface InventoryTransaction {
  id: string
  type: 'stock_in' | 'stock_out' | 'adjustment'
  itemType: 'Medicine' | 'Supply'
  itemId: string
  itemName: string
  quantity: number
  previousStock: number
  newStock: number
  reason: string
  reference?: string
  userId: string
  userName: string
  createdAt: Date
}

// Clinic Log types
export interface ClinicLog {
  id: string
  date: Date
  chiefComplaint: string
  additionalNotes?: string
  medicines: MedicineItem[]
  supplies: SupplyItem[]
  issuedBy: string
  nurseId: string
  nurseName: string
  createdAt: Date
  updatedAt: Date
  status: 'active' | 'archived'
}

export interface ClinicLogFormData {
  patientDiagnose: string
  additionalNotes?: string
  medicines: MedicineItem[]
  supplies: SupplyItem[]
  issuedBy: string
}

// Reimbursement types
export interface Reimbursement {
  id: string;
  date: string;
  employeeId: string;
  fullNameEmployee: string;
  fullNameDependent?: string;
  workLocation: 'Office' | 'WFH';
  receiptDate: string;
  amountRequested: number;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ReimbursementFormData {
  date: Date
  employeeName: string
  employeeId: string
  medicineType: string
  amount: number
  receiptFile?: File
  purpose: string
}

// Form state types
export interface FormState<T> {
  data: T
  errors: Record<keyof T, string[]>
  isDirty: boolean
  isValid: boolean
  isSubmitting: boolean
  isSuccess: boolean
  errorMessage?: string
}

// Table and pagination types
export interface TableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: T[keyof T], record: T) => React.ReactNode
}

export interface TableData<T> {
  data: T[]
  columns: TableColumn<T>[]
  totalItems: number
  currentPage: number
  itemsPerPage: number
  totalPages: number
  isLoading: boolean
  error?: string
}

export interface PaginationState {
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
}

export interface SortState {
  key: string
  direction: 'asc' | 'desc'
}

export interface FilterState {
  searchTerm: string
  dateRange?: {
    from: Date
    to: Date
  }
  status?: string
  medicineType?: string
  supplier?: string
}

// Dashboard types
export interface DashboardStats {
  totalClinicLogs: number
  totalReimbursements: number
  pendingReimbursements: number
  approvedReimbursements: number
  totalMedicineValue: number
  totalReimbursementAmount: number
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: 'clinic_log' | 'reimbursement' | 'approval' | 'rejection'
  title: string
  description: string
  timestamp: Date
  userId: string
  userName: string
  status?: string
  metadata?: Record<string, any>
}

// Navigation types
export interface NavigationItem {
  id: string
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  active?: boolean
  badge?: string | number
  children?: NavigationItem[]
}

// Storage types
export interface StorageData {
  clinicLogs: ClinicLog[]
  reimbursements: Reimbursement[]
  users: User[]
  currentUser: User | null
  settings: AppSettings
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: boolean
  autoSave: boolean
  itemsPerPage: number
  dateFormat: string
  currency: string
}

// API response types
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
  timestamp: Date
}

export interface ApiError {
  message: string
  code: string
  details?: Record<string, any>
}

// Utility types
export type WithId<T> = T & { id: string }
export type WithTimestamps<T> = T & {
  createdAt: Date
  updatedAt: Date
}

export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>

// Medicine types for dropdowns
export interface MedicineOption {
  value: string
  label: string
  category: string
  commonDosages?: string[]
}

export interface SupplierOption {
  value: string
  label: string
  contact?: string
  location?: string
}

// Client and Issuer management types
export interface Client {
  id: string
  name: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface Issuer {
  id: string
  name: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface ClientFormData {
  name: string
}

export interface IssuerFormData {
  name: string
}

// Export utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type Required<T, K extends keyof T> = T & RequiredFields<T, K>

type RequiredFields<T, K extends keyof T> = {
  [P in K]-?: T[P]
}

// Health Check types
export interface HealthCheckRequest {
  id: string
  agentName: string
  client: string
  employeeId: string
  requestDate: Date
  status: 'pending' | 'notified' | 'in_clinic' | 'completed'
  requestType: 'routine' | 'urgent' | 'pre_employment' | 'other'
  notes?: string
  notifiedAt?: Date
  arrivedAt?: Date
  completedAt?: Date
  nurseId?: string
  nurseName?: string
  createdAt: Date
  updatedAt: Date
}

export interface HealthCheckFormData {
  agentName: string
  client: string
  employeeId: string
  requestType: 'routine' | 'urgent' | 'pre_employment' | 'other'
  notes?: string
}

// Database-based Patient types
export type GenderEnum = 'Male' | 'Female' | 'Other' | 'Prefer not to say'
export type UserTypeEnum = 'Agent' | 'Client' | 'Internal'

// Core database tables interfaces
export interface DbUser {
  id: number
  email: string
  user_type: UserTypeEnum
  created_at: Date
  updated_at: Date
}

export interface DbPersonalInfo {
  id: number
  user_id: number
  first_name: string
  middle_name?: string
  last_name: string
  nickname?: string
  profile_picture?: string
  phone?: string
  birthday?: Date
  country?: string
  city?: string
  address?: string
  gender?: GenderEnum
  created_at: Date
  updated_at: Date
}

export interface DbJobInfo {
  id: number
  employee_id: string
  agent_user_id?: number
  internal_user_id?: number
  job_title?: string
  shift_period?: string
  shift_schedule?: string
  shift_time?: string
  work_setup?: string
  employment_status?: string
  hire_type?: string
  staff_source?: string
  start_date?: Date
  exit_date?: Date
  created_at: Date
  updated_at: Date
}

export interface DbMember {
  id: number
  company: string
  address?: string
  phone?: string
  logo?: string
  service?: string
  status?: string
  created_at: Date
  updated_at: Date
}

export interface DbAgent {
  user_id: number
  exp_points?: number
  member_id: number
  department_id?: number
  created_at: Date
  updated_at: Date
}

// Combined Patient interface for clinic use
export interface InternalUser {
  id: number
  email: string
  user_type: UserTypeEnum
  first_name: string
  middle_name?: string
  last_name: string
  full_name: string
}

export interface Patient {
  id: number
  user_id: number
  email: string
  employee_id: string
  full_name: string
  first_name: string
  middle_name?: string
  last_name: string
  nickname?: string
  profile_picture?: string
  phone?: string
  birthday?: Date
  age?: number
  address?: string
  gender?: GenderEnum
  company?: string
  badge_color?: string
  job_title?: string
  employment_status?: string
  user_type: UserTypeEnum
  medical_history?: string | null
  last_visited?: Date | null
  created_at: Date
  updated_at: Date
}

// Patient form data for creating/updating
export interface PatientFormData {
  email: string
  user_type: UserTypeEnum
  first_name: string
  middle_name?: string
  last_name: string
  nickname?: string
  phone?: string
  birthday?: Date
  address?: string
  gender?: GenderEnum
  employee_id: string
  job_title?: string
  employment_status?: string
  company?: string
  medical_history?: string
}

// Database-based Clinic Log types
export interface DbClinicLog {
  id: number
  patient_id: number
  patient_diagnose: string
  additional_notes?: string
  issued_by: string
  created_at: Date
  updated_at: Date
  patient_email: string
  patient_user_type: UserTypeEnum
  patient_full_name: string
  employee_id?: string
  company?: string
  badge_color?: string
  medicines: DbClinicLogMedicine[]
  supplies: DbClinicLogSupply[]
}

export interface DbClinicLogMedicine {
  name: string
  quantity: number
}

export interface DbClinicLogSupply {
  name: string
  quantity: number
} 