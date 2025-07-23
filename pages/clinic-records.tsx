import React from 'react'
import { NextPage } from 'next'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { ClinicRecordsTable } from '@/components/tables/ClinicRecordsTable'

const ClinicRecordsPage: NextPage = React.memo(() => {
  return (
    <PageWrapper title="">
      <ClinicRecordsTable />
    </PageWrapper>
  )
})

ClinicRecordsPage.displayName = 'ClinicRecordsPage'

export default ClinicRecordsPage 