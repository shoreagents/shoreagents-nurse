import { Pool, QueryResult } from 'pg'
import { InventoryMedicine, InventorySupply, InventoryTransaction, MedicalCategory, MedicalSupplier, ItemTypeMedical, Patient, PatientFormData, DbUser, DbPersonalInfo, DbJobInfo, DbMember, DbAgent, GenderEnum, UserTypeEnum, ClinicLog, ClinicLogFormData } from './types'

// Database connection pool
let pool: Pool | null = null

// Initialize database connection
export function initializeDatabase() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
      process.exit(-1)
    })
  }
  return pool
}

// Generic query function
export async function query(text: string, params?: any[]): Promise<QueryResult> {
  const client = initializeDatabase()
  try {
    const result = await client.query(text, params)
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Close database connection
export async function closeDatabase() {
  if (pool) {
    await pool.end()
    pool = null
  }
}

// Category Database Functions
export const categoryDb = {
  async getAll(itemType?: ItemTypeMedical): Promise<MedicalCategory[]> {
    const whereClause = itemType ? 'WHERE item_type = $1' : ''
    const params = itemType ? [itemType] : []
    
    const result = await query(`
      SELECT id, item_type, name
      FROM inventory_medical_categories 
      ${whereClause}
      ORDER BY name ASC
    `, params)
    
    return result.rows.map(row => ({
      id: row.id,
      item_type: row.item_type,
      name: row.name
    }))
  },

  async save(category: Omit<MedicalCategory, 'id'>): Promise<MedicalCategory> {
    const result = await query(`
      INSERT INTO inventory_medical_categories (item_type, name)
      VALUES ($1, $2)
      ON CONFLICT (item_type, name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
      RETURNING id, item_type, name
    `, [category.item_type, category.name])
    
    const row = result.rows[0]
    return {
      id: row.id,
      item_type: row.item_type,
      name: row.name
    }
  }
}

// Supplier Database Functions
export const supplierDb = {
  async getAll(): Promise<MedicalSupplier[]> {
    const result = await query(`
      SELECT id, name
      FROM inventory_medical_suppliers 
      ORDER BY name ASC
    `)
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name
    }))
  },

  async save(supplier: Omit<MedicalSupplier, 'id'>): Promise<MedicalSupplier> {
    const result = await query(`
      INSERT INTO inventory_medical_suppliers (name)
      VALUES ($1)
      ON CONFLICT (name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
      RETURNING id, name
    `, [supplier.name])
    
    const row = result.rows[0]
    return {
      id: row.id,
      name: row.name
    }
  },

  async update(id: number, supplier: Partial<MedicalSupplier>): Promise<MedicalSupplier> {
    const result = await query(`
      UPDATE inventory_medical_suppliers 
      SET name = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name
    `, [supplier.name, id])
    
    if (result.rows.length === 0) {
      throw new Error('Supplier not found')
    }
    
    const row = result.rows[0]
    return {
      id: row.id,
      name: row.name
    }
  },

  async delete(id: number): Promise<void> {
    // Check if supplier is being used
    const usageResult = await query(`
      SELECT COUNT(*) as count 
      FROM inventory_medical 
      WHERE supplier_id = $1
    `, [id])
    
    const usageCount = parseInt(usageResult.rows[0].count)
    if (usageCount > 0) {
      throw new Error('Supplier is in use and cannot be deleted')
    }
    
    const result = await query(`
      DELETE FROM inventory_medical_suppliers 
      WHERE id = $1
    `, [id])
    
    if (result.rowCount === 0) {
      throw new Error('Supplier not found')
    }
  },

  async getById(id: number): Promise<MedicalSupplier | null> {
    const result = await query(`
      SELECT id, name
      FROM inventory_medical_suppliers 
      WHERE id = $1
    `, [id])
    
    if (result.rows.length === 0) return null
    
    const row = result.rows[0]
    return {
      id: row.id,
      name: row.name
    }
  }
}

