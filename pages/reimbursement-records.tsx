import React from 'react'
import { NextPage } from 'next'
import { PageWrapper } from '@/components/layout/PageWrapper'
import ReimbursementRecordsTable from '@/components/tables/ReimbursementRecordsTable'

const ReimbursementRecordsPage: NextPage = React.memo(() => {
  return (
    <PageWrapper title="">
      <ReimbursementRecordsTable />
    </PageWrapper>
  )
})

ReimbursementRecordsPage.displayName = 'ReimbursementRecordsPage'

export default ReimbursementRecordsPage 