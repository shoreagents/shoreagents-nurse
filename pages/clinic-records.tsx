import React from 'react'
import { NextPage } from 'next'
import { ClinicRecordsTable } from '@/components/tables/ClinicRecordsTable'

const ClinicRecordsPage: NextPage = React.memo(() => {
  return (
    <div className="container mx-auto px-4 py-6">
      <ClinicRecordsTable />
    </div>
  )
})

ClinicRecordsPage.displayName = 'ClinicRecordsPage'

export default ClinicRecordsPage 