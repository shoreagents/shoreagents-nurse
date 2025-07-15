import React from 'react'
import { NextPage } from 'next'
import { ClinicRecordsTable } from '@/components/tables/ClinicRecordsTable'

const ClinicRecordsPage: NextPage = React.memo(() => {
  return (
    <div className="w-full min-h-screen px-8 py-6">
      <ClinicRecordsTable />
    </div>
  )
})

ClinicRecordsPage.displayName = 'ClinicRecordsPage'

export default ClinicRecordsPage 