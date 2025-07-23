import React from 'react'
import { NextPage } from 'next'
import { PageWrapper } from '@/components/layout/PageWrapper'
import SupplyTable from '../components/tables/SupplyTable'

const SuppliesPage: NextPage = React.memo(() => {
  return (
    <PageWrapper title="">
      <SupplyTable />
    </PageWrapper>
  )
})

SuppliesPage.displayName = 'SuppliesPage'

export default SuppliesPage 