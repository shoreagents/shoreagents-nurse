import { NextApiRequest, NextApiResponse } from 'next'
import { medicineDb, transactionDb } from '@/lib/database'
import { InventoryMedicine } from '@/lib/types'

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
    // Get specific medicine by ID
    const medicine = await medicineDb.getById(parseInt(id as string))
    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' })
    }
    return res.status(200).json(medicine)
  }

  if (search) {
    // Search medicines
    const medicines = await medicineDb.search(search as string)
    return res.status(200).json(medicines)
  }

  // Get all medicines
  const medicines = await medicineDb.getAll()
  res.status(200).json(medicines)
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const medicineData: Partial<InventoryMedicine> = req.body

  // Validate required fields
  if (!medicineData.name) {
    return res.status(400).json({ error: 'Missing required field: name' })
  }

  const savedMedicine = await medicineDb.save(medicineData)

  // TODO: Record initial stock transaction if stock > 0 (temporarily disabled for debugging)
  // if (savedMedicine.stock > 0 && (medicineData.stock || 0) > 0) {
  //   await transactionDb.add({
  //     type: 'stock_in',
  //     itemType: 'medicine',
  //     itemId: savedMedicine.id.toString(),
  //     itemName: savedMedicine.name,
  //     quantity: savedMedicine.stock,
  //     previousStock: 0,
  //     newStock: savedMedicine.stock,
  //     reason: 'Initial stock entry',
  //     userId: req.body.userId || 'system',
  //     userName: req.body.userName || 'System'
  //   })
  // }

  res.status(201).json(savedMedicine)
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const medicineData: Partial<InventoryMedicine> = req.body

  if (!id) {
    return res.status(400).json({ error: 'Medicine ID is required' })
  }

  medicineData.id = parseInt(id as string)
  const updatedMedicine = await medicineDb.save(medicineData)
  res.status(200).json(updatedMedicine)
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Medicine ID is required' })
  }

  await medicineDb.delete(parseInt(id as string))
  res.status(200).json({ message: 'Medicine deleted successfully' })
} 