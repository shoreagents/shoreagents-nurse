import { NextApiRequest, NextApiResponse } from 'next'
import { supplyDb, transactionDb } from '@/lib/database'
import { InventorySupply } from '@/lib/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        await handleGet(req, res)
        break
      case 'POST':
        await handlePost(req, res)
        break
      case 'PUT':
        await handlePut(req, res)
        break
      case 'DELETE':
        await handleDelete(req, res)
        break
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).json({ error: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id, search } = req.query

  if (id) {
    // Get specific supply by ID
    const supply = await supplyDb.getById(parseInt(id as string))
    if (!supply) {
      return res.status(404).json({ error: 'Supply not found' })
    }
    return res.status(200).json(supply)
  }

  if (search) {
    // Search supplies
    const supplies = await supplyDb.search(search as string)
    return res.status(200).json(supplies)
  }

  // Get all supplies
  const supplies = await supplyDb.getAll()
  res.status(200).json(supplies)
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const supplyData: Partial<InventorySupply> = req.body

  // Validate required fields
  if (!supplyData.name) {
    return res.status(400).json({ error: 'Missing required field: name' })
  }

  const savedSupply = await supplyDb.save(supplyData)

  // TODO: Record initial stock transaction if stock > 0 (temporarily disabled for debugging)
  // if (savedSupply.stock > 0 && (supplyData.stock || 0) > 0) {
  //   await transactionDb.add({
  //     type: 'stock_in',
  //     itemType: 'supply',
  //     itemId: savedSupply.id.toString(),
  //     itemName: savedSupply.name,
  //     quantity: savedSupply.stock,
  //     previousStock: 0,
  //     newStock: savedSupply.stock,
  //     reason: 'Initial stock entry',
  //     userId: req.body.userId || 'system',
  //     userName: req.body.userName || 'System'
  //   })
  // }

  res.status(201).json(savedSupply)
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const supplyData: Partial<InventorySupply> = req.body

  if (!id) {
    return res.status(400).json({ error: 'Supply ID is required' })
  }

  supplyData.id = parseInt(id as string)
  const updatedSupply = await supplyDb.save(supplyData)
  res.status(200).json(updatedSupply)
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Supply ID is required' })
  }

  await supplyDb.delete(parseInt(id as string))
  res.status(200).json({ message: 'Supply deleted successfully' })
} 