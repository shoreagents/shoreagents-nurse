import { NextApiRequest, NextApiResponse } from 'next'
import { query } from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const result = await query(`
      SELECT 
        u.id,
        u.user_type,
        pi.first_name,
        pi.middle_name,
        pi.last_name,
        CASE 
          WHEN pi.middle_name IS NOT NULL AND pi.middle_name != '' 
          THEN CONCAT(pi.first_name, ' ', pi.middle_name, ' ', pi.last_name)
          ELSE CONCAT(pi.first_name, ' ', pi.last_name)
        END as full_name
      FROM users u
      INNER JOIN personal_info pi ON u.id = pi.user_id
      WHERE u.user_type = 'Internal'
      ORDER BY pi.first_name, pi.last_name
    `)

    const internalUsers = result.rows.map(row => ({
      id: row.id,
      user_type: row.user_type,
      first_name: row.first_name,
      middle_name: row.middle_name,
      last_name: row.last_name,
      full_name: row.full_name
    }))

    res.status(200).json({ 
      success: true, 
      data: internalUsers 
    })

  } catch (error) {
    console.error('Error fetching internal users:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch internal users' 
    })
  }
} 