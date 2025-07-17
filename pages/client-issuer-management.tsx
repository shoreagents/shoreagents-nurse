import React from 'react'
import { NextPage } from 'next'
import ClientIssuerManagement from '@/components/tables/ClientIssuerManagement'

const ClientIssuerManagementPage: NextPage = React.memo(() => {
  return (
    <div className="w-full min-h-screen px-8 py-6">
      <ClientIssuerManagement />
    </div>
  )
})

ClientIssuerManagementPage.displayName = 'ClientIssuerManagementPage'

export default ClientIssuerManagementPage 