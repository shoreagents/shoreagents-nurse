import { Pool, QueryResult } from 'pg'
import { InventoryMedicine, InventorySupply, InventoryTransaction, MedicalCategory, MedicalSupplier, ItemTypeMedical } from './types'

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
      SELECT 
        m.id, m.name, m.description, m.category_id, m.stock, 
        m.reorder_level, m.price, m.supplier_id,
        c.name as category_name,
        s.name as supplier_name
      FROM inventory_medical m
      LEFT JOIN inventory_medical_categories c ON m.category_id = c.id
      LEFT JOIN inventory_medical_suppliers s ON m.supplier_id = s.id
      WHERE m.item_type = 'medicine'
      ORDER BY m.name ASC
    `)
    
    return result.rows.map(row => ({
      id: row.id,
      item_type: 'medicine',
      name: row.name,
      description: row.description,
      category_id: row.category_id,
      stock: row.stock,
      reorder_level: row.reorder_level,
      price: row.price ? parseFloat(row.price) : undefined,
      supplier_id: row.supplier_id,
      category_name: row.category_name,
      supplier_name: row.supplier_name
    }))
  },

  async getById(id: number): Promise<InventoryMedicine | null> {
    const result = await query(`
      SELECT 
        m.id, m.name, m.description, m.category_id, m.stock, 
        m.reorder_level, m.price, m.supplier_id,
        c.name as category_name,
        s.name as supplier_name
      FROM inventory_medical m
      LEFT JOIN inventory_medical_categories c ON m.category_id = c.id
      LEFT JOIN inventory_medical_suppliers s ON m.supplier_id = s.id
      WHERE m.id = $1 AND m.item_type = 'medicine'
    `, [id])
    
    if (result.rows.length === 0) return null
    
    const row = result.rows[0]
    return {
      id: row.id,
      item_type: 'medicine',
      name: row.name,
      description: row.description,
      category_id: row.category_id,
      stock: row.stock,
      reorder_level: row.reorder_level,
      price: row.price ? parseFloat(row.price) : undefined,
      supplier_id: row.supplier_id,
      category_name: row.category_name,
      supplier_name: row.supplier_name
    }
  },

  async save(medicine: Partial<InventoryMedicine>): Promise<InventoryMedicine> {
    if (medicine.id) {
      // Update existing
      const result = await query(`
        UPDATE inventory_medical 
        SET name = $1, description = $2, category_id = $3, stock = $4,
            reorder_level = $5, price = $6, supplier_id = $7,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $8 AND item_type = 'medicine'
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
      // Create new
      const result = await query(`
        INSERT INTO inventory_medical (item_type, name, description, category_id, stock, reorder_level, price, supplier_id)
        VALUES ('medicine', $1, $2, $3, $4, $5, $6, $7)
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
      WHERE id = $1 AND item_type = 'medicine'
    `, [id])
  },

  async search(searchTerm: string): Promise<InventoryMedicine[]> {
    const result = await query(`
      SELECT 
        m.id, m.name, m.description, m.category_id, m.stock, 
        m.reorder_level, m.price, m.supplier_id,
        c.name as category_name,
        s.name as supplier_name
      FROM inventory_medical m
      LEFT JOIN inventory_medical_categories c ON m.category_id = c.id
      LEFT JOIN inventory_medical_suppliers s ON m.supplier_id = s.id
      WHERE m.item_type = 'medicine' 
        AND (m.name ILIKE $1 OR m.description ILIKE $1 OR c.name ILIKE $1 OR s.name ILIKE $1)
      ORDER BY m.name ASC
    `, [`%${searchTerm}%`])
    
    return result.rows.map(row => ({
      id: row.id,
      item_type: 'medicine',
      name: row.name,
      description: row.description,
      category_id: row.category_id,
      stock: row.stock,
      reorder_level: row.reorder_level,
      price: row.price ? parseFloat(row.price) : undefined,
      supplier_id: row.supplier_id,
      category_name: row.category_name,
      supplier_name: row.supplier_name
    }))
  }
}

