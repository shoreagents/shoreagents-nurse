import { NextApiRequest, NextApiResponse } from 'next'
import { supplierDb } from '@/lib/database'

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
    console.error('Suppliers API Error:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const suppliers = await supplierDb.getAll()
  res.status(200).json(suppliers)
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.body

  // Validate required fields
  if (!name) {
    return res.status(400).json({ error: 'Missing required field: name.' })
  }

  const savedSupplier = await supplierDb.save({ name })
  res.status(201).json(savedSupplier)
} 