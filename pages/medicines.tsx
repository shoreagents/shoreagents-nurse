import React from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { PageWrapper } from '@/components/layout/PageWrapper'
import MedicineTable from '../components/tables/MedicineTable'

const MedicinesPage: NextPage = React.memo(() => {
  const router = useRouter()
  const shouldOpenForm = router.query.action === 'add'

  return (
    <PageWrapper title="">
      <MedicineTable autoOpenForm={shouldOpenForm} />
    </PageWrapper>
  )
})

MedicinesPage.displayName = 'MedicinesPage'

export default MedicinesPage 