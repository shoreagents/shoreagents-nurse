import { NextApiRequest, NextApiResponse } from 'next'
import { categoryDb } from '@/lib/database'
import { ItemTypeMedical } from '@/lib/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        await handleGet(req, res)
        break
      case 'POST':
        await handlePost(req, res)
        break
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).json({ error: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    console.error('Categories API Error:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { type } = req.query

  // Validate type parameter if provided
  if (type && !['medicine', 'supply'].includes(type as string)) {
    return res.status(400).json({ error: 'Invalid type parameter. Must be "medicine" or "supply"' })
  }

  const itemType = type as ItemTypeMedical | undefined
  const categories = await categoryDb.getAll(itemType)
  
  res.status(200).json(categories)
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { item_type, name } = req.body

  // Validate required fields
  if (!item_type || !name) {
    return res.status(400).json({ error: 'Missing required fields: item_type and name' })
  }

  // Validate item_type
  if (!['medicine', 'supply'].includes(item_type)) {
    return res.status(400).json({ error: 'Invalid item_type. Must be "medicine" or "supply"' })
  }

  const savedCategory = await categoryDb.save({ item_type, name })
  res.status(201).json(savedCategory)
} 