// Supply Database Functions (similar to medicine but for supplies)
export const supplyDb = {
  async getAll(): Promise<InventorySupply[]> {
    const result = await query(`
      SELECT 
        m.id, m.name, m.description, m.category_id, m.stock, 
        m.reorder_level, m.price, m.supplier_id,
        c.name as category_name,
        s.name as supplier_name
      FROM inventory_medical m
      LEFT JOIN inventory_medical_categories c ON m.category_id = c.id
      LEFT JOIN inventory_medical_suppliers s ON m.supplier_id = s.id
      WHERE m.item_type = 'supply'
      ORDER BY m.name ASC
    `)
    
    return result.rows.map(row => ({
      id: row.id,
      item_type: 'supply',
      name: row.name,
      description: row.description,
      category_id: row.category_id,
      stock: row.stock,
      reorder_level: row.reorder_level,
      price: row.price ? parseFloat(row.price) : undefined,
      supplier_id: row.supplier_id,
      category_name: row.category_name,
      supplier_name: row.supplier_name
    }))
  },

  async getById(id: number): Promise<InventorySupply | null> {
    const result = await query(`
      SELECT 
        m.id, m.name, m.description, m.category_id, m.stock, 
        m.reorder_level, m.price, m.supplier_id,
        c.name as category_name,
        s.name as supplier_name
      FROM inventory_medical m
      LEFT JOIN inventory_medical_categories c ON m.category_id = c.id
      LEFT JOIN inventory_medical_suppliers s ON m.supplier_id = s.id
      WHERE m.id = $1 AND m.item_type = 'supply'
    `, [id])
    
    if (result.rows.length === 0) return null
    
    const row = result.rows[0]
    return {
      id: row.id,
      item_type: 'supply',
      name: row.name,
      description: row.description,
      category_id: row.category_id,
      stock: row.stock,
      reorder_level: row.reorder_level,
      price: row.price ? parseFloat(row.price) : undefined,
      supplier_id: row.supplier_id,
      category_name: row.category_name,
      supplier_name: row.supplier_name
    }
  },

  async save(supply: Partial<InventorySupply>): Promise<InventorySupply> {
    if (supply.id) {
      // Update existing
      const result = await query(`
        UPDATE inventory_medical 
        SET name = $1, description = $2, category_id = $3, stock = $4,
            reorder_level = $5, price = $6, supplier_id = $7,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $8 AND item_type = 'supply'
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
      // Create new
      const result = await query(`
        INSERT INTO inventory_medical (item_type, name, description, category_id, stock, reorder_level, price, supplier_id)
        VALUES ('supply', $1, $2, $3, $4, $5, $6, $7)
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
      WHERE id = $1 AND item_type = 'supply'
    `, [id])
  },

  async search(searchTerm: string): Promise<InventorySupply[]> {
    const result = await query(`
      SELECT 
        m.id, m.name, m.description, m.category_id, m.stock, 
        m.reorder_level, m.price, m.supplier_id,
        c.name as category_name,
        s.name as supplier_name
      FROM inventory_medical m
      LEFT JOIN inventory_medical_categories c ON m.category_id = c.id
      LEFT JOIN inventory_medical_suppliers s ON m.supplier_id = s.id
      WHERE m.item_type = 'supply' 
        AND (m.name ILIKE $1 OR m.description ILIKE $1 OR c.name ILIKE $1 OR s.name ILIKE $1)
      ORDER BY m.name ASC
    `, [`%${searchTerm}%`])
    
    return result.rows.map(row => ({
      id: row.id,
      item_type: 'supply',
      name: row.name,
      description: row.description,
      category_id: row.category_id,
      stock: row.stock,
      reorder_level: row.reorder_level,
      price: row.price ? parseFloat(row.price) : undefined,
      supplier_id: row.supplier_id,
      category_name: row.category_name,
      supplier_name: row.supplier_name
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