import { NextApiRequest, NextApiResponse } from 'next'
import { categoryDb } from '@/lib/database'
import { ItemTypeMedical } from '@/lib/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - Get all categories with optional type filter
  if (req.method === 'GET') {
    try {
      const { type } = req.query
      
      if (type && !['Medicine', 'Supply'].includes(type as string)) {
        return res.status(400).json({ error: 'Invalid type parameter. Must be "Medicine" or "Supply"' })
      }
      
      const categories = await categoryDb.getAll(type as ItemTypeMedical)
      return res.status(200).json(categories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      return res.status(500).json({ error: 'Failed to fetch categories' })
    }
  }

  // POST - Create new category
  if (req.method === 'POST') {
    try {
      const { item_type, name } = req.body
      
      if (!item_type || !name) {
        return res.status(400).json({ error: 'item_type and name are required' })
      }
      
      if (!['Medicine', 'Supply'].includes(item_type)) {
        return res.status(400).json({ error: 'Invalid item_type. Must be "Medicine" or "Supply"' })
      }

      const savedCategory = await categoryDb.save({ item_type, name })
      return res.status(201).json(savedCategory)
    } catch (error) {
      console.error('Error creating category:', error)
      return res.status(500).json({ error: 'Failed to create category' })
    }
  }

  // Default case for other methods
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).json({ error: `Method ${req.method} Not Allowed` })
} 