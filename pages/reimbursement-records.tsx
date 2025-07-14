import React from 'react'
import { NextPage } from 'next'
import ReimbursementRecordsTable from '@/components/tables/ReimbursementRecordsTable'

const ReimbursementRecordsPage: NextPage = React.memo(() => {
  return (
    <div className="container mx-auto px-4 py-6">
      <ReimbursementRecordsTable />
    </div>
  )
})

ReimbursementRecordsPage.displayName = 'ReimbursementRecordsPage'

export default ReimbursementRecordsPage 