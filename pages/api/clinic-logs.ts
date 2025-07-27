import { NextApiRequest, NextApiResponse } from 'next'
import { query } from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { patientId, patientDiagnose, additionalNotes, issuedBy, medicines, supplies } = req.body

      // Validate required fields
      if (!patientId || !issuedBy || !patientDiagnose) {
        return res.status(400).json({ 
          success: false, 
          message: 'Patient ID, Issued By, and Patient Diagnosis are required' 
        })
      }

      // Start a transaction
      await query('BEGIN')

      try {
        // Insert clinic log
        const clinicLogResult = await query(`
          INSERT INTO clinic_logs (patient_id, patient_diagnose, additional_notes, issued_by)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `, [patientId, patientDiagnose, additionalNotes || null, issuedBy])

        const clinicLogId = clinicLogResult.rows[0].id

        // Insert medicines if any
        if (medicines && medicines.length > 0) {
          for (const medicine of medicines) {
            await query(`
              INSERT INTO clinic_log_medicines (clinic_log_id, inventory_item_id, quantity, name)
              VALUES ($1, $2, $3, $4)
            `, [clinicLogId, medicine.inventory_item_id, medicine.quantity, medicine.name])
          }
        }

        // Insert supplies if any
        if (supplies && supplies.length > 0) {
          for (const supply of supplies) {
            await query(`
              INSERT INTO clinic_log_supplies (clinic_log_id, inventory_item_id, quantity, name)
              VALUES ($1, $2, $3, $4)
            `, [clinicLogId, supply.inventory_item_id, supply.quantity, supply.name])
          }
        }

        // Commit transaction
        await query('COMMIT')

        res.status(201).json({ 
          success: true, 
          message: 'Clinic log created successfully',
          data: { id: clinicLogId }
        })

      } catch (error) {
        // Rollback transaction on error
        await query('ROLLBACK')
        throw error
      }

    } catch (error) {
      console.error('Error creating clinic log:', error)
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create clinic log',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else if (req.method === 'GET') {
    try {
      // Get clinic logs with patient information
      const clinicLogsResult = await query(`
        SELECT 
          cl.id,
          cl.patient_id,
          cl.patient_diagnose,
          cl.additional_notes,
          cl.issued_by,
          cl.created_at,
          cl.updated_at,
          u.email as patient_email,
          u.user_type as patient_user_type,
          pi.first_name,
          pi.middle_name,
          pi.last_name,
          CASE 
            WHEN pi.middle_name IS NOT NULL AND pi.middle_name != '' 
            THEN CONCAT(pi.first_name, ' ', pi.middle_name, ' ', pi.last_name)
            ELSE CONCAT(pi.first_name, ' ', pi.last_name)
          END as patient_full_name,
          ji.employee_id,
          CASE 
            WHEN u.user_type = 'Internal' THEN 'Internal'
            ELSE m.company
          END as company,
          m.badge_color
        FROM clinic_logs cl
        INNER JOIN users u ON cl.patient_id = u.id
        LEFT JOIN personal_info pi ON u.id = pi.user_id
        LEFT JOIN job_info ji ON u.id = ji.agent_user_id OR u.id = ji.internal_user_id
        LEFT JOIN agents a ON (u.user_type = 'Agent' AND a.user_id = u.id)
        LEFT JOIN members m ON a.member_id = m.id
        ORDER BY cl.created_at DESC
      `)

      const clinicLogs = clinicLogsResult.rows

      // Get medicines and supplies for each clinic log
      const clinicLogsWithItems = await Promise.all(
        clinicLogs.map(async (log) => {
          // Get medicines for this clinic log
          const medicinesResult = await query(`
            SELECT name, quantity
            FROM clinic_log_medicines
            WHERE clinic_log_id = $1
            ORDER BY name
          `, [log.id])

          // Get supplies for this clinic log
          const suppliesResult = await query(`
            SELECT name, quantity
            FROM clinic_log_supplies
            WHERE clinic_log_id = $1
            ORDER BY name
          `, [log.id])

          return {
            ...log,
            medicines: medicinesResult.rows,
            supplies: suppliesResult.rows
          }
        })
      )

      res.status(200).json({ 
        success: true, 
        data: clinicLogsWithItems 
      })

    } catch (error) {
      console.error('Error fetching clinic logs:', error)
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch clinic logs' 
      })
    }
  } else {
    res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }
} 