// Medicine Database Functions
export const medicineDb = {
  async getAll(): Promise<InventoryMedicine[]> {
    const result = await query(`
      SELECT m.*, 
             c.name as category_name,
             s.name as supplier_name
      FROM inventory_medical m
      LEFT JOIN inventory_medical_categories c ON m.category_id = c.id
      LEFT JOIN inventory_medical_suppliers s ON m.supplier_id = s.id
      WHERE m.item_type = 'Medicine'
      ORDER BY m.name ASC
    `)
    
    return result.rows.map(row => ({
      id: row.id,
      item_type: 'Medicine',
      name: row.name,
      description: row.description,
      category_id: row.category_id,
      stock: row.stock,
      reorder_level: row.reorder_level,
      price: row.price ? Number(row.price) : undefined,
      supplier_id: row.supplier_id,
      category_name: (row.category_name && row.category_name !== 'null') ? row.category_name : null,
      supplier_name: (row.supplier_name && row.supplier_name !== 'null') ? row.supplier_name : null
    }))
  },

  async getById(id: number): Promise<InventoryMedicine | null> {
    const result = await query(`
      SELECT m.*, 
             c.name as category_name,
             s.name as supplier_name
      FROM inventory_medical m
      LEFT JOIN inventory_medical_categories c ON m.category_id = c.id
      LEFT JOIN inventory_medical_suppliers s ON m.supplier_id = s.id
      WHERE m.id = $1 AND m.item_type = 'Medicine'
    `, [id])
    
    if (result.rows.length === 0) return null
    
    const row = result.rows[0]
    return {
      id: row.id,
      item_type: 'Medicine',
      name: row.name,
      description: row.description,
      category_id: row.category_id,
      stock: row.stock,
      reorder_level: row.reorder_level,
      price: row.price ? Number(row.price) : undefined,
      supplier_id: row.supplier_id,
      category_name: (row.category_name && row.category_name !== 'null') ? row.category_name : null,
      supplier_name: (row.supplier_name && row.supplier_name !== 'null') ? row.supplier_name : null
    }
  },

  async save(medicine: Partial<InventoryMedicine>): Promise<InventoryMedicine> {
    if (medicine.id) {
      // Update existing medicine
      const result = await query(`
        UPDATE inventory_medical 
        SET name = $1, description = $2, category_id = $3, stock = $4, 
            reorder_level = $5, price = $6, supplier_id = $7, updated_at = CURRENT_TIMESTAMP
        WHERE id = $8 AND item_type = 'Medicine'
        RETURNING id
      `, [
        medicine.name,
        medicine.description,
        medicine.category_id,
        medicine.stock,
        medicine.reorder_level,
        medicine.price,
        medicine.supplier_id,
        medicine.id
      ])
      
      return this.getById(result.rows[0].id) as Promise<InventoryMedicine>
    } else {
      // Insert new medicine
      const result = await query(`
        INSERT INTO inventory_medical (item_type, name, description, category_id, stock, reorder_level, price, supplier_id)
        VALUES ('Medicine', $1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [
        medicine.name,
        medicine.description,
        medicine.category_id,
        medicine.stock || 0,
        medicine.reorder_level || 10,
        medicine.price,
        medicine.supplier_id
      ])
      
      return this.getById(result.rows[0].id) as Promise<InventoryMedicine>
    }
  },

  async delete(id: number): Promise<void> {
    await query(`
      DELETE FROM inventory_medical 
      WHERE id = $1 AND item_type = 'Medicine'
    `, [id])
  },

  async search(searchTerm: string): Promise<InventoryMedicine[]> {
    const result = await query(`
      SELECT m.*, 
             c.name as category_name,
             s.name as supplier_name
      FROM inventory_medical m
      LEFT JOIN inventory_medical_categories c ON m.category_id = c.id
      LEFT JOIN inventory_medical_suppliers s ON m.supplier_id = s.id
      WHERE m.item_type = 'Medicine' AND (
        m.name ILIKE $1 OR 
        m.description ILIKE $1 OR
        c.name ILIKE $1 OR
        s.name ILIKE $1
      )
      ORDER BY m.name ASC
    `, [`%${searchTerm}%`])
    
    return result.rows.map(row => ({
      id: row.id,
      item_type: 'Medicine',
      name: row.name,
      description: row.description,
      category_id: row.category_id,
      stock: row.stock,
      reorder_level: row.reorder_level,
      price: row.price ? Number(row.price) : undefined,
      supplier_id: row.supplier_id,
      category_name: (row.category_name && row.category_name !== 'null') ? row.category_name : null,
      supplier_name: (row.supplier_name && row.supplier_name !== 'null') ? row.supplier_name : null
    }))
  }
}

// Supply Database Functions (similar to medicine but for supplies)
export const supplyDb = {
  async getAll(): Promise<InventorySupply[]> {
    const result = await query(`
      SELECT m.*, 
             c.name as category_name,
             s.name as supplier_name
      FROM inventory_medical m
      LEFT JOIN inventory_medical_categories c ON m.category_id = c.id
      LEFT JOIN inventory_medical_suppliers s ON m.supplier_id = s.id
      WHERE m.item_type = 'Supply'
      ORDER BY m.name ASC
    `)
    
    return result.rows.map(row => ({
      id: row.id,
      item_type: 'Supply',
      name: row.name,
      description: row.description,
      category_id: row.category_id,
      stock: row.stock,
      reorder_level: row.reorder_level,
      price: row.price ? Number(row.price) : undefined,
      supplier_id: row.supplier_id,
      category_name: (row.category_name && row.category_name !== 'null') ? row.category_name : null,
      supplier_name: (row.supplier_name && row.supplier_name !== 'null') ? row.supplier_name : null
    }))
  },

  async getById(id: number): Promise<InventorySupply | null> {
    const result = await query(`
      SELECT m.*, 
             c.name as category_name,
             s.name as supplier_name
      FROM inventory_medical m
      LEFT JOIN inventory_medical_categories c ON m.category_id = c.id
      LEFT JOIN inventory_medical_suppliers s ON m.supplier_id = s.id
      WHERE m.id = $1 AND m.item_type = 'Supply'
    `, [id])
    
    if (result.rows.length === 0) return null
    
    const row = result.rows[0]
    return {
      id: row.id,
      item_type: 'Supply',
      name: row.name,
      description: row.description,
      category_id: row.category_id,
      stock: row.stock,
      reorder_level: row.reorder_level,
      price: row.price ? Number(row.price) : undefined,
      supplier_id: row.supplier_id,
      category_name: (row.category_name && row.category_name !== 'null') ? row.category_name : null,
      supplier_name: (row.supplier_name && row.supplier_name !== 'null') ? row.supplier_name : null
    }
  },

  async save(supply: Partial<InventorySupply>): Promise<InventorySupply> {
    if (supply.id) {
      // Update existing supply
      const result = await query(`
        UPDATE inventory_medical 
        SET name = $1, description = $2, category_id = $3, stock = $4, 
            reorder_level = $5, price = $6, supplier_id = $7, updated_at = CURRENT_TIMESTAMP
        WHERE id = $8 AND item_type = 'Supply'
        RETURNING id
      `, [
        supply.name,
        supply.description,
        supply.category_id,
        supply.stock,
        supply.reorder_level,
        supply.price,
        supply.supplier_id,
        supply.id
      ])
      
      return this.getById(result.rows[0].id) as Promise<InventorySupply>
    } else {
      // Insert new supply
      const result = await query(`
        INSERT INTO inventory_medical (item_type, name, description, category_id, stock, reorder_level, price, supplier_id)
        VALUES ('Supply', $1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [
        supply.name,
        supply.description,
        supply.category_id,
        supply.stock || 0,
        supply.reorder_level || 10,
        supply.price,
        supply.supplier_id
      ])
      
      return this.getById(result.rows[0].id) as Promise<InventorySupply>
    }
  },

  async delete(id: number): Promise<void> {
    await query(`
      DELETE FROM inventory_medical 
      WHERE id = $1 AND item_type = 'Supply'
    `, [id])
  },

  async search(searchTerm: string): Promise<InventorySupply[]> {
    const result = await query(`
      SELECT m.*, 
             c.name as category_name,
             s.name as supplier_name
      FROM inventory_medical m
      LEFT JOIN inventory_medical_categories c ON m.category_id = c.id
      LEFT JOIN inventory_medical_suppliers s ON m.supplier_id = s.id
      WHERE m.item_type = 'Supply' AND (
        m.name ILIKE $1 OR 
        m.description ILIKE $1 OR
        c.name ILIKE $1 OR
        s.name ILIKE $1
      )
      ORDER BY m.name ASC
    `, [`%${searchTerm}%`])
    
    return result.rows.map(row => ({
      id: row.id,
      item_type: 'Supply',
      name: row.name,
      description: row.description,
      category_id: row.category_id,
      stock: row.stock,
      reorder_level: row.reorder_level,
      price: row.price ? Number(row.price) : undefined,
      supplier_id: row.supplier_id,
      category_name: (row.category_name && row.category_name !== 'null') ? row.category_name : null,
      supplier_name: (row.supplier_name && row.supplier_name !== 'null') ? row.supplier_name : null
    }))
  }
}

// Transaction Database Functions
export const transactionDb = {
  async add(transaction: Omit<InventoryTransaction, 'id' | 'createdAt'>): Promise<InventoryTransaction> {
    const result = await query(`
      INSERT INTO inventory_transactions (type, item_type, item_id, item_name, quantity, previous_stock, new_stock, reason, reference, user_id, user_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, created_at
    `, [
      transaction.type,
      transaction.itemType,
      transaction.itemId,
      transaction.itemName,
      transaction.quantity,
      transaction.previousStock,
      transaction.newStock,
      transaction.reason,
      transaction.reference,
      transaction.userId,
      transaction.userName
    ])
    
    const row = result.rows[0]
    return {
      ...transaction,
      id: row.id,
      createdAt: new Date(row.created_at)
    }
  }
}

// Patient Database Functions
export const patientDb = {
  async getAll(): Promise<Patient[]> {
    const result = await query(`
      SELECT 
        u.id as user_id,
        u.email,
        u.user_type,
        u.created_at as user_created_at,
        u.updated_at as user_updated_at,
        pi.id,
        pi.first_name,
        pi.middle_name,
        pi.last_name,
        pi.nickname,
        pi.profile_picture,
        pi.phone,
        pi.birthday,
        pi.country,
        pi.city,
        pi.address,
        pi.gender,
        pi.created_at,
        pi.updated_at,
        ji.employee_id,
        ji.job_title,
        ji.employment_status,
                 CASE 
           WHEN u.user_type = 'Internal' THEN 'Internal'
           ELSE m.company
         END as company,
         m.badge_color,
        CASE 
          WHEN pi.middle_name IS NOT NULL AND pi.middle_name != '' 
          THEN CONCAT(pi.first_name, ' ', pi.middle_name, ' ', pi.last_name)
          ELSE CONCAT(pi.first_name, ' ', pi.last_name)
        END as full_name,
        CASE 
          WHEN pi.birthday IS NOT NULL 
          THEN EXTRACT(YEAR FROM AGE(pi.birthday))::integer
          ELSE NULL
        END as age
      FROM users u
      INNER JOIN personal_info pi ON u.id = pi.user_id
      LEFT JOIN job_info ji ON (
        (u.user_type = 'Agent' AND ji.agent_user_id = u.id) OR
        (u.user_type = 'Internal' AND ji.internal_user_id = u.id)
      )
      LEFT JOIN agents a ON (u.user_type = 'Agent' AND a.user_id = u.id)
      LEFT JOIN members m ON a.member_id = m.id
      WHERE u.user_type IN ('Agent', 'Internal')
      ORDER BY pi.first_name, pi.last_name
    `)
    
    return result.rows.map(row => ({
      id: row.user_id,
      user_id: row.user_id,
      email: row.email,
      employee_id: row.employee_id || '',
      full_name: row.full_name,
      first_name: row.first_name,
      middle_name: row.middle_name,
      last_name: row.last_name,
      nickname: row.nickname,
      profile_picture: row.profile_picture,
      phone: row.phone,
      birthday: row.birthday,
      age: row.age,
      country: row.country,
      city: row.city,
      address: row.address,
      gender: row.gender,
      company: row.company,
      badge_color: row.badge_color,
      job_title: row.job_title,
      employment_status: row.employment_status,
      user_type: row.user_type,
      medical_history: null, // To be implemented with medical records
      last_visited: null, // To be implemented with clinic logs
      created_at: row.created_at,
      updated_at: row.updated_at
    }))
  },

  async getById(id: number): Promise<Patient | null> {
    const result = await query(`
      SELECT 
        u.id as user_id,
        u.email,
        u.user_type,
        u.created_at as user_created_at,
        u.updated_at as user_updated_at,
        pi.id,
        pi.first_name,
        pi.middle_name,
        pi.last_name,
        pi.nickname,
        pi.profile_picture,
        pi.phone,
        pi.birthday,
        pi.country,
        pi.city,
        pi.address,
        pi.gender,
        pi.created_at,
        pi.updated_at,
        ji.employee_id,
        ji.job_title,
        ji.employment_status,
        CASE 
          WHEN u.user_type = 'Internal' THEN 'Internal'
          ELSE m.company
        END as company,
        m.badge_color,
        CASE 
          WHEN pi.middle_name IS NOT NULL AND pi.middle_name != '' 
          THEN CONCAT(pi.first_name, ' ', pi.middle_name, ' ', pi.last_name)
          ELSE CONCAT(pi.first_name, ' ', pi.last_name)
        END as full_name,
        CASE 
          WHEN pi.birthday IS NOT NULL 
          THEN EXTRACT(YEAR FROM AGE(pi.birthday))::integer
          ELSE NULL
        END as age
      FROM users u
      INNER JOIN personal_info pi ON u.id = pi.user_id
      LEFT JOIN job_info ji ON (
        (u.user_type = 'Agent' AND ji.agent_user_id = u.id) OR
        (u.user_type = 'Internal' AND ji.internal_user_id = u.id)
      )
      LEFT JOIN agents a ON (u.user_type = 'Agent' AND a.user_id = u.id)
      LEFT JOIN members m ON a.member_id = m.id
      WHERE u.id = $1 AND u.user_type IN ('Agent', 'Internal')
    `, [id])
    
    if (result.rows.length === 0) return null
    
    const row = result.rows[0]
    return {
      id: row.user_id,
      user_id: row.user_id,
      email: row.email,
      employee_id: row.employee_id || '',
      full_name: row.full_name,
      first_name: row.first_name,
      middle_name: row.middle_name,
      last_name: row.last_name,
      nickname: row.nickname,
      profile_picture: row.profile_picture,
      phone: row.phone,
      birthday: row.birthday,
      age: row.age,
      country: row.country,
      city: row.city,
      address: row.address,
      gender: row.gender,
      company: row.company,
      badge_color: row.badge_color,
      job_title: row.job_title,
      employment_status: row.employment_status,
      user_type: row.user_type,
      medical_history: null, // To be implemented with medical records
      last_visited: null, // To be implemented with clinic logs
      created_at: row.created_at,
      updated_at: row.updated_at
    }
  },

  async search(searchTerm: string): Promise<Patient[]> {
    const result = await query(`
      SELECT 
        u.id as user_id,
        u.email,
        u.user_type,
        u.created_at as user_created_at,
        u.updated_at as user_updated_at,
        pi.id,
        pi.first_name,
        pi.middle_name,
        pi.last_name,
        pi.nickname,
        pi.profile_picture,
        pi.phone,
        pi.birthday,
        pi.country,
        pi.city,
        pi.address,
        pi.gender,
        pi.created_at,
        pi.updated_at,
        ji.employee_id,
        ji.job_title,
        ji.employment_status,
        CASE 
          WHEN u.user_type = 'Internal' THEN 'Internal'
          ELSE m.company
        END as company,
        m.badge_color,
        CASE 
          WHEN pi.middle_name IS NOT NULL AND pi.middle_name != '' 
          THEN CONCAT(pi.first_name, ' ', pi.middle_name, ' ', pi.last_name)
          ELSE CONCAT(pi.first_name, ' ', pi.last_name)
        END as full_name,
        CASE 
          WHEN pi.birthday IS NOT NULL 
          THEN EXTRACT(YEAR FROM AGE(pi.birthday))::integer
          ELSE NULL
        END as age
      FROM users u
      INNER JOIN personal_info pi ON u.id = pi.user_id
      LEFT JOIN job_info ji ON (
        (u.user_type = 'Agent' AND ji.agent_user_id = u.id) OR
        (u.user_type = 'Internal' AND ji.internal_user_id = u.id)
      )
      LEFT JOIN agents a ON (u.user_type = 'Agent' AND a.user_id = u.id)
      LEFT JOIN members m ON a.member_id = m.id
      WHERE u.user_type IN ('Agent', 'Internal')
        AND (
          pi.first_name ILIKE $1 OR 
          pi.last_name ILIKE $1 OR
          pi.middle_name ILIKE $1 OR
          CONCAT(pi.first_name, ' ', pi.last_name) ILIKE $1 OR
          ji.employee_id ILIKE $1 OR
          u.email ILIKE $1 OR
          m.company ILIKE $1
        )
      ORDER BY pi.first_name, pi.last_name
    `, [`%${searchTerm}%`])
    
    return result.rows.map(row => ({
      id: row.user_id,
      user_id: row.user_id,
      email: row.email,
      employee_id: row.employee_id || '',
      full_name: row.full_name,
      first_name: row.first_name,
      middle_name: row.middle_name,
      last_name: row.last_name,
      nickname: row.nickname,
      profile_picture: row.profile_picture,
      phone: row.phone,
      birthday: row.birthday,
      age: row.age,
      country: row.country,
      city: row.city,
      address: row.address,
      gender: row.gender,
      company: row.company,
      badge_color: row.badge_color,
      job_title: row.job_title,
      employment_status: row.employment_status,
      user_type: row.user_type,
      medical_history: null, // To be implemented with medical records
      last_visited: null, // To be implemented with clinic logs
      created_at: row.created_at,
      updated_at: row.updated_at
    }))
  },

  async create(patientData: PatientFormData): Promise<Patient> {
    // Start transaction
    const client = initializeDatabase()
    await client.query('BEGIN')
    
    try {
      // Create user
      const userResult = await client.query(`
        INSERT INTO users (email, user_type)
        VALUES ($1, $2)
        RETURNING id, created_at, updated_at
      `, [patientData.email, patientData.user_type])
      
      const userId = userResult.rows[0].id
      
      // Create personal info
      const personalInfoResult = await client.query(`
        INSERT INTO personal_info (
          user_id, first_name, middle_name, last_name, nickname, 
          phone, birthday, country, city, address, gender
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, created_at, updated_at
      `, [
        userId,
        patientData.first_name,
        patientData.middle_name,
        patientData.last_name,
        patientData.nickname,
        patientData.phone,
        patientData.birthday,
        patientData.country,
        patientData.city,
        patientData.address,
        patientData.gender
      ])
      
      const personalInfoId = personalInfoResult.rows[0].id
      
      // Create job info if provided
      if (patientData.employee_id) {
        const userIdColumn = patientData.user_type === 'Agent' ? 'agent_user_id' : 'internal_user_id'
        await client.query(`
          INSERT INTO job_info (
            employee_id, ${userIdColumn}, job_title, employment_status
          )
          VALUES ($1, $2, $3, $4)
        `, [
          patientData.employee_id,
          userId,
          patientData.job_title,
          patientData.employment_status
        ])
      }
      
      // If Agent type, create agent record (requires member_id)
      if (patientData.user_type === 'Agent') {
        // For now, we'll use member_id = 1 as default, this should be configurable
        await client.query(`
          INSERT INTO agents (user_id, member_id, exp_points)
          VALUES ($1, 1, 0)
        `, [userId])
      }
      
      await client.query('COMMIT')
      
      // Return the created patient
      const patient = await this.getById(personalInfoId)
      if (!patient) {
        throw new Error('Failed to retrieve created patient')
      }
      
      return patient
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }
  },

  async update(id: number, patientData: Partial<PatientFormData>): Promise<Patient> {
    const client = initializeDatabase()
    await client.query('BEGIN')
    
    try {
      // Get current patient to get user_id
      const currentPatient = await this.getById(id)
      if (!currentPatient) {
        throw new Error('Patient not found')
      }
      
      // Update personal info
      const personalInfoUpdates = []
      const personalInfoValues = []
      let paramCount = 1
      
      if (patientData.first_name !== undefined) {
        personalInfoUpdates.push(`first_name = $${paramCount++}`)
        personalInfoValues.push(patientData.first_name)
      }
      if (patientData.middle_name !== undefined) {
        personalInfoUpdates.push(`middle_name = $${paramCount++}`)
        personalInfoValues.push(patientData.middle_name)
      }
      if (patientData.last_name !== undefined) {
        personalInfoUpdates.push(`last_name = $${paramCount++}`)
        personalInfoValues.push(patientData.last_name)
      }
      if (patientData.nickname !== undefined) {
        personalInfoUpdates.push(`nickname = $${paramCount++}`)
        personalInfoValues.push(patientData.nickname)
      }
      if (patientData.phone !== undefined) {
        personalInfoUpdates.push(`phone = $${paramCount++}`)
        personalInfoValues.push(patientData.phone)
      }
      if (patientData.birthday !== undefined) {
        personalInfoUpdates.push(`birthday = $${paramCount++}`)
        personalInfoValues.push(patientData.birthday)
      }
      if (patientData.country !== undefined) {
        personalInfoUpdates.push(`country = $${paramCount++}`)
        personalInfoValues.push(patientData.country)
      }
      if (patientData.city !== undefined) {
        personalInfoUpdates.push(`city = $${paramCount++}`)
        personalInfoValues.push(patientData.city)
      }
      if (patientData.address !== undefined) {
        personalInfoUpdates.push(`address = $${paramCount++}`)
        personalInfoValues.push(patientData.address)
      }
      if (patientData.gender !== undefined) {
        personalInfoUpdates.push(`gender = $${paramCount++}`)
        personalInfoValues.push(patientData.gender)
      }
      
      if (personalInfoUpdates.length > 0) {
        personalInfoUpdates.push(`updated_at = CURRENT_TIMESTAMP`)
        personalInfoValues.push(id)
        
        await client.query(`
          UPDATE personal_info 
          SET ${personalInfoUpdates.join(', ')}
          WHERE id = $${paramCount}
        `, personalInfoValues)
      }
      
      // Update email if provided
      if (patientData.email !== undefined) {
        await client.query(`
          UPDATE users 
          SET email = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [patientData.email, currentPatient.user_id])
      }
      
      // Update job info if provided
      if (patientData.employee_id !== undefined || patientData.job_title !== undefined || patientData.employment_status !== undefined) {
        const userIdColumn = currentPatient.user_type === 'Agent' ? 'agent_user_id' : 'internal_user_id'
        
        // Check if job info exists
        const jobInfoResult = await client.query(`
          SELECT id FROM job_info WHERE ${userIdColumn} = $1
        `, [currentPatient.user_id])
        
        if (jobInfoResult.rows.length > 0) {
          // Update existing
          const jobUpdates = []
          const jobValues = []
          let jobParamCount = 1
          
          if (patientData.employee_id !== undefined) {
            jobUpdates.push(`employee_id = $${jobParamCount++}`)
            jobValues.push(patientData.employee_id)
          }
          if (patientData.job_title !== undefined) {
            jobUpdates.push(`job_title = $${jobParamCount++}`)
            jobValues.push(patientData.job_title)
          }
          if (patientData.employment_status !== undefined) {
            jobUpdates.push(`employment_status = $${jobParamCount++}`)
            jobValues.push(patientData.employment_status)
          }
          
          if (jobUpdates.length > 0) {
            jobUpdates.push(`updated_at = CURRENT_TIMESTAMP`)
            jobValues.push(jobInfoResult.rows[0].id)
            
            await client.query(`
              UPDATE job_info 
              SET ${jobUpdates.join(', ')}
              WHERE id = $${jobParamCount}
            `, jobValues)
          }
        } else if (patientData.employee_id) {
          // Create new job info
          await client.query(`
            INSERT INTO job_info (
              employee_id, ${userIdColumn}, job_title, employment_status
            )
            VALUES ($1, $2, $3, $4)
          `, [
            patientData.employee_id,
            currentPatient.user_id,
            patientData.job_title,
            patientData.employment_status
          ])
        }
      }
      
      await client.query('COMMIT')
      
      // Return the updated patient
      const patient = await this.getById(id)
      if (!patient) {
        throw new Error('Failed to retrieve updated patient')
      }
      
      return patient
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }
  }
}

// Clinic Log Database Functions  
export const clinicLogDb = {
  async create(clinicLogData: ClinicLogFormData & { nurseId: string; nurseName: string }): Promise<ClinicLog> {
    const client = initializeDatabase()
    await client.query('BEGIN')
    
    try {
      // Create clinic log entry
      const clinicLogResult = await client.query(`
        INSERT INTO clinic_logs (
          date, patient_id, chief_complaint, additional_notes, 
          issued_by, nurse_id, nurse_name, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
        RETURNING id, created_at, updated_at
      `, [
        clinicLogData.date,
        parseInt(clinicLogData.patientId),
        clinicLogData.chiefComplaint,
        clinicLogData.additionalNotes,
        clinicLogData.issuedBy,
        clinicLogData.nurseId,
        clinicLogData.nurseName
      ])
      
      const clinicLogId = clinicLogResult.rows[0].id
      
      // Insert medicines
      if (clinicLogData.medicines && clinicLogData.medicines.length > 0) {
        for (const medicine of clinicLogData.medicines) {
          await client.query(`
            INSERT INTO clinic_log_medicines (clinic_log_id, name, custom_name, quantity)
            VALUES ($1, $2, $3, $4)
          `, [
            clinicLogId,
            medicine.name,
            medicine.customName,
            medicine.quantity
          ])
        }
      }
      
      // Insert supplies
      if (clinicLogData.supplies && clinicLogData.supplies.length > 0) {
        for (const supply of clinicLogData.supplies) {
          await client.query(`
            INSERT INTO clinic_log_supplies (clinic_log_id, name, custom_name, quantity)
            VALUES ($1, $2, $3, $4)
          `, [
            clinicLogId,
            supply.name,
            supply.customName,
            supply.quantity
          ])
        }
      }
      
      await client.query('COMMIT')
      
      // Return the created clinic log
      return {
        id: clinicLogId.toString(),
        date: clinicLogData.date,
        chiefComplaint: clinicLogData.chiefComplaint,
        additionalNotes: clinicLogData.additionalNotes,
        medicines: clinicLogData.medicines || [],
        supplies: clinicLogData.supplies || [],
        issuedBy: clinicLogData.issuedBy,
        nurseId: clinicLogData.nurseId,
        nurseName: clinicLogData.nurseName,
        status: 'active',
        createdAt: clinicLogResult.rows[0].created_at,
        updatedAt: clinicLogResult.rows[0].updated_at
      }
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }
  },

  async getByPatientId(patientId: number): Promise<ClinicLog[]> {
    const result = await query(`
      SELECT 
        cl.id, cl.date, cl.chief_complaint, cl.additional_notes,
        cl.issued_by, cl.nurse_id, cl.nurse_name, cl.status,
        cl.created_at, cl.updated_at
      FROM clinic_logs cl
      WHERE cl.patient_id = $1 AND cl.status = 'active'
      ORDER BY cl.date DESC, cl.created_at DESC
    `, [patientId])
    
    const clinicLogs = []
    for (const row of result.rows) {
      // Get medicines for this clinic log
      const medicinesResult = await query(`
        SELECT name, custom_name, quantity 
        FROM clinic_log_medicines 
        WHERE clinic_log_id = $1
      `, [row.id])
      
      // Get supplies for this clinic log
      const suppliesResult = await query(`
        SELECT name, custom_name, quantity 
        FROM clinic_log_supplies 
        WHERE clinic_log_id = $1
      `, [row.id])
      
      clinicLogs.push({
        id: row.id.toString(),
        date: row.date,
        chiefComplaint: row.chief_complaint,
        additionalNotes: row.additional_notes,
        medicines: medicinesResult.rows.map(m => ({
          name: m.name,
          customName: m.custom_name,
          quantity: parseFloat(m.quantity)
        })),
        supplies: suppliesResult.rows.map(s => ({
          name: s.name,
          customName: s.custom_name,
          quantity: parseFloat(s.quantity)
        })),
        issuedBy: row.issued_by,
        nurseId: row.nurse_id,
        nurseName: row.nurse_name,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })
    }
    
    return clinicLogs
  }
} 