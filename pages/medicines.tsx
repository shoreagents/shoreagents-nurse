import React from 'react'
import { NextPage } from 'next'
import { PageWrapper } from '@/components/layout/PageWrapper'
import MedicineTable from '../components/tables/MedicineTable'

const MedicinesPage: NextPage = React.memo(() => {
  return (
    <PageWrapper title="">
      <MedicineTable />
    </PageWrapper>
  )
})

MedicinesPage.displayName = 'MedicinesPage'

export default MedicinesPage 