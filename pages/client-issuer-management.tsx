import React from 'react'
import { NextPage } from 'next'
import { PageWrapper } from '@/components/layout/PageWrapper'
import ClientIssuerManagement from '@/components/tables/ClientIssuerManagement'

const ClientIssuerManagementPage: NextPage = React.memo(() => {
  return (
    <PageWrapper title="">
      <ClientIssuerManagement />
    </PageWrapper>
  )
})

ClientIssuerManagementPage.displayName = 'ClientIssuerManagementPage'

export default ClientIssuerManagementPage 