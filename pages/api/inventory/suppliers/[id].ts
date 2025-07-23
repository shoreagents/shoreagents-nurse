import { NextApiRequest, NextApiResponse } from 'next'
import { supplierDb } from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = parseInt(req.query.id as string)

  // Validate id is a valid number
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid supplier ID.' })
  }

  try {
    switch (req.method) {
      case 'PUT':
        await handlePut(req, res, id)
        break
      case 'DELETE':
        await handleDelete(req, res, id)
        break
      default:
        res.setHeader('Allow', ['PUT', 'DELETE'])
        res.status(405).json({ error: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    console.error('Suppliers API Error:', error)
    res.status(500).json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, id: number) {
  const { name } = req.body

  if (!name) {
    return res.status(400).json({ error: 'Name is required.' })
  }

  try {
    const updatedSupplier = await supplierDb.update(id, { name })
    res.status(200).json(updatedSupplier)
  } catch (error) {
    if (error instanceof Error && error.message === 'Supplier not found') {
      return res.status(404).json({ error: 'Supplier not found.' })
    }
    throw error
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: number) {
  try {
    await supplierDb.delete(id)
    res.status(200).json({ message: 'Supplier deleted successfully' })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Supplier not found') {
        return res.status(404).json({ error: 'Supplier not found.' })
      }
      if (error.message === 'Supplier is in use and cannot be deleted') {
        return res.status(400).json({ error: 'Supplier is in use and cannot be deleted.' })
      }
    }
    throw error
  }
} 