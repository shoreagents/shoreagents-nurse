import { NextApiRequest, NextApiResponse } from 'next'
import { patientDb } from '@/lib/database'
import { PatientFormData } from '@/lib/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query
    const patientId = parseInt(id as string, 10)
    
    if (isNaN(patientId)) {
      return res.status(400).json({ success: false, error: 'Invalid patient ID' })
    }

    switch (req.method) {
      case 'GET':
        const patient = await patientDb.getById(patientId)
        
        if (!patient) {
          return res.status(404).json({ success: false, error: 'Patient not found' })
        }
        
        res.status(200).json({ success: true, data: patient })
        break

      case 'PUT':
        const updateData: Partial<PatientFormData> = req.body
        
        const updatedPatient = await patientDb.update(patientId, updateData)
        res.status(200).json({ success: true, data: updatedPatient })
        break

      default:
        res.setHeader('Allow', ['GET', 'PUT'])
        res.status(405).json({ success: false, error: `Method ${req.method} not allowed` })
    }
  } catch (error) {
    console.error('Patient API error:', error)
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
} 