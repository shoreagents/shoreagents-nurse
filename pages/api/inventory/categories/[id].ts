import { NextApiRequest, NextApiResponse } from 'next'
import { query } from '@/lib/database'
import { ItemTypeMedical } from '@/lib/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = parseInt(req.query.id as string)

  // Validate id is a valid number
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid category ID' })
  }

  try {
    switch (req.method) {
      case 'PUT':
        const { name } = req.body
        if (!name) {
          return res.status(400).json({ error: 'Name is required' })
        }

        // First get the existing category to preserve its type
        const existingCategory = await query(
          'SELECT item_type FROM inventory_medical_categories WHERE id = $1',
          [id]
        )

        if (!existingCategory?.rowCount) {
          return res.status(404).json({ error: 'Category not found' })
        }

        const updateResult = await query(
          'UPDATE inventory_medical_categories SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
          [name, id]
        )

        if (!updateResult?.rowCount) {
          return res.status(404).json({ error: 'Category not found' })
        }

        res.status(200).json(updateResult.rows[0])
        break

      case 'DELETE':
        try {
          console.log(`Attempting to delete category with ID: ${id}`)
          
          // First check if category exists and get its type
          const categoryCheck = await query(
            'SELECT id, item_type, name FROM inventory_medical_categories WHERE id = $1',
            [id]
          )

          console.log(`Category check result:`, categoryCheck?.rows)

          if (!categoryCheck?.rowCount) {
            return res.status(404).json({ error: 'Category not found' })
          }

          const category = categoryCheck.rows[0]
          const itemType = category.item_type as ItemTypeMedical

          console.log(`Category found: ${category.name}, type: ${itemType}`)

          // Check if category is in use - check the inventory_medical table
          const usageCheck = await query(
            'SELECT id FROM inventory_medical WHERE category_id = $1 LIMIT 1',
            [id]
          )

          // Safely check rowCount with null coalescing
          const isInUse = (usageCheck?.rowCount ?? 0) > 0
          if (isInUse) {
            return res.status(400).json({ error: 'Category is in use and cannot be deleted' })
          }
          
          // Finally delete the category
          const deleteResult = await query(
            'DELETE FROM inventory_medical_categories WHERE id = $1',
            [id]
          )

          console.log(`Delete result:`, deleteResult?.rowCount)

          res.status(200).json({ message: 'Category deleted successfully' })
        } catch (error) {
          console.error('Delete category error:', error)
          res.status(500).json({ 
            error: 'Failed to delete category',
            details: error instanceof Error ? error.message : 'Unknown error'
          })
        }
        break

      default:
        res.setHeader('Allow', ['PUT', 'DELETE'])
        res.status(405).json({ error: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    console.error('Categories API Error:', error)
    res.status(500).json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 