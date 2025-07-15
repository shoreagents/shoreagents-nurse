import React from 'react'
import { NextPage } from 'next'
import ReimbursementRecordsTable from '@/components/tables/ReimbursementRecordsTable'

const ReimbursementRecordsPage: NextPage = React.memo(() => {
  return (
    <div className="w-full min-h-screen px-8 py-6">
      <ReimbursementRecordsTable />
    </div>
  )
})

ReimbursementRecordsPage.displayName = 'ReimbursementRecordsPage'

export default ReimbursementRecordsPage 