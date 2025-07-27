import { NextApiRequest, NextApiResponse } from 'next'
import { patientDb } from '@/lib/database'
import { Patient, PatientFormData } from '@/lib/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        const { search } = req.query
        
        let patients: Patient[]
        if (search && typeof search === 'string') {
          patients = await patientDb.search(search)
        } else {
          patients = await patientDb.getAll()
        }
        
        res.status(200).json({ success: true, data: patients })
        break

      case 'POST':
        const patientData: PatientFormData = req.body
        
        // Basic validation
        if (!patientData.email || !patientData.first_name || !patientData.last_name) {
          return res.status(400).json({ 
            success: false, 
            error: 'Email, first name, and last name are required' 
          })
        }
        
        const newPatient = await patientDb.create(patientData)
        res.status(201).json({ success: true, data: newPatient })
        break

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).json({ success: false, error: `Method ${req.method} not allowed` })
    }
  } catch (error) {
    console.error('Patients API error:', error)
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
} 