import React from 'react'
import { NextPage } from 'next'
import { PageWrapper } from '@/components/layout/PageWrapper'
import ClinicLogForm from '@/components/forms/ClinicLogForm'

const ClinicLogFormPage: NextPage = React.memo(() => {
  return (
    <PageWrapper title="">
      <ClinicLogForm />
    </PageWrapper>
  )
})

ClinicLogFormPage.displayName = 'ClinicLogFormPage'

export default ClinicLogFormPage 