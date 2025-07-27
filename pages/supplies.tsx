import React from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { PageWrapper } from '@/components/layout/PageWrapper'
import SupplyTable from '../components/tables/SupplyTable'

const SuppliesPage: NextPage = React.memo(() => {
  const router = useRouter()
  const shouldOpenForm = router.query.action === 'add'

  return (
    <PageWrapper title="">
      <SupplyTable autoOpenForm={shouldOpenForm} />
    </PageWrapper>
  )
})

SuppliesPage.displayName = 'SuppliesPage'

export default SuppliesPage 