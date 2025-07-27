import { NextApiRequest, NextApiResponse } from 'next'
import { query } from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'DELETE') {
    try {
      // Validate ID
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ 
          success: false, 
          message: 'Valid clinic log ID is required' 
        })
      }

      const clinicLogId = Number(id)

      // Start a transaction
      await query('BEGIN')

      try {
        // First, get the clinic log to restore inventory
        const clinicLogResult = await query(`
          SELECT id FROM clinic_logs WHERE id = $1
        `, [clinicLogId])

        if (clinicLogResult.rows.length === 0) {
          await query('ROLLBACK')
          return res.status(404).json({ 
            success: false, 
            message: 'Clinic log not found' 
          })
        }

        // Get medicines to restore inventory
        const medicinesResult = await query(`
          SELECT name, quantity FROM clinic_log_medicines WHERE clinic_log_id = $1
        `, [clinicLogId])

        // Get supplies to restore inventory
        const suppliesResult = await query(`
          SELECT name, quantity FROM clinic_log_supplies WHERE clinic_log_id = $1
        `, [clinicLogId])

        // Restore inventory for medicines
        for (const medicine of medicinesResult.rows) {
          await query(`
            UPDATE inventory_medical 
            SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP
            WHERE name = $2 AND item_type = 'medicine'
          `, [medicine.quantity, medicine.name])
        }

        // Restore inventory for supplies
        for (const supply of suppliesResult.rows) {
          await query(`
            UPDATE inventory_medical 
            SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP
            WHERE name = $2 AND item_type = 'supply'
          `, [supply.quantity, supply.name])
        }

        // Delete medicines and supplies (cascade will handle this, but being explicit)
        await query(`
          DELETE FROM clinic_log_medicines WHERE clinic_log_id = $1
        `, [clinicLogId])

        await query(`
          DELETE FROM clinic_log_supplies WHERE clinic_log_id = $1
        `, [clinicLogId])

        // Delete the clinic log
        await query(`
          DELETE FROM clinic_logs WHERE id = $1
        `, [clinicLogId])

        // Commit transaction
        await query('COMMIT')

        res.status(200).json({ 
          success: true, 
          message: 'Clinic log deleted successfully' 
        })

      } catch (error) {
        // Rollback transaction on error
        await query('ROLLBACK')
        throw error
      }

    } catch (error) {
      console.error('Error deleting clinic log:', error)
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete clinic log',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else {
    res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }
} 