import React from 'react'
import { NextPage } from 'next'
import InventoryTable from '@/components/tables/InventoryTable'

const InventoryPage: NextPage = React.memo(() => {
  return (
    <div className="w-full min-h-screen px-8 py-6">
      <InventoryTable />
    </div>
  )
})

InventoryPage.displayName = 'InventoryPage'

export default InventoryPage 